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
	var MPSP;

	/**
	 * @class mw.mmv.ui.MetadataPanelScroller
	 * @extends mw.mmv.ui.Element
	 * Handles scrolling behavior of the metadata panel.
	 * @constructor
	 * @param {jQuery} $container The container for the panel (.mw-mmv-post-image).
	 * @param {jQuery} $aboveFold The control bar element (.mw-mmv-above-fold).
	 * @param {Object} localStorage the localStorage object, for dependency injection
	 */
	function MetadataPanelScroller( $container, $aboveFold, localStorage ) {
		mw.mmv.ui.Element.call( this, $container );

		this.$aboveFold = $aboveFold;

		/** @property {Object} localStorage the window.localStorage object */
		this.localStorage = localStorage;

		/** @property {boolean} panelIsOpen state flag which will be used to detect open <-> closed transitions */
		this.panelIsOpen = null;

		/**
		 * Whether this user has ever opened the metadata panel.
		 * Based on a localstorage flag; will be set to true if the client does not support localstorage.
		 * @type {boolean}
		 */
		this.hasOpenedMetadata = undefined;

		/**
		 * Whether we've already fired an animation for the metadata div in this lightbox session.
		 * @property {boolean}
		 * @private
		 */
		this.hasAnimatedMetadata = false;

		this.initialize();
	}
	oo.inheritClass( MetadataPanelScroller, mw.mmv.ui.Element );
	MPSP = MetadataPanelScroller.prototype;

	MPSP.toggleScrollDuration = 400;

	MPSP.attach = function() {
		var panel = this;

		this.handleEvent( 'keydown', function ( e ) {
			panel.keydown( e );
		} );

		$.scrollTo().on( 'scroll.mmvp', $.throttle( 250, function() {
			panel.scroll();
		} ) );

		this.$container.on( 'mmv-metadata-open', function () {
			if ( !panel.hasOpenedMetadata && panel.localStorage ) {
				panel.hasOpenedMetadata = true;
				panel.$dragIcon.removeClass( 'panel-never-opened' );
				try {
					panel.localStorage.setItem( 'mmv.hasOpenedMetadata', true );
				} catch ( e ) {
					// localStorage is full or disabled
				}
			}
		} );

		// reset animation flag when the viewer is reopened
		this.hasAnimatedMetadata = false;
	};

	MPSP.unattach = function() {
		this.clearEvents();
		$.scrollTo().off( 'scroll.mmvp' );
		this.$container.off( 'mmv-metadata-open' );
	};

	MPSP.empty = function () {
		this.$dragIcon.toggleClass( 'panel-never-opened', !this.hasOpenedMetadata );

		// need to remove this to avoid animating again when reopening lightbox on same page
		this.$container.removeClass( 'invite' );

		this.panelIsOpen = !!$.scrollTo().scrollTop();
	};

	MPSP.initialize = function () {
		var panel = this;

		this.$dragIcon = $( '<div>' )
			.addClass( 'mw-mmv-drag-icon mw-mmv-drag-icon-pointing-down' )
			.toggleClass( 'panel-never-opened', !this.hasOpenedMetadata )
			.prop( 'title', mw.message( 'multimediaviewer-panel-open-popup-text' ).text() )
			.tipsy( { gravity: 's', delayIn: mw.config.get( 'wgMultimediaViewer').tooltipDelay } )
			.appendTo( this.$aboveFold )
			.click( function () {
				// Trigger open event and do related actions that would be normally done by the scroll handler.
				// If we left this to the scroll handler, the size of the panel would change mid-animation
				// and the end position would be off.
				panel.panelIsOpen = true;
				panel.$dragIcon.addClass( 'panel-open' );
				// use triggerHandler instead of trigger because it is non-async; the untruncate handler
				// must run before the toggle() call
				panel.$container.triggerHandler( 'mmv-metadata-open' );

				panel.toggle( 'up' );
			} );

		this.$dragIconBottom = $( '<div>' )
			.addClass( 'mw-mmv-drag-icon mw-mmv-drag-icon-pointing-up' )
			.prop( 'title', mw.message( 'multimediaviewer-panel-close-popup-text' ).text() )
			.tipsy( { gravity: 's', delayIn: mw.config.get( 'wgMultimediaViewer').tooltipDelay } )
			.appendTo( this.$container )
			.click( function () {
				panel.toggle( 'down' );
			} );

		this.hasOpenedMetadata = !this.localStorage || this.localStorage.getItem( 'mmv.hasOpenedMetadata' );
	};

	/**
	 * Animates the metadata area when the viewer is first opened.
	 */
	MPSP.animateMetadataOnce = function () {
		if ( !this.hasOpenedMetadata && !this.hasAnimatedMetadata ) {
			this.hasAnimatedMetadata = true;
			this.$container.addClass( 'invite' );
		}
	};

	/**
	 * Toggles the metadata div being totally visible.
	 * @param {string} [forceDirection] 'up' or 'down' makes the panel move on that direction (and is a noop
	 *  if the panel is already at the upmost/bottommost position); without the parameter, the panel position
	 *  is toggled. (Partially open counts as open.)
	 * @return {jQuery.Deferred} a deferred which resolves after the animation has finished.
	 */
	MPSP.toggle = function ( forceDirection ) {
		var deferred = $.Deferred(),
			scrollTopWhenOpen = this.$container.outerHeight() - parseInt( this.$aboveFold.css( 'min-height' ), 10 ),
			scrollTopWhenClosed = 0,
			scrollTop = $.scrollTo().scrollTop(),
			panelIsOpen = scrollTop > scrollTopWhenClosed,
			scrollTopTarget = panelIsOpen ? scrollTopWhenClosed : scrollTopWhenOpen,
			isOpening = scrollTopTarget === scrollTopWhenOpen;

		if ( forceDirection ) {
			scrollTopTarget = forceDirection === 'down' ? scrollTopWhenClosed : scrollTopWhenOpen;
		}

		// don't log / animate if the panel is already in the end position
		if ( scrollTopTarget === scrollTop ) {
			deferred.resolve();
		} else {
			mw.mmv.actionLogger.log( isOpening ? 'metadata-open' : 'metadata-close' );
			$.scrollTo( scrollTopTarget, this.toggleScrollDuration, {
				onAfter: function () {
					deferred.resolve();
				}
			} );
		}
		return deferred;
	};

	/**
	 * Makes sure that the given element (which must be a descendant of the metadata panel) is
	 * in view. If it isn't, scrolls the panel smoothly to reveal it.
	 * @param {HTMLElement|jQuery|string} target
	 * @param {number} [duration] animation length
	 * @param {Object} [settings] see jQuery.scrollTo
	 */
	MPSP.scrollIntoView = function( target, duration, settings ) {
		var $target = $( target ),
			targetHeight = $target.height(),
			targetTop = $target.offset().top,
			targetBottom = targetTop + targetHeight,
			viewportHeight = $( window ).height(),
			viewportTop = $.scrollTo().scrollTop(),
			viewportBottom = viewportTop + viewportHeight;

		// we omit here a bunch of cases which are logically possible but unlikely given the size
		// of the panel, and only care about the one which will actually happen
		if ( targetHeight <= viewportHeight ) { // target fits into screen
			if (targetBottom > viewportBottom ) {
				$.scrollTo( viewportTop + ( targetBottom - viewportBottom ), duration, settings );
			}
		}
	};

	/**
	 * Handles keydown events for this element.
	 */
	MPSP.keydown = function ( e ) {
		switch ( e.which ) {
			case 40: // Down arrow
				// fall through
			case 38: // Up arrow
				this.toggle();
				e.preventDefault();
				break;
		}
	};

	/**
	 * Receives the window's scroll events and flips the chevron if necessary.
	 */
	MPSP.scroll = function () {
		var panelIsOpen = !!$.scrollTo().scrollTop();

		this.$dragIcon.toggleClass( 'panel-open', panelIsOpen );

		if ( panelIsOpen && !this.panelIsOpen ) { // just opened (this is skipped in some cases, see the $dragIcon click handler)
			this.$container.trigger( 'mmv-metadata-open' );
		} else if ( !panelIsOpen && this.panelIsOpen ) { // just closed
			this.$container.trigger( 'mmv-metadata-close' );
		}
		this.panelIsOpen = panelIsOpen;
	};

	mw.mmv.ui.MetadataPanelScroller = MetadataPanelScroller;
}( mediaWiki, jQuery, OO ) );
