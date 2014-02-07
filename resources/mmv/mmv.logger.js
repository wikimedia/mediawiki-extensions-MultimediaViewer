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
	var L;

	/**
	 * @class mw.mmv.Logger
	 * Writes log entries
	 */
	function Logger() {}

	L = Logger.prototype;

	L.logActions = {
		'thumbnail-link-click': 'User clicked on thumbnail to open lightbox.',
		'enlarge-link-click': 'User clicked on enlarge link to open lightbox.',
		'fullscreen-link-click': 'User clicked on fullscreen button in lightbox.',
		'defullscreen-link-click': 'User clicked on button to return to normal lightbox view.',
		'close-link-click': 'User clicked on the lightbox close button.',
		'site-link-click': 'User clicked on the link to the file description page.',

		// Profiling events start messages, $1 replaced with profile ID
		'profile-image-load-start': 'Profiling image load with ID $1',
		'profile-image-resize-start': 'Profiling image resize with ID $1',
		'profile-metadata-fetch-start': 'Profiling image metadata fetch with ID $1',
		'profile-gender-fetch-start': 'Profiling uploader gender fetch with ID $1',

		// Profiling events end messages, $1 replaced with profile ID, $2 replaced with time it took in ms
		'profile-image-load-end': 'Finished image load with ID $1 in $2 milliseconds',
		'profile-image-resize-end': 'Finished image resize with ID $1 in $2 milliseconds',
		'profile-metadata-fetch-end': 'Finished image metadata fetch with ID $1 in $2 milliseconds',
		'profile-gender-fetch-end': 'Finished uploader gender fetch with ID $1 in $2 milliseconds'
	};

	/**
	 * Logs an action
	 * @param {string} action The key representing the action
	 * @param {boolean} skipEventLog True if we don't want the action to be recorded in the event log
	 * @param {Object} substitutions A list of variable subtitutions for parametrized action texts
	 */
	L.log = function ( action, skipEventLog, substitutions ) {
		action = this.logActions[action] || action;

		if ( $.isPlainObject( substitutions ) ) {
			$.each( substitutions, function( key, value ) {
				action = action.replace( key, value );
			} );
		}

		mw.log( action );

		if ( mw.eventLog && !skipEventLog ) {
			mw.eventLog.logEvent( 'MediaViewer', {
				version: '1.1',
				action: action
			} );
		}
	};

	mw.mmv.logger = new Logger();
}( mediaWiki, jQuery ) );
