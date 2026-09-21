/**
 * Mobile image carousel initialization and display controls.
 *
 * @module mmv.carousel
 */

'use strict';

const SESSION_STORAGE_KEY = 'multimediaviewer.carousel.hidden';

function isCarouselHidden() {
	return !!( mw.storage && mw.storage.session && mw.storage.session.get( SESSION_STORAGE_KEY ) === '1' );
}

function setCarouselHidden( isHidden ) {
	if ( !mw.storage || !mw.storage.session ) {
		return;
	}
	if ( isHidden ) {
		mw.storage.session.set( SESSION_STORAGE_KEY, '1' );
	} else {
		mw.storage.session.remove( SESSION_STORAGE_KEY );
	}
}

const updateHiddenState = ( nextHiddenState, options = {} ) => {
	const { persist = true } = options;
	const carouselRoot = document.getElementById( 'mmv-carousel-root' );
	if ( !carouselRoot ) {
		return;
	}

	carouselRoot.classList.toggle( 'mmv-carousel--collapsed', nextHiddenState );
	if ( persist ) {
		setCarouselHidden( nextHiddenState );
	}
};
function loadDeferredImage( img ) {
	if ( !img.dataset.src ) {
		return;
	}
	// Keep the placeholder background until pixels have arrived, so
	// transparent images render as usual once loaded.
	img.addEventListener( 'load', () => {
		img.classList.remove( 'mmv-carousel__item-image--pending' );
	}, { once: true } );
	if ( img.dataset.sizes ) {
		img.sizes = img.dataset.sizes;
		delete img.dataset.sizes;
	}
	if ( img.dataset.srcset ) {
		img.srcset = img.dataset.srcset;
		delete img.dataset.srcset;
	}
	img.src = img.dataset.src;
	delete img.dataset.src;
}

function loadDeferredImages( deferredImages ) {
	if ( !deferredImages.length ) {
		return;
	}

	deferredImages = Array.from( deferredImages );

	if ( 'IntersectionObserver' in window ) {
		// Only load a tile once it has stayed within the lookahead area
		// for a beat: a fast fling sweeps every tile through the observer
		// box, and promoting them all would queue a strip's worth of
		// downloads ahead of the tiles the reader actually lands on.
		const SUSTAINED_INTERSECTION_MS = 150;
		const pendingTimers = new Map();
		const observer = new IntersectionObserver( ( entries ) => {
			entries.forEach( ( entry ) => {
				const img = entry.target;
				if ( entry.isIntersecting ) {
					if ( !pendingTimers.has( img ) ) {
						pendingTimers.set( img, setTimeout( () => {
							pendingTimers.delete( img );
							loadDeferredImage( img );
							observer.unobserve( img );
						}, SUSTAINED_INTERSECTION_MS ) );
					}
				} else if ( pendingTimers.has( img ) ) {
					clearTimeout( pendingTimers.get( img ) );
					pendingTimers.delete( img );
				}
			} );
		}, {
			// Observe against the horizontally scrolling items list so the
			// floating header stays pinned to the carousel frame.
			root: document.querySelector( '.mmv-carousel__items' ) || document.getElementById( 'mmv-carousel-root' ),
			// Horizontal lookahead of roughly three items, so images are
			// ready by the time the reader scrolls them into view.
			rootMargin: '0px 500px'
		} );
		deferredImages.forEach( ( img ) => observer.observe( img ) );
	} else {
		deferredImages.forEach( loadDeferredImage );
	}
}

// TODO(image-carousel-retest): Remove treatment options after choosing the permanent UI.
// Includes caption filtering and showJumpLink injection below; keep normal carousel behavior.
function init( carouselItems, options ) {
	if ( !carouselItems.length ) {
		return;
	}

	const Vue = require( 'vue' );
	const App = require( './App.vue' );
	const { getInstrumentProxy } = require( './instrument.js' );

	const fileTitleRef = Vue.ref( null );
	const fileImageRef = Vue.ref( null );
	const fileCaptionRef = Vue.ref( null );

	const container = document.createElement( 'div' );
	container.setAttribute( 'id', 'mmv-carousel-detail' );
	document.getElementById( 'content' ).appendChild( container );
	const app = Vue.createMwApp( App );
	const instrument = getInstrumentProxy( 'image-browsing' );
	app.provide( 'instrument', instrument );
	app.provide( 'titleRef', fileTitleRef );
	app.provide( 'imageRef', fileImageRef );
	app.provide( 'captionRef', fileCaptionRef );
	app.provide( 'showJumpLink', options.showJumpLink );
	app.mount( '#mmv-carousel-detail' );

	// Items beyond the first few are server-rendered without a src
	// (data-src/data-srcset instead), because native loading=lazy leaves the
	// preload lookahead to the browser, which fetches images far beyond the
	// scrollport. Load them ourselves as they approach the visible area.
	const deferredImages = document.querySelectorAll( '.mmv-carousel__item img[data-src]' );
	loadDeferredImages( deferredImages );

	carouselItems.forEach( ( item ) => {
		const link = item.querySelector( 'a' );
		if ( !link ) {
			return;
		}

		link.addEventListener( 'click', ( e ) => {
			if ( e.button !== 0 || e.altKey || e.ctrlKey || e.shiftKey || e.metaKey ) {
				return;
			}

			e.preventDefault();
			e.stopPropagation();

			const img = item.querySelector( 'img.mmv-carousel__item-image' );
			const caption = item.querySelector( '.mmv-carousel__item-caption' );

			if ( img ) {
				// A fast scroll can outrun the observer; make sure the image has
				// a src before deriving the title from it below.
				loadDeferredImage( img );
			}

			// Normalise to the DB key (underscores, File: prefix) so the title
			// matches the filenames the overlay derives from the page's own
			// thumbnails (caption + prev/next navigation).
			let title = img ? mw.Title.newFromImg( img ) : null;
			if ( !title ) {
				const href = link.getAttribute( 'href' ) || link.href;
				if ( href ) {
					try {
						const url = new URL( href, location.origin );
						// On wikis without clean-URL rewrite rules, the title lives
						// in the `title` query param (index.php?title=File:Foo.jpg),
						// not the last path segment (which works for clean URLs
						// like `/wiki/File:Foo.jpg`). Prefer the query param when present.
						const titleText = url.searchParams.get( 'title' ) ||
							decodeURIComponent( url.pathname ).replace( /^.*\//, '' );
						title = mw.Title.newFromText( titleText );
					} catch ( _err ) {
						// Malformed URI, ignore
					}
				}
			}

			fileTitleRef.value = title;
			if ( !fileTitleRef.value ) {
				fileImageRef.value = null;
				fileCaptionRef.value = null;
				return;
			}

			// Construct a parseImageUrl()-like result where resizeUrl is guaranteed
			// to exist and produce a valid url (defaulting to current src if none
			// otherwise possible or requested width exceeds the original), and has
			// max available width set (to facilitate upscaling as much as needed)
			const resizeableThumbnail = img ? mw.util.parseImageUrl( img.src ) : null;
			const originalImageWidth = ( img && parseInt( img.dataset.fileWidth, 10 ) ) ||
				( resizeableThumbnail && resizeableThumbnail.width ) ||
				( img && parseInt( img.getAttribute( 'width' ), 10 ) ) ||
				( img && img.clientWidth ) ||
				0;

			let maxSrcsetUrl = null;
			let maxSrcsetWidth = 0;
			if ( img && img.srcset ) {
				const entries = img.srcset.split( ',' );
				for ( let i = 0; i < entries.length; i++ ) {
					const match = entries[ i ].trim().match( /^(\S+)\s+(\d+)w$/ );
					if ( match ) {
						const candidateWidth = parseInt( match[ 2 ], 10 );
						if ( candidateWidth > maxSrcsetWidth ) {
							maxSrcsetWidth = candidateWidth;
							maxSrcsetUrl = match[ 1 ];
						}
					}
				}
			}

			fileImageRef.value = {
				name: fileTitleRef.value.getMainText(),
				width: originalImageWidth,
				resizeUrl: ( width ) => {
					if ( resizeableThumbnail && resizeableThumbnail.resizeUrl && ( !originalImageWidth || width < originalImageWidth ) ) {
						return resizeableThumbnail.resizeUrl( width );
					}
					return maxSrcsetUrl || ( img && img.src ) || '';
				}
			};
			fileCaptionRef.value = options.showCaptions && caption ? caption.textContent : null;
			// Record the accepted thumbnail action after the detail view renders.
			// Reactive title changes alone are not user interactions.
			const selectedTitle = fileTitleRef.value;
			Vue.nextTick( () => {
				if ( fileTitleRef.value !== selectedTitle ) {
					return;
				}
				// TODO(image-carousel-retest): Remove this hook fire; retain the existing instrument.send.
				mw.hook( 'mmv.carousel.action' ).fire( 'thumbnailOpen' );
				instrument.send( 'click', {
					// eslint-disable-next-line camelcase
					action_subtype: 'view_image', action_source: 'image_carousel'
				} );
			} );
		} );
	} );
}

// TODO(image-carousel-retest): Remove the experiment startup handoff once ReaderExperiments
// stops calling initialize: deferred root reveal, arm options, readiness promise,
// data-mmv-defer-init guard, and module export. Preserve normal automatic startup.
let initialization;

const initializeCarousel = ( options ) => {
	const carouselRoot = document.getElementById( 'mmv-carousel-root' );
	if ( !carouselRoot ) {
		return false;
	}
	// Apply the arm while the server-rendered root is still hidden.
	Array.from( carouselRoot.querySelectorAll( '.mmv-carousel__item-caption' ) ).forEach( ( node ) => {
		node.style.display = options.showCaptions ? '' : 'none';
	} );
	Array.from( carouselRoot.querySelectorAll( '.mmv-carousel__toggle' ) ).forEach( ( node ) => {
		node.style.display = options.showToggle ? '' : 'none';
	} );
	carouselRoot.style.removeProperty( 'display' );
	const toggleButtons = carouselRoot ? Array.from( carouselRoot.querySelectorAll( '.mmv-carousel__toggle' ) ) : [];

	toggleButtons.forEach( ( toggleButton ) => {
		toggleButton.addEventListener( 'click', () => {
			const hidden = !carouselRoot.classList.contains( 'mmv-carousel--collapsed' );
			updateHiddenState( hidden );
			// TODO(image-carousel-retest): Remove this event bridge; preserve hide/show behavior.
			mw.hook( 'mmv.carousel.action' ).fire( hidden ? 'carouselHide' : 'carouselShow' );
			// We're swapping out the entire button, hiding the one that just got clicked,
			// so it will lose focus; let's restore that by focusing the button again
			// (not need to target the correct one, this will only work on the visible
			// one and be a no-op for that one that's hidden)
			toggleButtons.forEach( ( node ) => node.focus() );
		} );
	} );

	const carouselItems = Array.from( document.querySelectorAll( '.mmv-carousel__item' ) );
	const visibleCarouselItems = carouselItems.filter( ( item ) => {
		const img = item.querySelector( 'img.mmv-carousel__item-image' );
		return img.checkVisibility ?
			img.checkVisibility() : // Modern browsers
			!!( img.offsetWidth || img.offsetHeight || img.getClientRects().length ); // jQuery .visible equivalent
	} );

	// Mark visibility of the image so we can scope these with CSS
	// and adjust rendering as needed in cases where users explicitly
	// chose to hide certain images
	// @see https://en.wikipedia.org/wiki/Help:Options_to_hide_an_image#Disable_images_on_specific_pages
	carouselItems.forEach( ( item ) => ( item.dataset.visible = visibleCarouselItems.includes( item ) ) );

	if ( !visibleCarouselItems.length ) {
		carouselRoot.style.display = 'none';
		return false;
	}
	init( visibleCarouselItems, options );

	const initialHiddenState = isCarouselHidden();
	updateHiddenState( initialHiddenState, { persist: false } );
	return require( 'vue' ).nextTick().then( () => true );
};

/**
 * Apply display options before showing deferred markup, then mount the viewer.
 * Resolves after Vue has applied the UI, so callers can safely record exposure.
 *
 * @param {Object} [options] Carousel display options
 * @return {Promise<boolean>}
 */
const initialize = ( options = {} ) => {
	if ( !initialization ) {
		initialization = Promise.resolve().then( () => initializeCarousel( Object.assign( {
			showCaptions: true, showJumpLink: true, showToggle: true
		}, options ) ) );
	}
	return initialization;
};

// Normal rollout keeps its automatic initialization. Experiment markup opts out
// so ReaderExperiments can confirm assignment before revealing/mounting it.
$( () => {
	const root = document.getElementById( 'mmv-carousel-root' );
	if ( root && root.dataset.mmvDeferInit !== '1' ) {
		initialize();
	}
} );

module.exports = { initialize };
