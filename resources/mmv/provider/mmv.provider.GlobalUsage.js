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
	 * Gets file usage information on all wikis but the local one.
	 * This needs the [GlobalUsage extension](https://www.mediawiki.org/wiki/Extension:GlobalUsage)
	 * to be installed.
	 * @class mw.mmv.provider.GlobalUsage
	 * @extends mw.mmv.provider.Api
	 * @constructor
	 * @param {mw.Api} api
	 * @param {Object} [options]
	 * @cfg {number[]} [namespaces] list of namespace ids
	 * @cfg {number} [apiLimit=100] number of entries to get from the API. If there are
	 *         more pages than this, we won't have an accurate count.
	 *         (Also, influences query performance.)
	 * @cfg {boolean} [doNotUseApi=false] If true, always returns an empty result immediately,
	 *         without doing an actual API call. Used when the GlobalUsage extension (and thus the
	 *         API) is not available.
	 * @cfg {number} [dataLimit=10] number of entries to actually put into the model.
	 * @cfg {number} [maxage] cache expiration time, in seconds
	 *  Will be used for both client-side cache (maxage) and reverse proxies (s-maxage)
	 */
	function GlobalUsage( api, options ) {
		options = $.extend( {
			doNotUseApi: false,
			apiLimit: 100,
			dataLimit: 10
		}, options );

		mw.mmv.provider.Api.call( this, api, options );
	}
	oo.inheritClass( GlobalUsage, mw.mmv.provider.Api );

	/**
	 * Fetches the global usage data from the API.
	 * @param {mw.Title} file
	 * @return {jQuery.Promise}
	 */
	GlobalUsage.prototype.get = function( file ) {
		var provider = this,
			fileUsage;

		if ( this.options.doNotUseApi ) {
			fileUsage = new mw.mmv.model.FileUsage( file, mw.mmv.model.FileUsage.Scope.GLOBAL,
				[], 0, false );
			fileUsage.fake = true;
			return $.Deferred().resolve( fileUsage );
		}

		return this.getCachedPromise( file.getPrefixedDb(), function () {
			return provider.apiGetWithMaxAge( {
				action: 'query',
				prop: 'globalusage',
				titles: file.getPrefixedDb(),
				guprop: 'url|namespace',
				gufilterlocal: 1,
				gulimit: provider.options.apiLimit
			} ).then( function( data ) {
				return provider.getQueryPage( file, data );
			} ).then( function( pageData, data ) {
				var pages;
				pages = $.map( pageData.globalusage || {}, function( item ) {
					return {
						wiki: item.wiki,
						page: new mw.Title( item.title, item.ns )
					};
				} );
				return new mw.mmv.model.FileUsage(
					file,
					mw.mmv.model.FileUsage.Scope.GLOBAL,
					pages.slice( 0, provider.options.dataLimit ),
					pages.length,
					!!( data['query-continue'] && data['query-continue'].globalusage )
				);
			} );
		} );
	};

	mw.mmv.provider.GlobalUsage = GlobalUsage;
}( mediaWiki, OO, jQuery ) );
