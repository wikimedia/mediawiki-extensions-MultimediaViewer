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

	QUnit.asyncTest( 'Check we are saving the resize listener', 2, function ( assert ) {
		var img = new window.LightboxImage('http://en.wikipedia.org/w/skins/vector/images/search-ltr.png'),
			lightbox = new window.LightboxInterface.BaseClass();

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

	QUnit.test( 'The interface is emptied properly when necessary', thingsShouldBeEmptied.length + thingsShouldHaveEmptyClass.length + 2, function ( assert ) {
		var i,
			lightbox = new window.LightboxInterface();

		assert.notStrictEqual( lightbox.handleKeyDown, undefined, 'The keydown handler is present before empty() gets called' );

		lightbox.empty();

		for ( i = 0; i < thingsShouldBeEmptied.length; i++ ) {
			assert.strictEqual( lightbox[thingsShouldBeEmptied[i]].text(), '', 'We successfully emptied the ' + thingsShouldBeEmptied[i] + ' element' );
		}

		for ( i = 0; i < thingsShouldHaveEmptyClass.length; i++ ) {
			assert.strictEqual( lightbox[thingsShouldHaveEmptyClass[i]].hasClass( 'empty' ), true, 'We successfully applied the empty class to the ' + thingsShouldHaveEmptyClass[i] + ' element' );
		}

		assert.strictEqual( lightbox.handleKeyDown, undefined, 'The keydown handler got removed' );
	} );
}( mediaWiki, jQuery ) );
