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

( function ( mw, $, oo ) {

	/**
	 * Gets user information (currently just the gender).
	 * See https://www.mediawiki.org/wiki/API:Users
	 * @class mw.mmv.provider.UserInfo
	 * @extends mw.mmv.provider.Api
	 * @constructor
	 * @param {mw.Api} api
	 * @param {Object} [options]
	 * @cfg {boolean} [useApi=true] If false, always returns an empty result immediately,
	 *         without doing an actual API call. Used when the current language does not have genders.
	 * @cfg {number} [maxage] cache expiration time, in seconds
	 *  Will be used for both client-side cache (maxage) and reverse proxies (s-maxage)
	 */
	function UserInfo( api, options ) {
		options = $.extend( { useApi: true }, options );

		mw.mmv.provider.Api.call( this, api, options );
	}
	oo.inheritClass( UserInfo, mw.mmv.provider.Api );

	/**
	 * Runs an API GET request to get the user info.
	 * @param {string} username
	 * @param {mw.mmv.model.Repo} repoInfo
	 * @return {jQuery.Promise.<mw.mmv.model.User>} user
	 */
	UserInfo.prototype.get = function ( username, repoInfo ) {
		var user,
			provider = this,
			ajaxOptions = {},
			cacheKey = username;

		if ( !this.options.useApi ) {
			// Create a user object with unknown gender without doing an API request.
			// This is used when the language does not use genders, so it would be a waste of time.
			// (This might maybe result in incorrect text if the message does not have a translation
			// and the fallback language does have genders, but that's an extremely rare edge case
			// we can just ignore.)
			user = new mw.mmv.model.User( username, mw.mmv.model.User.Gender.UNKNOWN );
			user.fake = true;
			return $.Deferred().resolve( user );
		}

		// For local/shared db images the user should be visible via a local API request,
		// maybe. (In practice we have Wikimedia users who haven't completed the SUL
		// merge process yet, and other sites might even use a shared DB for images
		// without CentralAuth. Too bad for them.)
		// For InstantCommons images we need to get user data directly from the repo's API.
		if ( repoInfo.apiUrl ) {
			ajaxOptions.url = repoInfo.apiUrl;
			ajaxOptions.dataType = 'jsonp';
			ajaxOptions.cache = true; // do not append `_=<timestamp>` to the URL
			ajaxOptions.jsonpCallback = this.getCallbackName( username );
			cacheKey = cacheKey + '|' + repoInfo.apiUrl; // local and remote user names could conflict
		}

		return this.getCachedPromise( cacheKey, function () {
			return provider.apiGetWithMaxAge( {
				action: 'query',
				list: 'users',
				ususers: username,
				usprop: 'gender'
			}, ajaxOptions ).then( function ( data ) {
				return provider.getQueryField( 'users', data );
			} ).then( function ( users ) {
				if ( users[0] && users[0].name && users[0].gender ) {
					return new mw.mmv.model.User( users[0].name, users[0].gender );
				} else {
					mw.log( 'user info not found for ' + username + ' at ' + repoInfo.name );
					return new mw.mmv.model.User( username, mw.mmv.model.User.Gender.UNKNOWN );
				}
			} );
		} );
	};

	/**,
	 * Generate JSONP callback function name.
	 * jQuery uses a random string by default, which would break caching.
	 * On the other hand the callback needs to be unique to avoid surprises when multiple
	 * requests run in parallel. And of course needs to be a valid JS variable name.
	 * @param username
	 */
	UserInfo.prototype.getCallbackName = function ( username ) {
		// Javascript variable name charset rules are fairly lax but better safe then sorry,
		// so let's encode every non-alphanumeric character.
		// Per http://stackoverflow.com/questions/1809153/maximum-length-of-variable-name-in-javascript
		// length should not be an issue (might add a few hundred bytes to the request & response size
		// for very long usernames, but we can live with that).
		return 'mmv_userinfo_' + mw.util.rawurlencode( username )// encodes all characters except -.~_
			.replace( /-/g, '%2D' ).replace( /\./g, '%2E' ).replace( /~/g, '%7E' ).replace( /_/g, '%5F' )
			.replace( /%/g, '_' );
	};

	mw.mmv.provider.UserInfo = UserInfo;
}( mediaWiki, jQuery, OO ) );
