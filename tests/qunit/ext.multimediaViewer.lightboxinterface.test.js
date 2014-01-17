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

	QUnit.test( 'Sanity test, object creation and ui construction', 17, function ( assert ) {
		var lightbox = new mw.LightboxInterface(),
			$document = $( document ),
			scrollTopBeforeOpeningLightbox,
			originalJQueryScrollTop = $.fn.scrollTop,
			memorizedDocumentScroll;

		function checkIfUIAreasAttachedToDocument( inDocument ) {
			var msg = inDocument === 1 ? ' ' : ' not ';
			assert.strictEqual( $( '.mw-mlb-title' ).length, inDocument, 'Title area' + msg + 'attached.' );
			assert.strictEqual( $( '.mw-mlb-author' ).length, inDocument, 'Author area' + msg + 'attached.' );
			assert.strictEqual( $( '.mw-mlb-image-desc' ).length, inDocument, 'Description area' + msg + 'attached.' );
			assert.strictEqual( $( '.mw-mlb-image-links' ).length, inDocument, 'Links area' + msg + 'attached.' );
		}

		// We need to set up a proxy on the jQuery scrollTop function
		// that will let us pretend that the document really scrolled
		// and that will return values as if the scroll happened
		$.fn.scrollTop = function ( scrollTop ) {
			if ( $document.is( this ) ) {
				if ( scrollTop !== undefined ) {
					memorizedDocumentScroll = scrollTop;
					return this;
				} else {
					return memorizedDocumentScroll;
				}
			}

			return originalJQueryScrollTop.call( this, scrollTop );
		};

		// Scroll down a little bit to check that the scroll memory works
		$document.scrollTop( 10 );

		scrollTopBeforeOpeningLightbox = $document.scrollTop();

		// UI areas not attached to the document yet.
		checkIfUIAreasAttachedToDocument(0);

		// Attach lightbox to testing fixture to avoid interference with other tests.
		lightbox.attach( '#qunit-fixture' );

		// To make sure that the details are out of view, the lightbox is supposed to scroll to the top when open
		assert.strictEqual( $document.scrollTop(), 0, 'Document scrollTop should be set to 0' );

		// Scroll down to check that the scrollTop memory doesn't affect prev/next (bug 59861)
		$document.scrollTop( 20 );

		// This extra attach() call simulates the effect of prev/next seen in bug 59861
		lightbox.attach( '#qunit-fixture' );

		// The lightbox was already open at this point, the scrollTop should be left untouched
		assert.strictEqual( $document.scrollTop(), 20, 'Document scrollTop should be set to 20' );

		// UI areas should now be attached to the document.
		checkIfUIAreasAttachedToDocument(1);

		// Check that the close button on the lightbox still follow the spec (being visible right away)
		assert.strictEqual( $( '#qunit-fixture .mlb-close' ).length, 1, 'There should be a close button' );
		assert.strictEqual( $( '#qunit-fixture .mlb-close' ).is(':visible'), true, 'The close button should be visible' );

		// Unattach lightbox from document
		lightbox.unattach();

		// Lightbox is supposed to restore the document scrollTop value that was set prior to opening it
		assert.strictEqual( $document.scrollTop(), scrollTopBeforeOpeningLightbox, 'document scrollTop value has been restored correctly' );

		// UI areas not attached to the document anymore.
		checkIfUIAreasAttachedToDocument(0);

		// Let's remove our scrollTop proxy, to make sure this test is free of side-effect
		$.fn.scrollTop = originalJQueryScrollTop;
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

	QUnit.test( 'Setting repository information in the UI works as expected', 3, function ( assert ) {
		var lightbox = new mw.LightboxInterface();

		lightbox.setRepoDisplay( 'Example Wiki' );
		assert.strictEqual( lightbox.$repo.text(), 'Learn more on Example Wiki', 'Text set to something useful for remote wiki - if this fails it might be because of localisation' );

		lightbox.setRepoDisplay();
		assert.strictEqual( lightbox.$repo.text(), 'Learn more on ' + mw.config.get( 'wgSiteName' ), 'Text set to something useful for local wiki - if this fails it might be because of localisation' );

		lightbox.setFilePageLink( 'https://commons.wikimedia.org/wiki/File:Foobar.jpg' );
		assert.strictEqual( lightbox.$repo.prop( 'href' ), 'https://commons.wikimedia.org/wiki/File:Foobar.jpg', 'The file link was set successfully.' );
	} );
}( mediaWiki, jQuery ) );
