/*
 * This file is part of the MediaWiki extension MediaViewer.
 *
 * MediaViewer is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * MediaViewer is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with MediaViewer.  If not, see <http://www.gnu.org/licenses/>.
 */

( function ( mw, $ ) {
	/**
	 * This provider is use to get annotation image (from ImageAnnotator extensions)
	 *
	 * @class mw.mmv.provider.AnnotationThumbnail
	 * @constructor
	 */
	function AnnotationThumbnail() {}

	/**
	 * File extensions which are vector types (as opposed to bitmap).
	 * Thumbnails of vector types can be larger than the original file.
	 * @property {Object.<string, number>}
	 */
	AnnotationThumbnail.prototype.vectorExtensions = {
		svg: 1
	};

	/**
	 * File extensions which can be displayed in the browser.
	 * Other file types need to be thumbnailed even if the size of the original file would be right.
	 * @property {Object.<string, number>}
	 */
	AnnotationThumbnail.prototype.displayableExtensions = {
		png: 1,
		jpg: 1,
		jpeg: 1,
		gif: 1
	};

	/**
	 * Try to guess the thumbnailinfo for a thumbnail without doing an API request.
	 * An existing thumbnail URL is required.
	 *
	 * There is no guarantee this function will be successful - in some cases, it is impossible
	 * to guess how the URL would look. If that's the case, the promise just rejects.
	 *
	 * @param {mw.Title} file
	 * @param {string} sampleUrl a thumbnail URL for the same file (but with different size).
	 * @param {number} width thumbnail width in pixels
	 * @param {number} originalWidth width of original image in pixels
	 * @param {number} originalHeight height of original image in pixels
	 * @return {jQuery.Promise.<mw.mmv.model.Thumbnail>}
	 */
	AnnotationThumbnail.prototype.get = function ( file, sampleUrl, width, originalWidth, originalHeight ) {
		var url = this.getUrl( file, sampleUrl, width, originalWidth );
		if ( url ) {
			return $.Deferred().resolve( new mw.mmv.model.Thumbnail(
				url,
				originalWidth,
				originalHeight
			) );
		} else {
			return $.Deferred().reject( 'Could not get thumbnail URL' );
		}
	};

	/**
	 * Try to guess the URL of a thumbnail without doing an API request.
	 * See #get().
	 *
	 * @param {mw.Title} file
	 * @param {string} sampleUrl a thumbnail URL for the same file (but with different size)
	 * @param {number} width thumbnail width in pixels
	 * @param {number} originalWidth width of original image in pixels
	 * @return {string|undefined} a thumbnail URL or nothing
	 */
	AnnotationThumbnail.prototype.getUrl = function ( file, sampleUrl, width, originalWidth ) {
		return sampleUrl;
	};


	mw.mmv.provider.AnnotationThumbnail = AnnotationThumbnail;
}( mediaWiki, jQuery ) );
