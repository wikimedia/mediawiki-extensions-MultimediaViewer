<template>
	<div
		ref="imageContainerRef"
		class="mmv-lightbox-image"
		:aria-busy="isBusy ? 'true' : 'false'"
	>
		<img
			v-if="image && displayUrl && !imgHasError"
			class="mmv-lightbox-image__el"
			:class="[
				image.filePageTitle.getExtension().toLowerCase(), /* extension → checkerboard for transparent images */
				{ 'mmv-lightbox-image__el--loaded': imgLoaded }
			]"
			:style="{ width: thumbnailWidths.cssWidth + 'px', height: thumbnailWidths.cssHeight + 'px' }"
			:src="displayUrl"
			:width="imageWidth"
			:height="imageHeight"
			:alt="image.alt || ''"
			@load="onImageLoad"
			@error="onImageError"
		>
		<cdx-progress-bar
			v-if="showSpinner"
			class="mmv-lightbox-image__progress"
			:aria-label="$i18n( 'multimediaviewer-loading' ).text()"
		></cdx-progress-bar>
	</div>
</template>

<script>
const { defineComponent, inject, computed, ref, useTemplateRef, watch, onBeforeUnmount } = require( 'vue' );
const { CdxProgressBar } = require( '@wikimedia/codex' );
const { ThumbnailWidthCalculator } = require( 'mmv.common' );

/** @typedef {import('./types').ViewerState} ViewerState */

/**
 * Delay (ms) before the image-area loading indicator appears, so quick loads
 * (cached / prefetched thumbnails) never flash a spinner. Pairs with
 * PREFETCH_DELAY (250) in BetaViewer.js, which warms neighbor thumbnails.
 */
const LOADING_INDICATOR_DELAY = 150;

// @vue/component
module.exports = exports = defineComponent( {
	name: 'LightboxImage',
	components: {
		CdxProgressBar
	},
	setup() {
		/** @type {ViewerState} */
		const state = inject( 'state' );
		const showError = inject( 'showError' );

		const imageContainerRef = useTemplateRef( 'imageContainerRef' );

		const image = computed( () => state.image.value );
		const displayUrl = computed( () => state.displayUrl.value );
		const loadId = computed( () => state.loadId.value );

		const imageWidth = computed( () => {
			if ( image.value && image.value.originalWidth &&
				!isNaN( image.value.originalWidth ) ) {
				return image.value.originalWidth;
			}
			return undefined;
		} );
		const imageHeight = computed( () => {
			if ( image.value && image.value.originalHeight &&
				!isNaN( image.value.originalHeight ) ) {
				return image.value.originalHeight;
			}
			return undefined;
		} );

		const thumbnailWidths = computed( () => {
			if ( !imageContainerRef.value ) {
				return {};
			}
			const containerRect = imageContainerRef.value.getBoundingClientRect();
			const thumbnailWidthCalculator = new ThumbnailWidthCalculator();
			return thumbnailWidthCalculator.calculateWidths(
				containerRect.width,
				containerRect.height,
				image.value.originalWidth || image.value.thumbnail.width,
				image.value.originalHeight || image.value.thumbnail.height
			);
		} );

		// Whether the on-page article thumbnail has already decoded.
		function placeholderDecoded() {
			const thumb = image.value && image.value.thumbnail;
			return !!( thumb && thumb.complete && thumb.naturalWidth > 0 );
		}

		const imgLoaded = ref( false );
		const imgHasError = ref( false );
		const delayElapsed = ref( false );
		let spinnerTimer = null;

		// loadId (bumped by BetaViewer.loadImage) is the "source of truth" for
		// navigation events. Whenever the user navigates to a new image in the
		// viewer, these values (which control much of what is visible on the
		// screen) are reset. Error state and whether the user sees a loading
		// indicator or not (we only show this element for longer loads when we
		// have no low-res placeholder) are controlled by these values. This
		// watcher must be immediate because loadId is incremented before the
		// component tree has mounted.
		watch( loadId, () => {
			imgHasError.value = false;
			imgLoaded.value = placeholderDecoded();
			delayElapsed.value = false;
			clearTimeout( spinnerTimer );
			spinnerTimer = setTimeout( () => {
				delayElapsed.value = true;
			}, LOADING_INDICATOR_DELAY );
		}, { immediate: true } );

		// displayUrl is cleared without a loadId bump on error/close; reset
		// imgLoaded explicitly so a late .onload can't leave it stale (the
		// loadId watcher only covers navigation).
		watch( displayUrl, ( url ) => {
			if ( !url ) {
				imgLoaded.value = false;
			}
		} );

		onBeforeUnmount( () => clearTimeout( spinnerTimer ) );

		// Whether the image area is still loading (for aria-busy)
		const isBusy = computed( () => !!image.value &&
			!imgLoaded.value && !imgHasError.value );
		const showSpinner = computed( () => isBusy.value && delayElapsed.value );

		function onImageError() {
			// A transient empty src (no on-page thumbnail yet) must not count as a
			// load failure
			if ( !displayUrl.value ) {
				return;
			}
			imgHasError.value = true;
			showError( mw.msg( 'multimediaviewer-thumbnail-error' ) );
		}

		function onImageLoad() {
			imgLoaded.value = true;
		}

		return {
			imageContainerRef,
			image,
			displayUrl,
			imageWidth,
			imageHeight,
			thumbnailWidths,
			imgLoaded,
			imgHasError,
			isBusy,
			showSpinner,
			onImageError,
			onImageLoad
		};
	}
} );
</script>

<style lang="less">
@import 'mediawiki.skin.variables.less';

.mmv-lightbox-image {
	position: relative;
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 0;

	// Centered loading indicator, absolutely positioned so toggling it causes no
	// layout shift (the image area keeps its size whether or not it is shown).
	&__progress {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate( -50%, -50% );
		width: 20rem;
		max-width: 80vw;
		min-width: 20vw;
	}

	&__el {
		max-width: @size-full;
		max-height: @size-full;
		object-fit: contain;

		// Fade the image in once it has decoded; instant-reset on navigation (the
		// transition lives on the loaded state) so rapid nav never fades out.
		opacity: 0;

		&--loaded {
			opacity: 1;
			transition: opacity 0.2s ease;
		}

		// Allowlist file types that are potentially transparent.
		// We don't set it for other file types because Media Viewer plugins
		// can find that undesirable (eg. 3d)
		&.gif,
		&.png,
		&.webp,
		&.svg,
		&.tiff,
		&.tif {
			background: url( ../mmv/ui/checker.png ) repeat;
		}
	}
}
</style>
