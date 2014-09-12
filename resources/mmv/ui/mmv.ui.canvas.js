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

( function( mw, $, oo ) {
	var C;

	/**
	 * UI component that contains the multimedia element to be displayed.
	 * This first version assumes an image but it can be extended to other
	 * media types (video, sound, presentation, etc.).
	 *
	 * @class mw.mmv.ui.Canvas
	 * @extends mw.mmv.ui.Element
	 * @constructor
	 * @param {jQuery} $container Canvas' container
	 * @param {jQuery} $imageWrapper
	 * @param {jQuery} $mainWrapper
	 */
	function Canvas( $container, $imageWrapper, $mainWrapper ) {
		mw.mmv.ui.Element.call( this, $container );

		/**
		 * @property {mw.mmv.ThumbnailWidthCalculator}
		 * @private
		 */
		this.thumbnailWidthCalculator = new mw.mmv.ThumbnailWidthCalculator();

		/**
		 * Contains image.
		 * @property {jQuery}
		 */
		this.$imageDiv = $( '<div>' )
			.addClass( 'mw-mmv-image' );

		this.$imageDiv.appendTo( this.$container );

		/**
		 * Container of canvas and controls, needed for canvas size calculations.
		 * @property {jQuery}
		 * @private
		 */
		this.$imageWrapper = $imageWrapper;

		/**
		 * Main container of image and metadata, needed to propagate events.
		 * @property {jQuery}
		 * @private
		 */
		this.$mainWrapper = $mainWrapper;

		/**
		 * Raw metadata of current image, needed for canvas size calculations.
		 * @property {mw.mmv.LightboxImage}
		 * @private
		 */
		this.imageRawMetadata = null;
	}
	oo.inheritClass( Canvas, mw.mmv.ui.Element );
	C = Canvas.prototype;

	/**
	 * Maximum blownup factor tolerated
	 * @property MAX_BLOWUP_FACTOR
	 * @static
	 */
	Canvas.MAX_BLOWUP_FACTOR = 11;

	/**
	 * Blowup factor threshold at which blurring kicks in
	 * @property BLUR_BLOWUP_FACTOR_THRESHOLD
	 * @static
	 */
	Canvas.BLUR_BLOWUP_FACTOR_THRESHOLD = 2;

	/**
	 * Clears everything.
	 */
	C.empty = function() {
		this.$imageDiv.addClass( 'empty' ).removeClass( 'error' );

		this.$imageDiv.empty();
	};

	/**
	 * Sets contained image.
	 * @param {mw.mmv.LightboxImage} imageRawMetadata
	 * @param {jQuery} $imageElement
	 */
	C.set = function( imageRawMetadata, $imageElement ) {
		this.$imageDiv.removeClass( 'empty' );

		this.imageRawMetadata = imageRawMetadata;
		this.$image = $imageElement;
		this.setUpImageClick();

		this.$imageDiv.html( this.$image );
	};

	/**
	 * Sets max-width and max-height of the image equal to those of its parent element.
	 * FIXME what is this good for, actually?
	 */
	C.setImageMaxDimensions = function() {
		this.$image.css( {
			maxWidth : this.$image.parent().width(),
			// for height, use closest ancestor which has non-content-defined height;
			// otherwise this could be determined by the height of the image.
			maxHeight : this.$imageWrapper.height()
		} );
	};

	/**
	 * Sets contained image and also the max dimensions. Called while resizing the viewer.
	 * Assumes set function called before.
	 * @param {mw.mmv.model.Thumbnail} thumbnail thumbnail information
	 * @param {HTMLImageElement} imageElement
	 * @param {mw.mmv.model.ThumbnailWidth} imageWidths
	 */
	C.setImageAndMaxDimensions = function( thumbnail, imageElement, imageWidths ) {
		var $image = $( imageElement );

		// we downscale larger images but do not scale up smaller ones, that would look ugly
		if ( thumbnail.width > imageWidths.cssWidth ) {
			imageElement.width = imageWidths.cssWidth;
		}

		if ( !this.$image.is( imageElement ) ) { // http://bugs.jquery.com/ticket/4087
			this.$image.replaceWith( $image );
			this.$image = $image;

			this.setUpImageClick();
		}

		this.setImageMaxDimensions();
	};

	/**
	 * Handles a "dialog open" event from dialogs on the page.
	 */
	C.handleDialogOpen = function () {
		this.dialogOpen = true;
		this.$image.addClass( 'mw-mmv-dialog-is-open' );
	};

	/**
	 * Handles a "dialog close" event from dialogs on the page.
	 */
	C.handleDialogClose = function () {
		this.dialogOpen = false;
		this.$image.removeClass( 'mw-mmv-dialog-is-open' );
	};

	/**
	 * Registers click listener on the image.
	 */
	C.setUpImageClick = function () {
		var canvas = this;

		this.handleEvent( 'mmv-reuse-opened', $.proxy( this.handleDialogOpen, this ) );
		this.handleEvent( 'mmv-reuse-closed', $.proxy( this.handleDialogClose, this ) );

		this.$image
			.on( 'click.mmv-view-original', function () {
				if ( !canvas.dialogOpen ) {
					mw.mmv.actionLogger.log( 'view-original-file' ).always( function() {
						$( document ).trigger( 'mmv-viewfile' );
					} );
				}
			} );
	};

	/**
	 * Registers listeners.
	 */
	C.attach = function() {
		var canvas = this;

		$( window ).on( 'resize.mmv-canvas', function () {
			canvas.$mainWrapper.trigger( $.Event( 'mmv-resize' ) );
		} );

		this.$imageDiv.on( 'click.mmv-canvas', 'img', function () {
			canvas.$mainWrapper.trigger( $.Event( 'mmv-image-click' ) );
		} );
	};

	/**
	 * Clears listeners.
	 */
	C.unattach = function() {
		this.clearEvents();

		$( window ).off( 'resize.mmv-canvas' );

		this.$imageDiv.off( 'click.mmv-canvas' );

		if ( this.$image ) {
			this.$image.tipsy( 'hide' );
		}
	};

	/**
	 * Sets page thumbnail for display if blowupFactor <= MAX_BLOWUP_FACTOR. Otherwise thumb is not set.
	 * The image gets also blured to avoid pixelation if blowupFactor > BLUR_BLOWUP_FACTOR_THRESHOLD.
	 * We set SVG files to the maximum screen size available.
	 * Assumes set function called before.
	 *
	 * @param {{width: number, height: number}} size
	 * @param {jQuery} $imagePlaceholder Image placeholder to be displayed while the real image loads.
	 * @param {mw.mmv.model.ThumbnailWidth} imageWidths
	 * @returns {boolean} Whether the image was blured or not
	 */
	 C.maybeDisplayPlaceholder = function ( size, $imagePlaceholder, imageWidths ) {
		var targetWidth,
			targetHeight,
			blowupFactor,
			blurredThumbnailShown = false;

		// Assume natural thumbnail size¸
		targetWidth = size.width;
		targetHeight = size.height;

		// If the image is bigger than the screen we need to resize it
		if ( size.width > imageWidths.cssWidth ) { // This assumes imageInfo.width in CSS units
			targetWidth = imageWidths.cssWidth;
			targetHeight = imageWidths.cssHeight;
		}

		blowupFactor = targetWidth / $imagePlaceholder.width();

		// If the placeholder is too blown up, it's not worth showing it
		if ( blowupFactor > Canvas.MAX_BLOWUP_FACTOR ) {
			return blurredThumbnailShown;
		}

		$imagePlaceholder.width( targetWidth );
		$imagePlaceholder.height( targetHeight );

		// Only blur the placeholder if it's blown up significantly
		if ( blowupFactor > Canvas.BLUR_BLOWUP_FACTOR_THRESHOLD ) {
			this.blur( $imagePlaceholder );
			blurredThumbnailShown = true;
		}

		this.set( this.imageRawMetadata, $imagePlaceholder.show() );

		return blurredThumbnailShown;
	};

	/**
	 * Blur image
	 * @param {jQuery} $image Image to be blurred.
	 */
	C.blur = function( $image ) {
		// We have to apply the SVG filter here, it doesn't work when defined in the .less file
		// We can't use an external SVG file because filters can't be accessed cross-domain
		// We can't embed the SVG file because accessing the filter inside of it doesn't work
		$image.addClass( 'blurred' ).css( 'filter', 'url("#gaussian-blur")' );
	};

	/**
	 * Animates the image into focus
	 */
	C.unblurWithAnimation = function() {
		var self = this,
			animationLength = 300;

		// The blurred class has an opacity < 1. This animated the image to become fully opaque
		this.$image
			.addClass( 'blurred' )
			.animate( { opacity: 1.0 }, animationLength );

		// During the same amount of time (animationLength) we animate a blur value from 3.0 to 0.0
		// We pass that value to an inline CSS Gaussian blur effect
		$( { blur: 3.0 } ).animate( { blur: 0.0 }, {
			duration: animationLength,
			step: function ( step ) {
				self.$image.css( { '-webkit-filter' : 'blur(' + step + 'px)',
					'filter' : 'blur(' + step + 'px)' } );
			},
			complete: function () {
				// When the animation is complete, the blur value is 0, clean things up
				self.unblur();
			}
		} );
	};

	C.unblur = function() {
		// We apply empty CSS values to remove the inline styles applied by jQuery
		// so that they don't get in the way of styles defined in CSS
		this.$image.css( { '-webkit-filter' : '', 'opacity' : '', 'filter' : '' } )
			.removeClass( 'blurred' );
	};

	/**
	 * Displays a message and error icon when loading the image fails.
	 * @param {string} error error message
	 */
	C.showError = function ( error ) {
		this.$imageDiv.empty()
			.addClass( 'error' )
			.append(
				$( '<div>' ).addClass( 'mw-mmv-error-text' ).text(
					mw.message( 'multimediaviewer-thumbnail-error', error ).text()
				)
			);
	};

	/**
	 * Gets the widths for a given lightbox image.
	 * @param {mw.mmv.LightboxImage} image
	 * @returns {mw.mmv.model.ThumbnailWidth}
	 */
	C.getLightboxImageWidths = function ( image ) {
		var thumb = image.thumbnail,
			$window = $( window ),
			$aboveFold = $( '.mw-mmv-above-fold' ),
			isFullscreened = !!$aboveFold.closest( '.jq-fullscreened' ).length,
			// Don't rely on this.$imageWrapper's sizing because it's fragile.
			// Depending on what the wrapper contains, its size can be 0 on some browsers.
			// Therefore, we calculate the available space manually
			availableWidth = $window.width(),
			availableHeight =  $window.height() - ( isFullscreened ? 0 : $aboveFold.height() );

		return this.thumbnailWidthCalculator.calculateWidths(
			availableWidth, availableHeight, thumb.width, thumb.height );
	};

	/**
	 * Gets the fullscreen widths for a given lightbox image.
	 * Intended for use before the viewer is in fullscreen mode
	 * (in fullscreen mode getLightboxImageWidths() works fine).
	 * @param {mw.mmv.LightboxImage} image
	 * @returns {mw.mmv.model.ThumbnailWidth}
	 */
	C.getLightboxImageWidthsForFullscreen = function ( image ) {
		var thumb = image.thumbnail;

		return this.thumbnailWidthCalculator.calculateWidths(
			screen.width, screen.height, thumb.width, thumb.height );
	};

	/**
	 * Gets the widths for the current lightbox image.
	 * @returns {mw.mmv.model.ThumbnailWidth}
	 */
	C.getCurrentImageWidths = function () {
		return this.getLightboxImageWidths( this.imageRawMetadata );
	};


	mw.mmv.ui.Canvas = Canvas;
}( mediaWiki, jQuery, OO ) );
