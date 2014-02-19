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
	/**
	 * Category metadata UI.
	 * @class mw.mmv.ui.Categories
	 * @extends mw.mmv.ui.Element
	 * @constructor
	 * @inheritdoc
	 */
	function Categories( $container ) {
		mw.mmv.ui.Element.call( this, $container );

		this.$categoryTpl = $( '<span>')
			.append( $( '<span>').addClass( 'comma-container' )
				.text( mw.message( 'comma-separator' ) ) )
			.append( '<a>' );
	}

	oo.inheritClass( Categories, mw.mmv.ui.Element );

	/**
	 * Sets the data for the element.
	 * @param {string} articlePath Path to articles on the repo this image comes from
	 * @param {string[]} categories
	 */
	Categories.prototype.set = function ( articlePath, categories ) {
		var i, cat, href, $category;

		this.empty();

		if ( !categories || !categories.length ) {
			return;
		}

		// We filter the categories first, because we need to know which category is the last
		// in order to insert the commas properly
		categories = $.grep( categories, function( cat ) {
			return cat && cat.length;
		} );

		for ( i = 0; i < categories.length; i++ ) {
			cat = categories[i];

			if ( !this.$categories ) {
				this.$categories = $( '<li>' ).addClass( 'mw-mlb-image-category' )
					.appendTo( this.$container );
			}

			href = articlePath.replace( '$1', 'Category:' + cat );

			$category = this.$categoryTpl
				.clone()
				.toggleClass( 'extra', i >= 3 )
				.appendTo( this.$categories );

			$category.find( 'a' )
				.text( cat )
				.prop( 'href', href );

			if ( i === 0 ) {
				$category.find( '.comma-container' ).remove();
			}
		}
	};

	/**
	 * @inheritdoc
	 */
	Categories.prototype.empty = function () {
		if ( this.$categories ) {
			this.$categories.remove();
			this.$categories = undefined;
		}
	};

	mw.mmv.ui.Categories = Categories;
}( mediaWiki, jQuery, OO ) );
