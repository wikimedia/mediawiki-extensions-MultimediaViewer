<template>
	<detail
		:title="titleRef"
		:image="imageRef"
		:caption="captionRef"
		:show-jump-link="showJumpLink"
		@view="onViewImage"
		@scroll="onScrollToImage"
		@close="onClose"
	></detail>
</template>

<script>
const { defineComponent, inject } = require( 'vue' );
const Detail = require( './Detail.vue' );

// @vue/component
module.exports = exports = defineComponent( {
	name: 'CarouselApp',
	components: {
		Detail
	},
	inject: {
		instrument: {
			type: /** @type {mw.testKitchen.InstrumentInterface} */ ( Object ),
			default: null,
			validator: ( instrument ) => ( typeof instrument.send === 'function' )
		},
		titleRef: {
			type: /** @type {Function<import('vue').Ref<mw.Title>>} */ ( Object ),
			default: null,
			validator: ( titleRef ) => ( titleRef.value instanceof mw.Title )
		},
		imageRef: {
			type: /** @type {Function<import('vue').Ref<ResizeableThumbnailUrl>>} */ ( Object ),
			default: null,
			validator: ( imageRef ) => ( typeof imageRef.value.resizeUrl === 'function' )
		},
		captionRef: {
			type: String,
			default: null
		}
	},
	setup() {
		const router = require( 'mediawiki.router' );
		const { Config } = require( 'mmv.bootstrap' );

		const instrument = inject( 'instrument' );
		const titleRef = inject( 'titleRef' );
		// TODO(image-carousel-retest): Remove arm-specific injection, export, and prop binding
		// once the permanent jump-link behavior is chosen; update the scroll guard below.
		const showJumpLink = inject( 'showJumpLink', true );

		// Track a carousel impression
		instrument.send(
			'impression',
			// eslint-disable-next-line camelcase
			{ action_source: 'image_carousel' }
		);

		function onClose() {
			titleRef.value = null;
		}

		function onViewImage( title ) {
			if ( !title || titleRef.value !== title ) {
				return;
			}
			// TODO(image-carousel-retest): Remove this event bridge; preserve navigation.
			mw.hook( 'mmv.carousel.action' ).fire( 'viewDetails' );
			router.navigateTo( null, {
				path: Config.getMediaHash( title.getPrefixedDb() )
			} );

			titleRef.value = null;
		}

		function onScrollToImage( title ) {
			if ( !showJumpLink || !title || titleRef.value !== title ) {
				return;
			}
			// Count the accepted action even if the destination cannot be found.
			// TODO(image-carousel-retest): Remove this event bridge; preserve scrolling.
			mw.hook( 'mmv.carousel.action' ).fire( 'scrollToImage' );
			const articleImage = document.querySelector( `.mw-parser-output a[href$="${ CSS.escape( title.getPrefixedDb() ) }"] img` );
			if ( !articleImage ) {
				mw.notify( mw.message( 'multimediaviewer-carousel-dialog-scroll-error' ).text() );
				throw new Error( `Failed to locate carousel image ${ title.getPrefixedDb() }` );
			}

			const isVisible = ( node ) => node.checkVisibility ?
				node.checkVisibility() : // Modern browsers
				!!( node.offsetWidth || node.offsetHeight || node.getClientRects().length ); // jQuery .visible equivalent

			if ( !isVisible( articleImage ) ) {
				// Section may be collapsed...
				// Find the closest parent with an id & navigate to it to ensure it's expanded
				let idNode = articleImage;
				while ( idNode && !idNode.hasAttribute( 'id' ) && idNode.parentNode ) {
					idNode = idNode.parentNode;
				}
				const currentHref = window.location.href;
				router.navigateTo( null, { path: '#' + idNode.getAttribute( 'id' ), useReplaceState: true } );

				// Manually trigger hashchange, which MobileFrontend (if in use) will pick up on to open section
				window.dispatchEvent( new HashChangeEvent( 'hashchange' ) );

				// Restore original uri
				router.navigateTo( null, { path: currentHref, useReplaceState: true } );
			}

			articleImage.scrollIntoView( { behavior: 'smooth' } );

			titleRef.value = null;
		}

		return {
			showJumpLink,
			onClose,
			onViewImage,
			onScrollToImage
		};
	}
} );
</script>
