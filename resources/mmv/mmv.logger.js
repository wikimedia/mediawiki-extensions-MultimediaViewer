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
	 * Writes log entries
	 * @class mw.mmv.Logger
	 */
	function Logger() {}

	L = Logger.prototype;

	/**
	 * Possible log actions, and their associated English developer log strings.
	 *
	 * These events are not de-duped. Eg. if the user opens the same site link
	 * in 10 tabs, there will be 10 site-link-click events. If they view the
	 * same image 10 times by hitting the prev/next buttons, there will be 10
	 * image-view events, etc.
	 * @property
	 * @static
	 */
	L.logActions = {
		'thumbnail-link-click': 'User clicked on thumbnail to open lightbox.',
		'enlarge-link-click': 'User clicked on enlarge link to open lightbox.',
		'fullscreen-link-click': 'User clicked on fullscreen button in lightbox.',
		'defullscreen-link-click': 'User clicked on button to return to normal lightbox view.',
		'close-link-click': 'User clicked on the lightbox close button.',
		'site-link-click': 'User clicked on the link to the file description page.',
		'use-this-file-link-click': 'User clicked on the link to use this file.',
		'image-view': 'User viewed an image'
	};

	/**
	 * Logs an action
	 * @param {string} action The key representing the action
	 * @param {boolean} skipEventLog True if we don't want the action to be recorded in the event log
	 * @param {Object} substitutions A list of variable subtitutions for parametrized action texts
	 * @returns {jQuery.Promise}
	 */
	L.log = function ( action, skipEventLog, substitutions ) {
		var translatedAction = this.logActions[action] || action;

		if ( $.isPlainObject( substitutions ) ) {
			$.each( substitutions, function( key, value ) {
				translatedAction = translatedAction.replace( key, value );
			} );
		}

		mw.log( translatedAction );

		if ( mw.eventLog && !skipEventLog ) {
			return mw.eventLog.logEvent( 'MediaViewer', {
				version: '1.1',
				action: action
			} );
		}

		return $.Deferred().resolve();
	};

	mw.mmv.logger = new Logger();
}( mediaWiki, jQuery ) );
