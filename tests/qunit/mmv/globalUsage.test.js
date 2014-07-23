/*
 * This file is part of the MediaWiki extension MediaViewer.
 *
 * MediaViewer is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * MediaViewer is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with MediaViewer.  If not, see <http://www.gnu.org/licenses/>.
 */

( function ( mw, $ ) {
	// integration tests to check if mmv.provider.GlobalUsage and mmv.ui.fileUsage work together correctly for
	// links to foreign wikis
	QUnit.module( 'Integration tests for GlobalUsage', QUnit.newMwEnvironment() );

	/**
	 * Tests that a given globalusage API response results in a given link.
	 * @param {Object} apiData globalusage API response (one item from the 'globalusage' array)
	 * @param {string} expectedUrl should start with // (i.e. no protocol)
	 * @param {string} expectedText
	 * @param sandbox the sinon.js sandbox object
	 * @param assert the QUnit assert object
	 */
	function testLink( apiData, expectedUrl, expectedText, sandbox, assert ) {
		var $link,
			$qf = $( '#qunit-fixture' ),
			file = new mw.Title( 'File:Stuff.jpg' ),
			api = { get: sandbox.stub() },
			localUsage = new mw.mmv.model.FileUsage( file, 'local', [] ),
			globalUsageProvider = new mw.mmv.provider.GlobalUsage( api, {} ),
			fileUsage = new mw.mmv.ui.FileUsage( $qf );

		api.get.returns( $.Deferred().resolve( {
			query: {
				pages: {
					'-1': {
						ns: 6,
						title: file.getPrefixedDb(),
						missing: '',
						globalusage: [ apiData ]
					}
				}
			}
		} )	);

		fileUsage.init();
		QUnit.stop();
		globalUsageProvider.get( file ).then( function( globalUsage ) {
			QUnit.start();
			fileUsage.set( localUsage, globalUsage );
			$link = $qf.find( 'li:not([class]) a' );
			assert.strictEqual( $link.prop( 'href' ), expectedUrl, 'URL is correct' );
			assert.strictEqual( $link.text(), expectedText, 'Text is correct' );
		} );
	}

	QUnit.test( 'Canonical namespace', 2, function ( assert ) {
		testLink(
			{
				title: 'User_talk:Alionnoob',
				wiki: 'en.wikipedia.org',
				url: 'https://en.wikipedia.org/wiki/User_talk:Alionnoob',
				ns: 3
			},
			'https://en.wikipedia.org/wiki/User_talk:Alionnoob',
			'User talk:Alionnoob',
			this.sandbox,
			assert
		);
	} );

	QUnit.test( 'Translated namespace on remote wiki', 2, function ( assert ) {
		testLink(
			{
				title: 'Bild:Foo.png',
				wiki: 'de.wikipedia.org',
				url: 'https://de.wikipedia.org/wiki/Bild:Foo.png',
				ns: 6
			},
			'https://de.wikipedia.org/wiki/Bild:Foo.png',
			'Bild:Foo.png',
			this.sandbox,
			assert
		);
	} );

	QUnit.test( 'Custom namespace on remote wiki', 2, function ( assert ) {
		testLink(
			{
				title: 'Progetto:Coordinamento/Immagini',
				wiki: 'it.wikipedia.org',
				url: 'https://it.wikipedia.org/wiki/Coordinamento/Immagini',
				ns: 102
			},
			'https://it.wikipedia.org/wiki/Coordinamento/Immagini',
			'Progetto:Coordinamento/Immagini',
			this.sandbox,
			assert
		);
	} );

	QUnit.test( 'Canonical namespace on remote wiki, for which a translation exists in the local wiki', 2, function ( assert ) {
		var oldWgNamespaceIds = mw.config.get( 'wgNamespaceIds' ),
			oldWgFormattedNamespaces = mw.config.get( 'wgFormattedNamespaces' );

		mw.config.set( 'wgNamespaceIds', { file: 6, 'user_talk': 3, 'benutzer_diskussion': 3 } );
		mw.config.set( 'wgFormattedNamespaces', { 6: 'Datei', 3: 'Benutzer Diskussion' } );

		testLink(
			{
				title: 'User_talk:Alionnoob',
				wiki: 'en.wikipedia.org',
				url: 'https://en.wikipedia.org/wiki/User_talk:Alionnoob',
				ns: 3
			},
			'https://en.wikipedia.org/wiki/User_talk:Alionnoob',
			'User talk:Alionnoob',
			this.sandbox,
			assert
		);

		mw.config.set( 'wgNamespaceIds', oldWgNamespaceIds );
		mw.config.set( 'wgFormattedNamespaces', oldWgFormattedNamespaces );
	} );
} ( mediaWiki, jQuery ) );
