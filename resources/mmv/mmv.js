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

const { Config } = require( 'mmv.bootstrap' );
const {
	HtmlUtils,
	notifyTitleNotFound,
	Api,
	ImageInfo,
	ImageModel,
	License,
	ThumbnailWidth,
	ThumbnailWidthCalculator
} = require( 'mmv.common' );
const ViewLogger = require( './logging/mmv.logging.ViewLogger.js' );
const Canvas = require( './ui/mmv.ui.canvas.js' );
const CanvasButtons = require( './ui/mmv.ui.canvasButtons.js' );
const Description = require( './ui/mmv.ui.description.js' );
const Dialog = require( './ui/mmv.ui.dialog.js' );
const UiElement = require( './ui/mmv.ui.js' );
const MetadataPanel = require( './ui/mmv.ui.metadataPanel.js' );
const MetadataPanelScroller = require( './ui/mmv.ui.metadataPanelScroller.js' );
const Permission = require( './ui/mmv.ui.permission.js' );
const StripeButtons = require( './ui/mmv.ui.stripeButtons.js' );
const TruncatableTextField = require( './ui/mmv.ui.truncatableTextField.js' );
const LightboxInterface = require( './mmv.lightboxinterface.js' );
const config = require( './config.json' );

const router = require( 'mediawiki.router' );

/**
 * Analyses the page, looks for image content and sets up the hooks
 * to manage the viewing experience of such content.
 */
class MultimediaViewer {
	constructor() {
		const apiCacheFiveMinutes = 300; // 5 min * 60 sec
		const api = new mw.Api();

		/**
		 * @type {ImageInfo}
		 * @private
		 */
		this.imageInfoProvider = new ImageInfo( api, {
			language: Config.language(),
			maxage: apiCacheFiveMinutes
		} );

		/**
		 * Image index on page.
		 *
		 * @type {number}
		 */
		this.currentIndex = 0;

		/**
		 * @type {OO.Router}
		 */
		this.router = router;
		this.comingFromHashChange = false;

		/**
		 * UI object used to display the pictures in the page.
		 *
		 * @type {LightboxInterface}
		 * @private
		 */
		this.ui = new LightboxInterface();

		/**
		 * base document title, MediaViewer will expand this
		 *
		 * @type {string}
		 */
		this.documentTitle = document.title;

		/**
		 * @type {ViewLogger}
		 */
		this.viewLogger = new ViewLogger( window );
	}

	/**
	 * Initialize the lightbox interface given an array of thumbnail
	 * objects.
	 *
	 * @param {LightboxImage[]} thumbs
	 */
	initWithThumbs( thumbs ) {
		this.thumbs = thumbs;
	}

	/**
	 * Handles resize events in viewer.
	 */
	resize() {
		const image = this.thumbs[ this.currentIndex ];

		if ( image ) {
			const imageInfoPromise = this.fetchImageInfo( image );
			imageInfoPromise.then( ( imageInfo ) => {
				this.displayRealThumbnail( imageInfo );
			} );
		}

		// This is done again later by displayRealThumbnail(), but do it now as well
		// to ensure icon positioning responds quickly when resizing.
		this.ui.updateControls( this.currentIndex, this.thumbs.length );
	}

	/**
	 * Loads a specified image.
	 *
	 * @param {LightboxImage} image
	 */
	loadImage( image ) {
		const $initialImage = $( image.thumbnail ).clone();

		const pluginsPromise = this.loadExtensionPlugins( image.filePageTitle.getExtension().toLowerCase() );

		this.currentIndex = image.index;
		this.currentImage = image;

		if ( !this.isOpen ) {
			$( document ).trigger( $.Event( 'mmv-setup-overlay' ) );
			this.ui.open();
			this.isOpen = true;
		} else {
			this.ui.empty();
		}

		this.setTitle();

		// At this point we can't show the thumbnail because we don't
		// know what size it should be. We still assign it to allow for
		// size calculations in getCurrentImageWidths, which needs to know
		// the aspect ratio
		$initialImage
			.removeAttr( 'style' )
			.removeClass()
			// Add file extension as class to display checkerboard pattern for transparent images
			.addClass( `mw-mmv-placeholder-image ${ image.filePageTitle.getExtension().toLowerCase() }` );

		const avoidBlowup = +$initialImage.attr( 'width' ) < 100 || +$initialImage.attr( 'height' ) < 100;
		if ( avoidBlowup ) {
			// avoid blowup of very small preview thumbnails
			$initialImage.hide();
		}

		this.preloadImagesMetadata();
		this.ui.canvas.set( image, $initialImage );

		const imageInfoPromise = this.fetchImageInfo( image );

		this.displayPlaceholderThumbnail( image, $initialImage );

		if ( this.currentIndex !== image.index ) {
			return;
		}

		$.when( imageInfoPromise, pluginsPromise ).then( ( imageInfo ) => {
			$( document ).trigger( $.Event( 'mmv-metadata', { viewer: this, image, imageInfo } ) );
		} );

		const initialImageLoaded = new Promise( ( resolve ) => {
			if ( $initialImage.prop( 'complete' ) || avoidBlowup ) {
				resolve();
			} else {
				$initialImage.one( 'load', resolve );
			}
		} );
		// Swapping the HTMLImageElement.src after the small image has loaded ensures that
		// the larger image one is only being displayed once it has been loaded.
		$.when( imageInfoPromise, initialImageLoaded ).then( ( imageInfo ) => {
			if ( this.currentIndex !== image.index ) {
				return;
			}
			this.displayRealThumbnail( imageInfo );
			$initialImage.removeClass( 'mw-mmv-placeholder-image' );
			if ( avoidBlowup ) {
				$initialImage.show();
			}
			this.viewLogger.attach( imageInfo.url );

		} );

		imageInfoPromise.then(
			// done
			( imageInfo ) => {
				if ( this.currentIndex !== image.index ) {
					return;
				}

				this.ui.panel.setImageInfo( image, imageInfo );

				// File reuse steals a bunch of information from the DOM, so do it last
				this.ui.setFileReuseData( imageInfo, image.caption, image.alt );

				this.ui.panel.scroller.animateMetadataOnce();
			},
			// fail
			( error ) => {
				if ( this.currentIndex === image.index ) {
					// Set title to caption or file name if caption is not available;
					// see setTitle() in mmv.ui.metadataPanel for extended caption fallback
					this.ui.panel.showError( image.caption ?
						HtmlUtils.htmlToTextWithTags( image.caption ) :
						image.filePageTitle.getNameText(), error );
				}

				return $.Deferred().reject( error );
			}
		);
	}

	displayRealThumbnail( imageInfo ) {
		this.ui.canvas.setImageAndMaxDimensions( imageInfo );
		this.ui.updateControls( this.currentIndex, this.thumbs.length );
	}

	/**
	 * Loads an image by its title
	 *
	 * @param {mw.Title} title
	 * @param {number} [position]
	 */
	loadImageByTitle( title, position ) {
		if ( !this.thumbs || !this.thumbs.length ) {
			return;
		}

		const thumb = this.thumbs.find( ( t ) => t.filePageTitle.getPrefixedText() === title.getPrefixedText() &&
			( !position || t.position === position )
		);

		if ( !thumb ) {
			this.onTitleNotFound( title );
			return;
		}

		this.loadImage( thumb );
	}

	/**
	 * When the image to load is not present on the current page,
	 * a notification is shown to the user and the MMV is closed.
	 *
	 * @param {mw.Title} title
	 * @private
	 */
	onTitleNotFound( title ) {
		this.close();
		notifyTitleNotFound( title );
	}

	/**
	 * Display the thumbnail from the page
	 *
	 * @param {LightboxImage} image
	 * @param {jQuery} $initialImage The thumbnail from the page
	 * @param {boolean} [recursion=false] for internal use, never set this when calling from outside
	 */
	displayPlaceholderThumbnail( image, $initialImage, recursion ) {
		const size = { width: image.originalWidth, height: image.originalHeight };

		// Width/height of the original image are added to the HTML by MediaViewer via a PHP hook,
		// and can be missing in exotic circumstances, e. g. when the extension has only been
		// enabled recently and the HTML cache has not cleared yet. If that is the case, we need
		// to fetch the size from the API first.
		if ( !size.width || !size.height ) {
			if ( recursion ) {
				// this should not be possible, but an infinite recursion is nasty
				// business, so we make a sense check
				throw new Error( 'MediaViewer internal error: displayPlaceholderThumbnail recursion' );
			}
			this.fetchImageInfo( image ).then( ( imageInfo ) => {
				// Make sure the user has not navigated away while we were waiting for the size
				if ( this.currentIndex === image.index ) {
					image.originalWidth = imageInfo.width;
					image.originalHeight = imageInfo.height;
					this.displayPlaceholderThumbnail( image, $initialImage, true );
				}
			} );
		} else {
			this.ui.canvas.maybeDisplayPlaceholder( size, $initialImage );
		}
	}

	/**
	 * Preload metadata for current and next image.
	 */
	preloadImagesMetadata() {
		const current = this.currentIndex;
		const next = this.currentIndex + 1;
		[ current, next ].filter( ( i ) => i < this.thumbs.length ).forEach( ( i ) => {
			const lightboxImage = this.thumbs[ i ];
			this.fetchImageInfo( lightboxImage );
		} );
	}

	/**
	 * Loads all the size-independent information needed by the lightbox (image metadata, repo
	 * information).
	 *
	 * @param {LightboxImage} image
	 * @return {jQuery.Promise.<ImageModel>}
	 */
	fetchImageInfo( image ) {
		// Pass the handler-specific parameter (multilingual SVG `lang`, PDF `page`) so the
		// API renders the thumbnail URLs as the same variant.
		const urlParam = image.getUrlParam();
		return this.imageInfoProvider.get( image.filePageTitle, urlParam ? urlParam.urlParam : undefined );
	}

	/**
	 * Loads an image at a specified index in the viewer's thumbnail array.
	 *
	 * @param {number} index
	 */
	loadIndex( index ) {
		if ( index < this.thumbs.length && index >= 0 ) {
			this.viewLogger.recordViewDuration();

			const thumb = this.thumbs[ index ];
			this.loadImage( thumb );
			router.navigateTo( null, {
				path: Config.getMediaHash( thumb.filePageTitle, thumb.position ),
				useReplaceState: true
			} );
		}
	}

	/**
	 * Opens the last image
	 */
	firstImage() {
		this.loadIndex( 0 );
	}

	/**
	 * Opens the last image
	 */
	lastImage() {
		this.loadIndex( this.thumbs.length - 1 );
	}

	/**
	 * Opens the next image
	 */
	nextImage() {
		if ( this.currentIndex === this.thumbs.length - 1 ) {
			this.firstImage();
		} else {
			this.loadIndex( this.currentIndex + 1 );
		}
	}

	/**
	 * Opens the previous image
	 */
	prevImage() {
		if ( this.currentIndex === 0 ) {
			this.lastImage();
		} else {
			this.loadIndex( this.currentIndex - 1 );
		}
	}

	/**
	 * Handles close event coming from the lightbox
	 */
	close() {
		this.viewLogger.recordViewDuration();
		this.viewLogger.unattach();

		if ( this.comingFromHashChange ) {
			this.comingFromHashChange = false;
		} else {
			this.router.back();
		}
		// update title after route change, see T225387
		document.title = this.createDocumentTitle( null );

		// This has to happen after the hash reset, because setting the hash to # will reset the page scroll
		$( document ).trigger( $.Event( 'mmv-cleanup-overlay' ) );

		this.isOpen = false;
	}

	/**
	 * Updates the page title to reflect the current title.
	 */
	setTitle() {
		// update title after route change, see T225387
		document.title = this.createDocumentTitle( this.currentImage && this.currentImage.filePageTitle );
	}

	/**
	 * Creates a string which can be shown as document title (the text at the top of the browser window).
	 *
	 * @param {mw.Title|null} imageTitle the title object for the image which is displayed; null when the
	 *  viewer is being closed
	 * @return {string}
	 */
	createDocumentTitle( imageTitle ) {
		if ( imageTitle ) {
			return `${ imageTitle.getNameText() } - ${ this.documentTitle }`;
		} else {
			return this.documentTitle;
		}
	}

	/**
	 * Fired when the viewer is closed. This is used by the lightbox to notify the main app.
	 *
	 * @event MultimediaViewer#mmv-close
	 */

	/**
	 * Fired when the user requests the next image.
	 *
	 * @event MultimediaViewer#mmv-next
	 */

	/**
	 * Fired when the user requests the previous image.
	 *
	 * @event MultimediaViewer#mmv-prev
	 */

	/**
	 * Fired when the screen size changes. Debounced to avoid continuous triggering while resizing with a mouse.
	 *
	 * @event MultimediaViewer#mmv-resize-end
	 */

	/**
	 * Registers all event handlers
	 */
	setupEventHandlers() {
		this.ui.connect( this, {
			first: 'firstImage',
			last: 'lastImage',
			next: 'nextImage',
			prev: 'prevImage'
		} );

		$( document ).on( 'mmv-close.mmvp', () => {
			this.close();
		} ).on( 'mmv-resize-end.mmvp', () => {
			this.resize();
		} ).on( 'mmv-viewfile.mmvp', () => {
			this.fetchImageInfo( this.currentImage ).then( ( imageInfo ) => {
				document.location = imageInfo.url;
			} );
		} );
	}

	/**
	 * Unregisters all event handlers. Currently only used in tests.
	 */
	cleanupEventHandlers() {
		$( document ).off( 'mmv-close.mmvp mmv-resize-end.mmvp' );

		this.ui.disconnect( this );
	}

	/**
	 * Loads the RL module defined for a given file extension, if any
	 *
	 * @param {string} extension File extension
	 * @return {jQuery.Promise}
	 */
	loadExtensionPlugins( extension ) {
		if ( !( extension in config.extensions ) || config.extensions[ extension ] === 'default' ) {
			return $.Deferred().resolve();
		}

		return mw.loader.using( config.extensions[ extension ] );
	}
}

module.exports = {
	Api,
	Canvas,
	CanvasButtons,
	Description,
	Dialog,
	HtmlUtils,
	ImageInfo,
	ImageModel,
	License,
	LightboxInterface,
	MetadataPanel,
	MetadataPanelScroller,
	MultimediaViewer,
	Permission,
	StripeButtons,
	ThumbnailWidth,
	ThumbnailWidthCalculator,
	TruncatableTextField,
	UiElement,
	ViewLogger
};
