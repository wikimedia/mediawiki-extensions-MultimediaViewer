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
	var L;

	/**
	 * Writes EventLogging entries for duration measurements
	 * @class mw.mmv.logging.DurationLogger
	 * @extends mw.mmv.logging.Logger
	 * @constructor
	 */
	function DurationLogger() {
		this.starts = {};
	}

	oo.inheritClass( DurationLogger, mw.mmv.logging.Logger );

	L = DurationLogger.prototype;

	/**
	 * @override
	 * @inheritdoc
	 */
	L.samplingFactor = mw.config.get( 'wgMultimediaViewer' ).durationSamplingFactor;

	/**
	 * @override
	 * @inheritdoc
	 */
	L.schema = 'MultimediaViewerDuration';

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
	 * @param {number} start Start timestamp that to substitute the one coming from start()
	 */
	L.stop = function ( type, start ) {
		var e, duration, message, startTimestamp;

		if ( !type ) {
			throw 'Must specify type';
		}

		startTimestamp = this.starts.hasOwnProperty( type ) ? this.starts[ type ] : start;

		if ( startTimestamp !== undefined ) {
			duration = $.now() - startTimestamp;

			e = {
				type : type,
				duration : duration,
				loggedIn : !mw.user.isAnon(),
				samplingFactor : this.samplingFactor
			};

			message = type + ': ' + duration + 'ms';

			mw.log( message );

			this.log( e );
		}

		if ( this.starts.hasOwnProperty( type ) ) {
			delete this.starts[ type ];
		}
	};

	mw.mmv.durationLogger = new DurationLogger();
}( mediaWiki, jQuery, OO ) );