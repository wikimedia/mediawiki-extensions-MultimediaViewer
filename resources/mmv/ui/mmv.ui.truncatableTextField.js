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
	 * Depending on its length, text in that field might be truncated or its font size reduced (or neither).
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

		/** @property {boolean} truncated state flag */
		this.truncated = false;

		/** @property {jQuery} $element The DOM element that holds text for this element. */
		this.$element = $element;

		/** @property {string} originalHtml the original (after sanitizing) element as a HTML string */
		this.originalHtml = null;

		/** @property {string} truncatedHtml the truncated element as a HTML string */
		this.truncatedHtml = null;

		/** @property {string} normalTitle title attribute to show when the text is not truncated */
		this.normalTitle = null;

		/** @property {string} truncatedTitle title attribute to show when the text not truncated */
		this.truncatedTitle = null;

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
		this.originalHtml = this.htmlUtils.htmlToTextWithLinks( value );

		this.$element.empty().append( this.originalHtml );
		this.changeStyle();
		this.$element.toggleClass( 'empty', !value );
		this.truncated = false;

		this.truncatedHtml = this.truncate( this.$element.get( 0 ), this.max, true ).html();

		this.shrink();
	};

	/**
	 * Allows setting different titles for fully visible and for truncated text.
	 * @param {string} normal
	 * @param {string} truncated
	 */
	TTFP.setTitle = function ( normal, truncated ) {
		this.normalTitle = normal;
		this.truncatedTitle = truncated;
		this.$element.attr( 'original-title', this.truncated ? truncated : normal );
	};

	/**
	 * Makes the text smaller via a few different methods.
	 */
	TTFP.shrink = function () {
		if ( !this.truncated && this.truncatedHtml !== this.originalHtml ) {
			this.$element.html( this.truncatedHtml );
			this.$element.attr( 'original-title', this.truncatedTitle );
			this.truncated = true;
		}
	};

	/**
	 * Restores original text
	 */
	TTFP.grow = function () {
		if ( this.truncated ) {
			this.$element.html( this.originalHtml );
			this.$element.attr( 'original-title', this.normalTitle );
			this.truncated = false;
		}
	};

	/**
	 * Changes the element style if a certain length is reached.
	 */
	TTFP.changeStyle = function () {
		this.$element.toggleClass( 'mw-mmv-reduce-toolong', this.$element.text().length > this.small );
		this.$element.toggleClass( 'mw-mmv-truncate-toolong', this.$element.text().length > this.max );
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
