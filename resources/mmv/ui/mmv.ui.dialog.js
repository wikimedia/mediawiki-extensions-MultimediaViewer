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
	// Shortcut for prototype later
	var DP;

	/**
	 * Represents a dialog and the link to open it.
	 * @class mw.mmv.ui.Dialog
	 * @extends mw.mmv.ui.Element
	 * @param {jQuery} $container the element to which the dialog will be appended
	 * @param {jQuery} $openButton the button which opens the dialog. Only used for positioning.
	 * @param {mw.mmv.Config} config
	 */
	function Dialog( $container, $openButton, config ) {
		mw.mmv.ui.Element.call( this, $container );

		/** @property {mw.mmv.Config} config - */
		this.config = config;

		this.$openButton = $openButton;

		this.$dialog = $( '<div>' )
			.addClass( 'mw-mmv-dialog' );

		this.$downArrow = $( '<div>' )
			.addClass( 'mw-mmv-dialog-down-arrow' )
			.appendTo( this.$dialog );

		this.$dialog.appendTo( this.$container );

		/** @property {boolean} Whether or not the dialog is open. */
		this.isOpen = false;

		/**
		 * @property {string[]} loadDependencies Dependencies to load before showing the dialog.
		 */
		this.loadDependencies = [];

		/**
		 * @property {string} eventPrefix Prefix specific to the class to be applied to events.
		 */
		this.eventPrefix = '';
	}

	oo.inheritClass( Dialog, mw.mmv.ui.Element );
	DP = Dialog.prototype;

	/**
	 * Handles click on link that opens/closes the dialog.
	 */
	 DP.handleOpenCloseClick = function () {
		var dialog = this;

		mw.loader.using( this.loadDependencies, function () {
			dialog.dependenciesLoaded = true;
			dialog.toggleDialog();
		}, function (error) {
			if ( window.console && window.console.error ) {
				window.console.error( 'mw.loader.using error when trying to load dialog dependencies', error );
			}
		} );

		return false;
	 };

	 /**
	  * Toggles the open state on the dialog.
	  */
	 DP.toggleDialog = function () {
		if ( this.isOpen ) {
			this.closeDialog();
		} else {
			this.openDialog();
		}
	 };

	/**
	 * Opens a dialog.
	 */
	DP.openDialog = function () {
		mw.mmv.actionLogger.log( this.eventPrefix + '-open' );

		this.startListeningToOutsideClick();
		this.$dialog.show();
		this.fixDownArrowPosition();
		this.isOpen = true;
		this.$openButton.addClass( 'mw-mmv-dialog-open' );
	};

	/**
	 * Closes a dialog.
	 */
	DP.closeDialog = function () {
		if ( this.isOpen ) {
			mw.mmv.actionLogger.log( this.eventPrefix + '-close' );
		}

		this.stopListeningToOutsideClick();
		this.$dialog.hide();
		this.isOpen = false;
		this.$openButton.removeClass( 'mw-mmv-dialog-open' );
	};

	/**
	 * Sets up the event handler which closes the dialog when the user clicks outside.
	 */
	DP.startListeningToOutsideClick = function () {
		var dialog = this;

		this.outsideClickHandler = this.outsideClickHandler || function ( e ) {
			var $clickTarget = $( e.target );

			// Don't close the dialog if the click inside a dialog or on an navigation arrow
			if ( $clickTarget.closest( dialog.$dialog ).length
			|| $clickTarget.closest( '.mw-mmv-next-image' ).length
			|| $clickTarget.closest( '.mw-mmv-prev-image' ).length ) {
				return;
			}

			dialog.closeDialog();
			return false;
		};
		$( document ).on( 'click.mmv.' + this.eventPrefix, this.outsideClickHandler );
	};

	/**
	 * Removes the event handler set up by startListeningToOutsideClick().
	 */
	DP.stopListeningToOutsideClick = function () {
		$( document ).off( 'click.mmv.' + this.eventPrefix, this.outsideClickHandler );
	};

	/**
	 * Fixes the tip of the container to point to the icon which opens it.
	 */
	DP.fixDownArrowPosition = function() {
		var buttonPosition,
			arrowPositionBase,
			buttonWidth,
			arrowWidth,
			offset;

		buttonPosition = this.$openButton.offset().left;
		arrowPositionBase = this.$downArrow.offsetParent().offset().left;
		buttonWidth = this.$openButton.outerWidth();
		arrowWidth = this.$downArrow.outerWidth();

		// this is the correct position of the arrow relative to the viewport - we want
		// the middle of the arrow to be positioned over the middle of the button
		offset = buttonPosition + ( buttonWidth - arrowWidth ) / 2;

		this.$downArrow.css( 'left', ( offset - arrowPositionBase ) + 'px' );
	};

	/**
	 * Clears listeners.
	 */
	DP.unattach = function () {
		mw.mmv.ui.Element.prototype.unattach.call( this );

		this.stopListeningToOutsideClick();
	};

	/**
	 * @inheritdoc
	 */
	DP.empty = function () {
		this.closeDialog();
	};

	mw.mmv.ui.Dialog = Dialog;
}( mediaWiki, jQuery, OO ) );
