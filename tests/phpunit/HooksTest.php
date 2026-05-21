<?php

namespace MediaWiki\Extension\MultimediaViewer\Tests;

use MediaWiki\Extension\MultimediaViewer\Hooks;
use MediaWiki\Output\OutputPage;
use MediaWiki\Request\FauxRequest;
use MediaWiki\Skin\SkinTemplate;
use MediaWiki\Title\Title;
use MediaWikiIntegrationTestCase;

/**
 * @covers \MediaWiki\Extension\MultimediaViewer\Hooks
 */
class HooksTest extends MediaWikiIntegrationTestCase {

	public function newHooksInstance() {
		return new Hooks(
			$this->getServiceContainer()->getMainConfig(),
			$this->getServiceContainer()->getSpecialPageFactory(),
			$this->getServiceContainer()->getUserOptionsLookup(),
			$this->getServiceContainer()->getPageProps(),
			null
		);
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
		$t = Title::newFromText( $pagename );
		// Force content model to avoid DB queries
		$t->setContentModel( CONTENT_MODEL_WIKITEXT );
		$skin = new SkinTemplate();
		$output = $this->createMock( OutputPage::class );
		$output->method( 'getTitle' )->willReturn( $t );
		$output->method( 'getUser' )->willReturn(
			$this->getServiceContainer()->getUserFactory()->newFromName( 'HooksTestUser' )
		);
		$output->expects( $this->exactly( $modulesExpected ) )->method( 'addModules' );
		$this->newHooksInstance()->onBeforePageDisplay( $output, $skin );
	}

	/**
	 * Call the private buildCarouselItems method via reflection.
	 * @param array[] $thumbData
	 * @return string
	 */
	private function buildCarouselItems( array $thumbData ): string {
		$method = new \ReflectionMethod( Hooks::class, 'buildCarouselItems' );
		return $method->invoke( $this->newHooksInstance(), $thumbData );
	}

	/**
	 * Call the private buildCarouselHtml method via reflection.
	 * @param array[] $thumbData
	 * @param string $pageTitle
	 * @return string
	 */
	private function buildCarouselHtml( array $thumbData, string $pageTitle ): string {
		$method = new \ReflectionMethod( Hooks::class, 'buildCarouselHtml' );
		return $method->invoke( $this->newHooksInstance(), $thumbData, $pageTitle );
	}

	public function testBuildCarouselItemsEmpty(): void {
		$this->assertSame( '', $this->buildCarouselItems( [] ) );
	}

	public function testBuildCarouselItemsRendersItem(): void {
		$html = $this->buildCarouselItems( [ [
			'title' => 'File:Cat.jpg',
			'href' => '/wiki/File:Cat.jpg',
			'src' => '/images/thumb/cat.jpg',
			'srcset' => '/images/thumb/cat-240px.jpg 2x',
			'width' => 120,
			'height' => 90,
			'alt' => 'A cat',
		] ] );

		$this->assertStringContainsString( 'class="mmv-carousel__item"', $html );
		$this->assertStringContainsString( 'data-mmv-title="File:Cat.jpg"', $html );
		$this->assertStringContainsString( 'data-mmv-position="1"', $html );
		$this->assertStringContainsString( 'href="/wiki/File:Cat.jpg"', $html );
		$this->assertStringContainsString( 'class="mmv-carousel__item-link mw-file-description"', $html );
		$this->assertStringContainsString( 'aria-label="A cat"', $html );
		$this->assertStringContainsString( 'src="/images/thumb/cat.jpg"', $html );
		$this->assertStringContainsString( 'srcset="/images/thumb/cat-240px.jpg 2x"', $html );
		$this->assertStringContainsString( 'width="120"', $html );
		$this->assertStringContainsString( 'height="90"', $html );
		$this->assertStringContainsString( 'alt="A cat"', $html );
		$this->assertStringContainsString( 'class="mmv-carousel__item-image"', $html );
		$this->assertStringContainsString( 'loading="lazy"', $html );
	}

	public function testBuildCarouselItemsFallsBackToFilenameForAriaLabel(): void {
		$html = $this->buildCarouselItems( [ [
			'title' => 'File:Cat.jpg',
			'href' => '/wiki/File:Cat.jpg',
			'src' => '/images/thumb/cat.jpg',
			'srcset' => '',
			'width' => 120,
			'height' => 90,
			'alt' => '',
			'label' => 'Cat',
		] ] );

		$this->assertStringContainsString( 'class="mmv-carousel__item"', $html );
		$this->assertStringContainsString( 'alt=""', $html );
		$this->assertStringContainsString( 'aria-label="Cat"', $html );
	}

	public function testBuildCarouselHtmlIncludesLabelWithCount(): void {
		$html = $this->buildCarouselHtml(
			[
				self::makeFakeThumb( 'A' ),
				self::makeFakeThumb( 'B' ),
				self::makeFakeThumb( 'C' ),
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
				self::makeFakeThumb( 'A' ),
			],
			''
		);

		$this->assertStringContainsString(
			'aria-label="Images in article, 1 item"',
			$html
		);
	}

	private static function makeFakeThumb( string $name ): array {
		return [
			'title' => "File:$name.jpg",
			'href' => "/wiki/File:$name.jpg",
			'src' => "/$name.jpg",
			'srcset' => "/$name-240px.jpg 2x",
			'width' => 120,
			'height' => 90,
			'alt' => $name,
		];
	}

	private function makeCarouselHooks( array $thumbs ): Hooks {
		$hooks = new class(
			$this->getServiceContainer()->getMainConfig(),
			$this->getServiceContainer()->getSpecialPageFactory(),
			$this->getServiceContainer()->getUserOptionsLookup(),
			$this->getServiceContainer()->getPageProps(),
			null
		) extends Hooks {
			public array $stubThumbs = [];

			protected function isMobileFrontendView(): bool {
				return true;
			}

			protected function shouldUseMobileCarousel( OutputPage $out ): bool {
				return true;
			}

			protected function extractImages( OutputPage $out ): array {
				return $this->stubThumbs;
			}
		};
		$hooks->stubThumbs = $thumbs;
		return $hooks;
	}

	public function testOnBeforePageDisplayInjectsCarouselMarkup(): void {
		$title = Title::newFromText( 'Main Page' );
		$title->setContentModel( CONTENT_MODEL_WIKITEXT );
		$skin = new SkinTemplate();
		$output = $this->createMock( OutputPage::class );
		$output->method( 'getTitle' )->willReturn( $title );
		$output->method( 'getUser' )->willReturn(
			$this->getServiceContainer()->getUserFactory()->newFromName( 'HooksTestCarouselUser' )
		);
		$output->method( 'getRequest' )->willReturn( new FauxRequest( [] ) );
		$output->expects( $this->once() )
			->method( 'addModules' )
			->with( [ 'mmv.carousel' ] );
		$output->expects( $this->once() )
			->method( 'prependHTML' )
			->with( $this->callback( static function ( string $html ): bool {
				return str_contains( $html, 'id="mmv-carousel-root"' ) &&
					str_contains( $html, 'class="mw-mmv-wrapper mmv-carousel"' ) &&
					str_contains( $html, 'class="mmv-carousel__items"' );
			} ) );

		$hooks = $this->makeCarouselHooks( [
			self::makeFakeThumb( 'A' ),
			self::makeFakeThumb( 'B' ),
			self::makeFakeThumb( 'C' ),
		] );

		$hooks->onBeforePageDisplay( $output, $skin );
	}

	public function testCarouselBelowThresholdNotInjected(): void {
		$title = Title::newFromText( 'Main Page' );
		$title->setContentModel( CONTENT_MODEL_WIKITEXT );
		$skin = new SkinTemplate();
		$output = $this->createMock( OutputPage::class );
		$output->method( 'getTitle' )->willReturn( $title );
		$output->method( 'getUser' )->willReturn(
			$this->getServiceContainer()->getUserFactory()->newFromName( 'HooksTestCarouselUserTwo' )
		);
		$output->method( 'getRequest' )->willReturn( new FauxRequest( [] ) );
		$output->expects( $this->never() )->method( 'prependHTML' );

		$hooks = $this->makeCarouselHooks( [
			self::makeFakeThumb( 'A' ),
			self::makeFakeThumb( 'B' )
		] );

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
}
