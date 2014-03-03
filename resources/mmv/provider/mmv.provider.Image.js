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
	 * Loads an image.
	 * @class mw.mmv.provider.Image
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
	 * Loads an image and returns it.
	 * Includes performance metrics.
	 * @param {string} url
	 * @return {jQuery.Promise.<HTMLImageElement>} a promise which resolves to the image object
	 */
	Image.prototype.get = function ( url ) {
		var provider = this,
			cacheKey = url,
			start,
			rawGet;

		if ( !this.cache[cacheKey] ) {
			if ( this.imagePreloadingSupported() ) {
				rawGet = $.proxy( provider.rawGet, provider, url, true );
				this.cache[cacheKey] = this.performance.record( 'image', url ).then( rawGet, rawGet );
			} else {
				start = $.now();
				this.cache[cacheKey] = this.rawGet( url );
				this.cache[cacheKey].always( function () {
					provider.performance.recordEntry( 'image', $.now() - start, url );
				} );
			}
		}

		return this.cache[cacheKey].fail( function ( error ) {
			mw.log( provider.constructor + ' provider failed to load: ', error );
		} );
	};

	/**
	 * Internal version of get(): no caching, no performance metrics.
	 * @param {string} url
	 * @param {boolean} [cors] if true, use CORS for preloading
	 * @return {jQuery.Promise.<HTMLImageElement>} a promise which resolves to the image object
	 */
	Image.prototype.rawGet = function ( url, cors ) {
		var img = new window.Image(),
			deferred = $.Deferred();

		// On Firefox this will trigger a CORS request for the image, instead of a normal one,
		// and allows using the image in a canvas etc.
		// We don't really care about that, but it seems the request will share cache with the
		// AJAX requests this way, so we can do AJAX preloading.
		// On other browsers hopefully it will have the same effect or at least won't make
		// things worse.
		// FIXME the image won't load of there is no Allowed-Origin header! we will want a
		// whitelist for this.
		if ( cors ) {
			img.crossOrigin = 'anonymous';
		}

		img.onload = function() {
			deferred.resolve( img );
		};
		img.onerror = function() {
			deferred.reject( 'could not load image from ' + url );
		};

		img.src = url;

		return deferred;
	};

	/**
	 * Checks whether the current browser supports AJAX preloading of images.
	 * This means that:
	 * - the browser supports CORS requests (large wiki farms usually host images on a
	 *   separate domain) and
	 * - either AJAX and normal image loading uses the same cache (when an image is used by a CORS
	 *   request, and then normally by setting img.src, it is only loaded once)
	 * - or (as is the case with Firefox) they are cached separately, but that can be changed by
	 *   setting the crossOrigin attribute
	 * @return {boolean}
	 */
	Image.prototype.imagePreloadingSupported = function () {
		// This checks if the browser supports CORS requests in XHRs
		return 'withCredentials' in new XMLHttpRequest();
	};

	mw.mmv.provider.Image = Image;
}( mediaWiki, jQuery ) );
