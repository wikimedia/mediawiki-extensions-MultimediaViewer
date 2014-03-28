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
	 * Represents the file reuse dialog and the link to open it.
	 * @class mw.mmv.ui.reuse.Dialog
	 * @extends mw.mmv.ui.Element
	 * @param {jQuery} $container the element to which the dialog will be appended
	 * @param {jQuery} $linkContainer the element to which the link to open the dialog will be appended
	 */
	function Dialog( $container, $linkContainer ) {
		mw.mmv.ui.Element.call( this, $container );

		this.$reuseLink = $( '<span>' )
			.addClass( 'mw-mlb-reuse-link empty' )
			.text( mw.message( 'multimediaviewer-reuse-link' ).text() );

		this.$reuseLink.appendTo( $linkContainer );

		this.$reuseDialog = $( '<div>' )
			.addClass( 'mw-mlb-reuse-dialog' );

		this.reuseTabs = new oo.ui.MenuWidget( {
			classes: [ 'mw-mlb-reuse-tabs' ]
		} );
		// MenuWidget has a nasty tendency to hide itself, maybe we're not using it right?
		this.reuseTabs.hide = $.noop;
		this.reuseTabs.$element.show().appendTo( this.$reuseDialog );

		this.$downArrow = $( '<div>' )
			.addClass( 'mw-mlb-reuse-down-arrow' )
			.appendTo( this.$reuseDialog );

		this.$reuseDialog.appendTo( this.$container );

		/** @property {boolean} Whether or not the dialog is open. */
		this.isOpen = false;

		/**
		 * @property {Object.<string, mw.mmv.ui.Element>} List of tab ui objects.
		 */
		this.tabs = null;

		this.initTabs();
	}

	oo.inheritClass( Dialog, mw.mmv.ui.Element );

	DP = Dialog.prototype;

	// FIXME this should happen outside the dialog and the tabs, but we need to improve
	DP.initTabs = function () {
		var shareTab, embedTab;

		this.tabs = {
			share: new mw.mmv.ui.reuse.Share( this.$reuseDialog ),
			embed: new mw.mmv.ui.reuse.Embed( this.$reuseDialog )
		};

		shareTab = new oo.ui.MenuItemWidget(
			'share', { label: mw.message( 'multimediaviewer-share-tab' ).text() } );
		embedTab = new oo.ui.MenuItemWidget(
			'embed', { label: mw.message( 'multimediaviewer-embed-tab' ).text() } );

		this.reuseTabs.addItems( [
			shareTab,
			embedTab
		] );

		// Default to 'share' tab
		this.selectedTab = 'share';
		this.reuseTabs.selectItem( shareTab );
	};

	/**
	 * Handles click on link that opens/closes the dialog.
	 */
	 DP.handleOpenCloseClick = function() {
		mw.mmv.logger.log( 'use-this-file-link-click' );

		if ( this.isOpen ) {
			this.closeDialog();
		} else {
			this.openDialog();
		}

		return false;
	 };

	/**
	 * Handles tab selection.
	 */
	 DP.handleTabSelection = function ( option ) {
		var tab;

		this.selectedTab = option.getData();

		for ( tab in this.tabs ) {
			if ( tab === this.selectedTab ) {
				this.tabs[tab].show();
			} else {
				this.tabs[tab].hide();
			}
		}
	 };

	/**
	 * Registers listeners.
	 */
	DP.attach = function() {
		var dialog = this,
			tab;

		this.$reuseLink.on( 'click', $.proxy( dialog.handleOpenCloseClick, dialog ) );
		this.reuseTabs.on( 'select', $.proxy( dialog.handleTabSelection, dialog ) );

		for ( tab in this.tabs ) {
			this.tabs[tab].attach();
		}
	};

	/**
	 * Clears listeners.
	 */
	DP.unattach = function() {
		var tab;

		this.constructor.super.prototype.unattach.call( this );

		this.stopListeningToOutsideClick();
		this.$reuseLink.off( 'click' );
		this.reuseTabs.off( 'select' );

		for ( tab in this.tabs ) {
			this.tabs[tab].unattach();
		}
	};


	/**
	 * Sets data needed by contaned tabs and makes dialog launch link visible.
	 * @param {mw.mmv.model.Image} image
	 * @param {mw.mmv.model.Repo} repo
	 * @param {string} caption
	 */
	DP.set = function ( image, repo, caption) {
		this.tabs.share.set( image );
		this.tabs.embed.set( image, repo, caption );
		this.$reuseLink.removeClass( 'empty' );
	};

	/**
	 * @inheritdoc
	 */
	DP.empty = function () {
		this.closeDialog();

		for ( var tab in this.tabs ) {
			this.tabs[tab].empty();
		}

		this.$reuseLink.addClass( 'empty' );
	};

	/**
	 * Opens a dialog with information about file reuse.
	 */
	DP.openDialog = function () {
		this.startListeningToOutsideClick();
		this.$reuseDialog.show();
		this.$reuseLink.addClass( 'open' );
		this.isOpen = true;
		this.tabs[this.selectedTab].show();
	};

	/**
	 * Closes the reuse dialog.
	 */
	DP.closeDialog = function () {
		this.stopListeningToOutsideClick();
		this.$reuseDialog.hide();
		this.$reuseLink.removeClass( 'open' );
		this.isOpen = false;
	};

	/**
	 * Sets up the event handler which closes the dialog when the user clicks outside.
	 */
	DP.startListeningToOutsideClick = function () {
		var dialog = this;

		this.outsideClickHandler = this.outsideClickHandler || function ( e ) {
			var $clickTarget = $( e.target );

			if ( $clickTarget.closest( dialog.$reuseDialog ).length ) {
				return;
			}

			dialog.closeDialog();
			return false;
		};
		$( document ).on( 'click.mmv', this.outsideClickHandler );
	};

	/**
	 * Removes the event handler set up by startListeningToOutsideClick().
	 */
	DP.stopListeningToOutsideClick = function () {
		$( document ).off( 'click.mmv', this.outsideClickHandler );
	};

	mw.mmv.ui.reuse.Dialog = Dialog;
}( mediaWiki, jQuery, OO ) );
