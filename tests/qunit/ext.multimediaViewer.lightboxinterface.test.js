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

	QUnit.test( 'Sanity test, object creation and ui construction', 14, function ( assert ) {
		var lightbox = new mw.LightboxInterface(),
			$document = $( document ),
			scrollTopBeforeOpeningLightbox;

		function checkIfUIAreasAttachedToDocument( inDocument ) {
			var msg = inDocument === 1 ? ' ' : ' not ';
			assert.strictEqual( $( '.mw-mlb-title' ).length, inDocument, 'Title area' + msg + 'attached.' );
			assert.strictEqual( $( '.mw-mlb-author' ).length, inDocument, 'Author area' + msg + 'attached.' );
			assert.strictEqual( $( '.mw-mlb-image-desc' ).length, inDocument, 'Description area' + msg + 'attached.' );
			assert.strictEqual( $( '.mw-mlb-image-links' ).length, inDocument, 'Links area' + msg + 'attached.' );
		}

		// Scroll down a little bit to check that the scroll memory works
		$document.scrollTop( 10 );

		scrollTopBeforeOpeningLightbox = $document.scrollTop();

		// UI areas not attached to the document yet.
		checkIfUIAreasAttachedToDocument(0);

		// Attach lightbox to testing fixture to avoid interference with other tests.
		lightbox.attach( '#qunit-fixture' );

		// To make sure that the details are out of view, the lightbox is supposed to scroll to the top when open
		assert.strictEqual( $document.scrollTop(), 0, 'Document scrollTop should be set to 0' );

		// UI areas should now be attached to the document.
		checkIfUIAreasAttachedToDocument(1);

		// Unattach lightbox from document
		lightbox.unattach();

		// Lightbox is supposed to restore the document scrollTop value that was set prior to opening it
		assert.strictEqual( $document.scrollTop(), scrollTopBeforeOpeningLightbox, 'document scrollTop value has been restored correctly' );

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

	QUnit.test( 'Setting repository information in the UI works as expected', 5, function ( assert ) {
		var lightbox = new mw.LightboxInterface(),

			localRepoInfo = {
				local: true
			},

			remoteDBRepoInfo = {
				descBaseUrl: 'http://example.com/wiki/File:'
			},

			remoteAPIRepoInfo = {
				server: 'http://commons.example.org',
				articlepath: '/wiki/$1'
			};

		lightbox.setRepoDisplayName( 'Example Wiki' );
		assert.strictEqual( lightbox.$repo.text(), 'Learn more on Example Wiki', 'Text set to something useful for remote wiki - if this fails it might be because of localisation' );

		lightbox.setRepoDisplayName();
		assert.strictEqual( lightbox.$repo.text(), 'Learn more on ' + mw.config.get( 'wgSiteName' ), 'Text set to something useful for local wiki - if this fails it might be because of localisation' );

		lightbox.setFilePageLink( localRepoInfo, mw.Title.newFromText( 'File:Foobar.jpg' ) );
		assert.strictEqual( lightbox.$repo.prop( 'href' ), mw.config.get( 'wgServer' ) + mw.config.get( 'wgArticlePath' ).replace( '$1', 'File:Foobar.jpg' ), 'The file link was set to a local page successfully.' );

		lightbox.setFilePageLink( remoteDBRepoInfo, mw.Title.newFromText( 'File:Foobar.jpg' ) );
		assert.strictEqual( lightbox.$repo.prop( 'href' ), 'http://example.com/wiki/File:Foobar.jpg', 'The file link was set to a remote shared DB page successfully.' );

		lightbox.setFilePageLink( remoteAPIRepoInfo, mw.Title.newFromText( 'File:Foobar.jpg' ) );
		assert.strictEqual( lightbox.$repo.prop( 'href' ), 'http://commons.example.org/wiki/File:Foobar.jpg', 'The file link was set to a remote API page successfully.' );
	} );
}( mediaWiki, jQuery ) );
