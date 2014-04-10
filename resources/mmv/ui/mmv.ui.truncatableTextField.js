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
	var TTFP;

	/**
	 * Represents any text field that needs to be truncated to be readable.
	 * @class mw.mmv.ui.TruncatableTextField
	 * @extends mw.mmv.ui.Element
	 * @constructor
	 * @param {jQuery} $container The container for the element.
	 * @param {jQuery} $element The element where we should put the text.
	 * @param {Object} [sizes] Overrides for the max and small properties.
	 * @param {number} [sizes.max=100] Override the max property.
	 * @param {number} [sizes.small=80] Override the small property.
	 */
	function TruncatableTextField( $container, $element, sizes ) {
		mw.mmv.ui.Element.call( this, $container );

		/** @property {jQuery} $element The DOM element that holds text for this element. */
		this.$element = $element;

		/** @property {mw.mmv.HtmlUtils} htmlUtils Our HTML utility instance. */
		this.htmlUtils = new mw.mmv.HtmlUtils();

		this.$container.append( this.$element );

		if ( sizes ) {
			if ( sizes.max ) {
				this.max = sizes.max;
			}

			if ( sizes.small ) {
				this.small = sizes.small;
			}
		}
	}

	oo.inheritClass( TruncatableTextField, mw.mmv.ui.Element );

	TTFP = TruncatableTextField.prototype;

	/**
	 * Maximum length of the field - we'll cut out the rest of the text.
	 * @property {number} max
	 */
	TTFP.max = 100;

	/**
	 * Maximum ideal length of the field - we'll make the font smaller after this.
	 * @property {number} small
	 */
	TTFP.small = 80;

	/**
	 * Sets the string for the element.
	 * @param {string} value Warning - unsafe HTML is allowed here.
	 * @override
	 */
	TTFP.set = function ( value ) {
		this.whitelistHtmlAndSet( value );
		this.shrink();

		this.$element.toggleClass( 'empty', !value );
	};

	/**
	 * Whitelists HTML in the DOM element. Just a shortcut because
	 * this class has only one element member. Then sets the text.
	 * @param {string} value Has unsafe HTML.
	 */
	TTFP.whitelistHtmlAndSet = function ( value ) {
		var $newEle = $.parseHTML( this.htmlUtils.htmlToTextWithLinks( value ) );
		this.$element.empty().append( $newEle );
	};

	/**
	 * Makes the text smaller via a few different methods.
	 */
	TTFP.shrink = function () {
		this.changeStyle();
		this.$element = this.truncate( this.$element.get( 0 ), this.max, true );
	};

	/**
	 * Changes the element style if a certain length is reached.
	 */
	TTFP.changeStyle = function () {
		this.$element.toggleClass( 'mw-mmv-truncate-toolong', this.$element.text().length > this.small );
	};

	/**
	 * Truncate the text in the DOM element according to a few different rules.
	 * @param {HTMLElement} element
	 * @param {number} maxlen Maximum text length for the element.
	 * @param {number} [appendEllipsis=true] Whether to stick an ellipsis at the end.
	 * @returns {jQuery}
	 */
	TTFP.truncate = function ( element, maxlen, appendEllipsis ) {
		var $result, curEle,
			curlen = ( element.textContent || { length: 0 } ).length;

		if ( appendEllipsis === undefined ) {
			appendEllipsis = true;
		}

		if ( curlen <= maxlen ) {
			// Easy case
			return $( element );
		}

		// Make room for the ellipsis
		maxlen -= appendEllipsis ? 1 : 0;

		// We're going to build up rather than remove until ready
		curlen = 0;

		// Create an empty element to dump things into
		$result = $( element ).clone().empty();

		// Fetch the first child.
		curEle = element.firstChild;

		while ( curEle !== null && curlen < maxlen ) {
			if ( curEle.nodeType === curEle.TEXT_NODE ) {
				if ( curEle.textContent.length < ( maxlen - curlen ) ) {
					$result.append( curEle.cloneNode( true ) );
				} else {
					$result.append( this.truncateText( curEle.textContent, maxlen - curlen ) );
					break;
				}
			} else {
				$result.append( this.truncate( curEle.cloneNode( true ), maxlen - curlen, false ) );
			}

			curlen = $result.text().length;
			curEle = curEle.nextSibling;
		}

		if ( appendEllipsis ) {
			$result.append( '…' );
		}

		$( element ).replaceWith( $result );
		return $result;
	};

	/**
	 * Truncate text to a maximum width.
	 * @param {string} text
	 * @param {number} maxlen
	 */
	TTFP.truncateText = function ( text, maxlen ) {
		// Just return the substr for now.
		return text.substr( 0, maxlen );
	};

	mw.mmv.ui.TruncatableTextField = TruncatableTextField;
}( mediaWiki, jQuery, OO ) );
