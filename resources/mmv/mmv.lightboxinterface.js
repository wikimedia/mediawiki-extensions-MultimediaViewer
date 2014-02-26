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
	var LIP;

	/**
	 * Represents the main interface of the lightbox
	 * @class mw.mmv.LightboxInterface
	 * @constructor
	 */
	function LightboxInterface( viewer ) {
		this.viewer = viewer;

		this.eventsRegistered = {};

		/**
		 * @property {mw.mmv.ThumbnailWidthCalculator}
		 * @private
		 */
		this.thumbnailWidthCalculator = new mw.mmv.ThumbnailWidthCalculator();

		this.init();
	}

	LIP = LightboxInterface.prototype;

	/**
	 * The currently selected LightboxImage.
	 * @type {mw.mmv.LightboxImage}
	 * @protected
	 */
	LIP.currentImage = null;

	/**
	 * Initialize the entire interface - helper method.
	 */
	LIP.init = function () {
		var addToPre = [],
			addToPost = [],
			lbinterface = this;

		// SVG filter, needed to achieve blur in Firefox
		this.$filter = $( '<svg><filter id="gaussian-blur"><fegaussianblur stdDeviation="3"></filter></svg>' );

		this.$overlay = $( '<div>' )
			.addClass( 'mlb-overlay' );

		this.$wrapper = $( '<div>' )
			.addClass( 'mlb-wrapper' );

		this.$main = $( '<div>' )
			.addClass( 'mlb-main' );

		// I blame CSS for this
		this.$innerWrapper = $( '<div>' )
			.addClass( 'mlb-image-inner-wrapper' );

		this.$imageWrapper = $( '<div>' )
			.addClass( 'mlb-image-wrapper' )
			.append( this.$innerWrapper );

		this.$preDiv = $( '<div>' )
			.addClass( 'mlb-pre-image' );
		this.setupPreDiv( addToPre );

		this.$postDiv = $( '<div>' )
			.addClass( 'mlb-post-image' );
		this.setupPostDiv( addToPost );

		this.$main.append(
			this.$preDiv,
			this.$imageWrapper,
			this.$postDiv,
			this.$filter
		);

		this.$wrapper.append(
			this.$main
		);

		window.addEventListener( 'keyup', function ( e ) {
			if ( e.keyCode === 27 ) {
				// Escape button pressed
				lbinterface.unattach();
			}
		} );

		this.panel = new mw.mmv.ui.MetadataPanel( this.$postDiv, this.$controlBar );
		this.buttons = new mw.mmv.ui.Buttons( this.$imageWrapper, this.$closeButton, this.$fullscreenButton );
		this.canvas = new mw.mmv.ui.Canvas( this.$innerWrapper, this.$imageWrapper, this.$wrapper );
	};

	/**
	 * Empties the interface.
	 */
	LIP.empty = function () {
		this.clearEvents();

		this.panel.empty();

		this.canvas.empty();
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
	 * @param {string} [parentId] parent id where we want to attach the UI. Defaults to document
	 *  element, override is mainly used for testing.
	 */
	LIP.attach = function ( parentId ) {
		var lbinterface = this,
			$parent;

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

		// Re-appending the same content can have nasty side-effects
		// Such as the browser leaving fullscreen mode if the fullscreened element is part of it
		if ( this.currentlyAttached ) {
			return;
		}

		$( document ).on( 'jq-fullscreen-change.lip', function( e ) {
			lbinterface.fullscreenChange( e );
		} );

		$parent = $( parentId || document.body );

		// Clean up fullscreen data because hard-existing fullscreen might have left
		// jquery.fullscreen unable to remove the class and attribute, since $main wasn't
		// attached to the DOM anymore at the time the jq-fullscreen-change event triggered
		this.$main.data( 'isFullscreened', false ).removeClass( 'jq-fullscreened' );
		this.isFullscreen = false;

		$parent
			.append(
				this.$wrapper,
				this.$overlay
			);
		this.currentlyAttached = true;

		this.panel.attach();

		this.canvas.attach();

		// Buttons fading might not had been reset properly after a hard fullscreen exit
		// This needs to happen after the parent attach() because the buttons need to be attached
		// to the DOM for $.fn.stop() to work
		this.buttons.stopFade();
	};

	/**
	 * Detaches the interface from the DOM.
	 */
	LIP.unattach = function () {
		// We trigger this event on the document because unattach() can run
		// when the interface is unattached
		$( document ).trigger( $.Event( 'mmv-close' ) )
			.off( 'jq-fullscreen-change.lip' );

		this.$wrapper.detach();
		this.$overlay.detach();

		this.currentlyAttached = false;

		this.panel.unattach();

		this.canvas.unattach();

		// Restore the scrollTop as it was before opening the lightbox
		if ( this.scrollTopBeforeAttach !== undefined ) {
			$.scrollTo( this.scrollTopBeforeAttach, 0 );
			this.scrollTopBeforeAttach = undefined;
		}

		this.panel.fileReuse.closeDialog();

		this.clearEvents();
	};

	/**
	 * FIXME A bunch of stuff ripped out of #load, because load tries to actually load the image
	 * and causes the small-thumbnail-for-a-moment bug in the process. Needs severe refactoring.
	 */
	LIP.setupForLoad = function () {
		var hashFragment = '#mediaviewer/' + this.viewer.currentImageFilename,
			ui = this;

		this.viewer.ui = this;

		if ( !this.comingFromHashChange ) {
			$( document ).trigger( $.Event( 'mmv.hash', { hash : hashFragment } ) );
		}

		// FIXME makes no sense to do this on every image load
		this.handleEvent( 'keydown', function ( e ) { ui.keydown( e ); } );

		// mousemove generates a ton of events, which is why we throttle it
		this.handleEvent( 'mousemove.lip', $.throttle( 250, function( e ) {
			ui.mousemove( e );
		} ) );

		this.handleEvent( 'mmv-faded-out', function ( e ) { ui.fadedOut( e ); } );
		this.handleEvent( 'mmv-fade-stopped', function ( e ) { ui.fadeStopped( e ); } );
	};

	/**
	 * Exits fullscreen mode.
	 */
	LIP.exitFullscreen = function () {
		this.fullscreenButtonJustPressed = true;
		this.$main.exitFullscreen();
	};

	/**
	 * Enters fullscreen mode.
	 */
	LIP.enterFullscreen = function () {
		this.$main.enterFullscreen();
	};

	/**
	 * Setup for DOM elements which come before the main image
	 * @param {Array.<HTMLElement|jQuery>} toAdd
	 */
	LIP.setupPreDiv = function ( toAdd ) {
		var lbinterface = this;

		this.$controlBar = $( '<div>' )
			.addClass( 'mlb-controls' );

		this.$closeButton = $( '<div>' )
			.text( ' ' )
			.addClass( 'mlb-close' )
			.click( function () {
				lbinterface.unattach();
			} );

		this.$fullscreenButton = $( '<div>' )
			.text( ' ' )
			.addClass( 'mlb-fullscreen' )
			.click( function () {
				if ( lbinterface.isFullscreen ) {
					lbinterface.exitFullscreen();
				} else {
					lbinterface.enterFullscreen();
				}
			} );

		this.setupFullscreenButton();

		this.$controlBar.append(
			this.$closeButton,
			this.$fullscreenButton
		);

		this.$preDiv.append( this.$controlBar );

		this.addElementsToDiv( this.$preDiv, toAdd );
	};

	/**
	 * Sets up the fullscreen button
	 */
	LIP.setupFullscreenButton = function () {
		// If the browser doesn't support fullscreen mode, hide the fullscreen button
		if ( $.support.fullscreen ) {
			this.$fullscreenButton.show();
		} else {
			this.$fullscreenButton.hide();
		}
	};

	/**
	 * Setup for DOM elements which come before the main image
	 * @param {Array.<HTMLElement|jQuery>} toAdd
	 */
	LIP.setupPostDiv = function ( toAdd ) {
		this.addElementsToDiv( this.$postDiv, toAdd );
	};

	LIP.addElementsToDiv = function ( $div, toAdd ) {
		var i;

		for ( i = 0; i < toAdd.length; i++ ) {
			$div.append( toAdd[i] );
		}
	};

	/**
	 * Handle a fullscreen change event.
	 * @param {jQuery.Event} e The fullscreen change event.
	 */
	LIP.fullscreenChange = function ( e ) {
		this.isFullscreen = e.fullscreen;

		if ( !this.fullscreenButtonJustPressed && !e.fullscreen ) {
			// Close the interface all the way if the user pressed 'esc'
			this.unattach();
		} else if ( this.fullscreenButtonJustPressed ) {
			this.fullscreenButtonJustPressed = false;
		}

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

		if ( e.altKey || e.shiftKey || e.ctrlKey || e.metaKey ) {
			return;
		}

		e.preventDefault();

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
	 * Called when the buttons have completely faded out and disappeared
	 */
	LIP.fadedOut = function () {
		this.$main.addClass( 'cursor-hidden' );
	};

	/**
	 * Called when the buttons have stopped fading and are back into view
	 */
	LIP.fadeStopped = function () {
		this.$main.removeClass( 'cursor-hidden' );
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

	mw.mmv.LightboxInterface = LightboxInterface;
}( mediaWiki, jQuery ) );
