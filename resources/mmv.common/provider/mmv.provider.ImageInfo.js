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
	 * @return {Promise<ImageModel>}
	 * @throws {Error}
	 */
	async get( file, iiurlparam ) {
		// Keep the plain title as the cache key when no handler parameter is set, so
		// invalidate() (which is keyed by title alone) keeps working for the common case.
		const cacheKey = iiurlparam ?
			[ file.getPrefixedDb(), iiurlparam ].join() :
			file.getPrefixedDb();

		let promise = this.cache[ cacheKey ];
		if ( !promise ) {
			promise = this.cache[ cacheKey ] = this.api.get( {
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
			} );
			promise.catch( ( error ) => {
				mw.log.warn( 'mmv.provider.ImageInfo failed to load: ', error );
			} );
		}

		const data = await promise;
		if ( !data ||
			!data.query ||
			!Array.isArray( data.query.pages ) ||
			data.query.pages.length !== 1
		) {
			// If we got to this point either the pages array is missing completely, or the
			// first element is not the requested page. Neither is supposed to happen
			// (if the page simply did not exist, there would still be a record for it).
			throw new Error( this.getErrorMessage( data ) );
		}
		const page = data.query.pages[ 0 ];
		if ( page.imageinfo && page.imageinfo.length ) {
			return new ImageModel( file, page, this.language );
		} else if ( page.missing === true && page.imagerepository === '' ) {
			throw new Error( `file does not exist: ${ file.getPrefixedDb() }` );
		} else {
			throw new Error( 'unknown error' );
		}
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
}

module.exports = ImageInfo;
