<template>
	<div class="mmv-lightbox-image">
		<img
			v-if="image && !imgHasError"
			class="mmv-lightbox-image__el"
			:class="image.filePageTitle.getExtension().toLowerCase() /* add extension to display checkerboard pattern for transparent images */"
			:src="displayUrl"
			:width="imageWidth"
			:height="imageHeight"
			:alt="image.alt || ''"
			@error="onImageError"
		>
	</div>
</template>

<script>
const { defineComponent, inject, computed, ref, watch } = require( 'vue' );

/** @typedef {import('./types').ViewerState} ViewerState */

// @vue/component
module.exports = exports = defineComponent( {
	name: 'LightboxImage',
	setup() {
		/** @type {ViewerState} */
		const state = inject( 'state' );
		const showError = inject( 'showError' );

		const image = computed( () => state.image.value );
		const displayUrl = computed( () => state.displayUrl.value );

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

		// Track image load failure locally so that dismissing the error toast does
		// not re-mount the <img> with the same broken URL. Reset only when a new
		// load starts (isLoading is true), not when the toast is dismissed.
		const imgHasError = ref( false );

		watch( () => state.isLoading.value, ( loading ) => {
			if ( loading ) {
				imgHasError.value = false;
			}
		} );

		function onImageError() {
			imgHasError.value = true;
			showError( mw.msg( 'multimediaviewer-thumbnail-error' ) );
		}

		return {
			image,
			displayUrl,
			imageWidth,
			imageHeight,
			imgHasError,
			onImageError
		};
	}
} );
</script>

<style lang="less">
@import 'mediawiki.skin.variables.less';

.mmv-lightbox-image {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 0;

	&__el {
		max-width: @size-full;
		max-height: @size-full;
		object-fit: contain;

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
