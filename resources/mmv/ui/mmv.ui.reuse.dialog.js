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
	 * @param {jQuery} $openButton the button which opens the dialog. Only used for positioning.
	 */
	function Dialog( $container, $openButton ) {
		mw.mmv.ui.Element.call( this, $container );

		this.$openButton = $openButton;

		this.$reuseDialog = $( '<div>' )
			.addClass( 'mw-mmv-reuse-dialog' );

		this.$downArrow = $( '<div>' )
			.addClass( 'mw-mmv-reuse-down-arrow' )
			.appendTo( this.$reuseDialog );

		this.$reuseDialog.appendTo( this.$container );

		/** @property {boolean} Whether or not the dialog is open. */
		this.isOpen = false;

		/**
		 * @property {Object.<string, mw.mmv.ui.Element>} List of tab ui objects.
		 */
		this.tabs = null;
	}
	oo.inheritClass( Dialog, mw.mmv.ui.Element );
	DP = Dialog.prototype;

	// FIXME this should happen outside the dialog and the tabs, but we need to improve
	DP.initTabs = function () {
		var shareTab, embedTab, downloadTab;

		this.reuseTabs = new oo.ui.MenuWidget( {
			classes: [ 'mw-mmv-reuse-tabs' ]
		} );

		// MenuWidget has a nasty tendency to hide itself, maybe we're not using it right?
		this.reuseTabs.hide = $.noop;
		this.reuseTabs.$element.show().appendTo( this.$reuseDialog );

		this.tabs = {
			share: new mw.mmv.ui.reuse.Share( this.$reuseDialog ),
			download: new mw.mmv.ui.reuse.Download( this.$reuseDialog ),
			embed: new mw.mmv.ui.reuse.Embed( this.$reuseDialog ),
		};

		shareTab = new oo.ui.MenuItemWidget(
			'share', { label: mw.message( 'multimediaviewer-share-tab' ).text() } );
		downloadTab = new oo.ui.MenuItemWidget(
			'download', { label: mw.message( 'multimediaviewer-download-tab' ).text() } );
		embedTab = new oo.ui.MenuItemWidget(
			'embed', { label: mw.message( 'multimediaviewer-embed-tab' ).text() } );

		this.reuseTabs.addItems( [
			shareTab,
			downloadTab,
			embedTab
		] );

		// Default to 'share' tab
		this.selectedTab = 'share';
		this.reuseTabs.selectItem( shareTab );

		if ( this.dependenciesNeedToBeAttached ) {
			this.attachDependencies();
		}

		if ( this.tabsSetValues ) {
			// This is a delayed set() for the elements we've just created on demand
			this.tabs.share.set.apply( this.tabs.share, this.tabsSetValues.share );
			this.tabs.download.set.apply( this.tabs.download, this.tabsSetValues.download );
			this.tabs.embed.set.apply( this.tabs.embed, this.tabsSetValues.embed );
			this.tabsSetValues = undefined;
		}
	};

	/**
	 * Handles click on link that opens/closes the dialog.
	 */
	 DP.handleOpenCloseClick = function () {
		var dialog = this,
			$deferred = $.Deferred();

		mw.mmv.actionLogger.log( 'use-this-file-open' );

		if ( this.tabs === null ) {
			// initTabs() needs to have these dependencies loaded in order to run
			mw.loader.using( [ 'mmv.ui.reuse.share', 'mmv.ui.reuse.embed', 'mmv.ui.reuse.download' ], function () {
				dialog.initTabs();
				$deferred.resolve();
			}, function (error) {
				$deferred.reject( error );
				if ( window.console && window.console.error ) {
					window.console.error( 'mw.loader.using error when trying to load reuse dependencies', error );
				}
			} );
		} else {
			$deferred.resolve();
		}

		$deferred.then( function() {
			if ( dialog.isOpen ) {
				dialog.closeDialog();
			} else {
				dialog.openDialog();
			}
		} );

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
	DP.attach = function () {
		var dialog = this;

		this.handleEvent( 'mmv-reuse-open', $.proxy( dialog.handleOpenCloseClick, dialog ) );

		this.attachDependencies();
	};

	/**
	 * Registrers listeners for dependencies loaded on demand
	 */
	DP.attachDependencies = function () {
		var tab, dialog = this;

		if ( this.reuseTabs && this.tabs ) {
			// This is a delayed attach() for the elements we've just created on demand
			this.reuseTabs.on( 'select', $.proxy( dialog.handleTabSelection, dialog ) );

			for ( tab in this.tabs ) {
				this.tabs[tab].attach();
			}

			this.dependenciesNeedToBeAttached = false;
		} else {
			this.dependenciesNeedToBeAttached = true;
		}
	};

	/**
	 * Clears listeners.
	 */
	DP.unattach = function () {
		var tab;

		this.constructor['super'].prototype.unattach.call( this );

		this.stopListeningToOutsideClick();

		if ( this.reuseTabs ) {
			this.reuseTabs.off( 'select' );
		}

		if ( this.tabs ) {
			for ( tab in this.tabs ) {
				this.tabs[tab].unattach();
			}
		}
	};


	/**
	 * Sets data needed by contaned tabs and makes dialog launch link visible.
	 * @param {mw.mmv.model.Image} image
	 * @param {mw.mmv.model.Repo} repo
	 * @param {string} caption
	 */
	DP.set = function ( image, repo, caption) {
		if ( this.tabs !== null ) {
			this.tabs.share.set( image );
			this.tabs.download.set( image );
			this.tabs.embed.set( image, repo, caption );
		} else {
			this.tabsSetValues = {
				share : [ image ],
				download : [ image ],
				embed : [ image, repo, caption ]
			};
		}
	};

	/**
	 * @inheritdoc
	 */
	DP.empty = function () {
		this.closeDialog();

		for ( var tab in this.tabs ) {
			this.tabs[tab].empty();
		}
	};

	/**
	 * @event mmv-reuse-opened
	 * Fired when the dialog is opened.
	 */
	/**
	 * Opens a dialog with information about file reuse.
	 */
	DP.openDialog = function () {
		this.startListeningToOutsideClick();
		this.$reuseDialog.show();
		this.fixDownArrowPosition();
		$( document ).trigger( 'mmv-reuse-opened' );
		this.isOpen = true;
		this.tabs[this.selectedTab].show();
	};

	/**
	 * @event mmv-reuse-closed
	 * Fired when the dialog is closed.
	 */
	/**
	 * Closes the reuse dialog.
	 */
	DP.closeDialog = function () {
		this.stopListeningToOutsideClick();
		this.$reuseDialog.hide();
		$( document ).trigger( 'mmv-reuse-closed' );
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

	mw.mmv.ui.reuse.Dialog = Dialog;
}( mediaWiki, jQuery, OO ) );
