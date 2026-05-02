/*
 * This file is part of the MediaWiki extension MediaViewer.
 *
 * MediaViewer is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * MediaViewer is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with MediaViewer.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Contains/retrieves configuration/environment information for MediaViewer.
 */
class Config {

	/**
	 * The media route prefix
	 *
	 * @return {string}
	 */
	static get ROUTE() {
		return 'media';
	}

	/**
	 * RegExp representing the media route
	 *
	 * @return {RegExp}
	 */
	static get ROUTE_REGEXP() {
		return /^\/media\/(.+)$/;
	}

	/**
	 * RegExp representing the media position as in "File:foo.jpg/3"
	 *
	 * @return {RegExp}
	 */
	static get POSITION_REGEXP() {
		return /\/(\d+)$/;
	}

	/**
	 * Returns true if MediaViewer should handle thumbnail clicks.
	 *
	 * @return {boolean}
	 */
	static isMediaViewerEnabledOnClick() {
		return mw.config.get( 'wgMediaViewer' ) && // global opt-out switch, can be set in user JS
			mw.config.get( 'wgMediaViewerOnClick' ) && // thumbnail opt-out, can be set in preferences
			( mw.user.isNamed() || !mw.storage.get( 'wgMediaViewerOnClick' ) || mw.storage.get( 'wgMediaViewerOnClick' ) === '1' ); // thumbnail opt-out for anons
	}

	/**
	 * Returns the location hash (route string) for the given file title.
	 *
	 * @param {string} imageFileTitle the file title
	 * @param {number} [position] the relative position of this image to others with same file
	 * @return {string} the location hash
	 * @member mw.mmv
	 */
	static getMediaHash( imageFileTitle, position ) {
		return position > 1 ?
			`#/${ this.ROUTE }/${ encodeURI( imageFileTitle ) }/${ position }` :
			`#/${ this.ROUTE }/${ encodeURI( imageFileTitle ) }`;
	}

	/**
	 * Returns UI language
	 *
	 * @return {string} Language code
	 */
	static language() {
		return mw.config.get( 'wgUserLanguage', false ) || mw.config.get( 'wgContentLanguage', 'en' );
	}
}

mw.mmv = Config;
module.exports = Config;
