// Wire up the mobile carousel by routing item clicks through the shared
// "#/media/<file>" router hash (used by both the MobileFrontend lightbox
// component as well as MMV). If the mobile-friendly "mmvBeta" module is
// loaded, it will handle carousel item clicks; if not, MobileFrontend will.
//
// Deferred to avoid side effects during module load (which interferes with
// the QUnit test environment).
$( () => {
	const router = require( 'mediawiki.router' );
	const carouselItems = Array.from( document.querySelectorAll( '.mmv-carousel__item' ) );

	carouselItems.forEach( ( item ) => {
		const title = item.dataset.mmvTitle;
		if ( !title ) {
			return;
		}

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
			const fileTitle = mw.Title.newFromText( title );
			if ( !fileTitle ) {
				return;
			}
			e.preventDefault();
			router.navigate( '#/media/' + encodeURIComponent( fileTitle.getPrefixedDb() ) );
		} );
	} );
} );
