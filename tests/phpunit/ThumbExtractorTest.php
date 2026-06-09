<?php

namespace MediaWiki\Extension\MultimediaViewer\Tests;

use MediaWiki\Extension\MultimediaViewer\ThumbExtractor;
use MediaWiki\FileRepo\File\File;
use MediaWiki\Title\Title;
use MediaWikiIntegrationTestCase;
use Wikimedia\Parsoid\Core\DOMCompat;
use Wikimedia\Parsoid\DOM\DocumentFragment;

/**
 * @covers \MediaWiki\Extension\MultimediaViewer\ThumbExtractor
 */
class ThumbExtractorTest extends MediaWikiIntegrationTestCase {

	private function makeFile( string $ext, int $width, int $height ) {
		$file = $this->createMock( File::class );
		$file->method( 'exists' )->willReturn( true );
		$file->method( 'getExtension' )->willReturn( $ext );
		$file->method( 'getWidth' )->willReturn( $width );
		$file->method( 'getHeight' )->willReturn( $height );
		$file->method( 'getTitle' )->willReturn( $this->createMock( Title::class ) );
		$file->method( 'getFullUrl' )->willReturn( "https://gotham.city/The_Right_Image_URL.$ext" );
		return $file;
	}

	private function makeBody( string $html ): DocumentFragment {
		$doc = DOMCompat::newDocument( true );
		$fragment = $doc->createDocumentFragment();
		DOMCompat::setInnerHTML( $fragment, $html );
		return $fragment;
	}

	public function testExtractReturnsEmptyForNullBody(): void {
		$extractor = new ThumbExtractor( [], [] );
		$this->assertSame( [], $extractor->extract( null, [] ) );
	}

	public function testExtractMatchesThumbToFile(): void {
		$file = $this->makeFile( 'jpg', 123, 321 );
		$files = [ 'Batman.jpg' => $file ];
		$extractor = new ThumbExtractor( [ 'jpg' => 'default' ], [] );

		$snippet = '<a class="mw-file-description">'
			. '<img src="/path/to/Batman.jpg/200px-Batman.jpg" width="200" height="200">'
			. '</a>';
		$result = $extractor->extract( $this->makeBody( $snippet ), $files );

		$this->assertCount( 1, $result );
		$this->assertSame( 'Batman.jpg', $result[0]['name'] );
		$this->assertSame( 'jpg', $result[0]['extension'] );
		$this->assertNotNull( $result[0]['thumb'] );
	}

	public function testExtractExcludesDisallowedExtension(): void {
		$file = $this->makeFile( 'svg', 666, 666 );
		$files = [ 'Bat_Sign.svg' => $file ];
		$extractor = new ThumbExtractor( [ 'jpg' => 'default' ], [] );

		$snippet = '<a class="image"><img src="/path/to/Bat_Sign.svg"></a>';
		$result = $extractor->extract( $this->makeBody( $snippet ), $files );

		$this->assertSame( [], $result );
	}

	public function testExtractExcludesSmallImage(): void {
		$file = $this->makeFile( 'jpg', 16, 11 );
		$files = [ 'Micro_Batman.jpg' => $file ];
		$extractor = new ThumbExtractor( [ 'jpg' => 'default' ], [] );

		$snippet = '<a class="image"><img src="/path/to/Micro_Batman.jpg"></a>';
		$result = $extractor->extract( $this->makeBody( $snippet ), $files );

		$this->assertSame( [], $result );
	}

	public function testExtractIsAllowedThumb(): void {
		$file = $this->makeFile( 'jpg', 666, 666 );
		$files = [ 'Meta_Batman.jpg' => $file ];
		$extractor = new ThumbExtractor( [ 'jpg' => 'default' ], [] );

		// .metadata is a known non-content ancestor class and should be excluded
		$snippet = '<div class="metadata">'
			. '<a class="image"><img src="/path/to/Meta_Batman.jpg"></a>'
			. '</div>';
		$result = $extractor->extract( $this->makeBody( $snippet ), $files );

		$this->assertSame( [], $result );
	}

	public function testExtractIsExcludedBySelector(): void {
		$file = $this->makeFile( 'jpg', 666, 666 );
		$files = [ 'Side_Batman.jpg' => $file ];
		$extractor = new ThumbExtractor( [ 'jpg' => 'default' ], [ '.sidebar-box' ] );

		$snippet = '<div class="sidebar-box">'
			. '<a class="image"><img src="/path/to/Side_Batman.jpg"></a>'
			. '</div>';
		$result = $extractor->extract( $this->makeBody( $snippet ), $files );

		$this->assertSame( [], $result );
	}

	/**
	 * Regression test for T428610: images whose src attributes contain
	 * percent-encoded characters (commas, Unicode, parentheses) must
	 * still match the decoded file names from RepoGroup::findFiles().
	 */
	public function testExtractMatchesEncodedSrcToDecodedFileName(): void {
		$file = $this->makeFile( 'jpg', 800, 600 );
		$files = [ 'Hue,_Vietnam.jpg' => $file ];
		$extractor = new ThumbExtractor( [ 'jpg' => 'default' ], [] );

		// The src contains %2C for the comma, as Parsoid would produce
		$snippet = '<a class="mw-file-description">'
			. '<img src="/path/to/Hue%2C_Vietnam.jpg/200px-Hue%2C_Vietnam.jpg" width="200" height="200">'
			. '</a>';
		$result = $extractor->extract( $this->makeBody( $snippet ), $files );

		$this->assertCount( 1, $result );
		$this->assertSame( 'Hue,_Vietnam.jpg', $result[0]['name'] );
	}

	/**
	 * Regression test for T428610: Unicode characters in file names must
	 * also match when the src attribute uses percent-encoding.
	 */
	public function testExtractMatchesEncodedUnicodeSrcToFileName(): void {
		$file = $this->makeFile( 'jpg', 800, 600 );
		$files = [ 'Khâm_Đức.jpg' => $file ];
		$extractor = new ThumbExtractor( [ 'jpg' => 'default' ], [] );

		// Percent-encoded UTF-8: â = %C3%A2, Đ = %C4%90, ứ = %E1%BB%A9
		$snippet = '<a class="mw-file-description">'
			. '<img src="/path/to/Kh%C3%A2m_%C4%90%E1%BB%A9c.jpg/200px.jpg" width="200" height="200">'
			. '</a>';
		$result = $extractor->extract( $this->makeBody( $snippet ), $files );

		$this->assertCount( 1, $result );
		$this->assertSame( 'Khâm_Đức.jpg', $result[0]['name'] );
	}
}
