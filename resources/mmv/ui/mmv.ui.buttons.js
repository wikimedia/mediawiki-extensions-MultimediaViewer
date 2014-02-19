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

( function ( mw, $, oo ) {
	/**
	 * Represents the buttons in the interface - next, previous, close, and fullscreen.
	 * @class mw.mmv.ui.Buttons
	 * @extends mw.mmv.ui.Element
	 * @constructor
	 */
	function Buttons( $container, $closeButton, $fullscreenButton ) {
		var buttons = this;

		mw.mmv.ui.Element.call( this, $container );

		this.$close = $closeButton;
		this.$fullscreen = $fullscreenButton;

		this.$next = $( '<div>' )
			.addClass( 'mw-mlb-next-image disabled' )
			.html( '&nbsp;' );

		this.$prev = $( '<div>' )
			.addClass( 'mw-mlb-prev-image disabled' )
			.html( '&nbsp;' );

		this.$nav = this.$next
			.add( this.$prev );

		this.$buttons = this.$close
			.add( this.$fullscreen )
			.add( this.$next )
			.add( this.$prev );

		this.$buttons.appendTo( this.$container );

		$( document ).on( 'mmv-close', function () {
			buttons.$nav.addClass( 'disabled' );
		} ).on( 'jq-fullscreen-change.lip', function ( e ) {
			if ( e.fullscreen ) {
				mw.mmv.logger.log( 'fullscreen-link-click' );
			} else {
				mw.mmv.logger.log( 'defullscreen-link-click' );
			}
		} );

		this.$close.click( function () {
			mw.mmv.logger.log( 'close-link-click' );

			$container.trigger( $.Event( 'mmv-close' ) );
		} );

		this.$fullscreen.click( function () {
			$container.trigger( $.Event( 'mmv-fullscreen' ) );
		} );

		this.$next.click( function () {
			$container.trigger( $.Event( 'mmv-next' ) );
		} );

		this.$prev.click( function () {
			$container.trigger( $.Event( 'mmv-prev' ) );
		} );
	}

	oo.inheritClass( Buttons, mw.mmv.ui.Element );

	/**
	 * Sets the top offset for the navigation buttons.
	 * @param {number} offset
	 */
	Buttons.prototype.setOffset = function ( offset ) {
		this.$nav.css( {
			top: offset
		} );
	};

	/**
	 * Stops the fading animation of the buttons and cancel any opacity value
	 */
	Buttons.prototype.stopFade = function () {
		this.$buttons
			.stop( true )
			.removeClass( 'hidden' )
			.css( 'opacity', '' );

		this.$container.trigger( $.Event( 'mmv-fade-stopped' ) );
	};

	/**
	 * Toggles buttons being disabled or not
	 * @param {boolean} showPrevButton
	 * @param {boolean} showNextButton
	 */
	Buttons.prototype.toggle = function ( showPrevButton, showNextButton ) {
		this.$next.toggleClass( 'disabled', !showPrevButton );
		this.$prev.toggleClass( 'disabled', !showNextButton );
	};

	/**
	 * Fades out the active buttons
	 */
	Buttons.prototype.fadeOut = function () {
		var buttons = this;

		// We don't use animation chaining because delay() can't be stop()ed
		this.buttonsFadeTimeout = setTimeout( function() {
			buttons.$buttons.not( '.disabled' ).animate( { opacity: 0 }, 1000, 'swing',
				function () {
					buttons.$buttons.addClass( 'hidden' );
					buttons.$container.trigger( $.Event( 'mmv-faded-out' ) );
				} );
		}, 1500 );
	};

	/**
	 * Checks if any active buttons are currently hovered, given a position
	 * @param {number} x The horizontal coordinate of the position
	 * @param {number} y The vertical coordinate of the position
	 * @return bool
	 */
	Buttons.prototype.isAnyActiveButtonHovered = function ( x, y ) {
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
	 * Reveals all active buttons and schedule a fade out if needed
	 */
	Buttons.prototype.revealAndFade = function ( mousePosition ) {
		if ( this.buttonsFadeTimeout ) {
			clearTimeout( this.buttonsFadeTimeout );
		}

		// Stop ongoing animations and make sure the buttons that need to be displayed are displayed
		this.stopFade();

		// mousePosition can be empty, for instance when we enter fullscreen and haven't
		// recorded a real mousemove event yet
		if ( !mousePosition
			|| !this.isAnyActiveButtonHovered( mousePosition.x, mousePosition.y ) ) {
			this.fadeOut();
		}
	};

	mw.mmv.ui.Buttons = Buttons;
}( mediaWiki, jQuery, OO ) );
