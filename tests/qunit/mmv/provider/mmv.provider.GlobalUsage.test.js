/*
 * This file is part of the MediaWiki extension MultimediaViewer.
 *
 * MultimediaViewer is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * MultimediaViewer is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with MultimediaViewer.  If not, see <http://www.gnu.org/licenses/>.
 */

( function ( mw, $ ) {
	QUnit.module( 'mmv.provider.GlobalUsage', QUnit.newMwEnvironment() );

	QUnit.test( 'GlobalUsage constructor sanity check', 2, function ( assert ) {
		var api = { get: function() {} },
			options = {},
			globalUsageProvider = new mw.mmv.provider.GlobalUsage( api, options ),
			globalUsageProviderWithNoOptions = new mw.mmv.provider.GlobalUsage( api );

		assert.ok( globalUsageProvider );
		assert.ok( globalUsageProviderWithNoOptions );
	} );

	QUnit.asyncTest( 'GlobalUsage get test', 9, function ( assert ) {
		var apiCallCount = 0,
			api = { get: function() {
				apiCallCount++;
				return $.Deferred().resolve( {
					query: {
						pages: {
							'-1': {
								ns: 6,
								title: 'File:Stuff.jpg',
								missing: '',
								globalusage: [
									{
										title: 'User_talk:Alionnoob',
										wiki: 'en.wikipedia.org',
										url: 'https://en.wikipedia.org/wiki/User_talk:Alionnoob',
										ns: 0
									}
								]
							}
						}
					}
				} );
			} },
			options = {},
			file = new mw.Title( 'File:Stuff.jpg' ),
			globalUsageProvider = new mw.mmv.provider.GlobalUsage ( api, options );

		globalUsageProvider.get( file ).then( function( fileUsage ) {
			assert.strictEqual( fileUsage.file, file, 'File is set correctly' );
			assert.strictEqual( fileUsage.scope, mw.mmv.model.FileUsage.Scope.GLOBAL, 'Scope is set correctly' );
			assert.ok( fileUsage.pages[0] instanceof mw.mmv.model.IwTitle, 'Page is a mw.mmv.model.IwTitle instance' );
			assert.strictEqual( fileUsage.pages[0].getDomain(), 'en.wikipedia.org', 'Wiki is set correctly' );
			assert.strictEqual( fileUsage.pages[0].getPrefixedDb(), 'User_talk:Alionnoob', 'Page name is set correctly' );
			assert.strictEqual( fileUsage.pages[0].getUrl(), 'https://en.wikipedia.org/wiki/User_talk:Alionnoob', 'Url is set correctly' );
			assert.strictEqual( fileUsage.totalCount, 1, 'Count is set correctly' );
			assert.strictEqual( fileUsage.totalCountIsLowerBound, false, 'Count flag is set correctly' );
		} ).then( function() {
			// call the data provider a second time to check caching
			return globalUsageProvider.get( file );
		} ).then( function() {
			assert.strictEqual( apiCallCount, 1 );
			QUnit.start();
		} );
	} );

	QUnit.asyncTest( 'GlobalUsage get test with continuation', 1, function ( assert ) {
		var api = { get: function() {
			return $.Deferred().resolve( {
				'query-continue': {
					globalusage: {
						gucontinue: 'Foo.jpg|enwiki|18120889'
					}
				},
				query: {
					pages: {
						'-1': {
							ns: 6,
							title: 'File:Stuff.jpg',
							missing: '',
							globalusage: [
								{
									title: 'User_talk:Alionnoob',
									wiki: 'en.wikipedia.org',
									ns: 3
								}
							]
						}
					}
				}
			} );
		} },
		options = {},
		file = new mw.Title( 'File:Stuff.jpg' ),
		globalUsageProvider = new mw.mmv.provider.GlobalUsage( api, options );

		globalUsageProvider.get( file ).then( function( fileUsage ) {
			assert.strictEqual( fileUsage.totalCountIsLowerBound, true, 'Count flag is set correctly' );
			QUnit.start();
		} );
	} );

	// no globalusage field - this happens when the extension is not installed
	QUnit.asyncTest( 'GlobalUsage missing data test', 1, function ( assert ) {
		var api = { get: function() {
				return $.Deferred().resolve( {
					query: {
						pages: {
							'-1': {
								ns: 6,
								title: 'File:Stuff.jpg',
								missing: ''
							}
						}
					}
				} );
			} },
			options = {},
			file = new mw.Title( 'File:Stuff.jpg' ),
			globalUsageProvider = new mw.mmv.provider.GlobalUsage( api, options );

		globalUsageProvider.get( file ).then( function( fileUsage ) {
			assert.strictEqual( fileUsage.totalCount, 0, 'Count flag is set correctly' );
			QUnit.start();
		} );
	} );

	QUnit.asyncTest( 'GlobalUsage fail test', 1, function ( assert ) {
		var api = { get: function() {
				return $.Deferred().resolve( {
					'error': {
						'code': 'unknown_action',
						'info': 'Unrecognized value for parameter \'action\': querry'
					}
				} );
			} },
			options = {},
			file = new mw.Title( 'File:Stuff.jpg' ),
			globalUsageProvider = new mw.mmv.provider.GlobalUsage( api, options );

		globalUsageProvider.get( file ).fail( function( errorMessage ) {
			assert.strictEqual(
				errorMessage,
				'unknown_action: Unrecognized value for parameter \'action\': querry',
				'Error message is set correctly'
			);
			QUnit.start();
		} );
	} );

	QUnit.asyncTest( 'GlobalUsage useApi test', 3, function ( assert ) {
		var api = { get: this.sandbox.stub()['throws']( 'API was invoked' ) },
			options = { useApi: false },
			file = new mw.Title( 'File:Stuff.jpg' ),
			globalUsageProvider = new mw.mmv.provider.GlobalUsage( api, options );

		globalUsageProvider.get( file ).done( function( fileUsage ) {
			assert.strictEqual( fileUsage.pages.length, 0, 'Does not return any pages' );
			assert.ok( fileUsage.fake );
			assert.ok( !api.get.called, 'API was not called' );
			QUnit.start();
		} );
	} );
}( mediaWiki, jQuery ) );
