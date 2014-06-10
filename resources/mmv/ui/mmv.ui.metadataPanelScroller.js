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
	 */
	function MetadataPanelScroller( $container, $controlBar, localStorage ) {
		mw.mmv.ui.Element.call( this, $container );

		this.$controlBar = $controlBar;

		/** @property {Object} localStorage the window.localStorage object */
		this.localStorage = localStorage;

		/**
		 * Whether we've already fired an animation for the metadata div in this lightbox session.
		 * @property {boolean}
		 * @private
		 */
		this.hasAnimatedMetadata = undefined;

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

		// reset animation flag when the viewer is reopened
		this.hasAnimatedMetadata = !this.localStorage || this.localStorage.getItem( 'mmv.hasOpenedMetadata' );
	};

	MPSP.unattach = function() {
		this.clearEvents();
		$.scrollTo().off( 'scroll.mmvp' );
	};

	MPSP.empty = function () {
		this.$dragIcon.removeClass( 'pointing-down' );

		// need to remove this to avoid animating again when reopening lightbox on same page
		this.$container.removeClass( 'invite' );
	};

	MPSP.initialize = function () {
		var panel = this;

		this.$dragBar = $( '<div>' )
			.addClass( 'mw-mmv-drag-affordance' )
			.appendTo( this.$controlBar )
			.click( function () {
				panel.toggle();
			} );

		this.$dragIcon = $( '<div>' )
			.addClass( 'mw-mmv-drag-icon' )
			.appendTo( this.$dragBar );
	};

	/**
	 * Animates the metadata area when the viewer is first opened.
	 */
	MPSP.animateMetadataOnce = function () {
		if ( !this.hasAnimatedMetadata ) {
			this.hasAnimatedMetadata = true;
			this.$container.addClass( 'invite' );
		}
	};

	/**
	 * Toggles the metadata div being totally visible.
	 */
	MPSP.toggle = function ( forceDirection ) {
		var scrollTopWhenOpen = this.$container.outerHeight() - this.$controlBar.outerHeight(),
			scrollTopWhenClosed = 0,
			scrollTop = $.scrollTo().scrollTop(),
			panelIsOpen = scrollTop > scrollTopWhenClosed,
			scrollTopTarget = panelIsOpen ? scrollTopWhenClosed : scrollTopWhenOpen;

		if ( forceDirection ) {
			scrollTopTarget = forceDirection === 'down' ? scrollTopWhenClosed : scrollTopWhenOpen;
		}

		mw.mmv.actionLogger.log( scrollTopTarget === scrollTopWhenOpen ? 'metadata-open' : 'metadata-close' );

		$.scrollTo( scrollTopTarget, this.toggleScrollDuration );
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
		var scrolled = !!$.scrollTo().scrollTop();

		this.$dragIcon.toggleClass( 'pointing-down', scrolled );

		if (
			!this.savedHasOpenedMetadata &&
				scrolled &&
				this.localStorage
			) {
			try {
				this.localStorage.setItem( 'mmv.hasOpenedMetadata', true );
			} catch ( e ) {
				// localStorage is full or disabled
			}

			// We mark it as saved even when localStorage failed, because retrying will very likely fail as well
			this.savedHasOpenedMetadata = true;
		}
	};

	mw.mmv.ui.MetadataPanelScroller = MetadataPanelScroller;
}( mediaWiki, jQuery, OO ) );
