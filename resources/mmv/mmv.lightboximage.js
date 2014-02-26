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

( function ( mw, $ ) {

	/**
	 * Represents an image on the page.
	 * @class mw.mmv.LightboxImage
	 * @constructor
	 * @param {string} fileLink Link to the file - generally a thumb URL
	 * @param {string} filePageLink Link to the File: page
	 * @param {mw.Title} fileTitle Represents the File: page
	 * @param {number} index Which number file this is
	 * @param {HTMLImageElement} thumb The thumbnail that represents this image on the page
	 * @param {string} [caption] The caption, if any.
	 */
	function LightboxImage( fileLink, filePageLink, fileTitle, index, thumb, caption ) {
		/** @property {string} Link to the file - generally a thumb URL */
		this.src = fileLink;

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

	var LIP = LightboxImage.prototype;

	/**
	 * The URL of the image (in the size we intend use to display the it in the lightbox)
	 * @type {String}
	 * @protected
	 */
	LIP.src = null;

	/**
	 * The URL of a placeholder while the image loads. Typically a smaller version of the image, which is already
	 * loaded in the browser.
	 * @type {String}
	 * @return {jQuery.Promise.<mw.mmv.LightboxImage, HTMLImageElement>}
	 * @protected
	 */
	LIP.initialSrc = null;

	/**
	 * Loads the image.
	 * FIXME we probably don't use this.
	 * @return {jQuery.Promise.<HTMLImageElement>}
	 */
	LIP.getImageElement = function () {
		var ele,
			$deferred = $.Deferred(),
			image = this;

		ele = new Image();
		ele.addEventListener( 'error', $deferred.reject );
		ele.addEventListener( 'load', function() { $deferred.resolve( image, ele ); } );

		if ( this.src !== this.initialSrc ) {
			ele.src = this.src;
		} else {
			// Don't display the thumb, pretend that we did load the image
			// This is a workaround until we decide whether we want to display a nicer version of the thumb or not
			$deferred.resolve( image, ele );
		}

		return $deferred;
	};

	mw.mmv.LightboxImage = LightboxImage;
}( mediaWiki, jQuery ) );
