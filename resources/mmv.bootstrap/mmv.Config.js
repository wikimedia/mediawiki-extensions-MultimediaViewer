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

const { isMediaViewerEnabledOnClick } = require( 'mmv.head' );
const api = new mw.Api();

/**
 * Contains/retrieves configuration/environment information for MediaViewer.
 */
class Config {
	/**
	 * (Semi-)permanently stores the setting whether MediaViewer should handle thumbnail clicks.
	 * - for logged-in users, we use preferences
	 * - for anons, we use localStorage
	 * - for anons with old browsers, we don't do anything
	 *
	 * @param {boolean} enabled
	 * @return {jQuery.Promise} a deferred which resolves/rejects on success/failure respectively
	 */
	static setMediaViewerEnabledOnClick( enabled ) {
		const defaultPrefValue = mw.config.get( 'wgMediaViewerEnabledByDefault' );
		let deferred;
		let newPrefValue;
		let success = true;

		if ( !mw.user.isNamed() ) {
			if ( !enabled ) {
				success = mw.storage.set( 'wgMediaViewerOnClick', '0' ); // localStorage stringifies everything, best use strings in the first place
			} else {
				success = mw.storage.remove( 'wgMediaViewerOnClick' );
			}
			if ( success ) {
				deferred = $.Deferred().resolve();
			} else {
				deferred = $.Deferred().reject();
			}
		} else {
			// Simulate changing the option in Special:Preferences. Turns out this is quite hard (bug 69942):
			// we need to delete the user_properties row if the new setting is the same as the default,
			// otherwise set '1' for enabled, '' for disabled. In theory the pref API will delete the row
			// if the new value equals the default, but this does not always work.
			if ( defaultPrefValue === true ) {
				newPrefValue = enabled ? '1' : '';
			} else {
				// undefined will cause the API call to omit the optionvalue parameter
				// which in turn will cause the options API to delete the row and revert the pref to default
				newPrefValue = enabled ? '1' : undefined;
			}
			deferred = api.saveOption( 'multimediaviewer-enable', newPrefValue );
		}

		return deferred.done( () => {
			// make the change work without a reload
			mw.config.set( 'wgMediaViewerOnClick', enabled );
			if ( !enabled ) {
				// set flag for showing a popup if this was a first-time disable
				Config.maybeEnableStatusInfo();
			}
		} );
	}

	/**
	 * True if info about enable/disable status should be displayed (mingle #719).
	 *
	 * @return {boolean}
	 */
	static shouldShowStatusInfo() {
		return !isMediaViewerEnabledOnClick( mw.config, mw.user, mw.storage ) && mw.storage.get( 'mmv-showStatusInfo' ) === '1';
	}

	/**
	 * Called when MediaViewer is disabled. If status info was never displayed before, future
	 * shouldShowStatusInfo() calls will return true.
	 *
	 * @private
	 */
	static maybeEnableStatusInfo() {
		const currentShowStatusInfo = mw.storage.get( 'mmv-showStatusInfo' );
		if ( currentShowStatusInfo === null ) {
			mw.storage.set( 'mmv-showStatusInfo', '1' );
		}
	}

	/**
	 * Called when status info is displayed. Future shouldShowStatusInfo() calls will return false.
	 */
	static disableStatusInfo() {
		mw.storage.set( 'mmv-showStatusInfo', '0' );
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

module.exports = Config;
