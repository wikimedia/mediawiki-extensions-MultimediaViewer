<?php

namespace MediaWiki\Extension\MultimediaViewer\Tests;

use MediaWiki\Output\OutputPage;
use MediaWiki\Skin\SkinTemplate;
use MediaWiki\Title\Title;

/**
 * @covers \MediaWiki\Extension\MultimediaViewer\Hooks
 */
class HooksTest extends HooksTestCase {

	/**
	 * Regression test for T428742: the multimediaviewer-enable preference
	 * must remain visible in Special:Preferences.
	 */
	public function testOnGetPreferencesRegistersEnableToggle() {
		$prefs = [];
		$this->newHooksInstance()->onGetPreferences(
			$this->getServiceContainer()->getUserFactory()->newFromName( 'HooksTestUser' ),
			$prefs
		);

		$this->assertArrayHasKey( 'multimediaviewer-enable', $prefs );
		$this->assertSame( 'toggle', $prefs['multimediaviewer-enable']['type'] );
	}

	public static function provideOnBeforePageDisplay() {
		return [
			'no files' => [ 'Main Page', 1 ],
			'with files' => [ 'Main Page', 1 ],
			'special with files' => [ 'Special:ListFiles', 1 ],
			'special no files' => [ 'Special:Watchlist', 0 ],
		];
	}

	/**
	 * @dataProvider provideOnBeforePageDisplay
	 */
	public function testOnBeforePageDisplay( $pagename, $modulesExpected ) {
		$output = $this->makeOutputPage( Title::newFromText( $pagename ) );
		$skin = new SkinTemplate();

		// The carousel module is only loaded when enough thumbnails exist
		// for carousel markup to actually render (T428627).
		$hooks = $this->newHooksInstance( [
			self::makeFakeThumbData( 'A.jpg' ),
			self::makeFakeThumbData( 'B.jpg' ),
			self::makeFakeThumbData( 'C.jpg' ),
		] );

		$output->expects( $this->exactly( $modulesExpected ) )->method( 'addModules' );
		$hooks->onBeforePageDisplay( $output, $skin );
	}

	public function testBuildCarouselItemsEmpty(): void {
		$this->assertSame( '', $this->buildCarouselItemsHtml( [] ) );
	}

	public function testBuildCarouselItemsRendersItem(): void {
		$html = $this->buildCarouselItemsHtml( [
			self::makeFakeThumbData( 'Cat.jpg', 'A cat' ),
		] );

		$this->assertStringContainsString( 'class="mmv-carousel__item"', $html );
		$this->assertStringContainsString( 'data-mmv-title="File:Cat.jpg"', $html );
		$this->assertStringContainsString( 'data-mmv-position="1"', $html );
		$this->assertStringContainsString( 'href="/wiki/File:Cat.jpg"', $html );
		$this->assertStringContainsString( 'class="mmv-carousel__item-link mw-file-description"', $html );
		$this->assertStringContainsString( 'aria-label="A cat"', $html );
		$this->assertStringContainsString(
			'src="//upload.wikimedia.org/wikipedia/commons/thumb/1/10/Cat.jpg/120px-Cat.jpg"',
			$html
		);
		$this->assertStringContainsString(
			'srcset="//upload.wikimedia.org/wikipedia/commons/thumb/1/10/Cat.jpg/240px-Cat.jpg 2x"',
			$html
		);
		$this->assertStringContainsString( 'width="120"', $html );
		$this->assertStringContainsString( 'height="90"', $html );
		$this->assertStringContainsString( 'alt="A cat"', $html );
		$this->assertStringContainsString( 'class="mmv-carousel__item-image"', $html );
		$this->assertStringContainsString( 'loading="lazy"', $html );
	}

	public function testBuildCarouselItemsFallsBackToFilenameForAriaLabel(): void {
		$html = $this->buildCarouselItemsHtml( [
			self::makeFakeThumbData( 'Cat.jpg', '' ),
		] );

		$this->assertStringContainsString( 'class="mmv-carousel__item"', $html );
		$this->assertStringContainsString( 'alt=""', $html );
		$this->assertStringContainsString( 'aria-label="Cat"', $html );
	}

	public function testBuildCarouselHtmlIncludesLabelWithCount(): void {
		$html = $this->buildCarouselHtml(
			[
				self::makeFakeThumbData( 'A.jpg' ),
				self::makeFakeThumbData( 'B.jpg' ),
				self::makeFakeThumbData( 'C.jpg' ),
			],
			'Main Page'
		);

		$this->assertStringContainsString(
			'aria-label="Images in Main Page, 3 items"',
			$html
		);
	}

	public function testBuildCarouselHtmlFallsBackToGenericArticleLabelWhenTitleMissing(): void {
		$html = $this->buildCarouselHtml(
			[
				self::makeFakeThumbData( 'A.jpg' ),
			],
			''
		);

		$this->assertStringContainsString(
			'aria-label="Images in article, 1 item"',
			$html
		);
	}

	public function testOnBeforePageDisplayInjectsCarouselMarkup(): void {
		$output = $this->makeOutputPage();
		$skin = new SkinTemplate();
		$hooks = $this->newHooksInstance( [
			self::makeFakeThumbData( 'A.jpg' ),
			self::makeFakeThumbData( 'B.jpg' ),
			self::makeFakeThumbData( 'C.jpg' ),
		] );

		$output->expects( $this->once() )
			->method( 'addModules' )
			->with( 'mmv.carousel' );
		$output->expects( $this->once() )
			->method( 'prependHTML' )
			->with( $this->callback( static function ( string $html ): bool {
				return str_contains( $html, 'id="mmv-carousel-root"' ) &&
					str_contains( $html, 'class="mw-mmv-wrapper mmv-carousel"' ) &&
					str_contains( $html, 'class="mmv-carousel__items"' );
			} ) );
		$hooks->onBeforePageDisplay( $output, $skin );
	}

	public function testCarouselBelowThresholdNotInjected(): void {
		$output = $this->makeOutputPage();
		$skin = new SkinTemplate();
		$hooks = $this->newHooksInstance( [
			self::makeFakeThumbData( 'A.jpg' ),
			self::makeFakeThumbData( 'B.jpg' )
		] );

		$output->expects( $this->never() )->method( 'prependHTML' );
		// Below the threshold the carousel module must not be loaded (T428627).
		$output->expects( $this->never() )->method( 'addModules' );
		$hooks->onBeforePageDisplay( $output, $skin );
	}

	public function testCarouselExclusionBehaviorSwitchIsRegistered(): void {
		$doubleUnderscoreIDs = $this->getServiceContainer()
			->getMagicWordFactory()
			->getDoubleUnderscoreArray()
			->getNames();

		$this->assertContains( 'nomediaviewercarousel', $doubleUnderscoreIDs );
		$this->assertTrue(
			$this->getServiceContainer()
				->getMagicWordFactory()
				->get( 'nomediaviewercarousel' )
				->matchStartToEnd( '__NOMEDIAVIEWERCAROUSEL__' )
		);
	}

	public function testShouldPageGetMobileCarouselSkipsMainPage(): void {
		$this->overrideConfigValue( 'MainPage', 'Main Page' );

		$output = $this->createMock( OutputPage::class );
		$output->method( 'getTitle' )->willReturn( Title::newFromText( 'Main Page' ) );

		$this->assertFalse( $this->shouldPageGetMobileCarousel( $output ) );
	}

}
