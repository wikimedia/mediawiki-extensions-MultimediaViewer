<?php

namespace MediaWiki\Extension\MultimediaViewer\Tests;

use MediaWiki\Extension\MultimediaViewer\ThumbExtractor;
use MediaWiki\Title\Title;
use MediaWikiIntegrationTestCase;
use Wikimedia\Parsoid\Core\DOMCompat;
use Wikimedia\Parsoid\DOM\DocumentFragment;
use Wikimedia\Parsoid\Utils\DOMUtils;

/**
 * @covers \MediaWiki\Extension\MultimediaViewer\ThumbExtractor
 */
class ThumbExtractorTest extends MediaWikiIntegrationTestCase {

	private function makeBody( string $html ): DocumentFragment {
		$doc = DOMCompat::newDocument( true );
		$fragment = $doc->createDocumentFragment();
		DOMCompat::setInnerHTML( $fragment, $html );
		return $fragment;
	}

	public function testFindThumbsMatchesThumbToFile(): void {
		$extractor = new ThumbExtractor( [ 'jpg' ], [], 30, 30, '/wiki/$1' );

		$snippet = '<a class="mw-file-description" href="/wiki/File:Batman.jpg">'
			. '<img src="/path/to/Batman.jpg/200px-Batman.jpg" width="200" height="200">'
			. '</a>';
		$result = $extractor->findThumbs( $this->makeBody( $snippet ) );

		$this->assertCount( 1, $result );
		$this->assertSame(
			'/path/to/Batman.jpg/200px-Batman.jpg',
			DOMCompat::getAttribute( $result[0], 'src' )
		);
	}

	public function testFindThumbsExcludesDisallowedExtension(): void {
		$extractor = new ThumbExtractor( [ 'jpg' ], [], 30, 30, '/wiki/$1' );

		$snippet = '<a class="image" href="/wiki/File:Bat_sign.svg">'
			. '<img src="/path/to/Bat_Sign.svg">'
			. '</a>';
		$result = $extractor->findThumbs( $this->makeBody( $snippet ) );

		$this->assertSame( [], $result );
	}

	public function testFindThumbsExcludesSmallImage(): void {
		$extractor = new ThumbExtractor( [ 'jpg' ], [], 30, 30, '/wiki/$1' );

		$snippet = '<a class="image" href="/wiki/File:Micro_Batman.jpg">'
			. '<img src="/path/to/Micro_Batman.jpg" width="16" height="11">'
			. '</a>';
		$result = $extractor->findThumbs( $this->makeBody( $snippet ) );

		$this->assertSame( [], $result );
	}

	public function testFindThumbsIsAllowedThumb(): void {
		$extractor = new ThumbExtractor( [ 'jpg' ], [], 30, 30, '/wiki/$1' );

		// .metadata is a known non-content ancestor class and should be excluded
		$snippet = '<div class="metadata">'
			. '<a class="image" href="/wiki/File:Meta_Batman.jpg"><img src="/path/to/Meta_Batman.jpg"></a>'
			. '</div>';
		$result = $extractor->findThumbs( $this->makeBody( $snippet ) );

		$this->assertSame( [], $result );
	}

	public function testFindThumbsIsExcludedBySelector(): void {
		$extractor = new ThumbExtractor( [ 'jpg' ], [ '.sidebar-box' ], 30, 30, '/wiki/$1' );

		$snippet = '<div class="sidebar-box">'
			. '<a class="image" href="/wiki/File:Side_Batman.jpg"><img src="/path/to/Side_Batman.jpg"></a>'
			. '</div>';
		$result = $extractor->findThumbs( $this->makeBody( $snippet ) );

		$this->assertSame( [], $result );
	}

	public static function provideExtractTitleFromAnchorElement(): array {
		return [
			// phpcs:disable Generic.Files.LineLength.TooLong
			[
				// Legacy parser version of an image on https://en.wikipedia.org/wiki/Teenage_Engineering
				<<<HTML
					<a
						href="/wiki/File:Teenage_Engineering_OP-1%27s_ultra_punchy_compressor.jpg"
						class="mw-file-description"
					>
						<img
						 	src="//upload.wikimedia.org/wikipedia/commons/thumb/0/01/Teenage_Engineering_OP-1%27s_ultra_punchy_compressor.jpg/250px-Teenage_Engineering_OP-1%27s_ultra_punchy_compressor.jpg"
						 	decoding="async"
						 	width="250"
						 	height="250"
						 	class="mw-file-element"
						 	srcset="//upload.wikimedia.org/wikipedia/commons/thumb/0/01/Teenage_Engineering_OP-1%27s_ultra_punchy_compressor.jpg/500px-Teenage_Engineering_OP-1%27s_ultra_punchy_compressor.jpg 2x"
						 	data-file-width="612"
						 	data-file-height="612"
						>
					</a>
				HTML,
				"File:Teenage_Engineering_OP-1's_ultra_punchy_compressor.jpg"
			],
			[
				// Parsoid version of an image on https://en.wikipedia.org/wiki/Teenage_Engineering
				<<<HTML
					<a
						href="//en.wikipedia.org/wiki/File:Teenage_Engineering_OP-1's_ultra_punchy_compressor.jpg"
						class="mw-file-description"
						id="mwiA"
					>
						<img
							resource="//en.wikipedia.org/wiki/File:Teenage_Engineering_OP-1's_ultra_punchy_compressor.jpg"
							src="//upload.wikimedia.org/wikipedia/commons/thumb/0/01/Teenage_Engineering_OP-1%27s_ultra_punchy_compressor.jpg/250px-Teenage_Engineering_OP-1%27s_ultra_punchy_compressor.jpg"
							decoding="async"
							data-file-width="612"
							data-file-height="612"
							data-file-type="bitmap"
							height="250"
							width="250"
							srcset="//upload.wikimedia.org/wikipedia/commons/thumb/0/01/Teenage_Engineering_OP-1%27s_ultra_punchy_compressor.jpg/500px-Teenage_Engineering_OP-1%27s_ultra_punchy_compressor.jpg 2x"
							class="mw-file-element"
							id="mwiQ"
						>
					</a>
				HTML,
				"File:Teenage_Engineering_OP-1's_ultra_punchy_compressor.jpg"
			],
			// phpcs:enable Generic.Files.LineLength.TooLong
		];
	}

	/**
	 * Regression test for T428610: images whose anchor href attributes
	 * contain percent-encoded characters (commas, Unicode, parentheses)
	 * must still build a valid (decoded) title (which will also match
	 * file names from RepoGroup::findFiles())
	 *
	 * @dataProvider provideExtractTitleFromAnchorElement
	 */
	public function testExtractTitleFromAnchorElement( string $src, ?string $prefixedDbKey = null ): void {
		$doc = DOMCompat::newDocument( true );
		$fragment = DOMUtils::parseHTMLToFragment( $doc, $src );
		$anchor = $fragment->firstElementChild;

		$extractor = new ThumbExtractor( [ 'jpg' ], [], 30, 30, '/wiki/$1' );
		$title = $extractor->extractTitleFromAnchorElement( $anchor );

		if ( $prefixedDbKey === null ) {
			$this->assertNull( $title );
		} else {
			$this->assertInstanceOf( Title::class, $title );
			$this->assertSame( $prefixedDbKey, $title->getPrefixedDbKey() );
		}
	}

	public static function provideForeignArticlePathHrefs(): array {
		return [
			'legacy parser href from a /wiki/$1 source wiki' => [
				'/wiki/File:Example.jpg',
				'File:Example.jpg',
			],
			'Parsoid relative href' => [
				'./File:Example.jpg',
				'File:Example.jpg',
			],
			'Parsoid absolutized href' => [
				'//en.wikipedia.org/wiki/File:Example.jpg',
				'File:Example.jpg',
			],
			'local article path still matches via the primary regex' => [
				'/index.php/File:Example.jpg',
				'File:Example.jpg',
			],
			'href matching neither article path yields no title' => [
				'/static/images/Logo.jpg',
				null,
			],
		];
	}

	/**
	 * Page content is not always rendered by the wiki serving it: in local
	 * development, MobileFrontendContentProvider proxies pages from a
	 * production wiki, so file hrefs follow the *source* wiki's article
	 * path ("/wiki/$1" on Wikimedia sites) rather than this wiki's, and
	 * Parsoid emits relative "./Title" hrefs. Title extraction must fall
	 * back to those shapes when the local article path does not match,
	 * otherwise every thumbnail is dropped and the carousel never renders.
	 *
	 * @dataProvider provideForeignArticlePathHrefs
	 */
	public function testExtractTitleFromAnchorElementFallsBackForForeignContent(
		string $href,
		?string $prefixedDbKey
	): void {
		$doc = DOMCompat::newDocument( true );
		$fragment = DOMUtils::parseHTMLToFragment(
			$doc,
			'<a href="' . rawurlencode( $href ) . '" class="mw-file-description"></a>'
		);
		$anchor = $fragment->firstElementChild;

		// A local article path that does not match Wikimedia's /wiki/$1,
		// as in a default quickstart dev wiki.
		$extractor = new ThumbExtractor( [ 'jpg' ], [], 30, 30, '/index.php/$1' );
		$title = $extractor->extractTitleFromAnchorElement( $anchor );

		if ( $prefixedDbKey === null ) {
			$this->assertNull( $title );
		} else {
			$this->assertInstanceOf( Title::class, $title );
			$this->assertSame( $prefixedDbKey, $title->getPrefixedDbKey() );
		}
	}

}
