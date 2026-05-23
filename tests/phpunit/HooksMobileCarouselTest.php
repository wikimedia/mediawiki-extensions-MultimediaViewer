<?php

namespace MediaWiki\Extension\MultimediaViewer\Tests;

use MediaWiki\Extension\MultimediaViewer\Hooks;
use MediaWiki\Extension\MultimediaViewer\ThumbExtractor;
use MediaWiki\Output\OutputPage;
use MediaWiki\Parser\ParserOutput;
use MediaWiki\Request\FauxRequest;
use MediaWiki\Skin\SkinTemplate;
use MediaWiki\Title\Title;
use MediaWiki\User\UserRigorOptions;
use Wikimedia\Parsoid\Core\DOMCompat;
use Wikimedia\Parsoid\DOM\Element;
use Wikimedia\Parsoid\Utils\DOMUtils;

/**
 * @covers \MediaWiki\Extension\MultimediaViewer\Hooks
 * @group Database
 */
class HooksMobileCarouselTest extends HooksTestCase {
	public function newHooksInstance(
		array $carouselItems = [],
		bool $useCarousel = true,
		string $currentRequestSkinName = 'minerva'
	): Hooks {
		$hooks = new class(
			$this->getServiceContainer()->getMainConfig(),
			$this->getServiceContainer()->getRepoGroup(),
			$this->getServiceContainer()->getSpecialPageFactory(),
			$this->getServiceContainer()->getUserOptionsLookup(),
			$this->getServiceContainer()->getPageProps(),
			null
		) extends Hooks {
			public array $stubCarouselItems;
			public bool $useCarousel;
			public string $currentRequestSkinName;

			protected function isMobileFrontendView(): bool {
				return true;
			}

			protected function getCurrentRequestSkinName(): string {
				return $this->currentRequestSkinName;
			}

			protected function shouldUseMobileCarousel( OutputPage $out ): bool {
				return $this->useCarousel;
			}

			protected function extractCarouselImageElements(
				ThumbExtractor $thumbExtractor,
				string $html,
				?ParserOutput $parserOutput = null
			): array {
				return $this->stubCarouselItems;
			}
		};
		$hooks->stubCarouselItems = $carouselItems;
		$hooks->useCarousel = $useCarousel;
		$hooks->currentRequestSkinName = $currentRequestSkinName;
		return $hooks;
	}

	protected function shouldPageGetMobileCarousel( OutputPage $output ): bool {
		$method = new \ReflectionMethod( Hooks::class, 'shouldPageGetMobileCarousel' );
		return $method->invoke( $this->newHooksInstance(), $output );
	}

	protected function extractCarouselImageElements(
		ThumbExtractor $thumbExtractor,
		string $html,
		?ParserOutput $parserOutput = null
	): array {
		$method = new \ReflectionMethod( Hooks::class, 'extractCarouselImageElements' );
		$hooks = new Hooks(
			$this->getServiceContainer()->getMainConfig(),
			$this->getServiceContainer()->getRepoGroup(),
			$this->getServiceContainer()->getSpecialPageFactory(),
			$this->getServiceContainer()->getUserOptionsLookup(),
			$this->getServiceContainer()->getPageProps(),
			null
		);
		return $method->invoke( $hooks, $thumbExtractor, $html, $parserOutput );
	}

	protected function buildCarouselItemsHtml( array $thumbData ): string {
		$method = new \ReflectionMethod( Hooks::class, 'buildCarouselItemsHtml' );
		return $method->invoke( $this->newHooksInstance(), $thumbData );
	}

	protected function buildCarouselHtml( array $thumbData, string $pageTitle ): string {
		$method = new \ReflectionMethod( Hooks::class, 'buildCarouselHtml' );
		return $method->invoke( $this->newHooksInstance(), $thumbData, $pageTitle );
	}

	protected static function makeFakeThumb( string $filename, ?string $alt = null ): Element {
		$alt = $alt !== null ? "alt=\"$alt\"" : '';
		$src = <<<HTML
			<a
				href="/wiki/File:$filename"
				class="mw-file-description"
			>
				<img
					$alt
					src="//upload.wikimedia.org/wikipedia/commons/thumb/1/10/$filename/120px-$filename"
					decoding="async"
					width="120"
					height="90"
					class="mw-file-element"
					srcset="//upload.wikimedia.org/wikipedia/commons/thumb/1/10/$filename/240px-$filename 2x"
					data-file-width="2400"
					data-file-height="1800"
				>
			</a>
		HTML;

		$doc = DOMCompat::newDocument( true );
		$fragment = DOMUtils::parseHTMLToFragment( $doc, $src );
		return $fragment->firstElementChild->firstElementChild;
	}

	protected static function makeFakeThumbData( string $filename, ?string $alt = null ): array {
		return [
			'thumb' => self::makeFakeThumb( $filename, $alt ),
			'title' => Title::makeTitle( NS_FILE, $filename ),
		];
	}

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

		// Without ?mmvBeta=1 (and with $wgMediaViewerMobileBeta off) the
		// bootstrap must not load: only the carousel does, routing clicks to
		// the MobileFrontend lightbox.
		$output->expects( $this->once() )
			->method( 'addModules' )
			->with( 'mmv.carousel' );
		$hooks->onBeforePageDisplay( $output, $skin );
	}

	public function testOnBeforePageDisplayLoadsBetaViewerWhenMobileBetaEnabled(): void {
		$this->overrideConfigValue( 'MediaViewerMobileBeta', true );
		// A registered user who has not disabled MediaViewer
		// ($wgMediaViewerEnableByDefault is on).
		$output = $this->makeOutputPage( user: $this->getTestUser()->getUser() );
		$skin = new SkinTemplate();

		$hooks = $this->newHooksInstance( [
			self::makeFakeThumbData( 'A.jpg' ),
			self::makeFakeThumbData( 'B.jpg' ),
			self::makeFakeThumbData( 'C.jpg' ),
		] );

		// With $wgMediaViewerMobileBeta enabled the bootstrap loads for all
		// mobile views without needing the ?mmvBeta=1 parameter (T428774).
		$addedModules = [];
		$output->method( 'addModules' )
			->willReturnCallback( static function ( $modules ) use ( &$addedModules ) {
				$addedModules[] = $modules;
			} );

		$hooks->onBeforePageDisplay( $output, $skin );

		$this->assertSame( [ 'mmv.bootstrap', 'mmv.carousel' ], $addedModules );
	}

	public function testOnBeforePageDisplaySkipsBetaViewerWhenUserOptedOut(): void {
		$user = $this->getTestUser()->getUser();
		$userOptionsManager = $this->getServiceContainer()->getUserOptionsManager();
		$userOptionsManager->setOption( $user, 'multimediaviewer-enable', 0 );
		$user->saveSettings();

		$this->overrideConfigValue( 'MediaViewerMobileBeta', true );
		$output = $this->makeOutputPage( user: $user );
		$skin = new SkinTemplate();

		$hooks = $this->newHooksInstance( [
			self::makeFakeThumbData( 'A.jpg' ),
			self::makeFakeThumbData( 'B.jpg' ),
			self::makeFakeThumbData( 'C.jpg' ),
		] );

		// Logged-in users who have disabled MediaViewer keep the MobileFrontend
		// lightbox: only the carousel module loads.
		$output->expects( $this->once() )
			->method( 'addModules' )
			->with( 'mmv.carousel' );
		$hooks->onBeforePageDisplay( $output, $skin );
	}

	public function testOnMakeGlobalVariablesScriptExportsMobileBetaWhenEnabled(): void {
		$this->overrideConfigValue( 'MediaViewerMobileBeta', true );
		$user = $this->getTestUser()->getUser();

		$output = $this->createMock( OutputPage::class );
		$output->method( 'getUser' )->willReturn( $user );

		$vars = [];
		$this->newHooksInstance()->onMakeGlobalVariablesScript( $vars, $output );

		$this->assertTrue( $vars['wgMediaViewerMobileBeta'] );
	}

	public function testOnMakeGlobalVariablesScriptExportsMobileBetaFalseByDefault(): void {
		$user = $this->getTestUser()->getUser();

		$output = $this->createMock( OutputPage::class );
		$output->method( 'getUser' )->willReturn( $user );

		$vars = [];
		$this->newHooksInstance()->onMakeGlobalVariablesScript( $vars, $output );

		$this->assertFalse( $vars['wgMediaViewerMobileBeta'] );
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
		$output->method( 'getTitle' )->willReturn( Title::makeTitle( NS_MAIN, 'Main Page' ) );

		$this->assertFalse( $this->shouldPageGetMobileCarousel( $output ) );
	}
}
