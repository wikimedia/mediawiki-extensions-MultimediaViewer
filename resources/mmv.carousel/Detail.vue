<template>
	<teleport :to="teleportTarget">
		<div
			v-if="open"
			class="mmv-carousel-detail"
			role="dialog"
			aria-modal="true"
			@keydown.esc="onClose"
		>
			<focus-trap>
				<div class="mmv-carousel-detail--dialog">
					<cdx-button
						class="mmv-carousel-detail--dialog--close"
						:aria-label="$i18n( 'multimediaviewer-carousel-dialog-close-button-label' ).text()"
						size="small"
						@click="onClose"
					>
						<cdx-icon :icon="cdxIconClose"></cdx-icon>
					</cdx-button>

					<img
						v-if="resizedSrc"
						:src="resizedSrc"
						:alt="title.getFileNameTextWithoutExtension()"
					>

					<p
						v-if="caption"
						class="mmv-carousel-detail--dialog--caption"
					>
						{{ caption }}
					</p>

					<div class="mmv-carousel-detail--dialog--buttons">
						<cdx-button
							action="progressive"
							weight="quiet"
							@click="$emit( 'scroll', title )"
						>
							<cdx-icon :icon="cdxIconArrowDown"></cdx-icon>
							{{ $i18n( 'multimediaviewer-carousel-dialog-scroll-button-label' ).text() }}
						</cdx-button>
						<cdx-button
							action="progressive"
							weight="quiet"
							@click="$emit( 'view', title )"
						>
							<cdx-icon :icon="cdxIconFullscreen"></cdx-icon>
							{{ $i18n( 'multimediaviewer-carousel-dialog-view-button-label' ).text() }}
						</cdx-button>
					</div>
				</div>
			</focus-trap>
		</div>
	</teleport>
</template>

<script>
const { computed, defineComponent, inject, onUnmounted, ref, watch } = require( 'vue' );
const { CdxButton, CdxIcon } = require( '@wikimedia/codex' );
const FocusTrap = require( './FocusTrap.vue' );
const icons = require( './icons.json' );

// @vue/component
module.exports = exports = defineComponent( {
	name: 'CarouselDetail',
	components: {
		FocusTrap,
		CdxButton,
		CdxIcon
	},
	props: {
		title: {
			type: /** @type {mw.Title} */ ( Object ),
			default: null,
			validator: ( title ) => ( title instanceof mw.Title )
		},
		image: {
			type: /** @type {ResizeableThumbnailUrl} */ ( Object ),
			default: null,
			validator: ( image ) => ( typeof image.resizeUrl === 'function' )
		},
		caption: {
			type: String,
			default: null
		}
	},
	emits: [
		'view',
		'scroll',
		'close'
	],
	setup( props, { emit } ) {
		const teleportTarget = inject( 'CdxTeleportTarget' );

		// Viewport width will instruct what size thumbnail to request
		const viewportWidth = ref( null );
		function setViewportWidth() {
			viewportWidth.value = Math.max( document.documentElement.clientWidth || 0, window.innerWidth || 0 );
		}
		setViewportWidth();
		window.addEventListener( 'resize', setViewportWidth );
		onUnmounted( () => {
			window.removeEventListener( 'resize', setViewportWidth );
		} );

		// Any (valid) title change should reopen the dialog
		const open = ref( false );
		watch(
			() => props.title,
			( title ) => ( open.value = !!title ),
			{ immediate: true }
		);
		function onClose() {
			open.value = false;
			emit( 'close', props.title );
		}

		const resizedSrc = computed( () => {
			if ( !props.title || !props.image ) {
				return null;
			}

			const resizeWidth = mw.util.adjustThumbWidthForSteps(
				viewportWidth.value,
				props.image.width,
				props.title.getExtension().toLowerCase() === 'svg'
			);

			return props.image.resizeUrl( resizeWidth );
		} );

		return {
			teleportTarget,
			cdxIconClose: icons.cdxIconClose,
			cdxIconArrowDown: icons.cdxIconArrowDown,
			cdxIconFullscreen: icons.cdxIconFullscreen,
			onClose,
			open,
			resizedSrc
		};
	}
} );
</script>

<style lang="less">
@import 'mediawiki.skin.variables.less';

// Prevent body scroll when dialog is open
body:has( .mmv-carousel-detail ) {
	overflow: hidden;
}

.mmv-carousel-detail {
	position: fixed;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
	z-index: @z-index-overlay;
	background: @background-color-backdrop-dark;

	&--dialog {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate( -50%, -50% );
		border-radius: @border-radius-base;
		border: @border-subtle;
		background: @background-color-base;
		box-shadow: @box-shadow-outset-large-below @box-shadow-color-alpha-base, @box-shadow-outset-large-around @box-shadow-color-alpha-base;
		max-height: 100vh;
		max-height: 100dvh;
		max-width: 100vw;
		max-width: 100dvw;
		display: flex;
		flex-direction: column;

		&--close {
			position: absolute;
			top: @spacing-100;
			right: @spacing-100;
		}

		img {
			overflow: hidden;
			object-fit: contain;
		}

		& &--caption {
			flex-shrink: 0;
			margin: @spacing-100 @spacing-100 0 @spacing-100; // Override Minerva stylesheet
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 5; // Truncate after 5 lines
			overflow: hidden;
		}

		&--buttons {
			flex-shrink: 0;
			display: flex;
			justify-content: center;
			margin: @spacing-100 0;

			.cdx-button {
				font-weight: @font-weight-normal;
			}
		}
	}
}
</style>
