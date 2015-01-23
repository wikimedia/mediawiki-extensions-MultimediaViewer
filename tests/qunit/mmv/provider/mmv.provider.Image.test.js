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

	QUnit.test( 'Image load success', 2, function ( assert ) {
		var url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0'
				+ 'iAAAABlBMVEUAAAD///+l2Z/dAAAAM0lEQVR4nGP4/5/h/1+G/58ZDrAz3D/McH'
				+ '8yw83NDDeNGe4Ug9C9zwz3gVLMDA/A6P9/AFGGFyjOXZtQAAAAAElFTkSuQmCC',
			imageProvider = new mw.mmv.provider.Image();

		imageProvider.imagePreloadingSupported = function () { return false; };
		imageProvider.performance.recordEntry = $.noop;

		QUnit.stop();
		imageProvider.get( url ).then( function ( image ) {
			assert.ok( image instanceof HTMLImageElement,
				'success handler was called with the image element' );
			assert.strictEqual( image.src, url, 'image src is correct' );
			QUnit.start();
		} );
	} );

	QUnit.test( 'Image caching', 6, function ( assert ) {
		var url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0'
				+ 'iAAAABlBMVEUAAAD///+l2Z/dAAAAM0lEQVR4nGP4/5/h/1+G/58ZDrAz3D/McH'
				+ '8yw83NDDeNGe4Ug9C9zwz3gVLMDA/A6P9/AFGGFyjOXZtQAAAAAElFTkSuQmCC',
			url2 = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
			result,
			imageProvider = new mw.mmv.provider.Image();

		imageProvider.imagePreloadingSupported = function () { return false; };
		imageProvider.performance.recordEntry = $.noop;

		QUnit.stop();
		imageProvider.get( url ).then( function ( image ) {
			result = image;
			assert.ok( image instanceof HTMLImageElement,
				'success handler was called with the image element' );
			assert.strictEqual( image.src, url, 'image src is correct' );
			QUnit.start();
		} );

		QUnit.stop();
		imageProvider.get( url ).then( function ( image ) {
			assert.strictEqual( image, result, 'image element is cached and not regenerated' );
			assert.strictEqual( image.src, url, 'image src is correct' );
			QUnit.start();
		} );

		QUnit.stop();
		imageProvider.get( url2 ).then( function ( image ) {
			assert.notStrictEqual( image, result, 'image element for different url is not cached' );
			assert.strictEqual( image.src, url2, 'image src is correct' );
			QUnit.start();
		} );
	} );

	QUnit.test( 'Image load XHR progress funneling', 7, function ( assert ) {
		var i = 0,
			imageProvider = new mw.mmv.provider.Image(),
			oldPerformance = imageProvider.performance,
			fakeURL = 'fakeURL',
			response = 'response';

		imageProvider.performance.delay = 0;
		imageProvider.imagePreloadingSupported = function () { return true; };
		imageProvider.rawGet = function () { return $.Deferred().resolve(); };

		imageProvider.performance.newXHR = function () {
			return { readyState: 4,
				response: response,
				send: function () {
					var self = this;

					// The timeout is necessary because without it notify() happens before
					// the imageProvider has time to chain its progress() to the returned deferred
					setTimeout( function () {
						self.onprogress( { lengthComputable: true, loaded: 10, total: 20 } );
						self.onreadystatechange();
					} );
				},

				open: $.noop };
		};

		QUnit.stop();

		imageProvider.performance.recordEntry = function ( type, total, url ) {
			QUnit.start();

			assert.strictEqual( type, 'image', 'Type matches' );
			assert.strictEqual( url, fakeURL, 'URL matches' );

			imageProvider.performance = oldPerformance;

			return $.Deferred().resolve();
		};

		QUnit.stop();

		imageProvider.get( fakeURL )
			.fail( function () {
				QUnit.start();

				assert.ok( false, 'Image failed to (pretend to) load' );
			} )
			.then( function () {
				QUnit.start();

				assert.ok( true, 'Image was pretend-loaded' );
			} )
			.progress( function ( response, percent ) {
				if ( i === 0 ) {
					assert.strictEqual( percent, 50, 'Correctly propagated a 50% progress event' );
					assert.strictEqual( response, response, 'Partial response propagated' );
				} else if ( i === 1 ) {
					assert.strictEqual( percent, 100, 'Correctly propagated a 100% progress event' );
					assert.strictEqual( response, response, 'Partial response propagated' );
				} else {
					assert.ok( false, 'Only 2 progress events should propagate' );
				}

				i++;
			} );
	} );

	QUnit.asyncTest( 'Image load fail', 2, function ( assert ) {
		var imageProvider = new mw.mmv.provider.Image(),
			oldMwLog = mw.log,
			mwLogCalled = false;

		imageProvider.imagePreloadingSupported = function () { return false; };
		imageProvider.performance.recordEntry = $.noop;
		mw.log = function () { mwLogCalled = true; };

		imageProvider.get( 'doesntexist.png' ).fail( function () {
			assert.ok( true, 'fail handler was called' );
			assert.ok( mwLogCalled, 'mw.log was called' );
			mw.log = oldMwLog;
			QUnit.start();
		} );
	} );

	QUnit.test( 'Image load with preloading supported', 1, function ( assert ) {
		var url = mw.config.get( 'wgExtensionAssetsPath' ) + '/MultimediaViewer/resources/mmv/img/expand.svg',
			imageProvider = new mw.mmv.provider.Image(),
			endsWith = function ( a, b ) { return a.indexOf( b ) === a.length - b.length; };

		imageProvider.imagePreloadingSupported = function () { return true; };
		imageProvider.performance = {
			record: function () { return $.Deferred().resolve(); }
		};

		QUnit.stop();
		imageProvider.get( url ).done( function ( image ) {
			// can't test equality as browsers transform this to a full URL
			assert.ok( endsWith( image.src, url ), 'local image loaded with correct source' );
			QUnit.start();
		} ).fail( function () {
			// do not hold up the tests if the image failed to load
			assert.ok( false, 'uh-oh, couldnt load - might be a problem with the test installation' );
			QUnit.start();
		} );
	} );

	QUnit.test( 'Failed image load with preloading supported', 1, function ( assert ) {
		var url = 'nosuchimage.png',
			imageProvider = new mw.mmv.provider.Image();

		imageProvider.imagePreloadingSupported = function () { return true; };
		imageProvider.performance = {
			record: function () { return $.Deferred().resolve(); }
		};

		QUnit.stop();
		imageProvider.get( url ).fail( function () {
			assert.ok( true, 'Fail callback called for non-existing image' );
			QUnit.start();
		} );
	} );

	QUnit.test( 'imageQueryParameter', 1, function ( assert ) {
		var imageProvider = new mw.mmv.provider.Image( 'foo' );

		imageProvider.imagePreloadingSupported = function () { return false; };
		imageProvider.rawGet = function () { return $.Deferred().resolve(); };

		imageProvider.performance.recordEntry = function ( type, total, url ) {
			assert.strictEqual( url, 'http://www.wikipedia.org/?foo', 'Extra parameter added' );
		};

		imageProvider.get( 'http://www.wikipedia.org/' );
	} );
}( mediaWiki, jQuery ) );
