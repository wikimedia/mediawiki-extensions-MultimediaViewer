<template>
	<div class="mmv-lightbox-header">
		<div v-if="image" class="mmv-lightbox-header__text">
			<div
				id="mmv-lightbox-title"
				class="mmv-lightbox-header__title"
				:class="{ 'mmv-lightbox-header__title--loaded': titleReady }"
			>
				{{ imageTitle }}
			</div>
			<div
				class="mmv-lightbox-header__author"
				:class="{ 'mmv-lightbox-header__author--loaded': authorReady }"
			>
				{{ author }}
			</div>
		</div>
	</div>
</template>

<script>
const { defineComponent, inject, computed } = require( 'vue' );
const { HtmlUtils } = require( 'mmv.common' );

/** @typedef {import('./types').ViewerState} ViewerState */

// @vue/component
module.exports = exports = defineComponent( {
	name: 'LightboxHeader',
	setup() {
		/** @type {ViewerState} */
		const state = inject( 'state' );
		const image = computed( () => state.image.value );
		const imageInfo = computed( () => state.imageInfo.value );

		const imageTitle = computed( () => {
			if ( image.value && image.value.caption ) {
				return HtmlUtils.htmlToText( image.value.caption );
			}
			if ( imageInfo.value && imageInfo.value.description ) {
				return HtmlUtils.htmlToText( imageInfo.value.description );
			}
			if ( image.value && image.value.filePageTitle ) {
				return image.value.filePageTitle.getNameText();
			}
			return '';
		} );

		// Unlike the legacy panel's setCredit(), don't combine author and
		// source: on Commons the source field is usually boilerplate
		// ( "Own work", transfer notices ), and this compact header has no
		// equivalent of the legacy truncate/expand behavior.
		const author = computed( () => {
			if ( imageInfo.value && imageInfo.value.attribution ) {
				return HtmlUtils.htmlToText( imageInfo.value.attribution );
			}
			if ( imageInfo.value && imageInfo.value.author ) {
				return HtmlUtils.htmlToText( imageInfo.value.author );
			}
			if ( imageInfo.value && imageInfo.value.source ) {
				return HtmlUtils.htmlToText( imageInfo.value.source );
			}
			return '';
		} );

		// The title is "ready" as soon as it can show its final value: either the
		// on-page caption (available synchronously) or the loaded imageInfo.
		const titleReady = computed( () => !!( ( image.value && image.value.caption ) || imageInfo.value ) );
		const authorReady = computed( () => !!imageInfo.value );

		return {
			image,
			imageTitle,
			author,
			titleReady,
			authorReady
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
	// Reserve space on the right for the absolutely-positioned close button.
	padding-right: calc( @spacing-100 + @size-200 + @spacing-75 );
	flex-shrink: 0;

	&__text {
		flex: 1;
		min-width: 0;
	}

	&__title {
		font-weight: @font-weight-bold;
		font-size: @font-size-medium;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;

		// Fade the text in only when it arrives late (see *--loaded). The
		// transition lives on the loaded state so showing fades in, while
		// clearing on navigation hides instantly (no fade-out flicker).
		opacity: 0;

		&--loaded {
			opacity: 1;
			transition: opacity 0.2s ease;
		}
	}

	&__author {
		font-size: @font-size-small;
		color: @color-subtle;
		margin-top: @spacing-25;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		opacity: 0;

		&--loaded {
			opacity: 1;
			transition: opacity 0.2s ease;
		}

		// Add a zero-width space so that there is always 1 line worth of text
		// content in the author area (to prevent layout shift while the metadata
		// is loaded)
		&::before {
			content: '\200b';
		}
	}
}
</style>
