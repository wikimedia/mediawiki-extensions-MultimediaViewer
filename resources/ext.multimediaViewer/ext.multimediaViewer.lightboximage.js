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

( function ( mw, $, oo, MLBImage ) {
	/**
	 * @class mw.LightboxImage
	 * @extends mlb.LightboxImage
	 * Represents an image on the page.
	 * @constructor
	 * @param {string} fileLink Link to the file - generally a thumb URL
	 * @param {string} filePageLink Link to the File: page
	 * @param {mw.Title} fileTitle Represents the File: page
	 * @param {number} index Which number file this is
	 * @param {HTMLImageElement} thumb The thumbnail that represents this image on the page
	 * @param {string} [caption] The caption, if any.
	 */
	function LightboxImage( fileLink, filePageLink, fileTitle, index, thumb, caption ) {
		MLBImage.call( this, fileLink );

		/** @property {string} filePageLink URL to the image's file page */
		this.filePageLink = filePageLink;

		/** @property {mw.Title} filePageTitle Title of the image's file page */
		this.filePageTitle = fileTitle;

		/** @property {number} index What number this image is in the array of indexed images */
		this.index = index;

		/** @property {HTMLImageElement} thumbnail The <img> element that holds the already-loaded thumbnail of the image*/
		this.thumbnail = thumb;

		/** @property {string} caption The caption of the image, if any */
		this.caption = caption;
	}

	oo.inheritClass( LightboxImage, MLBImage );

	mw.LightboxImage = LightboxImage;
}( mediaWiki, jQuery, OO, window.LightboxImage ) );
