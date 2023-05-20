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

const Api = require( './mmv.provider.Api.js' );
const ImageModel = require( '../model/mmv.model.Image.js' );

( function () {

	/**
	 * Gets file information.
	 *
	 * See https://www.mediawiki.org/wiki/API:Properties#imageinfo_.2F_ii
	 *
	 * @class ImageInfo
	 * @extends Api
	 * @constructor
	 * @param {mw.Api} api
	 * @param {Object} [options]
	 * @cfg {string} [language=null] image metadata language
	 * @cfg {number} [maxage] cache expiration time, in seconds
	 *  Will be used for both client-side cache (maxage) and reverse proxies (s-maxage)
	 */
	function ImageInfo( api, options ) {
		options = $.extend( {
			language: null
		}, options );

		Api.call( this, api, options );
	}
	OO.inheritClass( ImageInfo, Api );

	/**
	 * Array of imageinfo API properties which are needed to construct an Image model.
	 *
	 * @property {string[]}
	 */
	ImageInfo.prototype.iiprop = [
		'timestamp',
		'url',
		'size',
		'mime',
		'mediatype',
		'extmetadata'
	];

	/**
	 * Array of imageinfo extmetadata fields which are needed to construct an Image model.
	 *
	 * @property {string[]}
	 */
	ImageInfo.prototype.iiextmetadatafilter = [
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

	/**
	 * Runs an API GET request to get the image info.
	 *
	 * @param {mw.Title} file
	 * @return {jQuery.Promise} a promise which resolves to an Image object.
	 */
	ImageInfo.prototype.get = function ( file ) {
		var provider = this;

		return this.getCachedPromise( file.getPrefixedDb(), function () {
			return provider.apiGetWithMaxAge( {
				formatversion: 2,
				action: 'query',
				prop: 'imageinfo',
				titles: file.getPrefixedDb(),
				iiprop: provider.iiprop,
				iiextmetadatafilter: provider.iiextmetadatafilter,
				iiextmetadatalanguage: provider.options.language,
				uselang: 'content'
			} ).then( function ( data ) {
				return provider.getQueryPage( data );
			} ).then( function ( page ) {
				if ( page.imageinfo && page.imageinfo.length ) {
					return ImageModel.newFromImageInfo( file, page );
				} else if ( page.missing === true && page.imagerepository === '' ) {
					return $.Deferred().reject( 'file does not exist: ' + file.getPrefixedDb() );
				} else {
					return $.Deferred().reject( 'unknown error' );
				}
			} );
		} );
	};

	module.exports = ImageInfo;
}() );
