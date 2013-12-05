( function ( mw, $ ) {
	QUnit.module( 'ext.multimediaViewer.lightboxInterface', QUnit.newMwEnvironment() );

	QUnit.test( 'Sanity test, object creation and ui construction', 9, function ( assert ) {
		var lightbox = new window.LightboxInterface();

		function checkIfUIAreasAttachedToDocument( inDocument ) {
			var msg = inDocument === 1 ? ' ' : ' not ';
			assert.strictEqual( $( '.mlb-wrapper' ).length, inDocument, 'Wrapper area' + msg + 'attached.' );
			assert.strictEqual( $( '.mlb-main' ).length, inDocument, 'Main area' + msg + 'attached.' );
			assert.strictEqual( $( '.mlb-overlay' ).length, inDocument, 'Overlay area' + msg + 'attached.' );
		}

		// UI areas not attached to the document yet.
		checkIfUIAreasAttachedToDocument(0);

		// Attach lightbox to document
		lightbox.attach();

		// UI areas should now be attached to the document.
		checkIfUIAreasAttachedToDocument(1);

		// Unattach lightbox from document
		lightbox.unattach();

		// UI areas not attached to the document anymore.
		checkIfUIAreasAttachedToDocument(0);
	} );
}( mediaWiki, jQuery ) );
