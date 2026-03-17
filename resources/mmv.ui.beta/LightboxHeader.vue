<template>
	<div class="mmv-lightbox-header">
		<div v-if="image" class="mmv-lightbox-header__text">
			<div id="mmv-lightbox-title" class="mmv-lightbox-header__title">
				{{ imageTitle }}
			</div>
			<div class="mmv-lightbox-header__author">
				{{ author }}
			</div>
		</div>
		<cdx-button
			class="mmv-lightbox-header__close"
			:aria-label="$i18n( 'multimediaviewer-close-popup-text' ).text()"
			@click="onClose"
		>
			<cdx-icon :icon="cdxIconClose"></cdx-icon>
		</cdx-button>
	</div>
</template>

<script>
const { defineComponent, inject, computed } = require( 'vue' );
const { CdxButton, CdxIcon } = require( '@wikimedia/codex' );
const { cdxIconClose } = require( './icons.json' );
const { HtmlUtils } = require( 'mmv.common' );

/** @typedef {import('./types').ViewerState} ViewerState */

// @vue/component
module.exports = exports = defineComponent( {
	name: 'LightboxHeader',
	components: {
		CdxButton,
		CdxIcon
	},
	setup() {
		/** @type {ViewerState} */
		const state = inject( 'state' );
		const closeFn = inject( 'close' );

		const image = computed( () => state.image.value );
		const imageInfo = computed( () => state.imageInfo.value );

		const imageTitle = computed( () => {
			if ( image.value && image.value.filePageTitle ) {
				return image.value.filePageTitle.getNameText();
			}
			return '';
		} );

		const author = computed( () => {
			if ( imageInfo.value && imageInfo.value.author ) {
				return HtmlUtils.htmlToText( imageInfo.value.author );
			}
			return '';
		} );

		function onClose() {
			closeFn();
		}

		return {
			image,
			imageTitle,
			author,
			onClose,
			cdxIconClose
		};
	}
} );
</script>

<style lang="less">
@import 'mediawiki.skin.variables.less';

.mmv-lightbox-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	padding: @spacing-75 @spacing-100;
	flex-shrink: 0;

	&__text {
		flex: 1;
		min-width: 0;
		padding-right: @spacing-75;
	}

	&__title {
		font-weight: @font-weight-bold;
		font-size: @font-size-medium;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	&__author {
		font-size: @font-size-small;
		color: @color-subtle;
		line-height: @line-height-small;
		margin-top: @spacing-25;

		// Add a zero-width space so that there is always 1 line worth of text
		// content in the author area (to prevent layout shift while the metadata
		// is loaded)
		&::before {
			content: '\200b';
		}
	}
}
</style>
