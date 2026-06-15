const { createMwApp, ref, computed } = require( 'vue' );
const App = require( './App.vue' );
const { Config } = require( 'mmv.bootstrap' );
const { ImageInfo, notifyTitleNotFound } = require( 'mmv.common' );
const { getLargerThumbnailUrl } = require( './thumbnailGuessing.js' );

/** @typedef {import('./types').LightboxImage} LightboxImage */
/** @typedef {import('./types').ImageModel} ImageModel */
/** @typedef {import('./types').ViewerState} ViewerState */

/**
 * Delay (ms) before prefetching neighbors so that these
 * requests don't compete for bandwidth with the image
 * actually being viewed.
 */
const PREFETCH_DELAY = 250;

/**
 * Delay (ms) before showing the loading indicator.
 * Loads that resolve within this window swap straight in,
 * so quick navigation never flashes a loading indicator.
 */
const LOADING_INDICATOR_DELAY = 150;

/**
 * Beta image viewer using Vue 3 and Codex.
 * Implements the interface expected by MultimediaViewerBootstrap so it can
 * be used as a drop-in replacement for the legacy MultimediaViewer class.
 */
class BetaViewer {
	constructor() {
		/** @type {boolean} */
		this.isOpen = false;

		/**
		 * Set by bootstrap during hash-driven navigation
		 *
		 * @type {boolean}
		 */
		this.comingFromHashChange = false;

		/**
		 * Original document title, restored on close
		 *
		 * @type {string}
		 */
		this.documentTitle = document.title;

		/**
		 * LightboxImage objects for the current page
		 *
		 * @type {LightboxImage[]}
		 */
		this.thumbs = [];

		/**
		 * The currently displayed LightboxImage
		 *
		 * @type {LightboxImage|null}
		 */
		this.currentImage = null;

		/**
		 * The mounted Vue application instance
		 *
		 * @type {Object|null}
		 */
		this.app = null;

		/**
		 * The mount point element
		 *
		 * @type {HTMLElement|null}
		 */
		this.mountEl = null;

		/**
		 * Lazily created provider (caches responses)
		 *
		 * @type {ImageInfo|null}
		 */
		this.imageInfoProvider = null;

		/**
		 * Handle to abort any pending image request, plus the pending prefetch
		 * and loading-indicator timers.
		 *
		 * @type {?{controller: ?AbortController, prefetchTimer: ?number, loadingTimer: ?number}}
		 */
		this.inFlight = null;

		// Reactive state shared with the Vue app via provide/inject.
		// We use Vue.ref() so that changes here propagate to the template.
		/** @type {ViewerState} */
		this.state = {
			image: ref( null ),
			imageInfo: ref( null ),
			displayUrl: ref( '' ),
			thumbs: ref( [] ),
			isOpen: ref( false ),
			chromeVisible: ref( true ),
			errorMessage: ref( null ),
			isLoading: ref( false )
		};

		// Provide a ui object with unattach() so bootstrap can close
		// the viewer via viewer.ui.unattach() on non-MMV hash changes.
		this.ui = {
			unattach: () => {
				this.close();
			}
		};
	}

	/**
	 * Called by bootstrap after instantiation.
	 * Sets up keyboard and document-level event handlers.
	 */
	setupEventHandlers() {
		this.onKeyDown = ( e ) => {
			if ( !this.isOpen ) {
				return;
			}

			if ( e.key === 'Escape' ) {
				this.close();
			} else if ( e.key === 'ArrowLeft' ) {
				this.prevImage();
			} else if ( e.key === 'ArrowRight' ) {
				this.nextImage();
			}
		};

		document.addEventListener( 'keydown', this.onKeyDown );
	}

	/**
	 * Called by bootstrap with all the LightboxImage objects found on the page.
	 *
	 * @param {LightboxImage[]} thumbs
	 */
	initWithThumbs( thumbs ) {
		this.thumbs = thumbs;
		this.state.thumbs.value = thumbs;
	}

	/**
	 * Load and display an image by its file title.
	 * Called by bootstrap.route() when navigating via hash.
	 *
	 * @param {mw.Title} fileTitle
	 * @param {number} [position]
	 */
	loadImageByTitle( fileTitle, position ) {
		const prefixed = fileTitle.getPrefixedText();
		const matches = this.thumbs.filter(
			( t ) => t.filePageTitle.getPrefixedText() === prefixed
		);

		let image;

		if ( position && matches.length >= position ) {
			image = matches[ position - 1 ];
		} else {
			image = matches[ 0 ];
		}
		if ( image ) {
			this.loadImage( image );
		} else {
			this.onTitleNotFound( fileTitle );
		}
	}

	/**
	 * Called when the hash navigates to a file title not present on the current page.
	 * Closes the viewer and notifies the user with a link to the file page.
	 *
	 * @param {mw.Title} title
	 */
	onTitleNotFound( title ) {
		// Clear the URL hash to prevent navigation to non-existent title
		location.hash = '';
		this.close();
		notifyTitleNotFound( title );
	}

	/**
	 * Display the given LightboxImage.
	 *
	 * @param {LightboxImage} image
	 */
	loadImage( image ) {
		// Cancel any previous in-flight requests
		this.cancelInFlight();

		// Set up an AbortController (if supported) to cancel
		// this request in the future if necessary
		let controller = null;
		if ( typeof AbortController !== 'undefined' ) {
			controller = new AbortController();
		}

		this.inFlight = { controller, prefetchTimer: null, loadingTimer: null };
		this.currentImage = image;
		this.state.errorMessage.value = null;
		this.state.isLoading.value = true;
		this.open();

		if ( !this.imageInfoProvider ) {
			this.imageInfoProvider = new ImageInfo(
				new mw.Api(),
				{ language: mw.config.get( 'wgUserLanguage' ) }
			);
		}

		// Show the loading indicator only if the image takes a noticeable
		// moment to arrive: blank the displayed image after a short delay
		// (revealing App.vue's progress bar). The Promise.all below cancels
		// this if it resolves first, so quick navigation never flashes it.
		this.inFlight.loadingTimer = setTimeout( () => {
			if ( this.currentImage === image ) {
				this.state.image.value = null;
			}
		}, LOADING_INDICATOR_DELAY );

		const infoPromise = this.imageInfoProvider.get( image.filePageTitle );
		const thumbPromise = this.loadLargerThumbnail( image, controller && controller.signal );

		Promise.all( [ infoPromise, thumbPromise ] ).then( ( [ imageData, largerUrl ] ) => {
			if ( this.currentImage === image ) {
				clearTimeout( this.inFlight.loadingTimer );
				this.state.imageInfo.value = imageData;
				this.state.displayUrl.value = largerUrl || image.src;
				this.state.image.value = image;
				this.state.isLoading.value = false;
			}
		} ).catch( () => {
			if ( this.currentImage === image ) {
				// The load failed: tear down this navigation's in-flight work so
				// the pending prefetch timer doesn't fire and any still-loading
				// thumbnail download is aborted.
				this.cancelInFlight();
				// Remove the failed image file from the cache to allow
				// re-trying a fresh request.
				this.imageInfoProvider.invalidate( image.filePageTitle );
				// Clear any image kept on screen from before the delay so the
				// error state doesn't pair a stale image with the toast.
				this.state.image.value = null;
				this.state.isLoading.value = false;
				this.showError( mw.msg( 'multimediaviewer-thumbnail-error' ) );
			}
		} );

		// Pre-fetch neighbor images silently in the background, but do so after
		// a short delay so that we don't compete with the primary image request
		// in environments where bandwidth is constrained.
		this.inFlight.prefetchTimer = setTimeout(
			() => this.prefetchAdjacent( image ),
			PREFETCH_DELAY
		);
	}

	/**
	 * Cancel the in-flight image request from the most recent
	 * loadImage() call
	 */
	cancelInFlight() {
		if ( this.inFlight ) {
			if ( this.inFlight.controller ) {
				this.inFlight.controller.abort();
			}

			clearTimeout( this.inFlight.prefetchTimer );
			clearTimeout( this.inFlight.loadingTimer );
			this.inFlight = null;
		}
	}

	/**
	 * Display an error message.
	 *
	 * @param {string} message
	 */
	showError( message ) {
		this.state.errorMessage.value = message;
	}

	/**
	 * Preload a larger thumbnail for the given image.
	 *
	 * @param {LightboxImage} image
	 * @param {AbortSignal} [signal] Aborts the in-flight download when fired
	 * @return {Promise<string|null>} Resolves with the URL, or null on failure
	 */
	loadLargerThumbnail( image, signal ) {
		const url = getLargerThumbnailUrl( image );

		if ( !url ) {
			return Promise.resolve( null );
		}

		return new Promise( ( resolve ) => {
			if ( signal && signal.aborted ) {
				resolve( null );
				return;
			}

			const loader = new Image();

			const onabort = () => {
				// User navigated away: setting src to empty aborts the in-flight
				// request, and we resolve null so the caller falls back to image.src.
				loader.src = '';
				resolve( null );
			};

			loader.onload = () => {
				if ( signal ) {
					signal.removeEventListener( 'abort', onabort );
				}
				resolve( url );
			};

			loader.onerror = () => {
				if ( signal ) {
					signal.removeEventListener( 'abort', onabort );
				}
				// Best-effort: resolve null (not reject) so a failed larger thumbnail
				// degrades to image.src. Also fires post-abort, where resolve is a no-op.
				resolve( null );
			};

			if ( signal ) {
				signal.addEventListener( 'abort', onabort, { once: true } );
			}

			loader.src = url;
		} );
	}

	/**
	 * Prefetch thumbnails and imageInfo for the adjacent images so
	 * navigation feels instant.
	 *
	 * @param {LightboxImage} image The currently displayed image
	 */
	prefetchAdjacent( image ) {
		if ( this.thumbs.length <= 1 ) {
			return;
		}

		const idx = this.thumbs.indexOf( image );

		if ( idx < 0 ) {
			return;
		}

		const neighbors = [
			this.thumbs[ ( idx + 1 ) % this.thumbs.length ],
			this.thumbs[ ( idx - 1 + this.thumbs.length ) % this.thumbs.length ]
		];

		for ( const neighbor of neighbors ) {
			// Warm the imageInfo provider cache (promise is cached, no duplicate calls)
			this.imageInfoProvider.get( neighbor.filePageTitle );

			// Warm the browser image cache with a larger thumbnail
			const url = getLargerThumbnailUrl( neighbor );

			if ( url ) {
				( new Image() ).src = url;
			}
		}
	}

	/**
	 * Navigate to the next image.
	 */
	nextImage() {
		if ( !this.currentImage || this.thumbs.length <= 1 ) {
			return;
		}

		const idx = this.thumbs.indexOf( this.currentImage );
		const next = ( idx + 1 ) % this.thumbs.length;
		const image = this.thumbs[ next ];
		const hash = Config.getMediaHash( image.filePageTitle, image.position );

		location.hash = hash;
	}

	/**
	 * Navigate to the previous image.
	 */
	prevImage() {
		if ( !this.currentImage || this.thumbs.length <= 1 ) {
			return;
		}

		const idx = this.thumbs.indexOf( this.currentImage );
		const prev = ( idx - 1 + this.thumbs.length ) % this.thumbs.length;
		const image = this.thumbs[ prev ];
		const hash = Config.getMediaHash( image.filePageTitle, image.position );

		location.hash = hash;
	}

	/**
	 * Open the viewer overlay and mount the Vue app if needed.
	 */
	open() {
		if ( !this.app ) {
			this.mountEl = document.createElement( 'div' );
			this.mountEl.id = 'mmv-beta-root';

			// mw-mmv-wrapper is whitelisted in mmv.bootstrap.less so it stays
			// visible when body.mw-mmv-lightbox-open hides other children.
			this.mountEl.classList.add( 'mw-mmv-wrapper' );
			document.body.appendChild( this.mountEl );

			this.app = createMwApp( App );
			this.app.provide( 'state', this.state );
			this.app.provide( 'close', () => this.close() );
			this.app.provide( 'nextImage', () => this.nextImage() );
			this.app.provide( 'prevImage', () => this.prevImage() );
			this.app.provide( 'toggleChrome', () => {
				this.state.chromeVisible.value = !this.state.chromeVisible.value;
			} );
			this.app.provide( 'showError', ( message ) => this.showError( message ) );
			this.app.provide( 'hasError', computed( () => !!this.state.errorMessage.value ) );
			this.app.provide( 'reload', () => {
				if ( this.currentImage ) {
					this.loadImage( this.currentImage );
				}
			} );
			this.app.mount( this.mountEl );
		}

		this.isOpen = true;
		this.state.isOpen.value = true;
		this.documentTitle = this.documentTitle || document.title;

		if ( this.currentImage ) {
			document.title = this.createDocumentTitle( this.currentImage.filePageTitle );
		}

		$( document ).trigger( 'mmv-setup-overlay' );
	}

	/**
	 * Close the viewer overlay.
	 */
	close() {
		// Trigger cleanup unconditionally because loadViewer() calls
		// setupOverlay() before the viewer module loads, so the overlay may be
		// present even when close() is called before the viewer was opened
		// (e.g. title not found on a fresh page load).
		$( document ).trigger( 'mmv-cleanup-overlay' );

		if ( !this.isOpen ) {
			return;
		}

		this.cancelInFlight();
		this.isOpen = false;
		this.state.isOpen.value = false;
		this.state.chromeVisible.value = true;
		this.currentImage = null;
		this.state.image.value = null;
		this.state.imageInfo.value = null;
		this.state.displayUrl.value = '';
		this.state.errorMessage.value = null;
		this.state.isLoading.value = false;

		document.title = this.createDocumentTitle( null );

		if ( !this.comingFromHashChange ) {
			// Reset the hash so the viewer doesn't re-open on back navigation
			location.hash = '';
		}
	}

	/**
	 * Creates a document title string.
	 *
	 * @param {mw.Title|null} imageTitle The title of the displayed image, or null when closing
	 * @return {string}
	 */
	createDocumentTitle( imageTitle ) {
		if ( imageTitle ) {
			return imageTitle.getNameText() + ' - ' + this.documentTitle;
		}

		return this.documentTitle;
	}
}

module.exports = BetaViewer;
