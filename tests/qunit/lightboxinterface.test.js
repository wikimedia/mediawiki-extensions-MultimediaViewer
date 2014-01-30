( function ( mw, $ ) {
	QUnit.module( 'multilightbox.interface', QUnit.newMwEnvironment() );

	QUnit.test( 'Sanity test, object creation and ui construction', 6, function ( assert ) {
		var lightbox = new window.LightboxInterface();

		function checkIfUIAreasAttachedToDocument( inDocument ) {
			var msg = inDocument === 1 ? ' ' : ' not ';
			assert.strictEqual( $( '.mlb-wrapper' ).length, inDocument, 'Wrapper area' + msg + 'attached.' );
			assert.strictEqual( $( '.mlb-main' ).length, inDocument, 'Main area' + msg + 'attached.' );
			assert.strictEqual( $( '.mlb-overlay' ).length, inDocument, 'Overlay area' + msg + 'attached.' );
		}

		// UI areas not attached to the document yet.
		checkIfUIAreasAttachedToDocument(0);

		// Attach lightbox to testing fixture to avoid interference with other tests.
		lightbox.attach( '#qunit-fixture' );

		// UI areas should now be attached to the document.
		checkIfUIAreasAttachedToDocument(1);

		/*
		 * TODO(aarcos): We cannot test the section below because unattach()
		 * depends on global lightboxHooks that expect a mw.LightboxInterface object.
		 * Fix once this dependency is resolved.

		// Unattach lightbox from document
		//lightbox.unattach();

		// UI areas not attached to the document anymore.
		//checkIfUIAreasAttachedToDocument(0);
		*/
	} );

	QUnit.asyncTest( 'Check we are saving the resize listener', 2, function ( assert ) {
		var img = new window.LightboxImage('http://en.wikipedia.org/w/skins/vector/images/search-ltr.png'),
			lightbox = new window.LightboxInterface();

		// resizeListener not saved yet
		assert.strictEqual( this.resizeListener, undefined, 'Listener is not saved yet' );

		// Save original loadCallback
		lightbox.originalLoadCallback = lightbox.loadCallback;

		// Mock loadCallback
		lightbox.loadCallback = function ( image, ele ) {
			// Call original loadCallback
			this.originalLoadCallback( image, ele );

			// resizeListener should have been saved
			assert.notStrictEqual( this.resizeListener, undefined, 'Saved listener !' );
			QUnit.start();
		};

		lightbox.load(img);
	} );

	QUnit.test( 'Fullscreen mode', 4, function ( assert ) {
		var lightbox = new window.LightboxInterface(),
			oldFnEnterFullscreen = $.fn.enterFullscreen,
			oldFnExitFullscreen = $.fn.exitFullscreen;

		// Since we don't want these tests to really open fullscreen
		// which is subject to user security confirmation,
		// we use a mock that pretends regular jquery.fullscreen behavior happened
		$.fn.enterFullscreen = mw.mmvTestHelpers.enterFullscreenMock;
		$.fn.exitFullscreen = mw.mmvTestHelpers.exitFullscreenMock;

		// Attach lightbox to testing fixture to avoid interference with other tests.
		lightbox.attach( '#qunit-fixture' );

		// Entering fullscreen
		lightbox.$fullscreenButton.click();

		assert.strictEqual( lightbox.$main.hasClass( 'jq-fullscreened' ) , true,
			'Fullscreened area has the fullscreen class');
		assert.strictEqual( lightbox.isFullscreen , true, 'Lightbox knows it\'s in fullscreen mode');

		// Exiting fullscreen
		lightbox.$fullscreenButton.click();

		assert.strictEqual( lightbox.$main.hasClass( 'jq-fullscreened' ) , false,
			'Fullscreened area doesn\'t have the fullscreen class anymore');
		assert.strictEqual( lightbox.isFullscreen , false, 'Lightbox knows it\'s not in fullscreen mode');

		$.fn.enterFullscreen = oldFnEnterFullscreen;
		$.fn.exitFullscreen = oldFnExitFullscreen;
	} );

}( mediaWiki, jQuery ) );
