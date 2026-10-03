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

const ImageModel = require( '../model/mmv.model.Image.js' );

// HTTP cache expiration in seconds (5 minutes)
// Will be used for MW API requests for both CDN cache and browser cache
const API_MAXAGE = 300;

/**
 * Gets file information.
 *
 * See https://www.mediawiki.org/wiki/API:Properties#imageinfo_.2F_ii
 */
class ImageInfo {
	/**
	 * @param {mw.Api} api
	 * @param {Object} options
	 * @param {string} options.language image metadata language
	 */
	constructor( api, options ) {
		this.api = api;
		this.language = options.language;
		/**
		 * API call cache.
		 *
		 * @type {Object.<string, jQuery.Promise>}
		 * @protected
		 */
		this.cache = {};
	}

	/**
	 * Array of imageinfo API properties which are needed to construct an Image model.
	 *
	 * @return {string[]}
	 */
	get iiprop() {
		return [
			'timestamp',
			'url',
			'thumburls',
			'size',
			'extmetadata'
		];
	}

	/**
	 * Array of imageinfo extmetadata fields which are needed to construct an Image model.
	 *
	 * @return {string[]}
	 */
	get iiextmetadatafilter() {
		return [
			'DateTime',
			'DateTimeOriginal',
			'ObjectName',
			'ImageDescription',
			'License',
			'LicenseShortName',
			'UsageTerms',
			'LicenseUrl',
			'Credit',
			'Artist',
			'AuthorCount',
			'GPSLatitude',
			'GPSLongitude',
			'Permission',
			'Attribution',
			'AttributionRequired',
			'NonFree',
			'Restrictions',
			'DeletionReason'
		];
	}

	/**
	 * Runs an API GET request to get the image info.
	 *
	 * @param {mw.Title} file
	 * @param {string} [iiurlparam] handler-specific parameter string (e.g. `langde-800px`
	 *  for a multilingual SVG or `page2-800px` for a PDF page). When set, the returned
	 *  thumbnail URLs ({@link ImageModel#thumburls}) are rendered as the same variant.
	 * @return {jQuery.Promise} a promise which resolves to an Image object.
	 */
	get( file, iiurlparam ) {
		// Keep the plain title as the cache key when no handler parameter is set, so
		// invalidate() (which is keyed by title alone) keeps working for the common case.
		const cacheKey = iiurlparam ?
			[ file.getPrefixedDb(), iiurlparam ].join() :
			file.getPrefixedDb();
		return this.getCachedPromise( cacheKey, () => this.api.get( {
			formatversion: 2,
			action: 'query',
			prop: 'imageinfo',
			titles: file.getPrefixedDb(),
			iiprop: this.iiprop,
			iiurlparam,
			iiextmetadatafilter: this.iiextmetadatafilter,
			iiextmetadatalanguage: this.language,
			uselang: 'content',
			maxage: API_MAXAGE,
			smaxage: API_MAXAGE
		} ).then( ( data ) => this.getQueryPage( data ) ).then( ( page ) => {
			if ( page.imageinfo && page.imageinfo.length ) {
				return new ImageModel( file, page, this.language );
			} else if ( page.missing === true && page.imagerepository === '' ) {
				return $.Deferred().reject( `file does not exist: ${ file.getPrefixedDb() }` );
			} else {
				return $.Deferred().reject( 'unknown error' );
			}
		} ) );
	}

	/**
	 * Evict the entry of a given file from the cache.
	 *
	 * @param {mw.Title} file
	 */
	invalidate( file ) {
		delete this.cache[ file.getPrefixedDb() ];
	}

	/**
	 * Wraps a caching layer around a function returning a promise; if getCachedPromise has been
	 * called with the same key already, it will return the previous result.
	 *
	 * Since it is the promise and not the API response that gets cached, this method can ensure
	 * that there are no race conditions and multiple calls to the same resource: even if the
	 * request is still in progress, separate calls (with the same key) to getCachedPromise will
	 * share on the same promise object.
	 * The promise is cached even if it is rejected, so if the API request fails, all later calls
	 * to getCachedPromise will fail immediately without retrying the request.
	 *
	 * @param {string} key cache key
	 * @param {function(): jQuery.Promise} getPromise a function to get the promise on cache miss
	 * @return {jQuery.Promise}
	 */
	getCachedPromise( key, getPromise ) {
		if ( !this.cache[ key ] ) {
			this.cache[ key ] = getPromise();
			this.cache[ key ].catch( ( error ) => {
				mw.log( 'ImageInfo provider failed to load: ', error );
			} );
		}
		return this.cache[ key ];
	}

	/**
	 * Pulls an error message out of an API response.
	 *
	 * @param {Object} data
	 * @param {Object} data.error
	 * @param {string} data.error.code
	 * @param {string} data.error.info
	 * @return {string} From data.error.code + ': ' + data.error.info, or 'unknown error'
	 */
	getErrorMessage( data ) {
		const errorCode = data.error && data.error.code;
		let errorMessage = data.error && data.error.info || 'unknown error';
		if ( errorCode ) {
			errorMessage = `${ errorCode }: ${ errorMessage }`;
		}
		return errorMessage;
	}

	/**
	 * Returns a promise with the specified page from the API result.
	 * This is intended to be used as a .then() callback for action=query&prop=(...) APIs.
	 *
	 * @param {Object} data
	 * @return {jQuery.Promise} when successful, the first argument will be the page data,
	 *     when unsuccessful, it will be an error message. The second argument is always
	 *     the full API response.
	 */
	getQueryPage( data ) {
		if ( data &&
			data.query &&
			Array.isArray( data.query.pages ) &&
			data.query.pages.length === 1
		) {
			// pages is an array and the first element is always the requested title
			return $.Deferred().resolve( data.query.pages[ 0 ], data );
		}

		// If we got to this point either the pages array is missing completely, or the
		// first element is not the requested page. Neither is supposed to happen
		// (if the page simply did not exist, there would still be a record for it).
		return $.Deferred().reject( this.getErrorMessage( data ), data );
	}
}

module.exports = ImageInfo;
