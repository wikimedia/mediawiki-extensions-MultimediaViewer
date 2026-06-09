<?php

namespace MediaWiki\Extension\MultimediaViewer\Tests;

use MediaWiki\Extension\MultimediaViewer\Hooks;
use MediaWiki\Extension\MultimediaViewer\ThumbExtractor;
use MediaWiki\Output\OutputPage;
use MediaWiki\Request\FauxRequest;
use MediaWiki\Skin\SkinTemplate;
use MediaWiki\Title\Title;
use MediaWiki\User\User;
use MediaWiki\User\UserRigorOptions;
use MediaWikiIntegrationTestCase;
use Wikimedia\TestingAccessWrapper;

/**
 * @covers \MediaWiki\Extension\MultimediaViewer\Hooks
 * @group Database
 */
class HooksMobileCarouselTest extends MediaWikiIntegrationTestCase {

	private function newHooksInstance(): Hooks {
		return new class(
			$this->getServiceContainer()->getMainConfig(),
			$this->getServiceContainer()->getSpecialPageFactory(),
			$this->getServiceContainer()->getUserOptionsLookup(),
			$this->getServiceContainer()->getPageProps(),
			null
		) extends Hooks {
			public string $currentRequestSkinName = 'minerva';
			public array $stubThumbs = [];
			public bool $useCarousel = true;

			protected function isMobileFrontendView(): bool {
				return true;
			}

			protected function getCurrentRequestSkinName(): string {
				return $this->currentRequestSkinName;
			}

			protected function extractImages( OutputPage $out ): array {
				return $this->stubThumbs;
			}

			protected function shouldUseMobileCarousel( OutputPage $out ): bool {
				return $this->useCarousel;
			}
		};
	}

	private function prepare( User $user, array $requestParams = [] ): array {
		$this->overrideConfigValue( 'MediaViewerMobileCarousel', true );
		$title = Title::newFromText( 'Main Page' );
		$title->setContentModel( CONTENT_MODEL_WIKITEXT );
		$skin = new SkinTemplate();
		$output = $this->createMock( OutputPage::class );
		$output->method( 'getTitle' )->willReturn( $title );
		$output->method( 'getUser' )->willReturn( $user );
		$output->method( 'getRequest' )->willReturn( new FauxRequest( $requestParams ) );

		return [ $skin, $output ];
	}

	/**
	 * Build an OutputPage mock representing a request for an ordinary
	 * article, with a configurable action / diff param / revision state.
	 */
	private function makeArticleOutputPage(
		string $action = 'view',
		array $requestParams = [],
		bool $isRevisionCurrent = true
	): OutputPage {
		$title = Title::newFromText( 'Paris' );
		$title->setContentModel( CONTENT_MODEL_WIKITEXT );
		$output = $this->createMock( OutputPage::class );
		$output->method( 'getTitle' )->willReturn( $title );
		$output->method( 'getActionName' )->willReturn( $action );
		$output->method( 'getRequest' )->willReturn( new FauxRequest( $requestParams ) );
		$output->method( 'isRevisionCurrent' )->willReturn( $isRevisionCurrent );

		return $output;
	}

	public function testShouldPageGetMobileCarouselOnPlainView(): void {
		$hooks = TestingAccessWrapper::newFromObject( $this->newHooksInstance() );

		$this->assertTrue(
			$hooks->shouldPageGetMobileCarousel( $this->makeArticleOutputPage() )
		);
	}

	public function testShouldPageGetMobileCarouselRejectsNonViewActions(): void {
		$hooks = TestingAccessWrapper::newFromObject( $this->newHooksInstance() );

		foreach ( [ 'history', 'edit', 'info' ] as $action ) {
			$this->assertFalse(
				$hooks->shouldPageGetMobileCarousel( $this->makeArticleOutputPage( $action ) ),
				"carousel should not show for action=$action"
			);
		}
	}

	public function testShouldPageGetMobileCarouselRejectsDiffs(): void {
		$hooks = TestingAccessWrapper::newFromObject( $this->newHooksInstance() );

		// Diffs are served as part of the view action (T428701)
		$this->assertFalse(
			$hooks->shouldPageGetMobileCarousel(
				$this->makeArticleOutputPage( 'view', [ 'diff' => '12345' ] )
			)
		);
		$this->assertFalse(
			$hooks->shouldPageGetMobileCarousel(
				$this->makeArticleOutputPage( 'view', [ 'diff' => 'prev', 'oldid' => '12345' ] )
			)
		);
	}

	public function testShouldPageGetMobileCarouselRejectsOldRevisions(): void {
		$hooks = TestingAccessWrapper::newFromObject( $this->newHooksInstance() );

		$this->assertFalse(
			$hooks->shouldPageGetMobileCarousel(
				$this->makeArticleOutputPage( 'view', [ 'oldid' => '12345' ], false )
			)
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

	public function testOnBeforePageDisplayInjectsCarouselMarkupWhenEnabled(): void {
		$user = $this->getServiceContainer()->getUserFactory()
			->newFromName( 'HooksMobileCarouselUser' );
		[ $skin, $output ] = $this->prepare( $user );

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

		$hooks = $this->newHooksInstance();
		$hooks->stubThumbs = [
			self::makeFakeThumb( 'A' ),
			self::makeFakeThumb( 'B' ),
			self::makeFakeThumb( 'C' ),
		];

		$hooks->onBeforePageDisplay( $output, $skin );
	}

	public function testOnBeforePageDisplayInjectsCarouselMarkupForAnonymousReaders(): void {
		$user = $this->getServiceContainer()->getUserFactory()
			->newFromName( '127.0.0.1', UserRigorOptions::RIGOR_NONE );
		[ $skin, $output ] = $this->prepare( $user );

		$output->expects( $this->once() )
			->method( 'addModules' )
			->with( 'mmv.carousel' );
		$output->expects( $this->once() )
			->method( 'prependHTML' )
			->with( $this->stringContains( 'id="mmv-carousel-root"' ) );

		$hooks = $this->newHooksInstance();
		$hooks->stubThumbs = [
			self::makeFakeThumb( 'A' ),
			self::makeFakeThumb( 'B' ),
			self::makeFakeThumb( 'C' ),
		];

		$hooks->onBeforePageDisplay( $output, $skin );
	}

	/**
	 * Regression test: the mobile carousel must extract thumbnails even when the
	 * DOM backend reports element names in upper case.
	 *
	 * extractImagesFromHtml() locates each thumbnail's parent <a> to read the
	 * file name. Comparing $anchor->nodeName to a lower-case 'a' silently
	 * dropped every thumbnail on DOM backends that return upper-case names
	 * (newer libraries, and PHP 8.4 for the native DOM), so the carousel fell
	 * below its image minimum and never rendered. The comparison must be
	 * case-insensitive (DOMUtils::nodeName()).
	 */
	public function testExtractImagesFromHtmlHandlesUpperCaseAnchorNodeNames(): void {
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

		$thumbExtractor = new ThumbExtractor( [ 'jpg' => 'default' ], [] );
		$hooks = TestingAccessWrapper::newFromObject( $this->newHooksInstance() );

		$thumbs = $hooks->extractImagesFromHtml( $html, $thumbExtractor );

		$this->assertCount( 3, $thumbs, 'all three proxied thumbnails should be extracted' );
		$this->assertSame( 'File:Eiffel.jpg', $thumbs[0]['title'] );
		$this->assertSame( '//upload.wikimedia.org/Eiffel.jpg', $thumbs[0]['src'] );
		$this->assertSame( '//upload.wikimedia.org/Pantheon.jpg', $thumbs[2]['src'] );
	}

	public function testExtractImagesFromHtmlPreservesAltTextAndAllowsMissingAltText(): void {
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

		$thumbExtractor = new ThumbExtractor( [ 'jpg' => 'default' ], [] );
		$hooks = TestingAccessWrapper::newFromObject( $this->newHooksInstance() );

		$thumbs = $hooks->extractImagesFromHtml( $html, $thumbExtractor );

		$this->assertCount( 3, $thumbs, 'missing alt text should not suppress carousel images' );
		$this->assertSame( 'Eiffel Tower at dusk', $thumbs[0]['alt'] );
		$this->assertSame( '', $thumbs[1]['alt'] );
		$this->assertSame( 'Pantheon facade', $thumbs[2]['alt'] );
	}

	public function testOnBeforePageDisplaySkipsCarouselWhenNotApplicable(): void {
		$user = $this->getServiceContainer()->getUserFactory()
			->newFromName( 'HooksMobileCarouselUser' );
		[ $skin, $output ] = $this->prepare( $user );

		// No carousel and no beta opt-in, so no modules are added at all.
		$output->expects( $this->never() )
			->method( 'addModules' );
		$output->expects( $this->never() )
			->method( 'prependHTML' );

		$hooks = $this->newHooksInstance();
		$hooks->useCarousel = false;
		$hooks->stubThumbs = [
			self::makeFakeThumb( 'A' ),
			self::makeFakeThumb( 'B' ),
			self::makeFakeThumb( 'C' ),
		];

		$hooks->onBeforePageDisplay( $output, $skin );
	}

	public function testOnBeforePageDisplaySkipsCarouselWhenFewerThanMinImages(): void {
		$user = $this->getServiceContainer()->getUserFactory()
			->newFromName( 'HooksMobileCarouselUser' );
		[ $skin, $output ] = $this->prepare( $user );

		// Below the threshold no carousel is rendered, so the carousel module
		// must not be loaded either (T428627).
		$output->expects( $this->never() )
			->method( 'addModules' );
		$output->expects( $this->never() )
			->method( 'prependHTML' );

		$hooks = $this->newHooksInstance();
		// 2 images: below the MIN_CAROUSEL_IMAGES threshold of 3
		$hooks->stubThumbs = [
			self::makeFakeThumb( 'A' ),
			self::makeFakeThumb( 'B' ),
		];

		$hooks->onBeforePageDisplay( $output, $skin );
	}

	public function testOnBeforePageDisplayLoadsBetaViewerAlongsideCarousel(): void {
		[ $skin, $output ] = $this->prepare(
			$this->getServiceContainer()->getUserFactory()->newFromName( 'HooksMobileCarouselUser' ),
			[ 'mmvBeta' => '1' ]
		);

		// ?mmvBeta=1 alone loads the bootstrap alongside the carousel so it can
		// intercept the shared #/media/ route ahead of the MobileFrontend
		// lightbox (T427679).
		$addedModules = [];
		$output->method( 'addModules' )
			->willReturnCallback( static function ( $modules ) use ( &$addedModules ) {
				$addedModules[] = $modules;
			} );

		$hooks = $this->newHooksInstance();
		$hooks->stubThumbs = [
			self::makeFakeThumb( 'A' ),
			self::makeFakeThumb( 'B' ),
			self::makeFakeThumb( 'C' ),
		];

		$hooks->onBeforePageDisplay( $output, $skin );

		$this->assertSame( [ 'mmv.bootstrap', 'mmv.carousel' ], $addedModules );
	}

	public function testOnBeforePageDisplayLoadsBetaViewerWithoutCarousel(): void {
		[ $skin, $output ] = $this->prepare(
			$this->getServiceContainer()->getUserFactory()->newFromName( 'HooksMobileCarouselUser' ),
			[ 'mmvBeta' => '1' ]
		);

		// No carousel on this page, but ?mmvBeta=1 still loads the beta viewer.
		$output->expects( $this->once() )
			->method( 'addModules' )
			->with( 'mmv.bootstrap' );
		$output->expects( $this->never() )
			->method( 'prependHTML' );

		$hooks = $this->newHooksInstance();
		$hooks->useCarousel = false;

		$hooks->onBeforePageDisplay( $output, $skin );
	}

	public function testOnBeforePageDisplaySkipsBetaViewerWithoutMmvBetaParam(): void {
		[ $skin, $output ] = $this->prepare(
			$this->getServiceContainer()->getUserFactory()->newFromName( 'HooksMobileCarouselUser' )
		);

		// Without ?mmvBeta=1 the bootstrap must not load: only the carousel does,
		// routing clicks to the MobileFrontend lightbox.
		$output->expects( $this->once() )
			->method( 'addModules' )
			->with( 'mmv.carousel' );

		$hooks = $this->newHooksInstance();
		$hooks->stubThumbs = [
			self::makeFakeThumb( 'A' ),
			self::makeFakeThumb( 'B' ),
			self::makeFakeThumb( 'C' ),
		];

		$hooks->onBeforePageDisplay( $output, $skin );
	}

	public function testOnMakeGlobalVariablesScriptSetsOnClickFalseWhenViewerDisabled(): void {
		$user = $this->getTestUser()->getUser();
		$userOptionsManager = $this->getServiceContainer()->getUserOptionsManager();
		// Explicitly disable the viewer so shouldHandleClicks() returns false
		$userOptionsManager->setOption( $user, 'multimediaviewer-enable', 0 );
		$user->saveSettings();

		$output = $this->createMock( OutputPage::class );
		$output->method( 'getUser' )->willReturn( $user );

		$vars = [];
		$this->newHooksInstance()->onMakeGlobalVariablesScript( $vars, $output );

		$this->assertFalse( $vars['wgMediaViewerOnClick'] );
	}

	public function testOnMakeGlobalVariablesScriptSetsOnClickTrueWhenViewerEnabled(): void {
		$user = $this->getTestUser()->getUser();
		$userOptionsManager = $this->getServiceContainer()->getUserOptionsManager();
		$userOptionsManager->setOption( $user, 'multimediaviewer-enable', 1 );
		$user->saveSettings();

		$output = $this->createMock( OutputPage::class );
		$output->method( 'getUser' )->willReturn( $user );

		$vars = [];
		$this->newHooksInstance()->onMakeGlobalVariablesScript( $vars, $output );

		$this->assertTrue( $vars['wgMediaViewerOnClick'] );
	}
}
