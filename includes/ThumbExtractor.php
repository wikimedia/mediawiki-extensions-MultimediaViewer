<?php
declare( strict_types = 1 );

namespace MediaWiki\Extension\MultimediaViewer;

use MediaWiki\FileRepo\File\File;
use MediaWiki\Title\Title;
use Wikimedia\Parsoid\Core\DOMCompat;
use Wikimedia\Parsoid\DOM\DocumentFragment;
use Wikimedia\Parsoid\DOM\Element;
use Wikimedia\Parsoid\Utils\DOMUtils;
use Wikimedia\Zest\Zest;

/**
 * Extract thumbnail image data from a wiki page.
 *
 * Applies the following set of filters:
 *   - CSS selectors that indicate navigational icons and SVG infobox images
 *   - CSS selectors as passed by a config variable via the constructor
 *   - file extension allowlist
 *   - minimum image size
 */
class ThumbExtractor {
	/**
	 * Exclusions of thumbnails in known non-content areas.
	 * Should be kept equivalent to MultimediaViewer's isAllowedThumb implementation
	 *
	 * @const string[]
	 */
	private const DISALLOWED_SELECTORS = [
		// This is inside an informational template like {{refimprove}} on enwiki
		'.metadata',
		// MediaViewer has been specifically disabled for this image
		'.noviewer',
		// We are on an error page for a non-existing article, the image is part of some template
		'.noarticletext',
		'#siteNotice',
		// Thumbnails of a slideshow gallery
		'ul.mw-gallery-slideshow li.gallerybox',
	];

	/**
	 * @param string[] $allowedExtensions A file extension allowlist,
	 * typically based on https://commons.wikimedia.org/wiki/Special:MediaStatistics
	 * @param string[] $excludedImageSelectors CSS selectors whose ancestor presence causes an image to be excluded
	 * @param int $minWidth Minimum image width in pixels
	 * @param int $minHeight Minimum image height in pixels
	 * @param string $articlePath ArticlePath config value
	 */
	public function __construct(
		private array $allowedExtensions,
		private array $excludedImageSelectors,
		private int $minWidth,
		private int $minHeight,
		private string $articlePath,
	) {
	}

	/**
	 * Select and filter thumbnail elements from a DOM body.
	 *
	 * Applies CSS selector-based selection and exclusion filtering, but does
	 * not match against files. Useful when file metadata is unavailable (e.g.
	 * when working with proxied HTML from MobileFrontendContentProvider).
	 *
	 * @param DocumentFragment $body A wiki page's DOM body fragment
	 * @return Element[] The filtered thumbnail elements
	 */
	public function findThumbs( DocumentFragment $body ): array {
		$thumbs = $this->select( $body );
		$thumbs = $this->sort( $body, $thumbs );
		$thumbs = $this->filter( $thumbs );
		return $thumbs;
	}

	/**
	 * Select image thumbnails from a DOM body via CSS selectors.
	 *
	 * @param DocumentFragment $body A wiki page's DOM body fragment
	 * @return Element[] The extracted elements
	 */
	private function select( DocumentFragment $body ): array {
		$selectors = implode( ', ', [
			// Parsoid thumbs
			'[typeof~="mw:File"] a.mw-file-description img',
			'[typeof~="mw:File"] a.mw-file-description .lazy-image-placeholder',
			// Legacy parser thumbs
			'.gallery .image img',
			'.gallery .image .lazy-image-placeholder',
			'a.image img',
			'a.image .lazy-image-placeholder',
			'a.mw-file-description img',
			'a.mw-file-description .lazy-image-placeholder',
			'#file a img',
		] );

		return iterator_to_array( DOMCompat::querySelectorAll( $body, $selectors ) );
	}

	/**
	 * @param DocumentFragment $body A wiki page's DOM body fragment
	 * @param Element[] $thumbs
	 * @return Element[]
	 */
	private function sort( DocumentFragment $body, array $thumbs ): array {
		// $thumbs is not guaranteed to be in the correct order in
		// which the nodes appear in the document
		if ( $thumbs && method_exists( $thumbs[ 0 ], 'compareDocumentPosition' ) ) {
			// PHP 8.4+ has built-in position comparison
			usort(
				$thumbs,
				static fn ( $a, $b ) => $a->compareDocumentPosition( $b ) & 2 ? 1 : -1,
			);
		} elseif ( count( $thumbs ) > 1 ) {
			// Older versions don't; we'll determine the relative
			// position of thumbs in the document by locating it
			// in the HTML and sort accordingly
			$doc = $body->ownerDocument;
			$bodyHtml = $doc->saveHTML( $body );
			$positions = array_map(
				static fn ( $thumb ) => strpos( $bodyHtml, $doc->saveHTML( $thumb ) ),
				$thumbs,
			);
			uksort(
				$thumbs,
				static fn ( $a, $b ) => $positions[ $a ] <=> $positions[ $b ],
			);
		}

		return $thumbs;
	}

	/**
	 * Filter files that don't match the given constraints
	 * (e.g. don't have an allowed extension or whose size, is too small, or match
	 * disallowed selectors)
	 *
	 * @param Element[] $thumbs
	 * @return Element[]
	 */
	private function filter( array $thumbs ): array {
		return array_values( array_filter(
			$thumbs,
			function ( $thumb ): bool {
				// Find the parent <a> to get the file name. Rely on
				// DOMUtils::nodeName() to abstract over differences in
				// PHP versions (which may use uppercase or lowercase tag names).
				$anchor = DOMCompat::getParentElement( $thumb );
				$title = $this->extractTitleFromAnchorElement( $anchor );
				if ( !$title || $title->getNamespace() !== NS_FILE ) {
					return false;
				}

				$filename = $title->getDBkey();
				$n = strrpos( $filename, '.' );
				$extension = File::normalizeExtension( $n ? substr( $filename, $n + 1 ) : '' );
				if ( !in_array( $extension, $this->allowedExtensions ) ) {
					return false;
				}

				// if width/height is set, ensure it matches the minima defined
				$width = DOMCompat::getAttribute( $thumb, 'width' ) ??
					DOMCompat::getAttribute( $thumb, 'data-width' );
				$height = DOMCompat::getAttribute( $thumb, 'height' ) ??
					DOMCompat::getAttribute( $thumb, 'data-height' );
				if (
					( $width !== null && ( (int)$width ) < $this->minWidth ) ||
					( $height !== null && ( (int)$height ) < $this->minHeight )
				) {
					return false;
				}

				$disallowedSelectors = array_merge(
					self::DISALLOWED_SELECTORS,
					$this->excludedImageSelectors
				);
				if ( $this->matchesSelectors( $thumb, $disallowedSelectors ) ) {
					return false;
				}

				return true;
			}
		) );
	}

	public function extractTitleFromAnchorElement( ?Element $anchor ): ?Title {
		if ( !$anchor || DOMUtils::nodeName( $anchor ) !== 'a' ) {
			return null;
		}

		// Decode percent-encoded characters in the src URL so that
		// links containing special characters (commas, Unicode,
		// parentheses, etc.) can match. The href attribute can contain
		// contains encoded forms like %2C or %C3%A2 (although the
		// legacy parser and Parsoid handle them differently), whereas
		// titles are in decoded form.
		// See T428610.
		$href = rawurldecode( $anchor->getAttribute( 'href' ) );

		// Extract file name from href
		// Parsoid: href="//en.wikipedia.org/wiki/File:Example.jpg"
		// Legacy: href="/wiki/File:Example.jpg"
		$path = parse_url( $href, PHP_URL_PATH );
		$articlePathRegex = '/' . str_replace( '\\$1', '(.+)', preg_quote( $this->articlePath, '/' ) ) . '/';

		if (
			!preg_match( $articlePathRegex, $path, $match ) &&
			// Fallback for content this wiki did not render: pages proxied
			// from a foreign wiki (MobileFrontendContentProvider) carry the
			// *source* wiki's article path ("/wiki/$1" on Wikimedia sites),
			// and Parsoid emits relative "./Title" hrefs.
			!preg_match( '#(?:^\./|/wiki/)(.+)$#', $path, $match )
		) {
			return null;
		}

		return Title::newFromText( $match[1] );
	}

	/**
	 * Check if the thumbnail matches any of the given CSS selectors.
	 *
	 * @param Element $thumb An image thumbnail element
	 * @param string[] $selectors CSS selectors whose ancestor presence causes an image to be excluded
	 * @return bool
	 */
	private function matchesSelectors( Element $thumb, array $selectors ): bool {
		foreach ( $selectors as $selector ) {
			if ( $this->closest( $thumb, $selector ) !== null ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Find the closest parent of a DOM element (including itself)
	 * that matches a CSS selector.
	 *
	 * @param Element|null $element A DOM element
	 * @param string $selector A CSS selector to match
	 * @return Element|null The matching element, or null if none
	 */
	private function closest( ?Element $element, string $selector ): ?Element {
		if ( $element === null ) {
			return null;
		}

		// Check the element itself first
		if ( Zest::matches( $element, $selector ) ) {
			return $element;
		}

		// Traverse up through parents
		$parent = DOMCompat::getParentElement( $element );
		while ( $parent !== null ) {
			if ( Zest::matches( $parent, $selector ) ) {
				return $parent;
			}
			$parent = DOMCompat::getParentElement( $parent );
		}

		return null;
	}
}
