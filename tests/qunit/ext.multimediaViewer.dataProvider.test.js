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
	QUnit.module( 'ext.multimediaViewer.dataProvider', QUnit.newMwEnvironment() );

	QUnit.test( 'ImageUsage constructor sanity check', 2, function ( assert ) {
		var api = { get: function() {} },
			options = {},
			imageUsageDataProvider = new mw.mmv.dataProvider.ImageUsage( api, options ),
			imageUsageDataProviderWithNoOptions = new mw.mmv.dataProvider.ImageUsage( api );

		assert.ok( imageUsageDataProvider );
		assert.ok( imageUsageDataProviderWithNoOptions );
	} );

	QUnit.asyncTest( 'ImageUsage get test', 7, function ( assert ) {
		var apiCallCount = 0,
			api = { get: function() {
				apiCallCount++;
				return $.Deferred().resolve( {
					query: {
						imageusage: [
							{
								ns: 0,
								title: 'Albert Einstein'
							}
						]
					}
				} );
			} },
			options = {},
			file = new mw.Title( 'File:Albert Einsteing Head.jpg' ),
			imageUsageDataProvider = new mw.mmv.dataProvider.ImageUsage( api, options );

		imageUsageDataProvider.get( file ).then( function( fileUsage ) {
			assert.strictEqual( fileUsage.file, file, 'File is set correctly' );
			assert.strictEqual( fileUsage.scope, mw.mmv.model.FileUsage.Scope.LOCAL, 'Scope is set correctly' );
			assert.strictEqual( fileUsage.pages[0].wiki, null, 'Wiki is not set' );
			assert.strictEqual( fileUsage.pages[0].page.getPrefixedDb(), 'Albert_Einstein', 'Page name is set correctly' );
			assert.strictEqual( fileUsage.totalCount, 1, 'Count is set correctly' );
			assert.strictEqual( fileUsage.totalCountIsLowerBound, false, 'Count flag is set correctly' );
		} ).then( function() {
			// call the data provider a second time to check caching
			return imageUsageDataProvider.get( file );
		} ).then( function() {
			assert.strictEqual( apiCallCount, 1 );
			QUnit.start();
		} );
	} );

	QUnit.asyncTest( 'ImageUsage get test with continuation', 1, function ( assert ) {
		var api = { get: function() {
				return $.Deferred().resolve( {
					'query-continue': {
						imageusage: {
							iucontinue: '6|Albert_Einstein_Head.jpg|198622'
						}
					},
					query: {
						imageusage: [
							{
								ns: 0,
								title: 'Albert Einstein'
							}
						]
					}
				} );
			} },
			options = {},
			file = new mw.Title( 'File:Albert Einsteing Head.jpg' ),
			imageUsageDataProvider = new mw.mmv.dataProvider.ImageUsage( api, options );

		imageUsageDataProvider.get( file ).then( function( fileUsage ) {
			assert.strictEqual( fileUsage.totalCountIsLowerBound, true, 'Count flag is set correctly' );
			QUnit.start();
		} );
	} );

	QUnit.asyncTest( 'ImageUsage fail test', 1, function ( assert ) {
		var api = { get: function() {
				return $.Deferred().resolve( {
					'error': {
						'code': 'iumissingparam',
						'info': 'One of the parameters iutitle, iupageid is required'
					}
				} );
			} },
			options = {},
			file = new mw.Title( 'File:Albert Einsteing Head.jpg' ),
			imageUsageDataProvider = new mw.mmv.dataProvider.ImageUsage( api, options );

		imageUsageDataProvider.get( file ).fail( function( errorMessage ) {
			assert.strictEqual(
				errorMessage,
				'iumissingparam: One of the parameters iutitle, iupageid is required',
				'Error message is set correctly'
			);
			QUnit.start();
		} );
	} );


	QUnit.test( 'GlobalUsage constructor sanity check', 2, function ( assert ) {
		var api = { get: function() {} },
			options = {},
			globalUsageDataProvider = new mw.mmv.dataProvider.GlobalUsage( api, options ),
			globalUsageDataProviderWithNoOptions = new mw.mmv.dataProvider.GlobalUsage( api );

		assert.ok( globalUsageDataProvider );
		assert.ok( globalUsageDataProviderWithNoOptions );
	} );

	QUnit.asyncTest( 'GlobalUsage get test', 7, function ( assert ) {
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
			globalUsageDataProvider = new mw.mmv.dataProvider.GlobalUsage ( api, options );

		globalUsageDataProvider.get( file ).then( function( fileUsage ) {
			assert.strictEqual( fileUsage.file, file, 'File is set correctly' );
			assert.strictEqual( fileUsage.scope, mw.mmv.model.FileUsage.Scope.GLOBAL, 'Scope is set correctly' );
			assert.strictEqual( fileUsage.pages[0].wiki, 'en.wikipedia.org', 'Wiki is set correctly' );
			assert.strictEqual( fileUsage.pages[0].page.getPrefixedDb(), 'User_talk:Alionnoob', 'Page name is set correctly' );
			assert.strictEqual( fileUsage.totalCount, 1, 'Count is set correctly' );
			assert.strictEqual( fileUsage.totalCountIsLowerBound, false, 'Count flag is set correctly' );
		} ).then( function() {
			// call the data provider a second time to check caching
			return globalUsageDataProvider.get( file );
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
		globalUsageDataProvider = new mw.mmv.dataProvider.GlobalUsage( api, options );

		globalUsageDataProvider.get( file ).then( function( fileUsage ) {
			assert.strictEqual( fileUsage.totalCountIsLowerBound, true, 'Count flag is set correctly' );
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
			globalUsageDataProvider = new mw.mmv.dataProvider.GlobalUsage( api, options );

		globalUsageDataProvider.get( file ).fail( function( errorMessage ) {
			assert.strictEqual(
				errorMessage,
				'unknown_action: Unrecognized value for parameter \'action\': querry',
				'Error message is set correctly'
			);
			QUnit.start();
		} );
	} );
}( mediaWiki, jQuery ) );
