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
	 * @constructor
	 */
	function DurationLogger() {
		this.starts = {};
		this.schema = 'MultimediaViewerDuration';
	}

	L = DurationLogger.prototype;

	/**
	 * Sets the Geo object providing country information about the visitor
	 * @param {Object} Geo object containing country GeoIP information about the user
	 */
	L.setGeo = function ( Geo ) {
		this.Geo = Geo;
	};

	/**
	 * Sets the eventLog object providing a facility to record events
	 * @param {mw.eventLog} eventLog EventLogging instance
	 */
	L.setEventLog = function ( eventLog ) {
		this.eventLog = eventLog;
	};

	/**
	 * Saves the start of a duration
	 * @param {string|string[]} type_or_types Type(s) of duration being measured.
	 */
	L.start = function ( typeOrTypes ) {
		var i,
			start = $.now();

		if ( !typeOrTypes ) {
			throw 'Must specify type';
		}

		if ( !$.isArray( typeOrTypes ) ) {
			typeOrTypes = [ typeOrTypes ];
		}

		for ( i = 0; i < typeOrTypes.length; i++ ) {
			// Don't overwrite an existing value
			if ( !this.starts.hasOwnProperty( typeOrTypes[ i ] ) ) {
				this.starts[ typeOrTypes[ i ] ] = start;
			}
		}
	};

	/**
	 * Logs a duration if a start was recorded first
	 * @param {string} type Type of duration being measured.
	 */
	L.stop = function ( type ) {
		var e, duration, message,
			self = this;

		if ( !type ) {
			throw 'Must specify type';
		}

		if ( this.starts.hasOwnProperty( type ) ) {
			duration = $.now() - this.starts[ type ];

			e = {
				type : type,
				duration : duration,
				loggedIn : !mw.user.isAnon()
			};

			message = type + ': ' + duration + 'ms';

			this.loadDependencies().then( function () {
				if ( $.isPlainObject( self.Geo ) && typeof self.Geo.country === 'string' ) {
					e.country = self.Geo.country;
				}

				self.eventLog.logEvent( self.schema, e );
				mw.log( message );
			} );
		}

		if ( this.starts.hasOwnProperty( type ) ) {
			delete this.starts[ type ];
		}
	};

	/**
	 * Loads the dependencies that allow us to log events
	 * @returns {jQuery.Promise}
	 */
	L.loadDependencies = function () {
		var self = this,
			waitForEventLog = $.Deferred();

		// Waits for dom readiness because we don't want to have these dependencies loaded in the head
		$( document ).ready( function() {
			// window.Geo is currently defined in components that are loaded independently, there is no cheap
			// way to load just that information. Either we piggy-back on something that already loaded it
			// or we just don't have it
			if ( window.Geo ) {
				self.setGeo( window.Geo );
			}

			try {
				mw.loader.using( 'ext.eventLogging', function() {
					self.setEventLog( mw.eventLog );
					waitForEventLog.resolve();
				} );
			} catch ( e ) {
				waitForEventLog.reject();
			}
		} );

		return waitForEventLog;
	};

	mw.mmv.durationLogger = new DurationLogger();
}( mediaWiki, jQuery ) );