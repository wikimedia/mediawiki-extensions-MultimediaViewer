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

( function ( mw, oo, $ ) {

	/**
	 * @class mw.mmv.provider.ImageInfo
	 * Gets file information.
	 * See https://www.mediawiki.org/wiki/API:Properties#imageinfo_.2F_ii
	 * @extends mw.mmv.provider.Api
	 * @inheritdoc
	 * @param {mw.Api} api
	 */
	function ImageInfo( api ) {
		mw.mmv.provider.Api.call( this, api );
	}
	oo.inheritClass( ImageInfo, mw.mmv.provider.Api );

	/**
	 * List of imageinfo API properties which are needed to construct an Image model.
	 * @type {string[]}
	 */
	ImageInfo.prototype.iiprop = [
		'timestamp',
		'user',
		'url',
		'size',
		'mime',
		'mediatype',
		'extmetadata'
	];

	/**
	 * List of imageinfo extmetadata fields which are needed to construct an Image model.
	 * @type {string[]}
	 */
	ImageInfo.prototype.iiextmetadatafilter = [
		'DateTime',
		'DateTimeOriginal',
		'ImageDescription',
		'License',
		'Credit',
		'Artist',
		'GPSLatitude',
		'GPSLongitude'
	];

	/**
	 * @method
	 * Runs an API GET request to get the image info.
	 * @param {mw.Title} file
	 * @return {jQuery.Promise} a promise which resolves to an mw.mmv.model.Image object.
	 */
	ImageInfo.prototype.get = function( file ) {
		var provider = this,
			cacheKey = file.getPrefixedDb();

		if ( !this.cache[cacheKey] ) {
			this.cache[cacheKey] = this.api.get( {
				action: 'query',
				prop: 'imageinfo',
				titles: file.getPrefixedDb(),
				iiprop: this.iiprop,
				iiextmetadatafilter: this.iiextmetadatafilter,
				format: 'json'
			} ).then( function( data ) {
				return provider.getQueryPage( file, data );
			} ).then( function( page ) {
				if ( page.imageinfo && page.imageinfo.length ) {
					return mw.mmv.model.Image.newFromImageInfo( file, page );
				} else if ( page.missing === '' && page.imagerepository === '' ) {
					return $.Deferred().reject( 'file does not exist: ' + file.getPrefixedDb() );
				} else {
					return $.Deferred().reject( 'unknown error' );
				}
			} );
		}

		return this.cache[cacheKey];
	};

	mw.mmv.provider.ImageInfo = ImageInfo;
}( mediaWiki, OO, jQuery ) );
