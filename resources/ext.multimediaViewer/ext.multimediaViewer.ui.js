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
	/**
	 * @class mw.mmv.ui.Element
	 * @abstract
	 * Represents a UI element.
	 * @constructor
	 * @param {jQuery} $container
	 */
	function Element( $container ) {
		/** @property {jQuery} $container The element that contains the UI element. */
		this.$container = $container;
	}

	/**
	 * @method
	 * Helper function for whitelisting HTML to only keep links and text. Works in-place.
	 * @param {jQuery} $el
	 */
	Element.prototype.whitelistHtml = function ( $el ) {
		var child, $prev, $child = $el.children().first();

		while ( $child && $child.length ) {
			child = $child.get( 0 );

			if ( child.nodeType !== child.ELEMENT_NODE ) {
				return;
			}

			this.whitelistHtml( $child );

			if ( !$child.is( 'a' ) ) {
				$prev = $child.prev();
				$child.replaceWith( $child.contents() );
			} else {
				$prev = $child;
			}

			if ( $prev && $prev.length === 1 ) {
				$child = $prev.next();
			} else {
				$child = $el.children().first();
			}
		}
	};

	/**
	 * @method
	 * @abstract
	 * Sets the data for the element.
	 */
	Element.prototype.set = function () {};

	/**
	 * @method
	 * @abstract
	 * Empties the element.
	 */
	Element.prototype.empty = function () {};

	mw.mmv.ui = {};
	mw.mmv.ui.Element = Element;
}( mediaWiki ) );
