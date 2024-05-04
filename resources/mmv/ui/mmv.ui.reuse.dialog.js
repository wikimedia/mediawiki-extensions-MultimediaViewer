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

const Dialog = require( './mmv.ui.dialog.js' );

( function () {

	/**
	 * Represents the file reuse dialog and the link to open it.
	 */
	class ReuseDialog extends Dialog {
		/**
		 * @param {jQuery} $container the element to which the dialog will be appended
		 * @param {jQuery} $openButton the button which opens the dialog. Only used for positioning.
		 * @param {Config} config
		 */
		constructor( $container, $openButton, config ) {
			super( $container, $openButton, config );

			this.loadDependencies.push( 'mmv.ui.reuse.shareembed' );

			this.$dialog.addClass( 'mw-mmv-reuse-dialog' );

			this.eventPrefix = 'use-this-file';
		}

		/**
		 * Registers listeners.
		 */
		attach() {
			this.handleEvent( 'mmv-reuse-open', this.handleOpenCloseClick.bind( this ) );

			this.handleEvent( 'mmv-download-open', this.closeDialog.bind( this ) );
			this.handleEvent( 'mmv-options-open', this.closeDialog.bind( this ) );
		}

		/**
		 * Sets data needed by contained panes and makes dialog launch link visible.
		 *
		 * @param {Image} image
		 * @param {Repo} repo
		 * @param {string} caption
		 * @param {string} alt
		 */
		set( image, repo, caption, alt ) {
			if ( this.share && this.embed ) {
				this.share.set( image );
				this.embed.set( image, repo, caption, alt );
				this.embed.set( image, repo, caption );
				this.showImageWarnings( image );
			} else {
				this.setValues = [ image, repo, caption, alt ];
			}
		}

		/**
		 * Fired when the dialog is opened.
		 *
		 * @event ReuseDialog#mmv-reuse-opened
		 */

		/**
		 * Opens a dialog with information about file reuse.
		 */
		openDialog() {
			const { Embed, Share } = require( 'mmv.ui.reuse.shareembed' );
			if ( !this.share ) {
				this.share = new Share( this.$dialog );
				this.share.attach();
			}

			if ( !this.embed ) {
				this.embed = new Embed( this.$dialog );
				this.embed.attach();
			}

			if ( this.setValues ) {
				this.set( ...this.setValues );
				this.setValues = undefined;
			}

			super.openDialog();

			this.$warning.insertAfter( this.$container );

			$( document ).trigger( 'mmv-reuse-opened' );
		}

		/**
		 * Fired when the dialog is closed.
		 *
		 * @event ReuseDialog#mmv-reuse-closed
		 */

		/**
		 * Closes the reuse dialog.
		 */
		closeDialog() {
			super.closeDialog();

			$( document ).trigger( 'mmv-reuse-closed' );
		}
	}

	module.exports = ReuseDialog;
}() );
