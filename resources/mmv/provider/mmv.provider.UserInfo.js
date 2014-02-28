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

( function ( mw, oo ) {

	/**
	 * Gets user information (currently just the gender).
	 * See https://www.mediawiki.org/wiki/API:Users
	 * @class mw.mmv.provider.UserInfo
	 * @extends mw.mmv.provider.Api
	 * @constructor
	 * @param {mw.Api} api
	 */
	function UserInfo( api ) {
		mw.mmv.provider.Api.call( this, api );
	}
	oo.inheritClass( UserInfo, mw.mmv.provider.Api );

	/**
	 * @method
	 * Runs an API GET request to get the user info.
	 * @param {string} username
	 * @param {mw.mmv.model.Repo} repoInfo
	 * @return {jQuery.Promise.<mw.mmv.model.User>} user
	 */
	UserInfo.prototype.get = function( username, repoInfo ) {
		var provider = this,
			ajaxOptions = {},
			cacheKey = username;

		// For local/shared db images the user should be visible via a local API request,
		// maybe. (In practice we have Wikimedia users who haven't completed the SUL
		// merge process yet, and other sites might even use a shared DB for images
		// without CentralAuth. Too bad for them.)
		// For InstantCommons images we need to get user data directly from the repo's API.
		if ( repoInfo.apiUrl ) {
			ajaxOptions.url = repoInfo.apiUrl;
			ajaxOptions.dataType = 'jsonp';
			cacheKey = cacheKey + '|' + repoInfo.apiUrl; // local and remote user names could conflict
		}

		if ( !this.cache[cacheKey] ) {
			this.cache[cacheKey] = this.api.get( {
				action: 'query',
				list: 'users',
				ususers: username,
				usprop: 'gender'
			}, ajaxOptions ).then( function( data ) {
				return provider.getQueryField( 'users', data );
			} ).then( function( users ) {
				if ( users[0] && users[0].name && users[0].gender ) {
					return new mw.mmv.model.User( users[0].name, users[0].gender );
				} else {
					mw.log( 'user info not found for ' + username + ' at ' + repoInfo.name);
					return new mw.mmv.model.User( username, mw.mmv.model.User.Gender.UNKNOWN );
				}
			} );
		}

		return this.cache[cacheKey];
	};

	mw.mmv.provider.UserInfo = UserInfo;
}( mediaWiki, OO ) );
