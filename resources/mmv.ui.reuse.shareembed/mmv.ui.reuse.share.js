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

const { getMediaHash } = require( 'mmv.head' );
const { Utils } = require( 'mmv.ui.ondemandshareddependencies' );
const { UiElement } = require( 'mmv' );

/**
 * Represents the file reuse dialog and link to open it.
 */
class Share extends UiElement {
	/**
	 * @param {jQuery} $container
	 */
	constructor( $container ) {
		super( $container );

		Utils.createHeader( mw.message( 'multimediaviewer-share-tab' ).text() )
			.appendTo( $container );

		const $body = $( '<div>' )
			.addClass( 'cdx-dialog__body mw-mmv-pt-0' )
			.appendTo( $container );

		[ this.$pageInput, this.$pageInputDiv ] = Utils.createInputWithCopy(
			mw.message( 'multimediaviewer-reuse-copy-share' ).text(),
			mw.message( 'multimediaviewer-reuse-loading-placeholder' ).text()
		);
		this.$pageInput.attr( 'title', mw.message( 'multimediaviewer-share-explanation' ).text() );
		this.$pageInputDiv.appendTo( $body );
	}

	/**
	 * Shows the pane.
	 */
	show() {
		super.show();
	}

	/**
	 * @inheritdoc
	 * @param {Image} image
	 */
	set( image ) {
		const url = image.descriptionUrl + getMediaHash( image.title );
		this.$pageInput.val( url );
	}

	/**
	 * @inheritdoc
	 */
	empty() {
		this.$pageInput.val( '' );
	}
}

module.exports = Share;
