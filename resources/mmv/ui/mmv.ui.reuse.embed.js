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
	// Shortcut for prototype later
	var EP;

	/**
	 * UI component that provides the user html/wikitext snippets needed to share
	 * and/or embed a media asset.
	 *
	 * @class mw.mmv.ui.reuse.Embed
	 * @extends mw.mmv.ui.reuse.Tab
	 * @constructor
	 * @param {jQuery} $container
	 */
	function Embed( $container ) {
		Embed.super.call( this, $container );

		/**
		 * Formatter converting image data into formats needed for output
		 * @property {mw.mmv.EmbedFileFormatter}
		 */
		this.formatter = new mw.mmv.EmbedFileFormatter();

		this.$pane.addClass( 'mw-mlb-embed-pane' );

		this.$pane.appendTo( this.$container );

		this.createSnippetTextAreas( this.$pane );
		this.createSizePulldownMenus( this.$pane );

		/**
		 * Currently selected embed snippet, defaults to wikitext.
		 * @property {jQuery}
		 */
		this.$currentMainEmbedText = this.embedTextWikitext.$element;

		/**
		 * Currently selected size menu.
		 * @property {OO.ui.MenuWidget}
		 */
		this.currentSizeMenu = this.embedWtSizeSwitch.getMenu();
	}
	oo.inheritClass( Embed, mw.mmv.ui.reuse.Tab );
	EP = Embed.prototype;


	/**
	 * Creates text areas for html and wikitext snippets.
	 *
	 * @param {jQuery} $container
	 */
	EP.createSnippetTextAreas = function( $container ) {
		this.embedTextWikitext = new oo.ui.TextInputWidget( {
			classes: [ 'mw-mlb-embed-text-wt', 'active' ],
			multiline: true,
			readOnly: true
		} );

		$( '<p>' )
			.append(
				this.embedTextWikitext.$element
			)
			.appendTo( $container );
	};

	/**
	 * Creates pulldown menus to select file sizes.
	 *
	 * @param {jQuery} $container
	 */
	EP.createSizePulldownMenus = function( $container ) {
		// Wikitext sizes pulldown menu
		this.embedWtSizeSwitch = new oo.ui.InlineMenuWidget( {
			classes: [ 'mw-mlb-embed-size', 'active' ]
		} );

		this.embedWtSizeChoices = {};

		this.embedWtSizeSwitch.getMenu().addItems( [
			this.embedWtSizeChoices.default = new oo.ui.MenuItemWidget( { name: 'default' }, {
				label: mw.message( 'multimediaviewer-default-embed-size' ).text()
			} ),

			this.embedWtSizeChoices.small = new oo.ui.MenuItemWidget( {
				name: 'small',
				height: null,
				width: null
			},
			{
				label: mw.message( 'multimediaviewer-small-embed-size', 0, 0 ).text(),
				selected: true
			} ),

			this.embedWtSizeChoices.medium = new oo.ui.MenuItemWidget( {
				name: 'medium',
				height: null,
				width: null
			},
			{
				label: mw.message( 'multimediaviewer-medium-embed-size', 0, 0 ).text()
			} ),

			this.embedWtSizeChoices.large = new oo.ui.MenuItemWidget( {
				name: 'large',
				height: null,
				width: null
			},
			{
				label: mw.message( 'multimediaviewer-large-embed-size', 0, 0 ).text()
			} )
		] );

		this.embedWtSizeSwitch.getMenu().selectItem( this.embedWtSizeChoices.default );

		$( '<p>' )
			.append(
				this.embedWtSizeSwitch.$element
			)
			.appendTo( $container );
	};

	/**
	 * Registers listeners.
	 */
	EP.attach = function() {
		var embed = this,
			$wikitextTextarea = this.embedTextWikitext.$element.find( 'textarea' );

		// Select all text once element gets focus
		this.embedTextWikitext.onDOMEvent( 'focus', $.proxy( this.selectAllOnEvent, $wikitextTextarea ) );
		this.embedTextWikitext.onDOMEvent( 'mousedown click', $.proxy( this.onlyFocus, $wikitextTextarea ) );

		// Register handlers for switching between file sizes
		this.embedWtSizeSwitch.getMenu().on( 'select', $.proxy( embed.handleSizeSwitch, embed ) );
	};

	/**
	 * Clears listeners.
	 */
	EP.unattach = function() {
		this.constructor.super.prototype.unattach.call( this );

		this.embedTextWikitext.offDOMEvent( 'focus mousedown click' );
		this.embedWtSizeSwitch.getMenu().off( 'select' );
	};

	/**
	 * Handles size menu change events.
	 */
	EP.handleSizeSwitch = function ( item ) {
		var value = item.getData();

		this.changeSize( value.width, value.height );
	};

	/**
	 * Changes the size, takes different actions based on which sort of
	 * embed is currently chosen.
	 *
	 * @param {number} width New width to set
	 */
	EP.changeSize = function ( width ) {
		this.updateWtEmbedText( width );
		this.select();
	};

	/**
	 * Updates the wikitext embed text with a new value for width.
	 *
	 * Assumes that the set method has already been called.
	 * @param {number} width
	 */
	EP.updateWtEmbedText = function ( width ) {
		if ( !this.embedFileInfo ) {
			return;
		}

		var title = this.embedFileInfo.title,
			caption = this.embedFileInfo.caption;

		this.embedTextWikitext.setValue( this.formatter.getThumbnailWikitext(
			title, width, caption ? caption.plain : title.getNameText() ) );
	};

	/**
	 * Shows the pane.
	 */
	EP.show = function () {
		this.constructor.super.prototype.show.call( this );
		this.select();
	};

	/**
	 * Calculates possible image sizes for wikitext snippets. It returns up to
	 * three possible snippet frame sizes (small, medium, large).
	 *
	 * @param {number} width
	 * @param {number} height
	 * @returns {Object}
	 * @returns { {width: number, height: number} } return.small
	 * @returns { {width: number, height: number} } return.medium
	 * @returns { {width: number, height: number} } return.large
	 */
	EP.getPossibleImageSizesForWikitext = function ( width, height ) {
		var i, bucketName,
			bucketWidth,
			buckets = {
				'small': 300,
				'medium': 400,
				'large': 500
			},
			sizes = {},
			bucketNames = Object.keys( buckets ),
			widthToHeight = height / width;

		for ( i = 0; i < bucketNames.length; i++ ) {
			bucketName = bucketNames[i];
			bucketWidth = buckets[bucketName];

			if ( width > bucketWidth ) {
				sizes[bucketName] = {
					width: bucketWidth,
					height: Math.round( bucketWidth * widthToHeight )
				};
			}
		}

		return sizes;
	};

	/**
	 * Gets size options for html and wikitext snippets.
	 *
	 * @param {number} width
	 * @param {number} height
	 * @returns {Object}
	 * @returns {Object} return.html Collection of possible image sizes for html snippets
	 * @returns {Object} return.wikitext Collection of possible image sizes for wikitext snippets
	 */
	EP.getSizeOptions = function ( width, height ) {
		var sizes = {};

		sizes.wikitext = this.getPossibleImageSizesForWikitext( width, height );

		return sizes;
	};

	/**
	 * Sets the data on the element.
	 *
	 * @param {mw.mmv.model.Image} image
	 * @param {mw.mmv.model.EmbedFileInfo} embedFileInfo
	 */
	EP.set = function ( image, embedFileInfo ) {
		var wtSizeSwitch = this.embedWtSizeSwitch.getMenu(),
			wtSizeOptions = wtSizeSwitch.getItems(),
			sizes = this.getSizeOptions( image.width, image.height );

		this.embedFileInfo = embedFileInfo;

		this.updateMenuOptions( sizes.wikitext, wtSizeOptions );

		this.currentSizeMenu.selectItem( this.currentSizeMenu.getSelectedItem() );
	};

	/**
	 * @private
	 *
	 * Updates the menu options based on calculated sizes.
	 *
	 * @param {Object} sizes
	 * @param {OO.ui.MenuItemWidget[]} options
	 */
	 EP.updateMenuOptions = function ( sizes, options ) {
		var i, option, data;

		for ( i = 0; i < options.length; i++ ) {
			option = options[i];
			data = option.getData();

			if ( sizes[data.name] ) {
				option.setDisabled( false );

				// These values are later used in the else if case below as flags
				// to disable an option that is no longer pertinent. Ex: User went
				// from a large image from which we have options(small, med, large) to
				// a small image where the only pertinent option is small.
				data.width = sizes[data.name].width;
				data.height = sizes[data.name].height;

				option.setLabel(
					mw.message(
						'multimediaviewer-' + data.name + '-embed-size',
						data.width,
						data.height
					).text()
				);
			} else if ( data.width && data.height ) {
				option.setDisabled( true );

				data.width = null;
				data.height = null;
			}
		}
	};

	/**
	 * @inheritdoc
	 */
	EP.empty = function () {
		this.embedTextWikitext.setValue( '' );

		this.embedWtSizeSwitch.getMenu().hide();
	};

	/**
	 * Selects the text in the current text box.
	 */
	EP.select = function () {
		this.$currentMainEmbedText.focus();
	};

	mw.mmv.ui.reuse.Embed = Embed;
}( mediaWiki, jQuery, OO ) );
