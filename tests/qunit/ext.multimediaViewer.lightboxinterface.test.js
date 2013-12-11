( function ( mw, $ ) {
	var thingsShouldBeEmptied = [
			'$license',
			'$imageDesc',
			'$title',
			'$credit',
			'$username',
			'$repo',
			'$datetime'
		],

		thingsShouldHaveEmptyClass = [
			'$license',
			'$imageDescDiv',
			'$credit',
			'$usernameLi',
			'$repoLi',
			'$datetimeLi',
			'$useFileLi',
			'$imageDiv'
		];

	QUnit.module( 'ext.multimediaViewer.lightboxInterface', QUnit.newMwEnvironment() );

	QUnit.test( 'Sanity test, object creation and ui construction', 12, function ( assert ) {
		var lightbox = new mw.LightboxInterface();

		function checkIfUIAreasAttachedToDocument( inDocument ) {
			var msg = inDocument === 1 ? ' ' : ' not ';
			assert.strictEqual( $( '.mw-mlb-title' ).length, inDocument, 'Title area' + msg + 'attached.' );
			assert.strictEqual( $( '.mw-mlb-author' ).length, inDocument, 'Author area' + msg + 'attached.' );
			assert.strictEqual( $( '.mw-mlb-image-desc' ).length, inDocument, 'Description area' + msg + 'attached.' );
			assert.strictEqual( $( '.mw-mlb-image-links' ).length, inDocument, 'Links area' + msg + 'attached.' );
		}

		// UI areas not attached to the document yet.
		checkIfUIAreasAttachedToDocument(0);

		// Attach lightbox to testing fixture to avoid interference with other tests.
		lightbox.attach( '#qunit-fixture' );

		// UI areas should now be attached to the document.
		checkIfUIAreasAttachedToDocument(1);

		// Unattach lightbox from document
		lightbox.unattach();

		// UI areas not attached to the document anymore.
		checkIfUIAreasAttachedToDocument(0);
	} );

	QUnit.test( 'The interface is emptied properly when necessary', thingsShouldBeEmptied.length + thingsShouldHaveEmptyClass.length, function ( assert ) {
		var i,
			lightbox = new mw.LightboxInterface();

		lightbox.empty();

		for ( i = 0; i < thingsShouldBeEmptied.length; i++ ) {
			assert.strictEqual( lightbox[thingsShouldBeEmptied[i]].text(), '', 'We successfully emptied the ' + thingsShouldBeEmptied[i] + ' element' );
		}

		for ( i = 0; i < thingsShouldHaveEmptyClass.length; i++ ) {
			assert.strictEqual( lightbox[thingsShouldHaveEmptyClass[i]].hasClass( 'empty' ), true, 'We successfully applied the empty class to the ' + thingsShouldHaveEmptyClass[i] + ' element' );
		}
	} );

	QUnit.test( 'Handler registration and clearance work OK', 2, function ( assert ) {
		var lightbox = new mw.LightboxInterface(),
			handlerCalls = 0;

		function handleEvent() {
			handlerCalls++;
		}

		lightbox.handleEvent( 'test', handleEvent );
		$( document ).trigger( 'test' );
		assert.strictEqual( handlerCalls, 1, 'The handler was called when we triggered the event.' );
		lightbox.clearEvents();
		$( document ).trigger( 'test' );
		assert.strictEqual( handlerCalls, 1, 'The handler was not called after calling lightbox.clearEvents().' );
	} );

}( mediaWiki, jQuery ) );
