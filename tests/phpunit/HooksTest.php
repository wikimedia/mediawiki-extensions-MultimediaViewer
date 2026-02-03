<?php

namespace MediaWiki\Extension\MultimediaViewer\Tests;

use MediaWiki\Extension\MultimediaViewer\Hooks;
use MediaWiki\Output\OutputPage;
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
		$output->expects( $this->exactly( $modulesExpected ) )->method( 'addModules' );
		$this->newHooksInstance()->onBeforePageDisplay( $output, $skin );
	}
}
