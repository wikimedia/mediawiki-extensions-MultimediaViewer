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
const { Repo } = require( '../model/mmv.model.Repo.js' );

( function () {

	/**
	 * Gets file repo information.
	 *
	 * @class FileRepoInfo
	 * @extends Api
	 * @constructor
	 * @param {mw.Api} api
	 * @param {Object} [options]
	 * @cfg {number} [maxage] cache expiration time, in seconds
	 *  Will be used for both client-side cache (maxage) and reverse proxies (s-maxage)
	 */
	function FileRepoInfo( api, options ) {
		Api.call( this, api, options );
	}
	OO.inheritClass( FileRepoInfo, Api );

	/**
	 * Runs an API GET request to get the repo info.
	 *
	 * @return {jQuery.Promise.<Object.<string, Repo>>} a promise which resolves to
	 *     a hash of Repo objects, indexed by repo names.
	 */
	FileRepoInfo.prototype.get = function () {
		var provider = this;

		return this.getCachedPromise( '*', function () {
			return provider.apiGetWithMaxAge( {
				formatversion: 2,
				action: 'query',
				meta: 'filerepoinfo',
				uselang: 'content'
			} ).then( function ( data ) {
				return provider.getQueryField( 'repos', data );
			} ).then( function ( reposArray ) {
				var reposHash = {};
				reposArray.forEach( function ( repo ) {
					reposHash[ repo.name ] = Repo.newFromRepoInfo( repo );
				} );
				return reposHash;
			} );
		} );
	};

	module.exports = FileRepoInfo;
}() );
