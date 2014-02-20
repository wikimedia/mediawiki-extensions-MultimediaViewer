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

( function ( mw, $, oo, MLBInterface ) {
	var LIP;

	/**
         * Represents the main interface of the lightbox
	 * @class mw.LightboxInterface
	 * @extends mlb.LightboxInterface
	 * @constructor
	 */
	function LightboxInterface( viewer ) {
		MLBInterface.call( this );

		this.viewer = viewer;

		this.eventsRegistered = {};

		/**
		 * @property {mw.mmv.ThumbnailWidthCalculator}
		 * @private
		 */
		this.thumbnailWidthCalculator = new mw.mmv.ThumbnailWidthCalculator();


		this.initializeInterface();
	}

	oo.inheritClass( LightboxInterface, MLBInterface );

	LIP = LightboxInterface.prototype;

	/**
	 * Empties the interface.
	 * @override
	 */
	LIP.empty = function () {
		this.clearEvents();

		this.panel.empty();

		this.$imageDiv.addClass( 'empty' );

		MLBInterface.prototype.empty.call( this );
	};

	/**
	 * Add event handler in a way that will be auto-cleared on lightbox close
	 * NOTE: If you're changing this method you should probably do it in the
	 * mw.mmv.ui.Element version, which is where we'll be handling events
	 * from now on.
	 * @param {string} name Name of event, like 'keydown'
	 * @param {Function} handler Callback for the event
	 */
	LIP.handleEvent = function ( name, handler ) {
		if ( this.eventsRegistered[name] === undefined ) {
			this.eventsRegistered[name] = [];
		}
		this.eventsRegistered[name].push( handler );
		$( document ).on( name, handler );
	};

	/**
	 * Remove all events that have been registered.
	 */
	LIP.clearEvents = function () {
		var i, handlers, thisevent,
			events = Object.keys( this.eventsRegistered );

		for ( i = 0; i < events.length; i++ ) {
			thisevent = events[i];
			handlers = this.eventsRegistered[thisevent];
			while ( handlers.length > 0 ) {
				$( document ).off( thisevent, handlers.pop() );
			}
		}
	};

	/**
	 * Attaches the interface to the DOM.
	 * @override
	 * @param {string} parentId ID of the element that we should attach to.
	 */
	LIP.attach = function ( parentId ) {
		// Advanced description needs to be below the fold when the lightbox opens
		// regardless of what the scroll value was prior to opening the lightbox

		// Only scroll and save the position if it's the first attach
		// Otherwise it could be an attach event happening because of prev/next
		if ( this.scrollTopBeforeAttach === undefined ) {
			// Save the scrollTop value because we want below to be back to where they were
			// before opening the lightbox
			this.scrollTopBeforeAttach = $.scrollTo().scrollTop();
			$.scrollTo( 0, 0 );
		}

		// Make sure that the metadata is going to be at the bottom when it appears
		// 83 is the height of the top metadata area. Which can't be measured by
		// reading the DOM at this point of the execution, unfortunately
		this.$postDiv.css( 'top', ( $( window ).height() - 83 ) + 'px' );

		MLBInterface.prototype.attach.call( this, parentId );

		this.panel.attach();

		// Buttons fading might not had been reset properly after a hard fullscreen exit
		// This needs to happen after the parent attach() because the buttons need to be attached
		// to the DOM for $.fn.stop() to work
		this.buttons.stopFade();
	};

	/**
	 * Detaches the interface from the DOM.
	 * @override
	 */
	LIP.unattach = function () {
		MLBInterface.prototype.unattach.call( this );

		this.panel.unattach();

		// Restore the scrollTop as it was before opening the lightbox
		if ( this.scrollTopBeforeAttach !== undefined ) {
			$.scrollTo( this.scrollTopBeforeAttach, 0 );
			this.scrollTopBeforeAttach = undefined;
		}

		this.panel.fileReuse.closeDialog();
	};

	/**
	 * FIXME A bunch of stuff ripped out of #load, because load tries to actually load the image
	 * and causes the small-thumbnail-for-a-moment bug in the process. Needs severe refactoring.
	 */
	LIP.setupForLoad = function() {
		var hashFragment = '#mediaviewer/' + this.viewer.currentImageFilename,
			ui = this;

		this.viewer.ui = this;

		if ( !this.comingFromPopstate ) {
			history.pushState( {}, '', hashFragment );
		}

		this.handleEvent( 'keydown', function ( e ) { ui.keydown( e ); } );

		// mousemove generates a ton of events, which is why we throttle it
		this.handleEvent( 'mousemove.lip', $.throttle( 250, function( e ) {
			ui.mousemove( e );
		} ) );

		this.handleEvent( 'mmv-faded-out', function ( e ) { ui.fadedOut( e ); } );
		this.handleEvent( 'mmv-fade-stopped', function ( e ) { ui.fadeStopped( e ); } );
	};

	/**
	 * Loads an image into the interface.
	 * @override
	 */
	LIP.load = function ( image ) {
		this.setupForLoad();
		MLBInterface.prototype.load.call( this, image );
	};

	/**
	 * Initialize the entire interface - helper method.
	 */
	LIP.initializeInterface = function () {
		this.panel = new mw.mmv.ui.MetadataPanel( this.$postDiv, this.$controlBar );
		this.buttons = new mw.mmv.ui.Buttons( this.$imageWrapper, this.$closeButton, this.$fullscreenButton );
		this.initializeImage();
	};

	/**
	 * Initialize the image element.
	 */
	LIP.initializeImage = function () {
		this.$imageDiv
			.addClass( 'empty' );
	};

	/**
	 * Load a new image element into the interface.
	 * @override
	 * @param {HTMLImageElement} imageEle
	 */
	LIP.replaceImageWith = function ( imageEle ) {
		if ( this.$image.is( imageEle ) ) { // http://bugs.jquery.com/ticket/4087
			return;
		}

		var $image = $( imageEle );

		this.currentImage.src = imageEle.src;

		this.$image.replaceWith( $image );
		this.$image = $image;

		this.$image.css( {
			maxHeight: $image.parent().height(),
			maxWidth: $image.parent().width()
		} );
	};

	/**
	 * Handle a fullscreen change event.
	 * @override
	 * @param {jQuery.Event} e The fullscreen change event.
	 */
	LIP.fullscreenChange = function( e ) {
		MLBInterface.prototype.fullscreenChange.call( this, e );

		// Fullscreen change events can happen after unattach(), in which
		// case we shouldn't do anything UI-related
		if ( !this.currentlyAttached ) {
			return;
		}

		if ( this.isFullscreen ) {
			// When entering fullscreen without a mousemove, the browser
			// still thinks that the cursor is where it was prior to entering
			// fullscreen. I.e. on top of the fullscreen button
			// Thus, we purposefully reset the saved position, so that
			// the fade out really takes place (otherwise it's cancelled
			// by updateControls which is called a few times when fullscreen opens)
			this.mousePosition = { x: 0, y: 0 };
			this.buttons.fadeOut();
		}
	};

	/**
	 * Handles keydown events on the document
	 * @param {jQuery.Event} e The jQuery keypress event object
	 */
	LIP.keydown = function ( e ) {
		var isRtl = $( document.body ).hasClass( 'rtl' );

		switch ( e.which ) {
			case 37:
				// Left arrow
				if ( isRtl ) {
					this.viewer.nextImage();
				} else {
					this.viewer.prevImage();
				}
				break;
			case 39:
				// Right arrow
				if ( isRtl ) {
					this.viewer.prevImage();
				} else {
					this.viewer.nextImage();
				}
				break;
		}
	};

	/**
	 * Handles mousemove events on the document
	 * @param {jQuery.Event} e The mousemove event object
	 */
	LIP.mousemove = function ( e ) {
		if ( e ) {
			// Saving the mouse position is useful whenever we need to
			// run LIP.mousemove manually, such as when going to the next/prev
			// element
			this.mousePosition = { x: e.pageX, y: e.pageY };
		}

		if ( this.isFullscreen ) {
			this.buttons.revealAndFade( this.mousePosition );
		}
	};

	/**
	 * Updates the next and prev buttons
	 * @param {boolean} showPrevButton Whether the prev button should be revealed or not
	 * @param {boolean} showNextButton Whether the next button should be revealed or not
	 */
	LIP.updateControls = function ( showPrevButton, showNextButton ) {
		var prevNextTop = ( ( this.$imageWrapper.height() / 2 ) - 60 ) + 'px';

		if ( this.$main.data( 'isFullscreened' ) ) {
			this.$postDiv.css( 'top', '' );
		} else {
			this.$postDiv.css( 'top', this.$imageWrapper.height() );
		}

		this.buttons.setOffset( prevNextTop );
		this.buttons.toggle( showPrevButton, showNextButton );
	};

	/**
	 * @method
	 * Gets the widths for a given lightbox image.
	 * @param {mlb.LightboxImage} image
	 * @returns {mw.mmv.model.ThumbnailWidth}
	 */
	LIP.getLightboxImageWidths = function ( image ) {
		var thumb = image.thumbnail;

		return this.thumbnailWidthCalculator.calculateWidths(
			this.$imageWrapper.width(), this.$imageWrapper.height(), thumb.width, thumb.height );
	};

	/**
	 * Gets the fullscreen widths for a given lightbox image.
	 * Intended for use before the viewer is in fullscreen mode
	 * (in fullscreen mode getLightboxImageWidths() works fine).
	 * @param {mlb.LightboxImage} image
	 * @returns {mw.mmv.model.ThumbnailWidth}
	 */
	LIP.getLightboxImageWidthsForFullscreen = function ( image ) {
		var thumb = image.thumbnail;

		return this.thumbnailWidthCalculator.calculateWidths(
			screen.width, screen.height, thumb.width, thumb.height );
	};

	/**
	 * Gets the widths for the current lightbox image.
	 * @returns {mw.mmv.model.ThumbnailWidth}
	 */
	LIP.getCurrentImageWidths = function () {
		return this.getLightboxImageWidths( this.currentImage );
	};

	/**
	 * @method
	 * Called when the buttons have completely faded out and disappeared
	 */
	LIP.fadedOut = function () {
		this.$main.addClass( 'cursor-hidden' );
	};

	/**
	 * @method
	 * Called when the buttons have stopped fading and are back into view
	 */
	LIP.fadeStopped = function () {
		this.$main.removeClass( 'cursor-hidden' );
	};

	mw.LightboxInterface = LightboxInterface;
}( mediaWiki, jQuery, OO, window.LightboxInterface ) );
