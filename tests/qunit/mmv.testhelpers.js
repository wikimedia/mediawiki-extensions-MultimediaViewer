( function ( mw, $ ) {
	var MTH = {};

	MTH.enterFullscreenMock = function() {
		this.first().addClass( 'jq-fullscreened' ).data( 'isFullscreened', true );
		
		$( document ).trigger( $.Event( 'jq-fullscreen-change', { element: this, fullscreen: true } ) );
	};

	MTH.exitFullscreenMock = function() {
		this.first().removeClass( 'jq-fullscreened' ).data( 'isFullscreened', false );

		$( document ).trigger( $.Event( 'jq-fullscreen-change', { element: this, fullscreen: false } ) );
	};

	// TODO: remove once viewer isn't being referenced by interfaces anymore
	// and event listening code has been cleaned up
	MTH.resetViewer = function() {
		lightboxHooks.constructor();
		mw.mediaViewer.constructor();
	};

	mw.mmvTestHelpers = MTH;
} )( mediaWiki, jQuery );