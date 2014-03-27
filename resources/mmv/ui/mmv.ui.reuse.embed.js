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

		this.$explanation = $( '<div>' )
			.addClass( 'mw-mlb-shareembed-explanation mw-mlb-embed-explanation' )
			.text( mw.message( 'multimediaviewer-embed-explanation' ).text() )
			.appendTo( this.$pane );

		this.createSnippetSelectionButtons( this.$pane );
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

	/** @property {number} Width threshold at which an image is to be considered "large" */
	EP.LARGE_IMAGE_WIDTH_THRESHOLD = 1200;

	/** @property {number} Height threshold at which an image is to be considered "large" */
	EP.LARGE_IMAGE_HEIGHT_THRESHOLD = 900;


	/**
	 * Creates text areas for html and wikitext snippets.
	 *
	 * @param {jQuery} $container
	 */
	EP.createSnippetTextAreas = function( $container ) {
		this.embedTextHtml = new oo.ui.TextInputWidget( {
			classes: [ 'mw-mlb-embed-text-html' ],
			multiline: true,
			readOnly: true
		} );

		this.embedTextHtml.$element.find( 'textarea' )
			.prop( 'placeholder', mw.message( 'multimediaviewer-reuse-loading-placeholder' ).text() );

		this.embedTextWikitext = new oo.ui.TextInputWidget( {
			classes: [ 'mw-mlb-embed-text-wt', 'active' ],
			multiline: true,
			readOnly: true
		} );

		this.embedTextWikitext.$element.find( 'textarea' )
			.prop( 'placeholder', mw.message( 'multimediaviewer-reuse-loading-placeholder' ).text() );

		$( '<p>' )
			.append(
				this.embedTextHtml.$element,
				this.embedTextWikitext.$element
			)
			.appendTo( $container );
	};

	/**
	 * Creates snippet selection buttons.
	 *
	 * @param {jQuery} $container
	 */
	EP.createSnippetSelectionButtons = function( $container ) {
		var wikitextButtonOption,
			htmlButtonOption;
		this.embedSwitch = new oo.ui.ButtonSelectWidget( {
			classes: [ 'mw-mlb-embed-select' ]
		} );

		wikitextButtonOption = new oo.ui.ButtonOptionWidget( 'wt', {
				label: mw.message( 'multimediaviewer-embed-wt' ).text(),
			} );
		htmlButtonOption = new oo.ui.ButtonOptionWidget( 'html', {
				label: mw.message( 'multimediaviewer-embed-html' ).text()
			} );

		this.embedSwitch.addItems( [
			wikitextButtonOption,
			htmlButtonOption
		] );

		$( '<p>' )
			.append( this.embedSwitch.$element )
			.appendTo( $container );

		// Default to 'wikitext'
		this.embedSwitch.selectItem( wikitextButtonOption );

	};

	/**
	 * Creates pulldown menus to select file sizes.
	 *
	 * @param {jQuery} $container
	 */
	EP.createSizePulldownMenus = function( $container ) {
		var placeholderDimensions = $( '<span>' )
			.addClass( 'mw-mlb-embed-dimensions' )
			.text( mw.message( 'multimediaviewer-embed-dimensions', 0, 0 ).text() ).get( 0 ).outerHTML;

		// Wikitext sizes pulldown menu
		this.embedWtSizeSwitch = new oo.ui.InlineMenuWidget( {
			classes: [ 'mw-mlb-embed-size', 'active' ]
		} );

		this.embedWtSizeChoices = {};

		this.embedWtSizeSwitch.getMenu().addItems( [
			this.embedWtSizeChoices.default = new oo.ui.MenuItemWidget( { name: 'default' }, {
				label: mw.message( 'multimediaviewer-default-embed-dimensions' ).text(),
				autoFitLabel: false
			} ),

			this.embedWtSizeChoices.small = new oo.ui.MenuItemWidget( {
				name: 'small',
				height: null,
				width: null
			},
			{
				label: $( '<span>' ).html( mw.message( 'multimediaviewer-small-embed-dimensions', placeholderDimensions ).text() ),
				autoFitLabel: false
			} ),

			this.embedWtSizeChoices.medium = new oo.ui.MenuItemWidget( {
				name: 'medium',
				height: null,
				width: null
			},
			{
				label: $( '<span>' ).html( mw.message( 'multimediaviewer-medium-embed-dimensions', placeholderDimensions ).text() ),
				autoFitLabel: false
			} ),

			this.embedWtSizeChoices.large = new oo.ui.MenuItemWidget( {
				name: 'large',
				height: null,
				width: null
			},
			{
				label: $( '<span>' ).html( mw.message( 'multimediaviewer-large-embed-dimensions', placeholderDimensions ).text() ),
				autoFitLabel: false
			} )
		] );

		this.embedWtSizeSwitch.getMenu().selectItem( this.embedWtSizeChoices.default );

		// Html sizes pulldown menu
		this.embedHtmlSizeSwitch = new oo.ui.InlineMenuWidget( {
			classes: [ 'mw-mlb-embed-size' ]
		} );

		this.embedHtmlSizeChoices = {};

		this.embedHtmlSizeSwitch.getMenu().addItems( [
			this.embedHtmlSizeChoices.small = new oo.ui.MenuItemWidget( {
				name: 'small',
				height: null,
				width: null
			},
			{
				label: $( '<span>' ).html( mw.message( 'multimediaviewer-small-embed-dimensions', placeholderDimensions ).text() ),
				autoFitLabel: false
			} ),

			this.embedHtmlSizeChoices.medium = new oo.ui.MenuItemWidget( {
				name: 'medium',
				height: null,
				width: null
			},
			{
				label: $( '<span>' ).html( mw.message( 'multimediaviewer-medium-embed-dimensions', placeholderDimensions ).text() ),
				autoFitLabel: false
			} ),

			this.embedHtmlSizeChoices.large = new oo.ui.MenuItemWidget( {
				name: 'large',
				height: null,
				width: null
			},
			{
				label: $( '<span>' ).html( mw.message( 'multimediaviewer-large-embed-dimensions', placeholderDimensions ).text() ),
				autoFitLabel: false
			} ),

			this.embedHtmlSizeChoices.original = new oo.ui.MenuItemWidget( {
				name: 'original',
				height: null,
				width: null
			},
			{
				label: $( '<span>' ).html( mw.message( 'multimediaviewer-original-embed-dimensions', placeholderDimensions ).text() ),
				autoFitLabel: false
			} )
		] );

		this.embedHtmlSizeSwitch.getMenu().selectItem( this.embedHtmlSizeChoices.small );

		$( '<p>' )
			.append(
				this.embedHtmlSizeSwitch.$element,
				this.embedWtSizeSwitch.$element
			)
			.appendTo( $container );
	};

	/**
	 * Registers listeners.
	 */
	EP.attach = function() {
		var embed = this,
			$htmlTextarea = this.embedTextHtml.$element.find( 'textarea' ),
			$wikitextTextarea = this.embedTextWikitext.$element.find( 'textarea' );

		// Select all text once element gets focus
		this.embedTextHtml.onDOMEvent( 'focus', $.proxy( this.selectAllOnEvent, $htmlTextarea ) );
		this.embedTextWikitext.onDOMEvent( 'focus', $.proxy( this.selectAllOnEvent, $wikitextTextarea ) );
		// Disable partial text selection inside the textboxes
		this.embedTextHtml.onDOMEvent( 'mousedown click', $.proxy( this.onlyFocus, $htmlTextarea ) );
		this.embedTextWikitext.onDOMEvent( 'mousedown click', $.proxy( this.onlyFocus, $wikitextTextarea ) );

		// Register handler for switching between wikitext/html snippets
		this.embedSwitch.on( 'select', $.proxy( embed.handleTypeSwitch, embed ) );

		// workaround for bug 63094
		this.proxiedHandleSizeSwitch = this.proxiedHandleSizeSwitch  || $.proxy( this.handleSizeSwitch, this );

		// Register handlers for switching between file sizes
		this.embedHtmlSizeSwitch.getMenu().on( 'select', this.proxiedHandleSizeSwitch );
		this.embedWtSizeSwitch.getMenu().on( 'select', this.proxiedHandleSizeSwitch );
	};

	/**
	 * Clears listeners.
	 */
	EP.unattach = function() {
		this.constructor.super.prototype.unattach.call( this );

		this.embedTextHtml.offDOMEvent( 'focus mousedown click' );
		this.embedTextWikitext.offDOMEvent( 'focus mousedown click' );
		this.embedSwitch.off( 'select' );
		// the noop is needed for some tests which call unattach before calling attach.
		this.embedHtmlSizeSwitch.getMenu().off( 'select', this.proxiedHandleSizeSwitch || $.noop );
		this.embedWtSizeSwitch.getMenu().off( 'select', this.proxiedHandleSizeSwitch || $.noop );
	};

	/**
	 * Handles size menu change events.
	 */
	EP.handleSizeSwitch = function ( item ) {
		var value = item.getData();

		this.changeSize( value.width, value.height );
	};

	/**
	 * Handles snippet type switch.
	 */
	EP.handleTypeSwitch = function ( item ) {
		var value = item.getData();

		if ( value === 'html' ) {
			this.$currentMainEmbedText = this.embedTextHtml.$element;
			this.currentSizeMenu = this.embedHtmlSizeSwitch.getMenu();
			this.embedWtSizeSwitch.getMenu().hide();
		} else if ( value === 'wt' ) {
			this.$currentMainEmbedText = this.embedTextWikitext.$element;
			this.currentSizeMenu = this.embedWtSizeSwitch.getMenu();
			this.embedHtmlSizeSwitch.getMenu().hide();
		}

		this.embedTextHtml.$element
			.add( this.embedHtmlSizeSwitch.$element )
			.toggleClass( 'active', value === 'html' );

		this.embedTextWikitext.$element
			.add( this.embedWtSizeSwitch.$element )
			.toggleClass( 'active', value === 'wt' );

		this.select();

		this.currentSizeMenu.selectItem( this.currentSizeMenu.getSelectedItem() );
	};

	/**
	 * Changes the size, takes different actions based on which sort of
	 * embed is currently chosen.
	 *
	 * @param {number} width New width to set
	 * @param {number} height New height to set
	 */
	EP.changeSize = function ( width, height ) {
		var currentItem = this.embedSwitch.getSelectedItem();

		if ( currentItem === null ) {
			return;
		}

		switch ( currentItem.getData() ) {
			case 'html':
				this.setThumbnailURL( {}, width, height );
				break;
			case 'wt':
				this.updateWtEmbedText( width );
				break;
		}

		this.select();
	};

	/**
	 * Sets the value of the thumbnail URL to use for the HTML embed text.
	 *
	 * Assumes that the set method has already been called.
	 * @param {mw.mmv.model.Thumbnail} thumbnail (can be just an empty object)
	 * @param {number} width New width to set
	 * @param {number} height New height to set
	 */
	EP.setThumbnailURL = function ( thumbnail, width, height ) {
		var src;

		if ( !this.embedFileInfo ) {
			return;
		}

		src = thumbnail.url || this.embedFileInfo.src;

		// If the image dimension requested are "large", use the current image url
		if ( width > EP.LARGE_IMAGE_WIDTH_THRESHOLD  || height > EP.LARGE_IMAGE_HEIGHT_THRESHOLD ) {
			src = this.embedFileInfo.src;
		}

		this.embedTextHtml.setValue(
			this.formatter.getThumbnailHtml( this.embedFileInfo, src, width, height ) );
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
	 * Calculates possible image sizes for html snippets. It returns up to
	 * three possible snippet frame sizes (small, medium, large) plus the
	 * original image size.
	 *
	 * @param {number} width
	 * @param {number} height
	 * @returns {Object}
	 * @returns { {width: number, height: number} } return.small
	 * @returns { {width: number, height: number} } return.medium
	 * @returns { {width: number, height: number} } return.large
	 * @returns { {width: number, height: number} } return.original
	 */
	EP.getPossibleImageSizesForHtml = function ( width, height ) {
		var i, bucketName,
			currentGuess, dimensions,
			bucketWidth, bucketHeight,
			buckets = {
				'small': { width: 220, height: 145 },
				'medium': { width: 640, height: 480 },
				'large': { width: 1200, height: 900 }
			},
			sizes = {},
			bucketNames = Object.keys( buckets ),
			widthToHeight = height / width,
			heightToWidth = width / height;

		for ( i = 0; i < bucketNames.length; i++ ) {
			bucketName = bucketNames[i];
			dimensions = buckets[bucketName];
			bucketWidth = dimensions.width;
			bucketHeight = dimensions.height;

			if ( width > bucketWidth ) {
				// Width fits in the current bucket
				currentGuess = bucketWidth;

				if ( currentGuess * widthToHeight > bucketHeight ) {
					// Constrain in height, resize width accordingly
					sizes[bucketName] = {
						width: Math.round( bucketHeight * heightToWidth ),
						height: bucketHeight
					};
				} else {
					sizes[bucketName] = {
						width: currentGuess,
						height: Math.round( currentGuess * widthToHeight )
					};
				}
			} else if ( height > bucketHeight ) {
				// Height fits in the current bucket, resize width accordingly
				sizes[bucketName] = {
					width: Math.round( bucketHeight * heightToWidth ),
					height: bucketHeight
				};
			}
		}

		sizes.original = { width: width, height: height };

		return sizes;
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

		sizes.html = this.getPossibleImageSizesForHtml( width, height );
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
		var embed = this,
			htmlSizeSwitch = this.embedHtmlSizeSwitch.getMenu(),
			htmlSizeOptions = htmlSizeSwitch.getItems(),
			wtSizeSwitch = this.embedWtSizeSwitch.getMenu(),
			wtSizeOptions = wtSizeSwitch.getItems(),
			sizes = this.getSizeOptions( image.width, image.height );

		this.embedFileInfo = embedFileInfo;

		this.updateMenuOptions( sizes.html, htmlSizeOptions );
		this.updateMenuOptions( sizes.wikitext, wtSizeOptions );

		this.currentSizeMenu.selectItem( this.currentSizeMenu.getSelectedItem() );
		this.getThumbnailUrlPromise().done( function ( thumbnail ) {
			embed.setThumbnailURL( thumbnail );
			embed.select();
		} );
	};

	/**
	 * @private
	 *
	 * Gets a promise for the large thumbnail URL. This is needed because thumbnail URLs cannot
	 * be reliably guessed, even if we know the full size of the image - most of the time replacing
	 * the size in another thumbnail URL works (as long as the new size is not larger than the full
	 * size), but if the file name is very long and with the larger size the URL length would
	 * exceed a certain threshold, a different schema is used instead.
	 *
	 * FIXME document this better - why is this only needed for the large thumbnail?
	 *
	 * @return {jQuery.Promise.<string>}
	 */
	EP.getThumbnailUrlPromise = function () {
		return $( document ).triggerHandler( 'mmv-request-thumbnail',
			this.LARGE_IMAGE_WIDTH_THRESHOLD ) || $.Deferred().reject();
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
		var i, option, data, dimensions, $label;

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

				dimensions = $( '<span>' )
					.addClass( 'mw-mlb-embed-dimensions' )
					.text( mw.message( 'multimediaviewer-embed-dimensions', data.width, data.height ).text() ).get( 0 ).outerHTML;

				$label = $( '<span>' ).html(
					mw.message(
						'multimediaviewer-' + data.name + '-embed-dimensions',
						dimensions
					).text()
				);

				option.setLabel( $label );
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
		this.embedTextHtml.setValue( '' );
		this.embedTextWikitext.setValue( '' );

		this.embedHtmlSizeSwitch.getMenu().hide();
		this.embedWtSizeSwitch.getMenu().hide();
	};

	/**
	 * Selects the text in the current textbox by triggering a focus event.
	 */
	EP.select = function () {
		this.$currentMainEmbedText.focus();
	};

	mw.mmv.ui.reuse.Embed = Embed;
}( mediaWiki, jQuery, OO ) );
