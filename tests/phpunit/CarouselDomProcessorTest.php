<?php

namespace MediaWiki\Extension\MultimediaViewer\Tests;

use MediaWiki\Extension\MultimediaViewer\CarouselDomProcessor;
use MediaWiki\Extension\MultimediaViewer\ThumbExtractor;
use Wikimedia\Parsoid\Core\DOMCompat;
use Wikimedia\Parsoid\Utils\DOMUtils;

/**
 * @covers \MediaWiki\Extension\MultimediaViewer\Hooks
 * @group Database
 */
class CarouselDomProcessorTest extends HooksTestCase {
	/**
	 * Regression test: the mobile carousel must extract thumbnails even when the
	 * DOM backend reports element names in upper case.
	 *
	 * extractCarouselImages() locates each thumbnail's parent <a> to read
	 * the file name. Comparing $anchor->nodeName to a lower-case 'a' silently
	 * dropped every thumbnail on DOM backends that return upper-case names
	 * (newer libraries, and PHP 8.4 for the native DOM), so the carousel fell
	 * below its image minimum and never rendered. The comparison must be
	 * case-insensitive (DOMUtils::nodeName()).
	 */
	public function testExtractCarouselImagesHandlesUpperCaseAnchorNodeNames(): void {
		$thumbExtractor = new ThumbExtractor( [ 'jpg' ], [], 30, 30, '/wiki/$1' );
		$processor = new CarouselDomProcessor(
			$this->getServiceContainer()->getMainConfig(),
			$thumbExtractor,
		);

		// Mirrors the markup served by MobileFrontendContentProvider when it
		// proxies an article: protocol-relative File: hrefs wrapped in
		// <a class="mw-file-description">.
		$names = [ 'Eiffel', 'Louvre', 'Pantheon' ];
		$html = '';
		foreach ( $names as $name ) {
			$html .= '<figure typeof="mw:File/Thumb">'
				. '<a href="//en.wikipedia.org/wiki/File:' . $name . '.jpg" class="mw-file-description">'
				. '<img src="//upload.wikimedia.org/' . $name . '.jpg" class="mw-file-element"'
				. ' width="220" height="124" alt="' . $name . '">'
				. '</a></figure>';
		}
		$doc = DOMCompat::newDocument( true );
		$dom = DOMUtils::parseHTMLToFragment( $doc, $html );
		$thumbs = $processor->extractCarouselImages( $dom );

		$this->assertCount( 3, $thumbs, 'all three proxied thumbnails should be extracted' );
		$this->assertSame( 'File:Eiffel.jpg', $thumbs[0]['title'] );
		$this->assertSame(
			'//upload.wikimedia.org/Eiffel.jpg',
			$thumbs[0]['thumb']['src']
		);
		$this->assertSame(
			'//upload.wikimedia.org/Pantheon.jpg',
			$thumbs[2]['thumb']['src']
		);
	}

	public function testExtractCarouselImagesPreservesAltTextAndAllowsMissingAltText(): void {
		$thumbExtractor = new ThumbExtractor( [ 'jpg' ], [], 30, 30, '/wiki/$1' );
		$processor = new CarouselDomProcessor(
			$this->getServiceContainer()->getMainConfig(),
			$thumbExtractor,
		);

		$html = '<figure typeof="mw:File/Thumb">'
			. '<a href="//en.wikipedia.org/wiki/File:Eiffel.jpg" class="mw-file-description">'
			. '<img src="//upload.wikimedia.org/Eiffel.jpg" class="mw-file-element"'
			. ' width="220" height="124" alt="Eiffel Tower at dusk">'
			. '</a></figure>'
			. '<figure typeof="mw:File/Thumb">'
			. '<a href="//en.wikipedia.org/wiki/File:Louvre.jpg" class="mw-file-description">'
			. '<img src="//upload.wikimedia.org/Louvre.jpg" class="mw-file-element"'
			. ' width="220" height="124" alt="">'
			. '</a></figure>'
			. '<figure typeof="mw:File/Thumb">'
			. '<a href="//en.wikipedia.org/wiki/File:Pantheon.jpg" class="mw-file-description">'
			. '<img src="//upload.wikimedia.org/Pantheon.jpg" class="mw-file-element"'
			. ' width="220" height="124" alt="Pantheon facade">'
			. '</a></figure>';
		$doc = DOMCompat::newDocument( true );
		$dom = DOMUtils::parseHTMLToFragment( $doc, $html );
		$thumbs = $processor->extractCarouselImages( $dom );

		$this->assertCount( 3, $thumbs, 'missing alt text should not suppress carousel images' );
		$this->assertSame( 'Eiffel Tower at dusk', $thumbs[0]['thumb']['alt'] );
		$this->assertSame( '', $thumbs[1]['thumb']['alt'] );
		$this->assertSame( 'Pantheon facade', $thumbs[2]['thumb']['alt'] );
	}

	public function testExtractCarouselImagesExcludesLeadInfoboxImages(): void {
		$figure = static fn ( string $name ) => '<figure typeof="mw:File/Thumb">'
			. '<a href="//en.wikipedia.org/wiki/File:' . $name . '.jpg" class="mw-file-description">'
			. '<img src="//upload.wikimedia.org/' . $name . '.jpg" class="mw-file-element"'
			. ' width="220" height="124" alt="' . $name . '">'
			. '</a></figure>';
		$infobox = static fn ( string $name ) => '<table class="infobox"><tr><td>'
			. $figure( $name ) . '</td></tr></table>';

		$thumbExtractor = new ThumbExtractor( [ 'jpg' ], [], 30, 30, '/wiki/$1' );
		$processor = new CarouselDomProcessor(
			$this->getServiceContainer()->getMainConfig(),
			$thumbExtractor,
		);

		// The third image is the lead infobox image. Since two images remain, it's
		// below the three image threshold (MIN_CAROUSEL_IMAGES), so the carousel
		// would not render.
		$html = '<section data-mw-section-id="0">' . $infobox( 'Infobox' ) . $figure( 'Eiffel' ) . '</section>'
			. '<section data-mw-section-id="1">' . $figure( 'Louvre' ) . '</section>';
		$doc = DOMCompat::newDocument( true );
		$dom = DOMUtils::parseHTMLToFragment( $doc, $html );
		$thumbs = $processor->extractCarouselImages( $dom );

		$this->assertCount( 2, $thumbs );
		$this->assertLessThan( 3, count( $thumbs ) );
		$this->assertSame( 'File:Eiffel.jpg', $thumbs[0]['title'] );
		$this->assertSame( 'File:Louvre.jpg', $thumbs[1]['title'] );

		// An infobox outside the lead section still counts.
		$html = '<section data-mw-section-id="0">' . $figure( 'Eiffel' ) . '</section>'
			. '<section data-mw-section-id="1">' . $infobox( 'Louvre' ) . $figure( 'Pantheon' ) . '</section>';
		$doc = DOMCompat::newDocument( true );
		$dom = DOMUtils::parseHTMLToFragment( $doc, $html );
		$thumbs = $processor->extractCarouselImages( $dom );
		$this->assertCount( 3, $thumbs );
	}
}
