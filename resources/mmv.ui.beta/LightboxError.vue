<template>
	<div class="mmv-lightbox-error">
		<cdx-toast
			v-if="hasError"
			standalone
			:render-in-place="true"
			type="error"
			:action-button-label="$i18n( 'multimediaviewer-thumbnail-error-refresh-button' ).text()"
			@user-dismissed="dismissError"
			@action-button-click="handleRefresh"
		>
			{{ errorMessage }}
		</cdx-toast>
	</div>
</template>

<script>
const { defineComponent, inject } = require( 'vue' );
const { CdxToast } = require( '@wikimedia/codex' );

/** @typedef {import('./types').ViewerState} ViewerState */

// @vue/component
module.exports = exports = defineComponent( {
	name: 'LightboxError',
	components: {
		CdxToast
	},
	setup() {
		/** @type {ViewerState} */
		const state = inject( 'state' );
		const handleRefresh = inject( 'reload' );
		const hasError = inject( 'hasError' );
		const errorMessage = state.errorMessage;

		function dismissError() {
			state.errorMessage.value = null;
		}

		return {
			hasError,
			errorMessage,
			dismissError,
			handleRefresh
		};
	}
} );
</script>

<style lang="less">
@import 'mediawiki.skin.variables.less';

.mmv-lightbox-error {
	.cdx-toast {
		bottom: 0;
		left: 0;
		right: 0;
		width: auto;
		max-width: 100%;
		transform: none;
	}

	.cdx-message {
		&__content {
			@media ( max-width: 400px ) {
				font-size: @font-size-small;
				line-height: @line-height-x-small;
			}
		}

		&__action-button {
			@media ( max-width: 400px ) {
				font-size: @font-size-small;
			}
		}
	}
}
</style>
