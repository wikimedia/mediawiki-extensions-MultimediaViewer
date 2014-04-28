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
	 * Writes Event Logging entries for duration measurements
	 * @class mw.mmv.DurationLogger
	 */
	function DurationLogger() {
		this.starts = {};
	}

	L = DurationLogger.prototype;

	/**
	 * Saves the start of a duration
	 * @param {string|string[]} type_or_types Type(s) of duration being measured.
	 */
	L.start = function ( typeOrTypes ) {
		var i,
			start = $.now();

		if ( $.isArray( typeOrTypes ) ) {
			for ( i = 0; i < typeOrTypes.length; i++ ) {
				// Don't overwrite an existing value
				if ( !this.starts.hasOwnProperty( typeOrTypes[ i ] ) ) {
					this.starts[ typeOrTypes[ i ] ] = start;
				}
			}
		// Don't overwrite an existing value
		} else if ( typeOrTypes && !this.starts.hasOwnProperty( typeOrTypes ) ) {
			this.starts[ typeOrTypes ] = start;
		}
	};

	/**
	 * Logs a duration if a start was recorded first
	 * @param {string} type Type of duration being measured.
	 */
	L.stop = function ( type ) {
		var e, duration;

		if ( this.starts.hasOwnProperty( type ) ) {
			duration = $.now() - this.starts[ type ];

			e = {
				type : type,
				duration : duration,
				loggedIn : !mw.user.isAnon()
			};

			if ( $.isPlainObject( window.Geo ) && typeof window.Geo.country === 'string' ) {
				e.country = window.Geo.country;
			}

			if ( mw.eventLog ) {
				mw.eventLog.logEvent( 'MultimediaViewerDuration', e );
			}

			if ( window.console && window.console.log ) {
				window.console.log( type + ': ' + duration + 'ms' );
			}
		}

		if ( this.starts.hasOwnProperty( type ) ) {
			delete this.starts[ type ];
		}
	};

	mw.mmv.DurationLogger = new DurationLogger();
}( mediaWiki, jQuery ) );