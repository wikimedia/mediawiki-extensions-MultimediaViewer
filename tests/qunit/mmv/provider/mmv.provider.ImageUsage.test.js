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
	QUnit.module( 'mmv.provider.ImageUsage', QUnit.newMwEnvironment() );

	QUnit.test( 'ImageUsage constructor sanity check', 2, function ( assert ) {
		var api = { get: function() {} },
			options = {},
			imageUsageProvider = new mw.mmv.provider.ImageUsage( api, options ),
			imageUsageProviderWithNoOptions = new mw.mmv.provider.ImageUsage( api );

		assert.ok( imageUsageProvider );
		assert.ok( imageUsageProviderWithNoOptions );
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
			imageUsageProvider = new mw.mmv.provider.ImageUsage( api, options );

		imageUsageProvider.get( file ).then( function( fileUsage ) {
			assert.strictEqual( fileUsage.file, file, 'File is set correctly' );
			assert.strictEqual( fileUsage.scope, mw.mmv.model.FileUsage.Scope.LOCAL, 'Scope is set correctly' );
			assert.ok ( fileUsage.pages[0] instanceof mw.Title, 'The page is a mw.Title instance' );
			assert.strictEqual( fileUsage.pages[0].getPrefixedDb(), 'Albert_Einstein', 'Page name is set correctly' );
			assert.strictEqual( fileUsage.totalCount, 1, 'Count is set correctly' );
			assert.strictEqual( fileUsage.totalCountIsLowerBound, false, 'Count flag is set correctly' );
		} ).then( function() {
			// call the data provider a second time to check caching
			return imageUsageProvider.get( file );
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
			imageUsageProvider = new mw.mmv.provider.ImageUsage( api, options );

		imageUsageProvider.get( file ).then( function( fileUsage ) {
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
			imageUsageProvider = new mw.mmv.provider.ImageUsage( api, options );

		imageUsageProvider.get( file ).fail( function( errorMessage ) {
			assert.strictEqual(
				errorMessage,
				'iumissingparam: One of the parameters iutitle, iupageid is required',
				'Error message is set correctly'
			);
			QUnit.start();
		} );
	} );
}( mediaWiki, jQuery ) );
