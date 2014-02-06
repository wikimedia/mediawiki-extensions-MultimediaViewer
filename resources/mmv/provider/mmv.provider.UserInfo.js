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
	 * @class mw.mmv.provider.UserInfo
	 * Gets user information (currently just the gender).
	 * See https://www.mediawiki.org/wiki/API:Users
	 * @extends mw.mmv.provider.Api
	 * @inheritdoc
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
	 * @return {jQuery.Promise<mw.mmv.provider.UserInfo.Gender>} gender
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
				if ( users[0] && users[0].gender ) {
					return users[0].gender;
				} else {
					return $.Deferred().reject( 'error in provider, user info not found' );
				}
			} );
		}

		return this.cache[cacheKey];
	};

	/**
	 * Gender of the user (can be set at preferences, UNKNOWN means they did not set it).
	 * This is mainly used for translations, so in wikis where there are no grammatic genders
	 * it is not used much.
	 * (This should really belong to a model, but there is no point in having a user model if we
	 * only need a single property.)
	 * @enum {string} mw.mmv.provider.UserInfo.Gender
	 */
	UserInfo.Gender = {
		MALE: 'male',
		FEMALE: 'female',
		UNKNOWN: 'unknown'
	};

	mw.mmv.provider.UserInfo = UserInfo;
}( mediaWiki, OO, jQuery ) );
