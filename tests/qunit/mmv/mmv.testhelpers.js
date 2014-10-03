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

	/**
	 * Returns the exception thrown by callback, or undefined if no exception was thrown.
	 * @param {Function} callback
	 * @returns {*}
	 */
	MTH.getException = function ( callback ) {
		var ex;
		try {
			callback();
		} catch ( e ) {
			ex = e;
		}
		return ex;
	};

	/**
	 * Returns a fake local storage which is not saved between reloads.
	 * @param {object} [initialData]
	 */
	MTH.getFakeLocalStorage = function ( initialData ) {
		var bag = new mw.Map( initialData );

		return {
			getItem: function ( key ) { return bag.get( key ); },
			setItem: function ( key, value ) { bag.set( key, value ); },
			removeItem: function ( key ) { bag.set( key, null ); }
		};
	};

	mw.mmv.testHelpers = MTH;
} )( mediaWiki, jQuery );