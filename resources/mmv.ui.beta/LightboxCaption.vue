<template>
	<div
		v-if="image"
		class="mmv-lightbox-caption"
		:class="{ 'mmv-lightbox-caption--loaded': captionReady }"
	>
		<div
			v-if="captionHtml"
			class="mmv-lightbox-caption__text"
			v-html="captionHtml"
		></div>
		<a
			class="mmv-lightbox-caption__link"
			:href="filePageUrl"
			:title="$i18n( 'multimediaviewer-file-page' ).text()"
		>
			{{ licenseText }}
		</a>
	</div>
</template>

<script>
const { defineComponent, inject, computed } = require( 'vue' );
const { HtmlUtils } = require( 'mmv.common' );

/** @typedef {import('./types').ViewerState} ViewerState */

// @vue/component
module.exports = exports = defineComponent( {
	name: 'LightboxCaption',
	setup() {
		/** @type {ViewerState} */
		const state = inject( 'state' );

		const image = computed( () => state.image.value );
		const imageInfo = computed( () => state.imageInfo.value );

		// The header title already shows the caption (or the description if
		// there is no caption), so to avoid repeating the same text, the
		// caption area shows the description only when a caption also exists.
		// Mirrors the legacy Description.set() behavior.
		const captionHtml = computed( () => {
			if ( image.value && image.value.caption &&
				imageInfo.value && imageInfo.value.description
			) {
				return HtmlUtils.htmlToTextWithTags( imageInfo.value.description );
			}
			return '';
		} );

		const filePageUrl = computed( () => {
			if ( image.value && image.value.filePageTitle ) {
				return image.value.filePageTitle.getUrl();
			}
			return '';
		} );

		const licenseText = computed( () => {
			if ( imageInfo.value && imageInfo.value.license ) {
				return imageInfo.value.license.getShortName();
			}
			return mw.msg( 'multimediaviewer-description-page-button-text' );
		} );

		// Fade the description/license in once imageInfo arrives, rather than
		// showing the generic file-page fallback first and swapping it for the
		// real license. Prefetched images apply info before paint, so no fade.
		const captionReady = computed( () => !!imageInfo.value );

		return {
			image,
			captionHtml,
			filePageUrl,
			licenseText,
			captionReady
		};
	}
} );
</script>

<style lang="less">
@import 'mediawiki.skin.variables.less';

.mmv-lightbox-caption {
	flex-shrink: 0;
	padding: @spacing-75 @spacing-100;

	// Fade in when metadata arrives late; instant on navigation (the transition
	// lives on the loaded state). Height is reserved regardless of opacity.
	opacity: 0;

	&--loaded {
		opacity: 1;
		transition: opacity 0.2s ease;
	}

	&__text {
		font-size: @font-size-small;
		opacity: @opacity-icon-base;
		margin-bottom: @spacing-50;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	&__link {
		font-size: @font-size-small;
	}
}
</style>
