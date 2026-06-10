<?php

namespace MediaWiki\Extension\MultimediaViewer\Tests;

use MediaWiki\Extension\MultimediaViewer\ThumbExtractor;
use MediaWiki\Output\OutputPage;
use MediaWiki\Request\FauxRequest;
use MediaWiki\Skin\SkinTemplate;
use MediaWiki\User\UserRigorOptions;
use Wikimedia\Parsoid\Core\DOMCompat;

/**
 * @covers \MediaWiki\Extension\MultimediaViewer\Hooks
 * @group Database
 */
class HooksMobileCarouselTest extends HooksTestCase {
	public function testShouldPageGetMobileCarouselOnPlainView(): void {
		$output = $this->makeOutputPage();

		$this->assertTrue( $this->shouldPageGetMobileCarousel( $output ) );
	}

	public function testShouldPageGetMobileCarouselRejectsNonViewActions(): void {
		foreach ( [ 'history', 'edit', 'info' ] as $action ) {
			$output = $this->makeOutputPage( actionName: $action );
			$output->method( 'getActionName' )->willReturn( $action );
			$this->assertFalse(
				$this->shouldPageGetMobileCarousel( $output ),
				"carousel should not show for action=$action"
			);
		}
	}

	public function testShouldPageGetMobileCarouselRejectsDiffs(): void {
		// Diffs are served as part of the view action (T428701)
		$output = $this->makeOutputPage(
			request: new FauxRequest( [ 'diff' => '12345' ] )
		);
		$this->assertFalse( $this->shouldPageGetMobileCarousel( $output ) );

		$output = $this->makeOutputPage(
			request: new FauxRequest( [ 'diff' => 'prev', 'oldid' => '12345' ] )
		);
		$this->assertFalse( $this->shouldPageGetMobileCarousel( $output ) );
	}

	public function testShouldPageGetMobileCarouselRejectsOldRevisions(): void {
		$output = $this->makeOutputPage( isRevisionCurrent: false );
		$this->assertFalse( $this->shouldPageGetMobileCarousel( $output ) );
	}

	public function testOnBeforePageDisplayInjectsCarouselMarkupWhenEnabled(): void {
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

	public function testOnBeforePageDisplayInjectsCarouselMarkupForAnonymousReaders(): void {
		$output = $this->makeOutputPage(
			user: $this->getServiceContainer()->getUserFactory()
				->newFromName( '127.0.0.1', UserRigorOptions::RIGOR_NONE )
		);
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
			->with( $this->stringContains( 'id="mmv-carousel-root"' ) );
		$hooks->onBeforePageDisplay( $output, $skin );
	}

	/**
	 * Regression test: the mobile carousel must extract thumbnails even when the
	 * DOM backend reports element names in upper case.
	 *
	 * extractCarouselImageElements() locates each thumbnail's parent <a> to read
	 * the file name. Comparing $anchor->nodeName to a lower-case 'a' silently
	 * dropped every thumbnail on DOM backends that return upper-case names
	 * (newer libraries, and PHP 8.4 for the native DOM), so the carousel fell
	 * below its image minimum and never rendered. The comparison must be
	 * case-insensitive (DOMUtils::nodeName()).
	 */
	public function testExtractCarouselImageElementsHandlesUpperCaseAnchorNodeNames(): void {
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

		$thumbExtractor = new ThumbExtractor( [ 'jpg' ], [], 30, 30, '/wiki/$1' );
		$thumbs = $this->extractCarouselImageElements( $thumbExtractor, $html );

		$this->assertCount( 3, $thumbs, 'all three proxied thumbnails should be extracted' );
		$this->assertSame( 'File:Eiffel.jpg', $thumbs[0]['title']->getPrefixedDbKey() );
		$this->assertSame(
			'//upload.wikimedia.org/Eiffel.jpg',
			DOMCompat::getAttribute( $thumbs[0]['thumb'], 'src' )
		);
		$this->assertSame(
			'//upload.wikimedia.org/Pantheon.jpg',
			DOMCompat::getAttribute( $thumbs[2]['thumb'], 'src' )
		);
	}

	public function testExtractCarouselImageElementsPreservesAltTextAndAllowsMissingAltText(): void {
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

		$thumbExtractor = new ThumbExtractor( [ 'jpg' ], [], 30, 30, '/wiki/$1' );
		$thumbs = $this->extractCarouselImageElements( $thumbExtractor, $html );

		$this->assertCount( 3, $thumbs, 'missing alt text should not suppress carousel images' );
		$this->assertSame( 'Eiffel Tower at dusk', DOMCompat::getAttribute( $thumbs[0]['thumb'], 'alt' ) );
		$this->assertSame( '', DOMCompat::getAttribute( $thumbs[1]['thumb'], 'alt' ) );
		$this->assertSame( 'Pantheon facade', DOMCompat::getAttribute( $thumbs[2]['thumb'], 'alt' ) );
	}

	public function testOnBeforePageDisplaySkipsCarouselWhenNotApplicable(): void {
		$output = $this->makeOutputPage();
		$skin = new SkinTemplate();

		$hooks = $this->newHooksInstance(
			[
				self::makeFakeThumbData( 'A.jpg' ),
				self::makeFakeThumbData( 'B.jpg' ),
				self::makeFakeThumbData( 'C.jpg' ),
			],
			false
		);

		// No carousel and no beta opt-in, so no modules are added at all.
		$output->expects( $this->never() )
			->method( 'addModules' );
		$output->expects( $this->never() )
			->method( 'prependHTML' );
		$hooks->onBeforePageDisplay( $output, $skin );
	}

	public function testOnBeforePageDisplaySkipsCarouselWhenFewerThanMinImages(): void {
		$output = $this->makeOutputPage();
		$skin = new SkinTemplate();

		$hooks = $this->newHooksInstance( [
			// 2 images: below the MIN_CAROUSEL_IMAGES threshold of 3
			self::makeFakeThumbData( 'A.jpg' ),
			self::makeFakeThumbData( 'B.jpg' ),
		] );

		// Below the threshold no carousel is rendered, so the carousel module
		// must not be loaded either (T428627).
		$output->expects( $this->never() )
			->method( 'addModules' );
		$output->expects( $this->never() )
			->method( 'prependHTML' );
		$hooks->onBeforePageDisplay( $output, $skin );
	}

	public function testOnBeforePageDisplayLoadsBetaViewerAlongsideCarousel(): void {
		$output = $this->makeOutputPage( request: new FauxRequest( [ 'mmvBeta' => '1' ] ) );
		$skin = new SkinTemplate();

		$hooks = $this->newHooksInstance( [
			self::makeFakeThumbData( 'A.jpg' ),
			self::makeFakeThumbData( 'B.jpg' ),
			self::makeFakeThumbData( 'C.jpg' ),
		] );

		// ?mmvBeta=1 alone loads the bootstrap alongside the carousel so it can
		// intercept the shared #/media/ route ahead of the MobileFrontend
		// lightbox (T427679).
		$addedModules = [];
		$output->method( 'addModules' )
			->willReturnCallback( static function ( $modules ) use ( &$addedModules ) {
				$addedModules[] = $modules;
			} );

		$hooks->onBeforePageDisplay( $output, $skin );

		$this->assertSame( [ 'mmv.bootstrap', 'mmv.carousel' ], $addedModules );
	}

	public function testOnBeforePageDisplayLoadsBetaViewerWithoutCarousel(): void {
		$output = $this->makeOutputPage( request: new FauxRequest( [ 'mmvBeta' => '1' ] ) );
		$skin = new SkinTemplate();

		$hooks = $this->newHooksInstance( [], false );

		// No carousel on this page, but ?mmvBeta=1 still loads the beta viewer.
		$output->expects( $this->once() )
			->method( 'addModules' )
			->with( 'mmv.bootstrap' );
		$output->expects( $this->never() )
			->method( 'prependHTML' );
		$hooks->onBeforePageDisplay( $output, $skin );
	}

	public function testOnBeforePageDisplaySkipsBetaViewerWithoutMmvBetaParam(): void {
		$output = $this->makeOutputPage();
		$skin = new SkinTemplate();

		$hooks = $this->newHooksInstance( [
			self::makeFakeThumbData( 'A.jpg' ),
			self::makeFakeThumbData( 'B.jpg' ),
			self::makeFakeThumbData( 'C.jpg' ),
		] );

		// Without ?mmvBeta=1 the bootstrap must not load: only the carousel does,
		// routing clicks to the MobileFrontend lightbox.
		$output->expects( $this->once() )
			->method( 'addModules' )
			->with( 'mmv.carousel' );
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
