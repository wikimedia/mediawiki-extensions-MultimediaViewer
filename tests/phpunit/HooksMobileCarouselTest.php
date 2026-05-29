<?php

namespace MediaWiki\Extension\MultimediaViewer\Tests;

use MediaWiki\Extension\MultimediaViewer\Hooks;
use MediaWiki\Output\OutputPage;
use MediaWiki\Request\FauxRequest;
use MediaWiki\Skin\SkinTemplate;
use MediaWiki\Title\Title;
use MediaWiki\User\User;
use MediaWikiIntegrationTestCase;

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
		[ $skin, $output ] = $this->prepare( User::newFromName( 'HooksMobileCarouselUser' ) );

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

		$hooks = $this->newHooksInstance();
		$hooks->stubThumbs = [
			self::makeFakeThumb( 'A' ),
			self::makeFakeThumb( 'B' ),
			self::makeFakeThumb( 'C' ),
		];

		$hooks->onBeforePageDisplay( $output, $skin );
	}

	public function testOnBeforePageDisplayInjectsCarouselMarkupForAnonymousReaders(): void {
		[ $skin, $output ] = $this->prepare( User::newFromName( '127.0.0.1', false ) );

		$output->expects( $this->once() )
			->method( 'addModules' )
			->with( [ 'mmv.carousel' ] );
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

	public function testOnBeforePageDisplaySkipsCarouselWhenNotApplicable(): void {
		[ $skin, $output ] = $this->prepare( User::newFromName( 'HooksMobileCarouselUser' ) );

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
		[ $skin, $output ] = $this->prepare( User::newFromName( 'HooksMobileCarouselUser' ) );

		// Modules are still added, but no HTML is prepended
		$output->expects( $this->once() )
			->method( 'addModules' )
			->with( [ 'mmv.carousel' ] );
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
			User::newFromName( 'HooksMobileCarouselUser' ), [ 'mmvBeta' => '1' ] );

		// ?mmvBeta=1 alone loads the bootstrap alongside the carousel so it can
		// intercept the shared #/media/ route ahead of the MobileFrontend
		// lightbox (T427679).
		$output->expects( $this->once() )
			->method( 'addModules' )
			->with( [ 'mmv.carousel', 'mmv.bootstrap' ] );

		$hooks = $this->newHooksInstance();
		$hooks->stubThumbs = [
			self::makeFakeThumb( 'A' ),
			self::makeFakeThumb( 'B' ),
			self::makeFakeThumb( 'C' ),
		];

		$hooks->onBeforePageDisplay( $output, $skin );
	}

	public function testOnBeforePageDisplayLoadsBetaViewerWithoutCarousel(): void {
		[ $skin, $output ] = $this->prepare(
			User::newFromName( 'HooksMobileCarouselUser' ), [ 'mmvBeta' => '1' ] );

		// No carousel on this page, but ?mmvBeta=1 still loads the beta viewer.
		$output->expects( $this->once() )
			->method( 'addModules' )
			->with( [ 'mmv.bootstrap' ] );
		$output->expects( $this->never() )
			->method( 'prependHTML' );

		$hooks = $this->newHooksInstance();
		$hooks->useCarousel = false;

		$hooks->onBeforePageDisplay( $output, $skin );
	}

	public function testOnBeforePageDisplaySkipsBetaViewerWithoutMmvBetaParam(): void {
		[ $skin, $output ] = $this->prepare( User::newFromName( 'HooksMobileCarouselUser' ) );

		// Without ?mmvBeta=1 the bootstrap must not load: only the carousel does,
		// routing clicks to the MobileFrontend lightbox.
		$output->expects( $this->once() )
			->method( 'addModules' )
			->with( [ 'mmv.carousel' ] );

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
