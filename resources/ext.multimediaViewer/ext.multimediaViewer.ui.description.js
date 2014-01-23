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
	 * @class mw.mmv.ui.Description
	 * @extends mw.mmv.ui.Element
	 * @inheritdoc
	 * @constructor
	 * @inheritdoc
	 */
	function Description( $container ) {
		mw.mmv.ui.Element.call( this, $container );

		this.$imageDescDiv = $( '<div>' )
			.addClass( 'mw-mlb-image-desc-div empty' )
			.appendTo( this.$container );

		this.$imageDesc = $( '<p>' )
			.addClass( 'mw-mlb-image-desc' )
			.appendTo( this.$imageDescDiv );

		this.$imageCaption = $( '<p>' )
			.addClass( 'mw-mlb-description-backup empty' )
			.appendTo( this.$imageDescDiv );
	}

	oo.inheritClass( Description, mw.mmv.ui.Element );

	/**
	 * @method
	 * @inheritdoc
	 * @param {string} text The text of the description
	 * @param {string} [caption] The text of the caption
	 */
	Description.prototype.set = function ( text, caption ) {
		this.$imageDescDiv.toggleClass( 'empty', !text && !caption );
		this.$imageCaption.toggleClass( 'empty', !caption );
		this.$imageDesc.toggleClass( 'empty', !text );

		if ( caption ) {
			this.whitelistHtml( this.$imageCaption.empty().append( $.parseHTML( caption ) ) );
		}

		if ( text ) {
			this.whitelistHtml( this.$imageDesc.empty().append( $.parseHTML( text ) ) );
		} else {
			this.$imageDesc.empty().append( mw.message( 'multimediaviewer-desc-nil' ).text() );
		}
	};

	/**
	 * @method
	 * @inheritdoc
	 */
	Description.prototype.empty = function () {
		this.$imageDesc.empty();
		this.$imageDescDiv.addClass( 'empty' );
		this.$imageCaption.empty().addClass( 'empty' );
	};

	mw.mmv.ui.Description = Description;
}( mediaWiki, jQuery, OO ) );
