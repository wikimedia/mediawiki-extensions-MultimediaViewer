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
	var MLBP;

	/**
	 * Some interface functions for MMV.
	 * FIXME merge with Lightboxinterface, figure out better separation of responsibilities
	 * @class mw.mmv.MultiLightbox
	 * @constructor
	 * @param {number} initial
	 * @param {Function} InterfaceClass type of interface to use
	 * @param {mw.mmv.MultimediaViewer} viewer
	 */
	function MultiLightbox( initial, InterfaceClass ) {
		this.currentIndex = initial || 0;
		this.onInterfaceReady = [];
		this.iface = new InterfaceClass();
		this.interfaceReady();
	}

	MLBP = MultiLightbox.prototype;

	/**
	 * Schedules stuff to run when IF is ready (or fires it immediately if it is already).
	 * TODO replace with event or promise
	 * @param {function()} func
	 */
	MLBP.onInterface = function ( func ) {
		if ( this.onInterfaceReady !== undefined ) {
			this.onInterfaceReady.push( func );
		} else {
			func();
		}
	};

	/**
	 * Interface ready "event"
	 * TODO replace with real event or promise
	 */
	MLBP.interfaceReady = function () {
		var i;

		for ( i = 0; i < this.onInterfaceReady.length; i++ ) {
			this.onInterfaceReady[i]();
		}

		this.onInterfaceReady = undefined;
	};

	/**
	 * Opens the lightbox.
	 */
	MLBP.open = function () {
		this.iface.empty();
		this.iface.attach();
	};

	mw.mmv.MultiLightbox = MultiLightbox;
}( mediaWiki ) );
