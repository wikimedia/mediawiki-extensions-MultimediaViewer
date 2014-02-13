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
	 * @class mw.mmv.provider.Image
	 * Loads an image.
	 */
	function Image() {
		/**
		 * @property {mw.mmv.Performance}
		 * @private
		 */
		this.performance = new mw.mmv.Performance();

		/**
		 * AJAX call cache.
		 * @property {Object.<string, jQuery.Promise>} cache
		 * @protected
		 */
		this.cache = {};
	}

	/**
	 * @method
	 * Loads an image and returns it.
	 * @param {string} url
	 * @return {jQuery.Promise.<HTMLImageElement>} a promise which resolves to the image object
	 */
	Image.prototype.get = function ( url ) {
		var deferred, start,
			img = new window.Image(),
			cacheKey = url,
			provider = this;

		if ( !this.cache[cacheKey] ) {
			deferred = $.Deferred();
			this.cache[cacheKey] = deferred.promise();

			img.onload = function() {
				// Start is only defined for old browsers
				if ( start !== undefined ) {
					provider.performance.recordEntry( 'image', $.now() - start );
				}
				deferred.resolve( img );
			};

			img.onerror = function() {
				deferred.reject( 'could not load image from ' + url );
			};

			// We can only measure detailed image performance on browsers that are capable of
			// reading the XHR binary results as data URI. Otherwise loading the image as XHR
			// and then assigning the same URL to an image's src attribute
			// would cause a double request (won't hit browser cache).
			if ( this.browserSupportsBinaryOperations() ) {
				this.performance.record( 'image', url, 'arraybuffer' ).then( function( response ) {
					img.src = provider.binaryToDataURI( response );
				} );
			} else {
				// On old browsers we just do oldschool timing without details
				start = $.now();
				img.src = url;
			}
		}

		return this.cache[cacheKey];
	};

	/**
	 * @method
	 * Converts a binary image into a data URI
	 * @param {string} binary Binary image
	 * @returns {string} base64-encoded data URI representing the image
	 */
	Image.prototype.binaryToDataURI = function ( binary ) {
		var i,
			bytes = new Uint8Array( binary ),
			raw = '';

		for ( i = 0; i < bytes.length; i++ ) {
			raw += String.fromCharCode( bytes[ i ] );
		}

		// I've tested this on Firefox, Chrome, IE10, IE11, Safari, Opera
		// and for all of them we can get away with not giving the proper mime type
		// If we run into a browser where that's a problem, we'll need
		// to read the binary contents to determine the mime type
		return 'data:image;base64,' + btoa( raw );
	};

	/**
	 * @method
	 * Checks if the browser is capable of converting binary content to a data URI
	 * @returns {boolean}
	 */
	Image.prototype.browserSupportsBinaryOperations = function () {
		return window.btoa !== undefined &&
			window.Uint8Array !== undefined &&
			String.fromCharCode !== undefined;
	};

	mw.mmv.provider.Image = Image;
}( mediaWiki, jQuery ) );
