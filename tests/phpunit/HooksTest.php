<?php

namespace MediaWiki\Extension\MultimediaViewer\Tests;

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

		$output->expects( $this->exactly( $modulesExpected ) )->method( 'addModules' );
		$this->newHooksInstance()->onBeforePageDisplay( $output, $skin );
	}
}
