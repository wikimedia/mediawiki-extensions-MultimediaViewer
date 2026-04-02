<template>
	<div
		v-if="isOpen"
		class="mmv-lightbox"
		:class="{ 'mmv-lightbox--chrome-hidden': !chromeVisible }"
		role="dialog"
		aria-modal="true"
		aria-labelledby="mmv-lightbox-title"
	>
		<template v-if="image">
			<lightbox-header></lightbox-header>
			<lightbox-image @click="onViewportClick"></lightbox-image>
			<lightbox-caption></lightbox-caption>
			<lightbox-nav></lightbox-nav>
		</template>
		<cdx-progress-bar
			v-else
			class="mmv-lightbox__progress"
			:aria-label="$i18n( 'multimediaviewer-loading' ).text()"
		></cdx-progress-bar>
	</div>
</template>

<script>
const { defineComponent, inject, computed } = require( 'vue' );
const { CdxProgressBar } = require( '@wikimedia/codex' );
const LightboxHeader = require( './LightboxHeader.vue' );
const LightboxImage = require( './LightboxImage.vue' );
const LightboxCaption = require( './LightboxCaption.vue' );
const LightboxNav = require( './LightboxNav.vue' );

/** @typedef {import('./types').ViewerState} ViewerState */

// @vue/component
module.exports = exports = defineComponent( {
	name: 'MmvLightbox',
	components: {
		CdxProgressBar,
		LightboxHeader,
		LightboxImage,
		LightboxCaption,
		LightboxNav
	},
	setup() {
		/** @type {ViewerState} */
		const state = inject( 'state' );
		const toggleChromeFn = inject( 'toggleChrome' );

		const isOpen = computed( () => state.isOpen.value );
		const image = computed( () => state.image.value );
		const chromeVisible = computed( () => state.chromeVisible.value );

		function onViewportClick( e ) {
			if ( e.target.closest( 'a, button, [role="button"]' ) ) {
				return;
			}
			toggleChromeFn();
		}

		return {
			isOpen,
			image,
			chromeVisible,
			onViewportClick
		};
	}
} );
</script>

<style lang="less">
@import 'mediawiki.skin.variables.less';
@import ( reference ) 'mediawiki.skin.codex-design-tokens/theme-wikimedia-ui-mixin-dark.less';

.mmv-lightbox {
	.cdx-mode-dark();

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
	background-color: @background-color-interactive-subtle;
	color: @color-inverted-fixed;

	&__progress {
		max-width: 80vw;
		min-width: 20vw;
		width: 20rem;
		margin: auto;
	}

	.mmv-lightbox-header,
	.mmv-lightbox-caption,
	.mmv-lightbox-nav {
		transition: opacity 0.2s ease, visibility 0.2s ease;
	}

	&--chrome-hidden {
		.mmv-lightbox-header,
		.mmv-lightbox-caption,
		.mmv-lightbox-nav {
			opacity: 0;
			visibility: hidden;
			pointer-events: none;
		}
	}
}
</style>
