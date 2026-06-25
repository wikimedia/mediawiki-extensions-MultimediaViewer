// Wire up the mobile carousel by routing item clicks through the shared
// "#/media/<file>" router hash (used by both the MobileFrontend lightbox
// component as well as MMV). If the mobile-friendly "mmvBeta" module is
// loaded, it will handle carousel item clicks; if not, MobileFrontend will.
//
// Deferred to avoid side effects during module load (which interferes with
// the QUnit test environment).
$( () => {
	const router = require( 'mediawiki.router' );
	const { Config } = require( 'mmv.bootstrap' );
	const carouselItems = Array.from( document.querySelectorAll( '.mmv-carousel__item' ) );

	// Instrumentation with TestKitchen as a soft dependency.
	// Discussion at
	// https://gerrit.wikimedia.org/r/c/mediawiki/extensions/MultimediaViewer/+/1297716/comments/4151eb46_78975b42.
	let instrument;
	mw.loader.using( 'ext.testKitchen' )
		.then( () => {
			instrument = mw.testKitchen.getInstrument( 'image-browsing' );
			// Instrument image carousel impression.
			// This module is only loaded when Hooks.php rendered the carousel
			// markup, so carousel items are guaranteed to be present.
			// eslint-disable-next-line camelcase
			instrument.send( 'impression', { action_source: 'image_carousel' } );
		} )
		.catch( () => {
			// eslint-disable-next-line no-console
			console.info( '[MultimediaViewer] TestKitchen not available: skipping instrumentation.' );
		} );

	carouselItems.forEach( ( item ) => {
		const img = item.querySelector( 'img.mmv-carousel__item-image' );

		// Check visibility of the image so we can adjust as needed in
		// cases where users explicitly want to hide certain images
		// @see https://en.wikipedia.org/wiki/Help:Options_to_hide_an_image#Disable_images_on_specific_pages
		item.dataset.visible = img.checkVisibility ?
			img.checkVisibility() : // Modern browsers
			!!( img.offsetWidth || img.offsetHeight || img.getClientRects().length ); // jQuery .visible equivalent

		const link = item.querySelector( 'a' );
		if ( !link ) {
			return;
		}

		link.addEventListener( 'click', ( e ) => {
			if ( e.button !== 0 || e.altKey || e.ctrlKey || e.shiftKey || e.metaKey ) {
				return;
			}
			// Normalise to the DB key (underscores, File: prefix) so the title
			// matches the filenames the overlay derives from the page's own
			// thumbnails (caption + prev/next navigation).
			const fileTitle = mw.Title.newFromImg( img );
			if ( !fileTitle ) {
				return;
			}
			e.preventDefault();

			if ( instrument ) {
				// Instrument image carousel click
				instrument.send(
					'click',
					// eslint-disable-next-line camelcase
					{ action_subtype: 'view_image', action_source: 'image_carousel' }
				);
			}

			router.navigateTo( null, {
				path: Config.getMediaHash( fileTitle.getPrefixedDb() )
			} );
		} );
	} );
} );
