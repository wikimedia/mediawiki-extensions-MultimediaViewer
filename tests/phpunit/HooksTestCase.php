<?php

namespace MediaWiki\Extension\MultimediaViewer\Tests;

use MediaWiki\Context\RequestContext;
use MediaWiki\Extension\MultimediaViewer\Hooks;
use MediaWiki\Output\OutputPage;
use MediaWiki\Page\WikiPage;
use MediaWiki\Parser\ParserOutput;
use MediaWiki\Request\FauxRequest;
use MediaWiki\Skin\SkinTemplate;
use MediaWiki\Title\Title;
use MediaWiki\User\User;
use MediaWikiIntegrationTestCase;

/**
 * @covers \MediaWiki\Extension\MultimediaViewer\Hooks
 */
class HooksTestCase extends MediaWikiIntegrationTestCase {

	protected function setUp(): void {
		parent::setUp();
		// Isolate MMV's own logic from extensions that override $render
		// or $attributes on locally installed wikis.
		$this->clearHook( 'MultimediaViewerBeforeMobileCarousel' );
	}

	public function newHooksInstance(): Hooks {
		return new Hooks(
			$this->getServiceContainer()->getMainConfig(),
			$this->getServiceContainer()->getSpecialPageFactory(),
			$this->getServiceContainer()->getUserOptionsLookup(),
			$this->getServiceContainer()->getExtensionRegistry(),
			null
		);
	}

	protected function makeOutputPage(
		?Title $title = null,
		?User $user = null,
		?FauxRequest $request = null,
		string $actionName = 'view',
		bool $isRevisionCurrent = true,
	) {
		$user = $user ?? $this->getServiceContainer()->getUserFactory()->newFromName( 'HooksTestCarouselUser' );

		$title = $title ?? Title::makeTitle( NS_MAIN, 'Test Page' );
		$title->setContentModel( CONTENT_MODEL_WIKITEXT );

		$wikiPage = $this->createMock( WikiPage::class );
		$wikiPage->method( 'getTitle' )->willReturn( $title );

		$context = new RequestContext();
		$context->setTitle( $title );
		$context->setWikiPage( $wikiPage );

		$request = $request ?? new FauxRequest();

		$skin = new SkinTemplate( [ 'name' => 'skin' ] );

		$metadata = new ParserOutput();

		$output = $this->createMock( OutputPage::class );
		$output->method( 'getTitle' )->willReturn( $title );
		$output->method( 'getWikiPage' )->willReturn( $wikiPage );
		$output->method( 'getHtml' )->willReturn( '' );
		$output->method( 'getContext' )->willReturn( $context );
		$output->method( 'getUser' )->willReturn( $user );
		$output->method( 'getRequest' )->willReturn( $request );
		$output->method( 'getActionName' )->willReturn( $actionName );
		$output->method( 'isRevisionCurrent' )->willReturn( $isRevisionCurrent );
		$output->method( 'getSkin' )->willReturn( $skin );
		$output->method( 'getMetadata' )->willReturn( $metadata );

		// Make setProperty()/getProperty() store and return values.
		// Left as bare mocks they are no-ops returning null. This makes
		// __NOMEDIAVIEWERCAROUSEL__ opt-out testable.
		$properties = [];
		$output->method( 'setProperty' )->willReturnCallback(
			static function ( $name, $value ) use ( &$properties ) {
				$properties[$name] = $value;
			}
		);
		$output->method( 'getProperty' )->willReturnCallback(
			static function ( $name ) use ( &$properties ) {
				return $properties[$name] ?? null;
			}
		);

		return $output;
	}
}
