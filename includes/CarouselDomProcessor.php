<?php

namespace MediaWiki\Extension\MultimediaViewer;

use MediaWiki\Config\Config;
use MediaWiki\MainConfigNames;
use Wikimedia\Parsoid\Core\DOMCompat;
use Wikimedia\Parsoid\DOM\Document;
use Wikimedia\Parsoid\DOM\DocumentFragment;
use Wikimedia\Parsoid\DOM\Element;
use Wikimedia\Parsoid\DOM\Node;
use Wikimedia\Parsoid\Ext\DOMProcessor;
use Wikimedia\Parsoid\Ext\ParsoidExtensionAPI;

class CarouselDomProcessor extends DOMProcessor {
	public const EXTENSION_DATA_NAME = 'multimediaviewer-carousel';

	public function __construct(
		private readonly Config $config,
		private ?ThumbExtractor $thumbExtractor = null,
	) {
		if ( !$this->thumbExtractor ) {
			// Defaults to this config, but allow passing a different
			// one for testing
			$this->thumbExtractor = new ThumbExtractor(
				array_keys( $this->config->get( 'MediaViewerExtensions' ) ),
				$this->config->get( 'MediaViewerExcludedImageSelectors' ),
				50,
				50,
				$this->config->get( MainConfigNames::ArticlePath )
			);
		}
	}

	/**
	 * @inheritDoc
	 */
	public function wtPostprocess( ParsoidExtensionAPI $extApi, Node $root, array $options ): void {
		if ( !( $root instanceof Element ) ) {
			return;
		}

		$carouselItems = $this->extractCarouselImages( $root );
		$extApi->getMetadata()->setExtensionData( self::EXTENSION_DATA_NAME, $carouselItems );
	}

	/**
	 * Extract carousel image candidates from the given node.
	 *
	 * @param Document|DocumentFragment|Element $dom
	 * @return array{title: string, caption: ?string, thumb: array}[]
	 */
	public function extractCarouselImages( Document|DocumentFragment|Element $dom ): array {
		$thumbs = $this->thumbExtractor->findThumbs( $dom );
		$carouselItems = [];
		foreach ( $thumbs as $thumb ) {
			$anchor = DOMCompat::getParentElement( $thumb );
			$title = $this->thumbExtractor->extractTitleFromAnchorElement( $anchor );
			if ( !$title ) {
				continue;
			}

			// Guard against duplicates/overwrites
			$prefixedDbKey = $title->getPrefixedDBkey();
			if ( isset( $carouselItems[$prefixedDbKey] ) ) {
				continue;
			}

			$caption = $this->thumbExtractor->extractCaptionFromAnchorElement( $anchor, $dom );

			$carouselItems[$prefixedDbKey] = [
				'title' => $prefixedDbKey,
				'caption' => $caption,
				'thumb' => [
					'src' => DOMCompat::getAttribute( $thumb, 'src' ) ?:
						DOMCompat::getAttribute( $thumb, 'data-mw-src' ),
					'width' => (int)DOMCompat::getAttribute( $thumb, 'width' ),
					'height' => (int)DOMCompat::getAttribute( $thumb, 'height' ),
					'srcset' => DOMCompat::getAttribute( $thumb, 'srcset' ),
					'alt' => DOMCompat::getAttribute( $thumb, 'alt' ),
					'data-file-width' => ( (int)DOMCompat::getAttribute( $thumb, 'data-file-width' ) ?: null ),
					'data-file-height' => ( (int)DOMCompat::getAttribute( $thumb, 'data-file-height' ) ?: null ),
				],
			];
		}
		return array_values( $carouselItems );
	}
}
