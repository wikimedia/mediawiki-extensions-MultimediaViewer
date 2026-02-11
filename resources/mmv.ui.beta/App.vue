<template>
	<div
		v-if="isOpen"
		class="mmv-beta"
		@click.self="onClose"
	>
		<div class="mmv-beta__controls-top">
			<cdx-button
				class="mmv-beta__close-button"
				:aria-label="$i18n( 'multimediaviewer-close-popup-text' ).text()"
				@click="onClose"
			>
				<cdx-icon :icon="cdxIconClose"></cdx-icon>
			</cdx-button>
		</div>

		<div class="mmv-beta__image-area">
			<cdx-button
				v-if="thumbs.length > 1"
				class="mmv-beta__nav mmv-beta__nav--prev"
				:aria-label="$i18n( 'multimediaviewer-prev-image-alt-text' ).text()"
				@click="onPrev"
			>
				<cdx-icon :icon="cdxIconPrevious"></cdx-icon>
			</cdx-button>

			<img
				v-if="image"
				class="mmv-beta__image"
				:src="displaySrc"
				:width="imageWidth"
				:height="imageHeight"
				:alt="image.alt || ''"
			>

			<cdx-button
				v-if="thumbs.length > 1"
				class="mmv-beta__nav mmv-beta__nav--next"
				:aria-label="$i18n( 'multimediaviewer-next-image-alt-text' ).text()"
				@click="onNext"
			>
				<cdx-icon :icon="cdxIconNext"></cdx-icon>
			</cdx-button>
		</div>

		<div v-if="image" class="mmv-beta__metadata">
			<div class="mmv-beta__metadata-title">
				{{ imageTitle }}
			</div>
			<div
				v-if="image.caption"
				class="mmv-beta__metadata-caption"
				v-html="image.caption"
			></div>
			<div class="mmv-beta__metadata-footer">
				<span v-if="thumbs.length > 1" class="mmv-beta__metadata-counter">
					{{ $i18n( 'multimediaviewer-current-image-number', currentIndex + 1, thumbs.length ).text() }}
				</span>
				<a
					class="mmv-beta__metadata-link"
					:href="filePageUrl"
					:title="$i18n( 'multimediaviewer-file-page' ).text()"
				>
					{{ $i18n( 'multimediaviewer-description-page-button-text' ).text() }}
				</a>
			</div>
		</div>
	</div>
</template>

<script>
const { defineComponent, inject, computed, ref, watch } = require( 'vue' );
const { CdxButton, CdxIcon } = require( '@wikimedia/codex' );
const { cdxIconClose, cdxIconPrevious, cdxIconNext } = require( './icons.json' );
const { getLargerThumbnailUrl } = require( './thumbnailGuessing.js' );

// @vue/component
module.exports = exports = defineComponent( {
	name: 'MmvBetaApp',
	components: {
		CdxButton,
		CdxIcon
	},
	setup() {
		const state = inject( 'state' );
		const closeFn = inject( 'close' );
		const nextImageFn = inject( 'nextImage' );
		const prevImageFn = inject( 'prevImage' );

		const image = computed( () => state.image.value );
		const thumbs = computed( () => state.thumbs.value );
		const isOpen = computed( () => state.isOpen.value );

		// Progressive image loading: show the small thumbnail immediately,
		// then swap in a larger version once it finishes loading.
		// When we know the original dimensions, set width/height on the <img>
		// so the small thumbnail is upscaled to the final size, avoiding
		// layout jank when the high-res version swaps in.
		const displaySrc = ref( '' );
		const imageWidth = ref( undefined );
		const imageHeight = ref( undefined );
		let pendingLoad = null;

		watch( image, ( newImage ) => {
			// Cancel any in-flight load for a previous image
			if ( pendingLoad ) {
				pendingLoad.onload = null;
				pendingLoad = null;
			}

			if ( !newImage ) {
				displaySrc.value = '';
				imageWidth.value = undefined;
				imageHeight.value = undefined;
				return;
			}

			// Start with the small thumbnail we already have
			displaySrc.value = newImage.src;

			// If we know the original dimensions, set them on the <img> so
			// the browser reserves the correct aspect-ratio space immediately.
			// CSS max-width/max-height + object-fit: contain handle the rest.
			if ( newImage.originalWidth && newImage.originalHeight &&
				!isNaN( newImage.originalWidth ) && !isNaN( newImage.originalHeight ) ) {
				imageWidth.value = newImage.originalWidth;
				imageHeight.value = newImage.originalHeight;
			} else {
				imageWidth.value = undefined;
				imageHeight.value = undefined;
			}

			// Try to get a larger version
			const largerUrl = getLargerThumbnailUrl( newImage );
			if ( largerUrl ) {
				const loader = new Image();
				pendingLoad = loader;
				loader.onload = function () {
					// Only apply if this image is still current
					if ( image.value === newImage ) {
						displaySrc.value = largerUrl;
					}
					pendingLoad = null;
				};
				loader.src = largerUrl;
			}

			// Prefetch larger thumbnails for the adjacent images so
			// navigation feels instant. We just set .src on throwaway
			// Image objects — the browser cache does the rest.
			const allThumbs = thumbs.value;
			if ( allThumbs.length > 1 ) {
				const idx = allThumbs.indexOf( newImage );
				if ( idx >= 0 ) {
					const neighbors = [
						allThumbs[ ( idx + 1 ) % allThumbs.length ],
						allThumbs[ ( idx - 1 + allThumbs.length ) % allThumbs.length ]
					];
					for ( let i = 0; i < neighbors.length; i++ ) {
						const url = getLargerThumbnailUrl( neighbors[ i ] );
						if ( url ) {
							( new Image() ).src = url;
						}
					}
				}
			}
		}, { immediate: true } );

		const imageTitle = computed( () => {
			if ( image.value && image.value.filePageTitle ) {
				return image.value.filePageTitle.getNameText();
			}
			return '';
		} );

		const filePageUrl = computed( () => {
			if ( image.value && image.value.filePageTitle ) {
				return image.value.filePageTitle.getUrl();
			}
			return '';
		} );

		const currentIndex = computed( () => {
			if ( !image.value ) {
				return 0;
			}
			const idx = thumbs.value.indexOf( image.value );
			return idx >= 0 ? idx : 0;
		} );

		function onClose() {
			closeFn();
		}

		function onNext() {
			nextImageFn();
		}

		function onPrev() {
			prevImageFn();
		}

		return {
			image,
			thumbs,
			isOpen,
			displaySrc,
			imageWidth,
			imageHeight,
			imageTitle,
			filePageUrl,
			currentIndex,
			onClose,
			onNext,
			onPrev,
			cdxIconClose,
			cdxIconPrevious,
			cdxIconNext
		};
	}
} );
</script>

<style lang="less">
@import 'mediawiki.skin.variables.less';

.mmv-beta {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	// Stack above .mw-mmv-overlay (z-index: 1000) which the bootstrap
	// re-appends on each viewer open, potentially after our mount point.
	z-index: calc( 1000 + @z-index-stacking-1 );
	display: flex;
	flex-direction: column;
	background-color: rgba( 0, 0, 0, 0.95 );
	color: @color-inverted-fixed;

	&__controls-top {
		display: flex;
		justify-content: flex-end;
		padding: @spacing-50;
		flex-shrink: 0;
	}

	// Override Codex quiet-button styles for dark background.
	// Chained with .cdx-button to match Codex's own specificity
	// (e.g. .cdx-button:enabled.cdx-button--weight-quiet:hover).
	// Also reset mix-blend-mode which Codex sets to multiply on
	// hover — that makes buttons invisible on dark backgrounds.
	&__close-button.cdx-button,
	&__nav.cdx-button {
		color: @color-inverted-fixed;
		background-color: @background-color-transparent;
		border-color: @border-color-transparent;
		mix-blend-mode: normal;

		.cdx-icon {
			color: @color-inverted-fixed;
		}

		&:hover {
			background-color: rgba( 255, 255, 255, @opacity-low );
		}

		&:active {
			background-color: rgba( 255, 255, 255, @opacity-medium );
		}
	}

	&__image-area {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 0;
		position: relative;
		padding: 0 @spacing-300;
	}

	&__image {
		max-width: @spacing-full;
		max-height: @spacing-full;
		object-fit: contain;
	}

	&__nav {
		position: absolute;
		top: @spacing-half;
		transform: translateY( -50% );
		z-index: @z-index-stacking-1;

		&--prev {
			left: @spacing-50;
		}

		&--next {
			right: @spacing-50;
		}
	}

	&__metadata {
		flex-shrink: 0;
		padding: @spacing-75 @spacing-100;
	}

	&__metadata-title {
		font-weight: @font-weight-bold;
		font-size: @font-size-medium;
		margin-bottom: @spacing-25;
	}

	&__metadata-caption {
		font-size: @font-size-small;
		opacity: @opacity-icon-base;
		margin-bottom: @spacing-50;
	}

	&__metadata-footer {
		display: flex;
		align-items: center;
		gap: @spacing-100;
		font-size: @font-size-small;
	}

	&__metadata-counter {
		opacity: @opacity-icon-subtle;
	}
}
</style>
