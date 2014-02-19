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
	var i,
		binary,
		dataURI = 'data:image;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0'
			+ 'iAAAABlBMVEUAAAD///+l2Z/dAAAAM0lEQVR4nGP4/5/h/1+G/58ZDrAz3D/McH'
			+ '8yw83NDDeNGe4Ug9C9zwz3gVLMDA/A6P9/AFGGFyjOXZtQAAAAAElFTkSuQmCC',
		hex = '89504e470d0a1a0a0000000d4948445200000010000000100103000000253d6d'
			+ '2200000006504c5445000000ffffffa5d99fdd0000003349444154789c63f8ff'
			+ '9fe1ff5f86ff9f190eb033dc3fcc707f32c3cdcd0c378d19ee1483d0bdcf0cf7'
			+ '8152cc0c0fc0e8ff7f0051861728ce5d9b500000000049454e44ae426082';

	binary = new Uint8Array( hex.length / 2 );

	for ( i = 0; i < hex.length; i += 2 ) {
		binary[ i / 2 ] = parseInt( hex.substr( i, 2 ), 16 );
	}

	QUnit.module( 'mmv.provider.Image', QUnit.newMwEnvironment() );

	QUnit.test( 'Image constructor sanity check', 1, function ( assert ) {
		var imageProvider = new mw.mmv.provider.Image();

		assert.ok( imageProvider );
	} );

	QUnit.test( 'Image load success test', 5, function ( assert ) {
		var imageProvider = new mw.mmv.provider.Image(),
			oldPerformance = imageProvider.performance,
			fakeURL = 'fakeURL';

		imageProvider.performance.delay = 0;

		imageProvider.performance.newXHR = function () {
			return { readyState: 4,
				response: binary,
				send: function () { this.onreadystatechange(); },
				open: $.noop };
		};

		QUnit.stop();
		imageProvider.performance.recordEntry = function ( type, total, url ) {
			assert.strictEqual( type, 'image', 'Type matches' );
			assert.ok( total < 10, 'Total is less than 10ms' );
			assert.strictEqual( url, fakeURL, 'URL matches' );

			QUnit.start();

			imageProvider.performance = oldPerformance;

			return $.Deferred().resolve();
		};

		QUnit.stop();
		imageProvider.get( fakeURL ).then( function( image ) {
			assert.ok( image instanceof HTMLImageElement,
				'success handler was called with the image element');
			assert.strictEqual( image.src, dataURI );
			QUnit.start();
		} );
	} );

	QUnit.asyncTest( 'Image load fail test', 1, function ( assert ) {
		var imageProvider = new mw.mmv.provider.Image();

		imageProvider.get( 'doesntexist.png' ).fail( function() {
				assert.ok( true, 'fail handler was called' );
				QUnit.start();
			} );
	} );

	QUnit.test( 'binaryToDataURI', 1, function ( assert ) {
		var imageProvider = new mw.mmv.provider.Image();

		assert.strictEqual( imageProvider.binaryToDataURI( binary ), dataURI, 'Binary is correctly converted to data URI' );
	} );
}( mediaWiki, jQuery ) );
