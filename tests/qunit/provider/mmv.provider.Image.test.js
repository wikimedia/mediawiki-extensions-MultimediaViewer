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

( function ( mw ) {
	QUnit.module( 'mmv.provider.Image', QUnit.newMwEnvironment() );

	QUnit.test( 'Image constructor sanity check', 1, function ( assert ) {
		var imageProvider = new mw.mmv.provider.Image();

		assert.ok( imageProvider );
	} );

	QUnit.asyncTest( 'Image load success test', 1, function ( assert ) {
		var imageProvider = new mw.mmv.provider.Image();

		imageProvider.get(
			'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0'
			+ 'iAAAABlBMVEUAAAD///+l2Z/dAAAAM0lEQVR4nGP4/5/h/1+G/58ZDrAz3D/McH'
			+ '8yw83NDDeNGe4Ug9C9zwz3gVLMDA/A6P9/AFGGFyjOXZtQAAAAAElFTkSuQmCC'
		).then( function( image ) {
				assert.ok( image instanceof HTMLImageElement,
					'success handler was called with the image element');
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
}( mediaWiki ) );
