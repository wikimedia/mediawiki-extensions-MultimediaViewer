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
	 * @class mw.mmv.provider.ImageUsage
	 * Gets file usage information on the local wiki.
	 * @extends mw.mmv.provider.Api
	 * @inheritdoc
	 * @param {mw.Api} api
	 * @param {Object} [options]
	 * @param {number[]} [options.namespaces] list of namespace ids
	 * @param {number} [options.apiLimit] number of entries to get from the API. If there are
	 *         more pages than this, we won't have an accurate count.
	 *         (Also, influences query performance.)
	 * @param {number} [options.dataLimit] number of entries to actually put into the model.
	 */
	function ImageUsage( api, options ) {
		options = $.extend( {
			namespaces: [0, 100], // article, portal
			apiLimit: 100,
			dataLimit: 10
		}, options );

		mw.mmv.provider.Api.call( this, api, options );
	}
	oo.inheritClass( ImageUsage, mw.mmv.provider.Api );

	/**
	 * @method
	 * Runs an API GET request to get the image usage.
	 * @param {mw.Title} file
	 * @return {jQuery.Promise}
	 */
	ImageUsage.prototype.get = function( file ) {
		var provider = this,
			cacheKey = file.getPrefixedDb();

		if ( !this.cache[cacheKey] ) {
			this.cache[cacheKey] = this.api.get( {
				action: 'query',
				list: 'imageusage',
				iutitle: file.getPrefixedDb(),
				iunamespace: this.options.namespaces,
				iulimit: this.options.apiLimit,
				format: 'json'
			} ).then( function( data ) {
				return provider.getQueryField( 'imageusage', data );
			} ).then( function( imageusage, data ) {
				var pages;
				pages = $.map( imageusage, function( item ) {
					return {
						wiki: null,
						page: new mw.Title( item.title, item.ns )
					};
				} );
				return new mw.mmv.model.FileUsage(
					file,
					mw.mmv.model.FileUsage.Scope.LOCAL,
					pages.slice( 0, provider.options.dataLimit ),
					pages.length,
					!!( data['query-continue'] && data['query-continue'].imageusage )
				);
			} );
		}

		return this.cache[cacheKey];
	};

	mw.mmv.provider.ImageUsage = ImageUsage;
}( mediaWiki, OO, jQuery ) );
