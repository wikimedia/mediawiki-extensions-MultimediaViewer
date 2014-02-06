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
	 * @class mw.mmv.provider.Api
	 * Base class for API-based data providers.
	 * @abstract
	 * @constructor
	 * @param {mw.Api} api
	 * @param {Object} [options]
	 */
	function Api( api, options ) {
		/**
		 * API object for dependency injection.
		 * @property {mw.Api}
		 */
		this.api = api;

		/**
		 * Options object; the exact format and meaning is unspecified and could be different
		 * from subclass to subclass.
		 * @property {Object}
		 */
		this.options = options || {};

		/**
		 * API call cache.
		 * @property {Object.<string, jQuery.Promise>} cache
		 * @protected
		 */
		this.cache = {};

		/**
		 * @property {mw.mmv.performance}
		 * @private
		 */
		this.performance = new mw.mmv.performance();
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
	 * @method
	 * Returns a fixed a title based on the API response.
	 * The title of the returned file might be different from the requested title, e.g.
	 * if we used a namespace alias. If that happens the old and new title will be set in
	 * data.query.normalized; this method creates an updated title based on that.
	 * @param {mw.Title} title
	 * @param {Object} data
	 * @return {mw.Title}
	 */
	Api.prototype.getNormalizedTitle = function( title, data ) {
		if ( data && data.query && data.query.normalized ) {
			for ( var normalized = data.query.normalized, length = normalized.length, i = 0; i < length; i++ ) {
				if ( normalized[i].from === title.getPrefixedText() ) {
					title = new mw.Title( normalized[i].to );
					break;
				}
			}
		}
		return title;
	};

	/**
	 * @method
	 * Returns a promise with the specified field from the API result.
	 * This is intended to be used as a .then() callback for action=query APIs.
	 * @param {string} field
	 * @param {Object} data
	 * @return {jQuery.Promise} when successful, the first argument will be the field data,
	 *     when unsuccessful, it will be an error message. The second argument is always
	 *     the full API response.
	 */
	Api.prototype.getQueryField = function( field, data ) {
		if ( data && data.query && data.query[field] ) {
			return $.Deferred().resolve( data.query[field], data );
		} else {
			return $.Deferred().reject( this.getErrorMessage( data ), data );
		}
	};

	/**
	 * @method
	 * Returns a promise with the specified page from the API result.
	 * This is intended to be used as a .then() callback for action=query&prop=(...) APIs.
	 * @param {mw.Title} title
	 * @param {Object} data
	 * @return {jQuery.Promise} when successful, the first argument will be the page data,
	 *     when unsuccessful, it will be an error message. The second argument is always
	 *     the full API response.
	 */
	Api.prototype.getQueryPage = function( title, data ) {
		var pageName, pageData = null;
		if ( data && data.query && data.query.pages ) {
			title = this.getNormalizedTitle( title, data );
			pageName = title.getPrefixedText();

			// pages is an associative array indexed by pageid,
			// we need to iterate through to find the right page
			$.each( data.query.pages, function ( id, page ) {
				if ( page.title === pageName ) {
					pageData = page;
					return false;
				}
			} );

			if ( pageData ) {
				return $.Deferred().resolve( pageData, data );
			}
		}

		// If we got to this point either the pages array is missing completely, or we iterated
		// through it and the requested page was not found. Neither is supposed to happen
		// (if the page simply did not exist, there would still be a record for it).
		return $.Deferred().reject( this.getErrorMessage( data ), data );
	};

	mw.mmv.provider = {};
	mw.mmv.provider.Api = Api;
}( mediaWiki, jQuery ) );
