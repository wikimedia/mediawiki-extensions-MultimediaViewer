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
	var EP;

	/**
	 * Represents a UI element.
	 * @class mw.mmv.ui.Element
	 * @abstract
	 * @constructor
	 * @param {jQuery} $container
	 */
	function Element( $container ) {
		/** @property {jQuery} $container The element that contains the UI element. */
		this.$container = $container;

		/** @property {Object.<string, string[]>} eventsRegistered Events that this element has registered with the DOM. */
		this.eventsRegistered = {};
	}
	EP = Element.prototype;

	/**
	 * @abstract
	 * Sets the data for the element.
	 */
	EP.set = function () {};

	/**
	 * @abstract
	 * Empties the element.
	 */
	EP.empty = function () {};

	/**
	 * @abstract
	 * Registers listeners.
	 */
	EP.attach = function() {};

	/**
	 * @abstract
	 * Clears listeners.
	 */
	EP.unattach = function() {
		this.clearEvents();
	};

	/**
	 * Add event handler in a way that will be auto-cleared on lightbox close
	 * @param {string} name Name of event, like 'keydown'
	 * @param {Function} handler Callback for the event
	 *
	 * TODO: Unit tests
	 */
	EP.handleEvent = function ( name, handler ) {
		if ( this.eventsRegistered[name] === undefined ) {
			this.eventsRegistered[name] = [];
		}
		this.eventsRegistered[name].push( handler );
		$( document ).on( name, handler );
	};

	/**
	 * Remove all events that have been registered on this element.
	 *
	 * TODO: Unit tests
	 */
	EP.clearEvents = function () {
		var i, handlers, thisevent,
			events = Object.keys( this.eventsRegistered );

		for ( i = 0; i < events.length; i++ ) {
			thisevent = events[i];
			handlers = this.eventsRegistered[thisevent];
			while ( handlers.length > 0 ) {
				$( document ).off( thisevent, handlers.pop() );
			}
		}
	};

	mw.mmv.ui = {};
	mw.mmv.ui.reuse = {};
	mw.mmv.ui.Element = Element;
}( mediaWiki, jQuery ) );
