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
	 * @class mw.LightboxInterface
	 * @extends mlb.LightboxInterface
         * Represents the main interface of the lightbox
	 * @constructor
	 */
	function LightboxInterface( viewer ) {
		MLBInterface.call( this );

		this.viewer = viewer;

		this.eventsRegistered = {};

		/**
		 * Copy of {@link mw.MultimediaViewer#thumbnailWidthCalculator}
		 * @property {mw.mmv.ThumbnailWidthCalculator}
		 */
		this.thumbnailWidthCalculator = viewer.thumbnailWidthCalculator;

		this.initializeInterface();
	}

	oo.inheritClass( LightboxInterface, MLBInterface );

	LIP = LightboxInterface.prototype;

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

		// Buttons fading might not had been reset properly after a hard fullscreen exit
		// This needs to happen after the parent attach() because the buttons need to be attached
		// to the DOM for $.fn.stop() to work
		this.stopButtonsFade();
	};

	LIP.unattach = function () {
		MLBInterface.prototype.unattach.call( this );

		// Restore the scrollTop as it was before opening the lightbox
		if ( this.scrollTopBeforeAttach !== undefined ) {
			$.scrollTo( this.scrollTopBeforeAttach, 0 );
			this.scrollTopBeforeAttach = undefined;
		}
	};

	LIP.load = function ( image ) {
		var hashFragment = '#mediaviewer/' + this.viewer.currentImageFilename + '/' + this.viewer.lightbox.currentIndex,
			ui = this;

		this.viewer.ui = this;
		this.viewer.registerLogging();

		if ( !this.comingFromPopstate ) {
			history.pushState( {}, '', hashFragment );
		}

		this.handleEvent( 'keydown', function( e ) { ui.keydown( e ); } );

		// mousemove generates a ton of events, which is why we throttle it
		this.handleEvent( 'mousemove.lip', $.throttle( 250, function( e ) {
			ui.mousemove( e );
		} ) );

		MLBInterface.prototype.load.call( this, image );
	};

	LIP.initializeInterface = function () {
		this.panel = new mw.mmv.ui.MetadataPanel( this.$postDiv, this.$controlBar );

		this.initializeNavigation();
		this.initializeButtons();
		this.initializeImage();
	};

	LIP.initializeButtons = function () {
		// Note we aren't adding the fullscreen button here.
		// Fullscreen causes some funky issues with UI redraws,
		// and we aren't sure why, but it's not really necessary
		// with the new interface anyway - it's basically fullscreen
		// already!
		this.$buttons = this.$closeButton
			.add( this.$fullscreenButton )
			.add( this.$nextButton )
			.add( this.$prevButton )
			.appendTo( this.$imageWrapper );
	};

	LIP.initializeImage = function () {
		this.$imageDiv
			.addClass( 'empty' );
	};

	LIP.initializeNavigation = function () {
		var viewer = this.viewer;

		this.$nextButton = $( '<div>' )
			.addClass( 'mw-mlb-next-image disabled' )
			.html( '&nbsp;' )
			.click( function () {
				viewer.nextImage();
			} );

		this.$prevButton = $( '<div>' )
			.addClass( 'mw-mlb-prev-image disabled' )
			.html( '&nbsp;' )
			.click( function () {
				viewer.prevImage();
			} );
	};

	LIP.replaceImageWith = function ( imageEle ) {
		var $image = $( imageEle );

		this.currentImage.src = imageEle.src;

		this.$image.replaceWith( $image );
		this.$image = $image;

		this.$image.css( {
			maxHeight: $image.parent().height(),
			maxWidth: $image.parent().width()
		} );
	};

	LIP.fullscreenChange = function( e ) {
		MLBInterface.prototype.fullscreenChange.call( this, e );

		// Fullscreen change events can happen after unattach(), in which
		// case we shouldn't do anything UI-related
		if ( !this.currentlyAttached ) {
			return;
		}

		this.viewer.resize( this );

		if ( this.isFullscreen ) {
			// When entering fullscreen without a mousemove, the browser
			// still thinks that the cursor is where it was prior to entering
			// fullscreen. I.e. on top of the fullscreen button
			// Thus, we purposefully reset the saved position, so that
			// the fade out really takes place (otherwise it's cancelled
			// by updateControls which is called a few times when fullscreen opens)
			this.mousePosition = { x: 0, y: 0 };
			this.fadeOutButtons();
		}
	};

	/**
	 * @method
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
	 * @method
	 * Handles mousemove events on the document
	 */
	LIP.mousemove = function ( e ) {
		if ( e ) {
			// Saving the mouse position is useful whenever we need to
			// run LIP.mousemove manually, such as when going to the next/prev
			// element
			this.mousePosition = { x: e.pageX, y: e.pageY};
		}

		this.revealButtonsAndFadeIfNeeded();
	};

	/**
	 * @method
	 * Reveals all active buttons and schedule a fade out if needed
	 */
	LIP.revealButtonsAndFadeIfNeeded = function () {
		// Only fullscreen mode sees its buttons fade out when not used
		if ( !this.isFullscreen ) {
			return;
		}

		if ( this.buttonsFadeTimeout ) {
			clearTimeout( this.buttonsFadeTimeout );
		}

		// Stop ongoing animations and make sure the buttons that need to be displayed are displayed
		this.stopButtonsFade();

		// this.mousePosition can be empty, for instance when we enter fullscreen and haven't
		// recorded a real mousemove event yet
		if ( !this.mousePosition
			|| !this.isAnyActiveButtonHovered( this.mousePosition.x, this.mousePosition.y ) ) {
			this.fadeOutButtons();
		}
	};

	/**
	 * @method
	 * Fades out the active buttons
	 */
	LIP.fadeOutButtons = function () {
		var ui = this;

		// We don't use animation chaining because delay() can't be stop()ed
		this.buttonsFadeTimeout = setTimeout( function() {
			ui.$buttons.not( '.disabled' ).animate( { opacity: 0 }, 1000 );
		}, 1500 );
	};

	/**
	 * @method
	 * Stops the fading animation of the buttons and cancel any opacity value
	 */
	LIP.stopButtonsFade = function () {
		this.$buttons
			.stop( true )
			.css( 'opacity', '' );
	};

	/**
	 * @method
	 * Checks if any active buttons are currently hovered, given a position
	 * @param {number} x The horizontal coordinate of the position
	 * @param {number} y The vertical coordinate of the position
	 * @return bool
	 */
	LIP.isAnyActiveButtonHovered = function ( x, y ) {
		// We don't use mouseenter/mouseleave events because content is subject
		// to change underneath the cursor, eg. when entering fullscreen or
		// when going prev/next (the button can disappear when reaching ends)
		var hovered = false;

		this.$buttons.not( '.disabled' ).each( function( idx, e ) {
			var $e = $( e ),
				offset = $e.offset();

			if ( y >= offset.top
				&& y <= offset.top + $e.height()
				&& x >= offset.left
				&& x <= offset.left + $e.width() ) {
				hovered = true;
			}
		} );

		return hovered;
	};

	/**
	 * @method
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

		this.$nextButton.add( this.$prevButton ).css( {
			top: prevNextTop
		} );

		this.$nextButton.toggleClass( 'disabled', !showPrevButton );
		this.$prevButton.toggleClass( 'disabled', !showNextButton );

		this.revealButtonsAndFadeIfNeeded();
	};

	/**
	 * Gets the API arguments for various calls to the API to find sized thumbnails.
	 * @returns {Object}
	 * @returns {number} return.real The width that should be requested from the API
	 * @returns {number} return.css The ideal width we would like to have - should be the width of the image element later.
	 */
	LIP.getImageSizeApiArgs = function () {
		var thumb = this.currentImage.thumbnail;

		return this.thumbnailWidthCalculator.calculateWidths(
			this.$imageWrapper.width(), this.$imageWrapper.height(), thumb.width, thumb.height );
	};


	mw.LightboxInterface = LightboxInterface;
}( mediaWiki, jQuery, OO, window.LightboxInterface ) );
