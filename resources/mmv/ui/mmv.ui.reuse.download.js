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
	var DP;

	/**
	 * UI component that provides functionality to download the media asset displayed.
	 *
	 * @class mw.mmv.ui.reuse.Download
	 * @extends mw.mmv.ui.reuse.Tab
	 * @constructor
	 * @param {jQuery} $container
	 */
	function Download( $container ) {
		Download['super'].call( this, $container );

		/** @property {mw.mmv.ui.reuse.Utils} utils - */
		this.utils = new mw.mmv.ui.reuse.Utils();

		this.$pane.addClass( 'mw-mmv-download-pane' );
		this.$pane.appendTo( this.$container );

		this.createDownloadButton( this.$pane );
		this.createSizePulldownMenu( this.$pane );
		this.createPreviewLink( this.$pane );

		this.formatter = new mw.mmv.EmbedFileFormatter();
		this.currentAttrView = 'plain';
		this.createAttributionButton( this.$pane );

		/**
		 * Default item for the size menu.
		 * @property {OO.ui.MenuItemWidget}
		 */
		this.defaultItem = this.downloadSizeMenu.getMenu().getSelectedItem();

		/** @property {mw.mmv.model.Image|null} Image the download button currently points to. */
		this.image = null;
	}
	oo.inheritClass( Download, mw.mmv.ui.reuse.Tab );
	DP = Download.prototype;


	/**
	 * Creates download split button. It is a link with the "download" property set plus an
	 * arrow that allows the user to select the image size desired. The "download" property
	 * triggers native browser downloading in browsers that support it. The fallback is the
	 * 'download' parameter which instructs the server to send the right headers so the browser
	 * downloads the file instead of just displaying it. If all this fails, the image will appear
	 * in another window/tab.
	 *
	 * @param {jQuery} $container
	 */
	DP.createDownloadButton = function ( $container ) {
		var self = this;

		// TODO:  Use oojs-ui constructive button widget instead
		this.$downloadButton = $( '<a>' )
			.attr( 'target', '_blank' )
			.attr( 'download', '' )
			.addClass( 'mw-ui-button mw-ui-constructive mw-mmv-download-button' )
			.click( function ( e ) {
				self.trackLinkClick.call( this, 'download', e );
			} );

		this.$selectionArrow = $( '<span>' )
			.addClass( 'mw-ui-button mw-mmv-download-select-menu' )
			.append(
				$( '<span>' )
					.addClass( 'mw-mmv-download-image-size-name' )
					.html( '&nbsp;' )
			)
			.append(
				$( '<span>' )
					.addClass( 'mw-mmv-download-image-size' )
					.html( '&nbsp;' )
			);

		$container
			.append( this.$downloadButton )
			.append( this.$selectionArrow );
	};

	/**
	 * Creates pulldown menu to select image sizes.
	 *
	 * @param {jQuery} $container
	 */
	DP.createSizePulldownMenu = function ( $container ) {
		this.downloadSizeMenu = this.utils.createPulldownMenu(
			[ 'original', 'small', 'medium', 'large' ],
			[ 'mw-mmv-download-size' ],
			'original'
		);

		this.downloadSizeMenu.getMenu().on( 'select', function( item ) {
			mw.mmv.actionLogger.log( 'download-select-menu-' + item.data.name );
		} );

		$container.append( this.downloadSizeMenu.$element );
	};

	/**
	 * Creates preview link.
	 *
	 * @param {jQuery} $container
	 */
	DP.createPreviewLink = function ( $container ) {
		var self = this;

		this.$previewLink = $( '<a>' )
			.attr( 'target', '_blank' )
			.addClass( 'mw-mmv-download-preview-link' )
			.text( mw.message( 'multimediaviewer-download-preview-link-title' ).text() )
			.appendTo( $container )
			.click( function ( e ) {
				self.trackLinkClick.call( this, 'download-view-in-browser', e );
			} );
	};

	DP.createAttributionButton = function ( $container ) {
		var dl = this,
			attributionInput = new oo.ui.TextInputWidget( {
				classes: [ 'mw-mmv-download-attr-input' ],
				readOnly: true
			} ),
			attributionSwitch = new oo.ui.ButtonSelectWidget( {
				classes: [ 'mw-mmv-download-attr-select' ]
			} ),
			plainOption = new oo.ui.ButtonOptionWidget( 'plain', {
				label: mw.message( 'multimediaviewer-attr-plain' ).text()
			} ),
			htmlOption = new oo.ui.ButtonOptionWidget( 'html', {
				label: mw.message( 'multimediaviewer-attr-html' ).text()
			} );

		attributionSwitch.addItems( [
			plainOption,
			htmlOption
		] );

		attributionSwitch.selectItem( plainOption );

		attributionSwitch.on( 'select', function ( selection ) {
			dl.selectAttribution( selection.getData() );

			dl.attributionInput.$element.find( 'input' ).focus();
		} );

		this.$attributionSection = $( '<div>' )
			.addClass( 'mw-mmv-download-attribution mw-mmv-download-attribution-collapsed' )
			.appendTo( $container );

		this.$attributionCta = $( '<div>' )
			.addClass( 'mw-mmv-download-attribution-cta' )
			.append(
				$( '<p>' )
					.addClass( 'mw-mmv-download-attribution-cta-header' )
					.text( mw.message( 'multimediaviewer-download-attribution-cta-header' ).text() ),
				$( '<p>' )
					.addClass( 'mw-mmv-download-attribution-cta-invite' )
					.text( mw.message( 'multimediaviewer-download-attribution-cta' ).text() )
			)
			.click( function () {
				dl.$attributionSection.removeClass( 'mw-mmv-download-attribution-collapsed' );
				dl.attributionInput.$element.find( 'input' ).focus();
			} )
			.appendTo( this.$attributionSection );

		this.$attributionHow = $( '<div>' )
			.addClass( 'mw-mmv-download-attribution-how' )
			.append(
				$( '<p>' )
					.addClass( 'mw-mmv-download-attribution-how-header' )
					.text( mw.message( 'multimediaviewer-download-attribution-cta-header' ).text() ),
				attributionInput.$element,
				attributionSwitch.$element,
				$( '<p>' )
					.addClass( 'mw-mmv-download-attribution-close-button' )
					.click( function () {
						dl.$attributionSection.addClass( 'mw-mmv-download-attribution-collapsed' );
					} )
					.text( ' ' )
			)
			.appendTo( this.$attributionSection );

		this.attributionInput = attributionInput;
	};

	/**
	 * Selects the specified attribution type.
	 * @param {'plain'|'html'} [name='plain'] The attribution type to use.
	 */
	DP.selectAttribution = function ( name ) {
		this.currentAttrView = name;

		if ( this.currentAttrView === 'html' ) {
			this.attributionInput.setValue( this.htmlCredit );
		} else {
			this.attributionInput.setValue( this.textCredit );
		}
	};

	/**
	 * Registers listeners.
	 */
	DP.attach = function () {
		var download = this;

		// Register handlers for switching between file sizes
		this.downloadSizeMenu.getMenu().on( 'choose', $.proxy( download.handleSizeSwitch, download ) );
		this.$selectionArrow.on( 'click', function () {
			download.downloadSizeMenu.$element.click();
		} );

		this.attributionInput.$element.find( 'input' )
			.on( 'focus', this.selectAllOnEvent )
			.on( 'mousedown click', this.onlyFocus );
	};

	/**
	 * Clears listeners.
	 */
	DP.unattach = function () {
		this.constructor['super'].prototype.unattach.call( this );

		this.downloadSizeMenu.getMenu().off( 'choose' );
		this.$selectionArrow.off( 'click' );

		this.attributionInput.$element.find( 'input' )
			.off( 'focus mousedown click' );
	};

	/**
	 * Handles size menu change events.
	 *
	 * @param {OO.ui.MenuItemWidget} item
	 */
	DP.handleSizeSwitch = function ( item ) {
		var download = this,
			value = item.getData();

		if ( value.name === 'original' && this.image !== null ) {
			this.setDownloadUrl( this.image.url );
			this.setButtonText( value.name, this.getExtensionFromUrl( this.image.url ),
				value.width, value.height );
		} else {
			// Disable download while we get the image
			this.$downloadButton.addClass( 'disabledLink' );
			// Set a temporary message. It will be updated once we have the file type.
			this.setButtonText( value.name, this.imageExtension, value.width, value.height );

			this.utils.getThumbnailUrlPromise( value.width ).done( function ( thumbnail ) {
				download.setDownloadUrl( thumbnail.url );
				download.setButtonText( value.name, download.getExtensionFromUrl( thumbnail.url ),
					value.width, value.height );
			} );
		}
	};

	/**
	 * Sets the URL on the download button.
	 * @param {string} url
	 */
	DP.setDownloadUrl = function ( url ) {
		this.$downloadButton.attr( 'href', url + '?download' );
		this.$previewLink.attr( 'href', url );

		// Re-enable download
		this.$downloadButton.removeClass( 'disabledLink' );
	};

	/**
	 * Sets the text of the download button.
	 * @param {string} sizeClass A size class such as 'small'
	 * @param {string} extension file extension
	 * @param {number} width
	 * @param {number} height
	 */
	DP.setButtonText = function( sizeClass, extension, width, height ) {
		var sizeClasMessage, sizeMessage, dimensionMessage;

		sizeClasMessage = mw.message( 'multimediaviewer-download-' + sizeClass + '-button-name' ).text();
		dimensionMessage = mw.message( 'multimediaviewer-embed-dimensions', width, height ).text();
		sizeMessage = mw.message( 'multimediaviewer-embed-dimensions-with-file-format',
			dimensionMessage, extension ).text();

		// Update button label and size strings to reflect new selected size
		this.$downloadButton.html(
			'<span class="mw-mmv-download-image-size-name">' + sizeClasMessage + '</span>'
				+ '<span class="mw-mmv-download-image-size">' + sizeMessage + '</span>'
		);
	};

	/**
	 * Sets the text in the attribution input element.
	 * @param {mw.mmv.model.EmbedFileInfo} embed
	 */
	DP.setAttributionText = function ( embed ) {
		this.htmlCredit = this.formatter.getCreditHtml( embed );
		this.textCredit = this.formatter.getCreditText( embed );
		this.selectAttribution( this.currentAttrView );
	};

	/**
	 * Chops off the extension part of an URL.
	 * @param {string} url
	 */
	DP.getExtensionFromUrl = function( url ) {
		var urlParts = url.split( '.' );
		return urlParts[urlParts.length - 1];
	};

	/**
	 * Sets the data on the element.
	 *
	 * @param {mw.mmv.model.Image} image
	 * @param {mw.mmv.model.Repo} repo
	 */
	DP.set = function ( image, repo ) {
		var sizeOptions = this.downloadSizeMenu.getMenu().getItems(),
			sizes = this.utils.getPossibleImageSizesForHtml( image.width, image.height );

		this.image = image;

		this.utils.updateMenuOptions( sizes, sizeOptions );

		this.downloadSizeMenu.$element.addClass( 'active' );

		// Note: This extension will not be the real one for file types other than: png/gif/jpg/jpeg
		this.imageExtension = image.title.getExtension().toLowerCase();

		// Reset size menu to default item and update download button label now that we have the info
		this.downloadSizeMenu.getMenu().chooseItem( this.defaultItem );

		if ( image && repo ) {
			this.setAttributionText( new mw.mmv.model.EmbedFileInfo( image, repo ) );
		}
	};

	/**
	 * @inheritdoc
	 */
	DP.empty = function () {
		this.downloadSizeMenu.getMenu().toggle( false );
		this.downloadSizeMenu.$element.removeClass( 'active' );

		this.$downloadButton.attr( 'href', '' );
		this.$previewLink.attr( 'href', '' );
		this.imageExtension = undefined;

		this.image = null;
	};

	DP.show = function () {
		mw.mmv.ui.reuse.Tab.prototype.show.call( this );
		this.$container.addClass( 'mw-mmv-reuse-download-active' );
	};

	DP.hide = function () {
		mw.mmv.ui.reuse.Tab.prototype.hide.call( this );
		this.$container.removeClass( 'mw-mmv-reuse-download-active' );
	};

	mw.mmv.ui.reuse.Download = Download;
}( mediaWiki, jQuery, OO ) );
