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

/**
 * Represents an image on the page.
 */
class LightboxImage {
	/**
	 * @param {string} fileLink Link to the file - generally a thumb URL
	 * @param {mw.Title} fileTitle Represents the File: page
	 * @param {number} index Which number file this is
	 * @param {number} position The relative position of this image to others with same file
	 * @param {HTMLImageElement} thumb The thumbnail that represents this image on the page
	 * @param {string} [caption] The caption, if any.
	 */
	constructor( fileLink, fileTitle, index, position, thumb, caption ) {
		/**
		 * Link to the file - generally a thumb URL
		 *
		 * @type {string}
		 */
		this.src = fileLink;

		/**
		 * Title of the image's file page
		 *
		 * @type {mw.Title}
		 */
		this.filePageTitle = fileTitle;

		/**
		 * What number this image is in the array of indexed images
		 *
		 * @type {number}
		 */
		this.index = index;

		/**
		 * The relative position of this image to others with same file
		 *
		 * @type {number}
		 */
		this.position = position;

		/**
		 * The <img> element that holds the already-loaded thumbnail of the image
		 *
		 * @type {HTMLImageElement}
		 */
		this.thumbnail = thumb;

		/**
		 * The caption of the image, if any
		 *
		 * @type {string}
		 */
		this.caption = caption;

		/**
		 * The alt text of the image
		 *
		 * @type {string}
		 */
		this.alt = $( thumb ).attr( 'alt' );

		/**
		 * Width of the full-sized file (read from HTML data attribute, might be missing)
		 *
		 * @type {number}
		 */
		this.originalWidth = parseInt( $( thumb ).attr( 'data-file-width' ), 10 );

		/**
		 * Height of the full-sized file (read from HTML data attribute, might be missing)
		 *
		 * @type {number}
		 */
		this.originalHeight = parseInt( $( thumb ).attr( 'data-file-height' ), 10 );
	}

	/**
	 * Parses the handler-specific thumbnail parameter (multilingual SVG `lang`, PDF `page`,
	 * or paged TIFF `lossy`-prefixed `page`) from the sample thumbnail URL, if present.
	 *
	 * @return {{name: string, value: string, urlParam: string}|null} `name`/`value` are the
	 *  handler parameter (e.g. `lang`/`de`), `urlParam` is the width-less `iiurlparam` string
	 *  (e.g. `langde`, or `lossy-page1` for paged TIFFs).
	 */
	getUrlParam() {
		// The trailing `-<n>px` width only anchors the match; it is dropped from `urlParam`.
		// The optional leading `lossy`/`lossless` captures PagedTiffHandler's compression flag,
		// which it requires as part of its iiurlparam string (unlike plain PDF `page` params).
		const match = this.src && this.src.match( /\/(?:(lossy|lossless)-)?(lang|page)([\d\-a-z]+)-\d+px-/ );
		if ( !match ) {
			return null;
		}
		const prefix = match[ 1 ] ? match[ 1 ] + '-' : '';
		return { name: match[ 2 ], value: match[ 3 ], urlParam: prefix + match[ 2 ] + match[ 3 ] };
	}
}

module.exports = LightboxImage;
