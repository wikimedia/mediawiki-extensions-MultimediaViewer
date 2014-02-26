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

( function( mw, $ ) {
	QUnit.module( 'mw.mmv.ui.Canvas', QUnit.newMwEnvironment() );

	QUnit.test( 'Constructor sanity check', 3, function( assert ) {
		var $qf = $( '#qunit-fixture' ),
			canvas = new mw.mmv.ui.Canvas( $qf, $qf, $qf );

		assert.ok( canvas.$imageDiv, 'Image container is created.' );
		assert.strictEqual( canvas.$imageWrapper, $qf, '$imageWrapper is set correctly.' );
		assert.strictEqual( canvas.$mainWrapper, $qf, '$mainWrapper is set correctly.' );
	} );

	QUnit.test( 'empty() and set()', 8, function( assert ) {
		var $qf = $( '#qunit-fixture' ),
			canvas = new mw.mmv.ui.Canvas( $qf ),
			image = new Image(),
			$imageElem = $( image ),
			imageRawMetadata = new mw.mmv.LightboxImage( 'foo.png' );

		canvas.empty();

		assert.strictEqual( canvas.$imageDiv.html(), '', 'Canvas is empty.' );
		assert.ok( canvas.$imageDiv.hasClass( 'empty' ), 'Canvas is not visible.' );

		canvas.set( imageRawMetadata, $imageElem );

		assert.strictEqual( canvas.$image, $imageElem, 'Image element set correctly.' );
		assert.strictEqual( canvas.imageRawMetadata, imageRawMetadata, 'Raw metadata set correctly.' );
		assert.strictEqual( canvas.$imageDiv.html(), '<img>', 'Image added to container.' );
		assert.ok( !canvas.$imageDiv.hasClass( 'empty' ), 'Canvas is visible.' );

		canvas.empty();

		assert.strictEqual( canvas.$imageDiv.html(), '', 'Canvas is empty.' );
		assert.ok( canvas.$imageDiv.hasClass( 'empty' ), 'Canvas is not visible.' );
	} );

	QUnit.test( 'setImageAndMaxDimensions()', 6, function( assert ) {
		var $qf = $( '#qunit-fixture' ),
			canvas = new mw.mmv.ui.Canvas( $qf ),
			imageRawMetadata = new mw.mmv.LightboxImage( 'foo.png' ),
			image = new Image(),
			$imageElem = $( image ),
			image2 = new Image(),
			$currentImage;

		// Need to call set() before using setImageAndMaxDimensions()
		canvas.set( imageRawMetadata, $imageElem );

		// Call with the same image
		canvas.setImageAndMaxDimensions( image );

		assert.strictEqual( canvas.$image, $imageElem, 'Image element still set correctly.' );
		assert.strictEqual( canvas.$image.css( 'maxHeight' ), canvas.$imageDiv.height() + 'px', 'MaxHeight set correctly.' );
		assert.strictEqual( canvas.$image.css( 'maxWidth' ), canvas.$imageDiv.width() + 'px', 'MaxHeight set correctly.' );

		$currentImage = canvas.$image;

		// Call with a new image
		canvas.setImageAndMaxDimensions( image2 );

		assert.notStrictEqual( canvas.$image, $currentImage, 'Image element set correctly.' );
		assert.strictEqual( canvas.$image.css( 'maxHeight' ), canvas.$imageDiv.height() + 'px', 'MaxHeight set correctly.' );
		assert.strictEqual( canvas.$image.css( 'maxWidth' ), canvas.$imageDiv.width() + 'px', 'MaxHeight set correctly.' );
	} );

	QUnit.test( 'attach and unattach', 3, function( assert ) {
		var $qf = $( '#qunit-fixture' ),
			canvas = new mw.mmv.ui.Canvas( $qf );

		assert.ok( ! canvas.resizeListener, 'resize listener has not been set yet.' );

		canvas.attach();

		assert.ok( canvas.resizeListener, 'resize listener is set.' );

		canvas.unattach();

		assert.ok( ! canvas.resizeListener, 'resize listener has been removed.' );
	} );

	QUnit.test( 'setThumbnailForDisplay: placeholder big enough that it doesn\'t need blurring, actual image bigger than the lightbox', 5, function ( assert ) {
		var $image,
			blurredThumbnailShown,
			$qf = $( '#qunit-fixture' ),
			canvas = new mw.mmv.ui.Canvas( $qf );

		canvas.set = function () {
			assert.ok ( true, 'Placeholder shown');
		};

		$image = $( '<img>' ).width( 200 ).height( 100 );

		blurredThumbnailShown = canvas.setThumbnailForDisplay(
			{ width : 1000, height : 500 },
			$image,
			{ css : 300 }
		);

		assert.strictEqual( $image.width(), 300, 'Placeholder has the right width' );
		assert.strictEqual( $image.height(), 150, 'Placeholder has the right height' );
		assert.ok( ! $image.hasClass( 'blurred' ), 'Placeholder is not blurred' );
		assert.ok( ! blurredThumbnailShown, 'Placeholder state is correct' );
	} );

	QUnit.test( 'setThumbnailForDisplay: big-enough placeholder that needs blurring, actual image bigger than the lightbox', 5, function ( assert ) {
		var $image,
			blurredThumbnailShown,
			$qf = $( '#qunit-fixture' ),
			canvas = new mw.mmv.ui.Canvas( $qf );

		canvas.set = function () {
			assert.ok ( true, 'Placeholder shown');
		};

		$image = $( '<img>' ).width( 100 ).height( 50 );

		blurredThumbnailShown = canvas.setThumbnailForDisplay(
			{ width : 1000, height : 500 },
			$image,
			{ css : 300, real : 300 }
		);

		assert.strictEqual( $image.width(), 300, 'Placeholder has the right width' );
		assert.strictEqual( $image.height(), 150, 'Placeholder has the right height' );
		assert.ok( $image.hasClass( 'blurred' ), 'Placeholder is blurred' );
		assert.ok( blurredThumbnailShown, 'Placeholder state is correct' );
	} );

	QUnit.test( 'setThumbnailForDisplay: big-enough placeholder that needs blurring, actual image smaller than the lightbox', 5, function ( assert ) {
		var $image,
			blurredThumbnailShown,
			$qf = $( '#qunit-fixture' ),
			canvas = new mw.mmv.ui.Canvas( $qf );

		canvas.set = function () {
			assert.ok ( true, 'Placeholder shown');
		};

		$image = $( '<img>' ).width( 100 ).height( 50 );

		blurredThumbnailShown = canvas.setThumbnailForDisplay(
			{ width : 1000, height : 500 },
			$image,
			{ css : 1200 }
		);

		assert.strictEqual( $image.width(), 1000, 'Placeholder has the right width' );
		assert.strictEqual( $image.height(), 500, 'Placeholder has the right height' );
		assert.ok( $image.hasClass( 'blurred' ), 'Placeholder is blurred' );
		assert.ok( blurredThumbnailShown, 'Placeholder state is correct' );
	} );

	QUnit.test( 'setThumbnailForDisplay: placeholder too small to be displayed, actual image bigger than the lightbox', 4, function ( assert ) {
		var $image,
			blurredThumbnailShown,
			$qf = $( '#qunit-fixture' ),
			canvas = new mw.mmv.ui.Canvas( $qf );

		canvas.set = function () {
			assert.ok ( false, 'Placeholder shown when it should not');
		};

		$image = $( '<img>' ).width( 10 ).height( 5 );

		blurredThumbnailShown = canvas.setThumbnailForDisplay(
			{ width : 1000, height : 500 },
			$image,
			{ css : 300, real : 300 }
		);

		assert.strictEqual( $image.width(), 10, 'Placeholder has the right width' );
		assert.strictEqual( $image.height(), 5, 'Placeholder has the right height' );
		assert.ok( ! $image.hasClass( 'blurred' ), 'Placeholder is not blurred' );
		assert.ok( ! blurredThumbnailShown, 'Placeholder state is correct' );
	} );

	QUnit.test( 'Unblur', 3, function ( assert ) {
		var $qf = $( '#qunit-fixture' ),
			canvas = new mw.mmv.ui.Canvas( $qf ),
			oldAnimate = $.fn.animate;

		$.fn.animate = function ( target, options ) {
			var self = this,
				lastValue;

			$.each( target, function ( key, value ) {
				lastValue = self.key = value;
			} );

			if ( options ) {
				if ( options.step ) {
					options.step.call( this, lastValue );
				}

				if ( options.complete ) {
					options.complete.call( this );
				}
			}
		};

		canvas.$image =  $( '<img>' );

		canvas.unblur();

		assert.ok( ! canvas.$image.css( '-webkit-filter' ) || !canvas.$image.css( '-webkit-filter' ).length,
			'Image has no filter left' );
		assert.strictEqual( parseInt( canvas.$image.css( 'opacity' ), 10 ), 1,
			'Image is fully opaque' );
		assert.ok( ! canvas.$image.hasClass( 'blurred' ), 'Image has no "blurred" class' );

		$.fn.animate = oldAnimate;
	} );

}( mediaWiki, jQuery ) );
