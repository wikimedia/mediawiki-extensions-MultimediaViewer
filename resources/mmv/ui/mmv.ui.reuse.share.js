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
	var SP;

	/**
	 * Represents the file reuse dialog and link to open it.
	 * @class mw.mmv.ui.reuse.Share
	 * @extends mw.mmv.ui.reuse.Tab
	 * @param {jQuery} $container
	 */
	function Share( $container ) {
		Share.super.call( this, $container );

		this.init();
	}
	oo.inheritClass( Share, mw.mmv.ui.reuse.Tab );
	SP = Share.prototype;

	SP.init = function () {
		this.$pane.addClass( 'mw-mmv-share-pane active' )
			.appendTo( this.$container );

		this.pageInput = new oo.ui.TextInputWidget( {
			classes: [ 'mw-mmv-share-page' ],
			readOnly: true
		} );

		this.pageInput.$element.find( 'input' )
			.prop( 'placeholder', mw.message( 'multimediaviewer-reuse-loading-placeholder' ).text() );

		this.$pageLink = $( '<a>' )
			.addClass( 'mw-mmv-share-page-link' )
			.prop( 'alt', mw.message( 'multimediaviewer-link-to-page' ).text() )
			.prop( 'target', '_blank' )
			.html( '&nbsp;' )
			.appendTo( this.$pane );

		this.pageInput.$element.appendTo( this.$pane );

		this.$explanation = $( '<div>' )
			.addClass( 'mw-mmv-shareembed-explanation' )
			.text( mw.message( 'multimediaviewer-share-explanation' ).text() )
			.appendTo( this.$pane );

		this.$pane.appendTo( this.$container );
	};

	/**
	 * Shows the pane.
	 */
	SP.show = function () {
		this.constructor.super.prototype.show.call( this );
		this.select();
	};

	/**
	 * @inheritdoc
	 * @param {mw.mmv.model.Image} image
	 */
	SP.set = function ( image ) {
		// FIXME this should be handled by mmv.js to be DRY
		var url = image.descriptionUrl + '#mediaviewer/' + image.title.getMainText();
		this.pageInput.setValue( url );

		this.select();

		this.$pageLink.prop( 'href', url );
	};

	/**
	 * @inheritdoc
	 */
	SP.empty = function () {
		this.pageInput.setValue( '' );
		this.$pageLink.prop( 'href', null );
	};

	/**
	 * @inheritdoc
	 */
	SP.attach = function() {
		var $input = this.pageInput.$element.find( 'input' );

		this.pageInput.onDOMEvent( 'focus', $.proxy( this.selectAllOnEvent, $input ) );
		// Disable partial text selection inside the textbox
		this.pageInput.onDOMEvent( 'mousedown click', $.proxy( this.onlyFocus, $input ) );
	};

	/**
	 * @inheritdoc
	 */
	SP.unattach = function() {
		this.constructor.super.prototype.unattach.call( this );

		this.pageInput.offDOMEvent( 'focus mousedown click' );
	};

	/**
	 * Selects the text in the readonly textbox by triggering a focus event.
	 */
	SP.select = function () {
		this.pageInput.$element.focus();
	};


	mw.mmv.ui.reuse.Share = Share;
}( mediaWiki, jQuery, OO ) );
