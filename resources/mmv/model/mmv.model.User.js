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
	 * Represents information about a MediaWiki user.
	 * @class mw.mmv.model.User
	 * @constructor
	 * @param {string} username
	 * @param {mw.mmv.model.User.Gender} [gender='unknown']
	 */
	function User(
		username,
		gender
	) {
		var key,
			genderIsValid = false;

		if ( !username || !gender ) {
			throw 'All parameters are required and cannot be empty';
		}

		for ( key in User.Gender ) {
			if ( User.Gender.hasOwnProperty( key ) && User.Gender[key] === gender ) {
				genderIsValid = true;
			}
		}
		if ( !genderIsValid ) {
			throw 'invalid gender: ' + gender;
		}

		/**
		 *  The user's name, without namespace prefix, in human-readable format
		 *  ("John Doe", not "John_Doe")
		 *  @property {string}
		 */
		this.username = username;

		/**
		 * Gender of the user.
		 * @type {mw.mmv.model.User.Gender}
		 */
		this.gender = gender;
	}

	/**
	 * Gender of the user (can be set at preferences, UNKNOWN means they did not set it).
	 * This is mainly used for translations, so in wikis where there are no grammatic genders
	 * it is not used much (or misused for weird things like showing online status).
	 * (This should really belong to a model, but there is no point in having a user model if we
	 * only need a single property.)
	 * @enum {string} mw.mmv.model.User.Gender
	 */
	User.Gender = {
		/** User choose 'male' in preferences */
		MALE: 'male',
		/** User choose 'female' in preferences */
		FEMALE: 'female',
		/** User did not choose any gender in preferences */
		UNKNOWN: 'unknown'
	};

	mw.mmv.model.User = User;
}( mediaWiki ) );
