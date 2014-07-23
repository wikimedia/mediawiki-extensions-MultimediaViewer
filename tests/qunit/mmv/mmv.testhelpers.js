( function ( mw, $ ) {
	var MTH = {};

	MTH.enterFullscreenMock = function () {
		this.first().addClass( 'jq-fullscreened' ).data( 'isFullscreened', true );

		$( document ).trigger( $.Event( 'jq-fullscreen-change', { element: this, fullscreen: true } ) );
	};

	MTH.exitFullscreenMock = function () {
		this.first().removeClass( 'jq-fullscreened' ).data( 'isFullscreened', false );

		$( document ).trigger( $.Event( 'jq-fullscreen-change', { element: this, fullscreen: false } ) );
	};

	MTH.getException = function ( callback ) {
		var ex;
		try {
			callback();
		} catch ( e ) {
			ex = e;
		}
		return ex;
	};

	mw.mmv.testHelpers = MTH;
} )( mediaWiki, jQuery );