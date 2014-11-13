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
		// need to remove this to avoid animating again when reopening lightbox on same page
		this.$container.removeClass( 'invite' );

		this.panelIsOpen = !!$.scrollTo().scrollTop();
	};

	/**
	 * Returns scroll top position when the panel is fully open.
	 * (In other words, the height of the area that is outside the screen, in pixels.)
	 * @return {number}
	 */
	MPSP.getScrollTopWhenOpen = function () {
		return this.$container.outerHeight() - parseInt( this.$aboveFold.css( 'min-height' ), 10 )
			- parseInt( this.$aboveFold.css( 'padding-bottom' ), 10 );
	};

	/**
	 * Makes sure the panel does not contract when it is emptied and thus keeps its position as much as possible.
	 * This should be called when switching images, before the panel is emptied, and should be undone with
	 * unfreezeHeight after the panel has been populeted with the new metadata.
	 */
	MPSP.freezeHeight = function () {
		if ( !this.$container.is( ':visible' ) ) {
			return;
		}

		var scrollTop = $.scrollTo().scrollTop(),
			scrollTopWhenOpen = this.getScrollTopWhenOpen();

		this.panelWasFullyOpen = ( scrollTop === scrollTopWhenOpen );
		this.$container.css( 'min-height', this.$container.height() );
	};

	MPSP.unfreezeHeight = function () {
		if ( !this.$container.is( ':visible' ) ) {
			return;
		}

		this.$container.css( 'min-height', '' );
		if ( this.panelWasFullyOpen ) {
			$.scrollTo( this.getScrollTopWhenOpen() );
		}
	};


	MPSP.initialize = function () {
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
			scrollTopWhenOpen = this.getScrollTopWhenOpen(),
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
	 * Receives the window's scroll events and and turns them into business logic events
	 * @fires mmv-metadata-open
	 * @fires mmv-metadata-close
	 */
	MPSP.scroll = function () {
		var panelIsOpen = $.scrollTo().scrollTop() > 0;

		this.$container.toggleClass( 'panel-open', panelIsOpen );

		if ( panelIsOpen && !this.panelIsOpen ) { // just opened
			this.$container.trigger( 'mmv-metadata-open' );
		} else if ( !panelIsOpen && this.panelIsOpen ) { // just closed
			this.$container.trigger( 'mmv-metadata-close' );
		}
		this.panelIsOpen = panelIsOpen;
	};

	mw.mmv.ui.MetadataPanelScroller = MetadataPanelScroller;
}( mediaWiki, jQuery, OO ) );
