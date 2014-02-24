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
	QUnit.module( 'mmv.provider.Image', QUnit.newMwEnvironment() );

	QUnit.test( 'Image constructor sanity check', 1, function ( assert ) {
		var imageProvider = new mw.mmv.provider.Image();

		assert.ok( imageProvider );
	} );

	QUnit.test( 'Image load success test', 2, function ( assert ) {
		var url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0'
				+ 'iAAAABlBMVEUAAAD///+l2Z/dAAAAM0lEQVR4nGP4/5/h/1+G/58ZDrAz3D/McH'
				+ '8yw83NDDeNGe4Ug9C9zwz3gVLMDA/A6P9/AFGGFyjOXZtQAAAAAElFTkSuQmCC',
			imageProvider = new mw.mmv.provider.Image();

		imageProvider.imagePreloadingSupported = function () { return false; };
		imageProvider.performance.recordEntry = $.noop;

		QUnit.stop();
		imageProvider.get( url ).then( function( image ) {
			assert.ok( image instanceof HTMLImageElement,
				'success handler was called with the image element');
                        assert.strictEqual( image.src, url, 'image src is correct');
			QUnit.start();
		} );
	} );

	QUnit.test( 'Image caching test', 6, function ( assert ) {
		var url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0'
				+ 'iAAAABlBMVEUAAAD///+l2Z/dAAAAM0lEQVR4nGP4/5/h/1+G/58ZDrAz3D/McH'
				+ '8yw83NDDeNGe4Ug9C9zwz3gVLMDA/A6P9/AFGGFyjOXZtQAAAAAElFTkSuQmCC',
			url2 = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
			result,
			imageProvider = new mw.mmv.provider.Image();

		imageProvider.imagePreloadingSupported = function () { return false; };
		imageProvider.performance.recordEntry = $.noop;

		QUnit.stop();
		imageProvider.get( url ).then( function( image ) {
			result = image;
			assert.ok( image instanceof HTMLImageElement,
				'success handler was called with the image element');
			assert.strictEqual( image.src, url, 'image src is correct');
			QUnit.start();
		} );

		QUnit.stop();
		imageProvider.get( url ).then( function( image ) {
			assert.strictEqual( image, result, 'image element is cached and not regenerated' );
			assert.strictEqual( image.src, url, 'image src is correct');
			QUnit.start();
		} );

		QUnit.stop();
		imageProvider.get( url2 ).then( function( image ) {
			assert.notStrictEqual( image, result, 'image element for different url is not cached' );
			assert.strictEqual( image.src, url2, 'image src is correct');
			QUnit.start();
		} );

	} );

	QUnit.asyncTest( 'Image load fail test', 1, function ( assert ) {
		var imageProvider = new mw.mmv.provider.Image();

		imageProvider.imagePreloadingSupported = function () { return false; };
		imageProvider.performance.recordEntry = $.noop;

		imageProvider.get( 'doesntexist.png' ).fail( function() {
			assert.ok( true, 'fail handler was called' );
			QUnit.start();
		} );
	} );

	QUnit.test( 'Image load test with preloading supported', 1, function ( assert ) {
		var url = mw.config.get( 'wgScriptPath' ) + '/skins/vector/images/search-ltr.png',
			imageProvider = new mw.mmv.provider.Image(),
			endsWith = function ( a, b ) { return a.indexOf( b ) === a.length - b.length; };

		imageProvider.imagePreloadingSupported = function () { return true; };
		imageProvider.performance = {
			record: function() { return $.Deferred().resolve(); }
		};

		QUnit.stop();
		imageProvider.get( url ).done( function( image ) {
			// can't test equality as browsers transform this to a full URL
			assert.ok( endsWith( image.src, url ), 'local image loaded with correct source');
			QUnit.start();
		} ).fail( function () {
			// do not hold up the tests if the image failed to load
			assert.ok( false, 'uh-oh, couldnt load - might be a problem with the test installation' );
			QUnit.start();
		} );
	} );

	QUnit.test( 'Failed image load test with preloading supported', 1, function ( assert ) {
		var url = 'nosuchimage.png',
			imageProvider = new mw.mmv.provider.Image();

		imageProvider.imagePreloadingSupported = function () { return true; };
		imageProvider.performance = {
			record: function() { return $.Deferred().resolve(); }
		};

		QUnit.stop();
		imageProvider.get( url ).fail( function () {
			assert.ok( true, 'Fail callback called for non-existing image' );
			QUnit.start();
		} );
	} );
}( mediaWiki, jQuery ) );
