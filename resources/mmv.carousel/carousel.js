'use strict';

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
			// The root must be the scroll container (overflow lives on the
			// carousel wrapper, not on the items list).
			root: document.getElementById( 'mmv-carousel-root' ),
			// Horizontal lookahead of roughly three items, so images are
			// ready by the time the reader scrolls them into view.
			rootMargin: '0px 500px'
		} );
		deferredImages.forEach( ( img ) => observer.observe( img ) );
	} else {
		deferredImages.forEach( loadDeferredImage );
	}
}

function init( carouselItems ) {
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
	app.provide( 'instrument', getInstrumentProxy( 'image-browsing' ) );
	app.provide( 'titleRef', fileTitleRef );
	app.provide( 'imageRef', fileImageRef );
	app.provide( 'captionRef', fileCaptionRef );
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

			const img = item.querySelector( 'img.mmv-carousel__item-image' );
			const caption = item.querySelector( '.mmv-carousel__item-caption' );

			// A fast scroll can outrun the observer; make sure the image has
			// a src before deriving the title from it below.
			loadDeferredImage( img );

			// Normalise to the DB key (underscores, File: prefix) so the title
			// matches the filenames the overlay derives from the page's own
			// thumbnails (caption + prev/next navigation).
			fileTitleRef.value = mw.Title.newFromImg( img );
			if ( !fileTitleRef.value ) {
				fileImageRef.value = null;
				fileCaptionRef.value = null;
				return;
			}

			// Construct a parseImageUrl()-like result where resizeUrl is guaranteed
			// to exist and produce a valid url (defaulting to current src if none
			// otherwise possible), and has max available width set (to facilitate
			// upscaling as much as needed)
			const resizeableThumbnail = mw.util.parseImageUrl( img.src );
			fileImageRef.value = {
				name: fileTitleRef.value.getMainText(),
				width: img.dataset.fileWidth ||
					( resizeableThumbnail && resizeableThumbnail.width ) ||
					parseInt( img.getAttribute( 'width' ) ) ||
					img.clientWidth,
				resizeUrl: resizeableThumbnail && resizeableThumbnail.resizeUrl || ( () => ( img.src ) )
			};
			fileCaptionRef.value = caption ? caption.textContent : null;

			e.preventDefault();
		} );
	} );
}

// Wire up the mobile carousel.
// Deferred to avoid side effects during module load (which interferes with
// the QUnit test environment).
$( () => {
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

	init( visibleCarouselItems );
} );
