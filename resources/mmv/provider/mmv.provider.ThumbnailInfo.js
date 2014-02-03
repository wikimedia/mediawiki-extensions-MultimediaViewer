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
	 * @class mw.mmv.provider.ThumbnailInfo
	 * Gets thumbnail information.
	 * See https://www.mediawiki.org/wiki/API:Properties#imageinfo_.2F_ii
	 * @extends mw.mmv.provider.Api
	 * @inheritdoc
	 * @param {mw.Api} api
	 */
	function ThumbnailInfo( api ) {
		mw.mmv.provider.Api.call( this, api );
	}
	oo.inheritClass( ThumbnailInfo, mw.mmv.provider.Api );

	/**
	 * @method
	 * Runs an API GET request to get the thumbnail info.
	 * @param {mw.Title} file
	 * @param {number} width thumbnail width
	 * @return {jQuery.Promise.<string, number>} a promise which resolves to the thumbnail URL and
	 *     the actual width of the thumbnail (which might be smaller than the requested width,
	 *     in case the size we requested was larger than the full image size).
	 */
	ThumbnailInfo.prototype.get = function( file, width ) {
		var provider = this,
			cacheKey = file.getPrefixedDb() + '|' + width;

		if ( !this.cache[cacheKey] ) {
			this.cache[cacheKey] = this.api.get( {
				action: 'query',
				prop: 'imageinfo',
				titles: file.getPrefixedDb(),
				iiprop: 'url',
				iiurlwidth: width,
				format: 'json'
			} ).then( function( data ) {
				return provider.getQueryPage( file, data );
			} ).then( function( page ) {
				if ( page.imageinfo && page.imageinfo[0] ) {
					return $.Deferred().resolve( page.imageinfo[0].thumburl, page.imageinfo[0].thumbwidth );
				} else if ( page.missing === '' && page.imagerepository === '' ) {
					return $.Deferred().reject( 'file does not exist: ' + file.getPrefixedDb() );
				} else {
					return $.Deferred().reject( 'unknown error' );
				}
			} );
		}

		return this.cache[cacheKey];
	};

	mw.mmv.provider.ThumbnailInfo = ThumbnailInfo;
}( mediaWiki, OO, jQuery ) );
