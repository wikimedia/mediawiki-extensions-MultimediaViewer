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
	 * @class mw.mmv.dataProvider.Api
	 * @abstract
	 * @constructor
	 * @param {mw.Api} api
	 * @param {Object} [options]
	 */
	function Api( api, options ) {
		/**
		 * @property {mediaWiki.Api} api
		 */
		this.api = api;

		/**
		 * @property {Object} options
		 */
		this.options = options || {};

		/**
		 * @property {Object<String, jQuery.Promise>} cache
		 * API call cache.
		 * @protected
		 */
		this.cache = {};
	}

	/**
	 * @method
	 * Pulls an error message out of an API response.
	 * @param {Object} data
	 */
	Api.prototype.getErrorMessage = function( data ) {
		var errorCode, errorMessage;
		errorCode = data.error && data.error.code;
		errorMessage = data.error && data.error.info || 'unknown error';
		if ( errorCode ) {
			errorMessage = errorCode + ': ' + errorMessage;
		}
		return errorMessage;
	};


	/**
	 * @class mw,mmv.dataProvider.ImageUsage
	 * Gets file usage information on the local wiki.
	 * @extends mw.mmv.dataProvider.Api
	 * @inheritdoc
	 * @param {mw.Api} api
	 * @param {Object} [options]
	 * @param {Number[]} [options.namespaces] list of namespace ids
	 * @param {Number} [options.apiLimit] number of entries to get from the API. If there are
	 *         more pages than this, we won't have an accurate count.
	 *         (Also, influences query performance.)
	 * @param {Number} [options.dataLimit] number of entries to actually put into the model.
	 */
	function ImageUsage( api, options ) {
		options = $.extend( {
			namespaces: [0, 100], // article, portal
			apiLimit: 100,
			dataLimit: 10
		}, options );

		Api.call( this, api, options );
	}
	oo.inheritClass( ImageUsage, Api );

	/**
	 * @method
	 * Runs an API GET request to get the image usage.
	 * @param {mw.Title} file
	 * @return {jQuery.Promise}
	 */
	ImageUsage.prototype.get = function( file ) {
		var dataProvider = this,
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
				var pages;
				if ( data && data.query && data.query.imageusage ) {
					pages = $.map( data.query.imageusage, function( item ) {
						return {
							wiki: null,
							page: new mw.Title( item.title, item.ns )
						};
					} );
					return new mw.mmv.model.FileUsage(
						file,
						mw.mmv.model.FileUsage.Scope.LOCAL,
						pages.slice( 0, dataProvider.options.dataLimit ),
						pages.length,
						!!( data['query-continue'] && data['query-continue'].imageusage )
					);
				} else {
					return $.Deferred().reject( dataProvider.getErrorMessage( data ) );
				}
			} );
		}

		return this.cache[cacheKey];
	};


	/**
	 * @class mw,mmv.dataProvider.GlobalUsage
	 * Gets file usage information on all wikis but the local one.
	 * This needs the GlobalUsage extension to be installed.
	 * @see <https://www.mediawiki.org/wiki/Extension:GlobalUsage>
	 * @extends mw.mmv.dataProvider.Api
	 * @inheritdoc
	 * @param {mw.Api} api
	 * @param {Object} [options]
	 * @param {Number[]} [options.namespaces] list of namespace ids
	 * @param {Number} [options.apiLimit] number of entries to get from the API. If there are
	 *         more pages than this, we won't have an accurate count.
	 *         (Also, influences query performance.)
	 * @param {Number} [options.dataLimit] number of entries to actually put into the model.
	 */
	function GlobalUsage( api, options ) {
		options = $.extend( {
			apiLimit: 100,
			dataLimit: 10
		}, options );

		Api.call( this, api, options );
	}
	oo.inheritClass( GlobalUsage, Api );

	/**
	 * @method
	 * Fetches the global usage data from the API.
	 * @param {mw.Title} file
	 * @return {jQuery.Promise}
	 */
	GlobalUsage.prototype.get = function( file ) {
		var dataProvider = this,
			cacheKey = file.getPrefixedDb();

		if ( !this.cache[cacheKey] ) {
			this.cache[cacheKey] = this.api.get( {
				action: 'query',
				prop: 'globalusage',
				titles: file.getPrefixedDb(),
				guprop: ['url', 'namespace'],
				gufilterlocal: 1,
				gulimit: this.options.apiLimit,
				format: 'json'
			} ).then( function( data ) {
				var pages;
				if ( data && data.query && data.query.pages ) {
					// pages is an associative array indexed by pageid, turn it into proper array
					pages = $.map( data.query.pages, function ( v ) { return v; } );
					// the API returns a result for non-existent files as well so pages[0] will always exist
					pages = $.map( pages[0].globalusage, function( item ) {
						return {
							wiki: item.wiki,
							page: new mw.Title( item.title, item.ns )
						};
					} );
					return new mw.mmv.model.FileUsage(
						file,
						mw.mmv.model.FileUsage.Scope.GLOBAL,
						pages.slice( 0, dataProvider.options.dataLimit ),
						pages.length,
						!!( data['query-continue'] && data['query-continue'].globalusage )
					);
				} else {
					return $.Deferred().reject( dataProvider.getErrorMessage( data ) );
				}
			} );
		}

		return this.cache[cacheKey];
	};

	mw.mmv.dataProvider = {};
	mw.mmv.dataProvider.Api = Api;
	mw.mmv.dataProvider.ImageUsage = ImageUsage;
	mw.mmv.dataProvider.GlobalUsage = GlobalUsage;
}( mediaWiki, OO, jQuery ) );
