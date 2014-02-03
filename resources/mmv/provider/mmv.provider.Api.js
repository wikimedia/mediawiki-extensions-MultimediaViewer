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

( function ( mw ) {

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

	mw.mmv.provider = {};
	mw.mmv.provider.Api = Api;
}( mediaWiki ) );
