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

const HtmlUtils = require( '../mmv.HtmlUtils.js' );
const ThumbnailWidthCalculator = require( '../mmv.ThumbnailWidthCalculator.js' );
const UiElement = require( './mmv.ui.js' );

/**
 * UI component that contains the multimedia element to be displayed.
 * This first version assumes an image but it can be extended to other
 * media types (video, sound, presentation, etc.).
 */
class Canvas extends UiElement {
	/**
	 * @param {jQuery} $container Canvas' container
	 * @param {jQuery} $imageWrapper
	 * @param {jQuery} $mainWrapper
	 */
	constructor( $container, $imageWrapper, $mainWrapper ) {
		super( $container );

		/**
		 * @property {boolean}
		 * @private
		 */
		this.dialogOpen = false;

		/**
		 * @property {ThumbnailWidthCalculator}
		 * @private
		 */
		this.thumbnailWidthCalculator = new ThumbnailWidthCalculator();

		/**
		 * Contains image.
		 *
		 * @property {jQuery}
		 */
		this.$imageDiv = $( '<div>' )
			.addClass( 'mw-mmv-image' );

		this.$imageDiv.appendTo( this.$container );

		/**
		 * Container of canvas and controls, needed for canvas size calculations.
		 *
		 * @property {jQuery}
		 * @private
		 */
		this.$imageWrapper = $imageWrapper;

		/**
		 * Main container of image and metadata, needed to propagate events.
		 *
		 * @property {jQuery}
		 * @private
		 */
		this.$mainWrapper = $mainWrapper;

		/**
		 * Raw metadata of current image, needed for canvas size calculations.
		 *
		 * @property {LightboxImage}
		 * @private
		 */
		this.imageRawMetadata = null;
	}

	/**
	 * Clears everything.
	 */
	empty() {
		this.$imageDiv.addClass( 'empty' ).removeClass( 'error' );

		this.$imageDiv.empty();
	}

	/**
	 * Sets image on the canvas; does not resize it to fit. This is used to make the placeholder
	 * image available; it will be resized and displayed by #maybeDisplayPlaceholder().
	 * FIXME maybeDisplayPlaceholder() receives the placeholder so it is very unclear why this
	 * is necessary at all (apart from setting the LightboxImage, which is used in size calculations).
	 *
	 * @param {LightboxImage} imageRawMetadata
	 * @param {jQuery} $imageElement
	 */
	set( imageRawMetadata, $imageElement ) {
		this.$imageDiv.removeClass( 'empty' );

		this.imageRawMetadata = imageRawMetadata;
		this.$image = $imageElement;
		this.setUpImageClick();

		this.$imageDiv.html( this.$image );
	}

	/**
	 * Resizes image to the given dimensions and displays it on the canvas.
	 * This is used to display the actual image; it assumes set function was already called before.
	 *
	 * @param {Thumbnail} thumbnail thumbnail information
	 * @param {HTMLImageElement} imageElement
	 * @param {ThumbnailWidth} imageWidths
	 */
	setImageAndMaxDimensions( thumbnail, imageElement, imageWidths ) {
		const $image = $( imageElement );

		// we downscale larger images but do not scale up smaller ones, that would look ugly
		if ( thumbnail.width > imageWidths.cssWidth ) {
			imageElement.width = imageWidths.cssWidth;
			imageElement.height = imageWidths.cssHeight;
		}

		if ( !this.$image.is( imageElement ) ) { // http://bugs.jquery.com/ticket/4087
			this.$image.replaceWith( $image );
			this.$image = $image;

			// Since the image element got replaced, we need to rescue the dialog-open class.
			this.$image.toggleClass( 'mw-mmv-dialog-is-open', this.dialogOpen );

			this.setUpImageClick();
		}
	}

	/**
	 * Handles a "dialog open/close" event from dialogs on the page.
	 *
	 * @param {jQuery.Event} e
	 */
	handleDialogEvent( e ) {
		switch ( e.type ) {
			case 'mmv-download-opened':
				this.downloadOpen = true;
				break;
			case 'mmv-download-closed':
				this.downloadOpen = false;
				break;
			case 'mmv-reuse-opened':
				this.reuseOpen = true;
				break;
			case 'mmv-reuse-closed':
				this.reuseOpen = false;
				break;
		}

		this.dialogOpen = this.reuseOpen || this.downloadOpen;
		this.$image.toggleClass( 'mw-mmv-dialog-is-open', this.dialogOpen );
	}

	/**
	 * Registers click listener on the image.
	 *
	 * @fires ReuseDialog#mmv-reuse-opened
	 * @fires ReuseDialog#mmv-reuse-closed
	 * @fires DownloadDialog#mmv-download-opened
	 * @fires DownloadDialog#mmv-download-closed
	 */
	setUpImageClick() {
		this.handleEvent( 'mmv-reuse-opened', this.handleDialogEvent.bind( this ) );
		this.handleEvent( 'mmv-reuse-closed', this.handleDialogEvent.bind( this ) );
		this.handleEvent( 'mmv-download-opened', this.handleDialogEvent.bind( this ) );
		this.handleEvent( 'mmv-download-closed', this.handleDialogEvent.bind( this ) );

		this.$image.on( 'click.mmv-canvas', ( e ) => {
			// ignore clicks if the metadata panel or one of the dialogs is open - assume the intent is to
			// close it in this case; that will be handled elsewhere
			if ( !this.dialogOpen &&
				// FIXME a UI component should not know about its parents
				this.$container.closest( '.metadata-panel-is-open' ).length === 0 ) {
				e.stopPropagation(); // don't let $imageWrapper handle this
				$( document ).trigger( 'mmv-viewfile' );
			}
		} );

		// open the download panel on right clicking the image
		this.$image.on( 'mousedown.mmv-canvas', ( e ) => {
			if ( e.which === 3 && !this.downloadOpen ) {
				$( document ).trigger( 'mmv-download-open', e );
				e.stopPropagation();
			}
		} );
	}

	/**
	 * Registers listeners.
	 *
	 * @fires MultimediaViewer#mmv-resize-end
	 */
	attach() {
		/**
		 * Fired when the screen size changes. Debounced to avoid continuous triggering while resizing with a mouse.
		 *
		 * @event MultimediaViewer#mmv-resize-end
		 */
		$( window ).on( 'resize.mmv-canvas', mw.util.debounce( () => {
			this.$mainWrapper.trigger( $.Event( 'mmv-resize-end' ) );
		}, 100 ) );

		this.$imageWrapper.on( 'click.mmv-canvas', () => {
			if ( this.$container.closest( '.metadata-panel-is-open' ).length > 0 ) {
				this.$mainWrapper.trigger( 'mmv-panel-close-area-click' );
			}
		} );
	}

	/**
	 * Clears listeners.
	 */
	unattach() {
		this.clearEvents();

		$( window ).off( 'resize.mmv-canvas' );

		this.$imageWrapper.off( 'click.mmv-canvas' );
	}

	/**
	 * Sets page thumbnail for display if blowupFactor
	 * <= MAX_BLOWUP_FACTOR. Otherwise thumb is not set.
	 * We set SVG files to the maximum screen size available.
	 * Assumes set function called before.
	 *
	 * @param {{width: number, height: number}} size
	 * @param {jQuery} $imagePlaceholder Image placeholder to be displayed while the real image loads.
	 * @param {ThumbnailWidth} imageWidths
	 */
	maybeDisplayPlaceholder( size, $imagePlaceholder, imageWidths ) {
		// Assume natural thumbnail size¸
		let targetWidth = size.width;
		let targetHeight = size.height;

		// If the image is bigger than the screen we need to resize it
		if ( size.width > imageWidths.cssWidth ) { // This assumes imageInfo.width in CSS units
			targetWidth = imageWidths.cssWidth;
			targetHeight = imageWidths.cssHeight;
		}

		const blowupFactor = targetWidth / $imagePlaceholder.width();
		// If the placeholder is too blown up, it's not worth showing it
		if ( blowupFactor > Canvas.MAX_BLOWUP_FACTOR ) {
			return;
		}

		$imagePlaceholder.width( targetWidth );
		$imagePlaceholder.height( targetHeight );
		this.set( this.imageRawMetadata, $imagePlaceholder.show() );
	}

	/**
	 * Displays a message and error icon when loading the image fails.
	 *
	 * @param {string} error error message
	 */
	showError( error ) {
		const canvasDimensions = this.getDimensions();
		const thumbnailDimensions = this.getCurrentImageWidths();

		// ** is bolding in Phabricator
		const description = `**${ mw.msg( 'multimediaviewer-errorreport-privacywarning' ) }**


Error details:

error: ${ error }
URL: ${ location.href }
user agent: ${ navigator.userAgent }
screen size: ${ screen.width }x${ screen.height }
canvas size: ${ canvasDimensions.width }x${ canvasDimensions.height }
image size: ${ this.imageRawMetadata.originalWidth }x${ this.imageRawMetadata.originalHeight }
thumbnail size: CSS: ${ thumbnailDimensions.cssWidth }x${ thumbnailDimensions.cssHeight }, screen width: ${ thumbnailDimensions.screen }, real width: ${ thumbnailDimensions.real }`;
		const errorUri = mw.msg( 'multimediaviewer-report-issue-url', encodeURIComponent( description ) );

		const $retryLink = $( '<a>' ).addClass( 'mw-mmv-retry-link' ).text(
			mw.msg( 'multimediaviewer-thumbnail-error-retry' ) );
		const $reportLink = $( '<a>' ).attr( 'href', errorUri ).text(
			mw.msg( 'multimediaviewer-thumbnail-error-report' ) );

		this.$imageDiv.empty()
			.addClass( 'error' )
			.append(
				$( '<div>' ).addClass( 'error-box' ).append(
					$( '<div>' ).addClass( 'mw-mmv-error-text' ).text(
						mw.msg( 'multimediaviewer-thumbnail-error' )
					)
				).append(
					$( '<div>' ).addClass( 'mw-mmv-error-description' ).append(
						mw.msg( 'multimediaviewer-thumbnail-error-description',
							HtmlUtils.jqueryToHtml( $retryLink ),
							error,
							HtmlUtils.jqueryToHtml( $reportLink )
						)
					)
				)
			);
		this.$imageDiv.find( '.mw-mmv-retry-link' ).on( 'click', () => {
			location.reload();
		} );
	}

	/**
	 * Returns width and height of the canvas area (i.e. the space available for the image).
	 *
	 * @return {Object} Width and height in CSS pixels
	 */
	getDimensions() {
		const $window = $( window );
		// eslint-disable-next-line no-jquery/no-global-selector
		const $aboveFold = $( '.mw-mmv-above-fold' );
		const isFullscreened = !!$aboveFold.closest( '.jq-fullscreened' ).length;
		// Don't rely on this.$imageWrapper's sizing because it's fragile.
		// Depending on what the wrapper contains, its size can be 0 on some browsers.
		// Therefore, we calculate the available space manually
		const availableWidth = $window.width();
		const availableHeight = $window.height() - ( isFullscreened ? 0 : $aboveFold.outerHeight() );

		return {
			width: availableWidth,
			height: availableHeight
		};
	}

	/**
	 * Gets the widths for a given lightbox image.
	 *
	 * @param {LightboxImage} image
	 * @return {ThumbnailWidth}
	 */
	getLightboxImageWidths( image ) {
		const thumb = image.thumbnail;
		const canvasDimensions = this.getDimensions();

		return this.thumbnailWidthCalculator.calculateWidths(
			canvasDimensions.width,
			canvasDimensions.height,
			image.originalWidth || thumb.width,
			image.originalHeight || thumb.height
		);
	}

	/**
	 * Gets the widths for the current lightbox image.
	 *
	 * @return {ThumbnailWidth}
	 */
	getCurrentImageWidths() {
		return this.getLightboxImageWidths( this.imageRawMetadata );
	}
}

/**
 * Maximum blowup factor tolerated
 *
 * @property {number} MAX_BLOWUP_FACTOR
 * @static
 */
Canvas.MAX_BLOWUP_FACTOR = 11;

module.exports = Canvas;
