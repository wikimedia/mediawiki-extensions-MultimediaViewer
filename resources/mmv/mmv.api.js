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
	function Api( type, options ) {
		mw.Api.call( this, options );

		this.performance = new mw.mmv.Performance();
		this.type = type;
	}

	oo.inheritClass( Api, mw.Api );

	Api.prototype.ajax = function ( parameters, ajaxOptions ) {
		var start = $.now(),
			api = this;

		return mw.Api.prototype.ajax.call( this, parameters, ajaxOptions ).done( function ( result, jqxhr ) {
			api.performance.recordJQueryEntryDelayed( api.type, $.now() - start, jqxhr );
		} );
	};

	mw.mmv.Api = Api;
}( mediaWiki, jQuery, OO ) );
