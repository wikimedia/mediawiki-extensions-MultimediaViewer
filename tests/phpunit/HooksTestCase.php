<?php

namespace MediaWiki\Extension\MultimediaViewer\Tests;

use MediaWiki\Context\RequestContext;
use MediaWiki\Extension\MultimediaViewer\Hooks;
use MediaWiki\Output\OutputPage;
use MediaWiki\Page\WikiPage;
use MediaWiki\Request\FauxRequest;
use MediaWiki\Title\Title;
use MediaWiki\User\User;
use MediaWikiIntegrationTestCase;

/**
 * @covers \MediaWiki\Extension\MultimediaViewer\Hooks
 */
class HooksTestCase extends MediaWikiIntegrationTestCase {
	public function newHooksInstance(): Hooks {
		return new Hooks(
			$this->getServiceContainer()->getMainConfig(),
			$this->getServiceContainer()->getSpecialPageFactory(),
			$this->getServiceContainer()->getUserOptionsLookup(),
			$this->getServiceContainer()->getPageProps(),
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

		$output = $this->createMock( OutputPage::class );
		$output->method( 'getTitle' )->willReturn( $title );
		$output->method( 'getHtml' )->willReturn( '' );
		$output->method( 'getContext' )->willReturn( $context );
		$output->method( 'getUser' )->willReturn( $user );
		$output->method( 'getRequest' )->willReturn( $request );
		$output->method( 'getActionName' )->willReturn( $actionName );
		$output->method( 'isRevisionCurrent' )->willReturn( $isRevisionCurrent );

		return $output;
	}
}
