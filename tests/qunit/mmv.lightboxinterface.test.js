( function ( mw, $ ) {
	var thingsShouldBeEmptied = [
			'$license',
			'$title',
			'$credit',
			'$username',
			'$location',
			'$repo',
			'$datetime'
		],

		thingsShouldHaveEmptyClass = [
			'$license',
			'$credit',
			'$usernameLi',
			'$locationLi',
			'$repoLi',
			'$datetimeLi',
			'$useFileLi',
			'$imageDiv'
		];

	QUnit.module( 'mmv.lightboxInterface', QUnit.newMwEnvironment() );

	QUnit.test( 'Sanity test, object creation and ui construction', 14, function ( assert ) {
		var lightbox = new mw.LightboxInterface( mw.mediaViewer );

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

		// Check that the close button on the lightbox still follow the spec (being visible right away)
		assert.strictEqual( $( '#qunit-fixture .mlb-close' ).length, 1, 'There should be a close button' );
		assert.strictEqual( $( '#qunit-fixture .mlb-close' ).is(':visible'), true, 'The close button should be visible' );

		// Unattach lightbox from document
		lightbox.unattach();

		// UI areas not attached to the document anymore.
		checkIfUIAreasAttachedToDocument(0);
	} );

	QUnit.test( 'The interface is emptied properly when necessary', thingsShouldBeEmptied.length + thingsShouldHaveEmptyClass.length + 1, function ( assert ) {
		var i,
			lightbox = new mw.LightboxInterface( mw.mediaViewer );

		lightbox.empty();

		for ( i = 0; i < thingsShouldBeEmptied.length; i++ ) {
			assert.strictEqual( lightbox[thingsShouldBeEmptied[i]].text(), '', 'We successfully emptied the ' + thingsShouldBeEmptied[i] + ' element' );
		}

		for ( i = 0; i < thingsShouldHaveEmptyClass.length; i++ ) {
			assert.strictEqual( lightbox[thingsShouldHaveEmptyClass[i]].hasClass( 'empty' ), true, 'We successfully applied the empty class to the ' + thingsShouldHaveEmptyClass[i] + ' element' );
		}

		assert.strictEqual( lightbox.$dragIcon.hasClass( 'pointing-down' ), false, 'We successfully reset the chevron' );
	} );

	QUnit.test( 'Handler registration and clearance work OK', 2, function ( assert ) {
		var lightbox = new mw.LightboxInterface( mw.mediaViewer ),
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
		var lightbox = new mw.LightboxInterface( mw.mediaViewer );

		lightbox.setRepoDisplay( 'Example Wiki' );
		assert.strictEqual( lightbox.$repo.text(), 'Learn more on Example Wiki', 'Text set to something useful for remote wiki - if this fails it might be because of localisation' );

		lightbox.setRepoDisplay();
		assert.strictEqual( lightbox.$repo.text(), 'Learn more on ' + mw.config.get( 'wgSiteName' ), 'Text set to something useful for local wiki - if this fails it might be because of localisation' );

		lightbox.setFilePageLink( 'https://commons.wikimedia.org/wiki/File:Foobar.jpg' );
		assert.strictEqual( lightbox.$repo.prop( 'href' ), 'https://commons.wikimedia.org/wiki/File:Foobar.jpg', 'The file link was set successfully.' );
	} );

	QUnit.test( 'Setting location information works as expected', 2, function ( assert ) {
		var lightbox = new mw.LightboxInterface( mw.mediaViewer );

		lightbox.setLocationData(
			50, 10, 20, 'multimediaviewer-geoloc-north',
			70, 30, 40, 'multimediaviewer-geoloc-east',
			12.3456789, 98.7654321, 'en', 'Foobar.jpg'
		);

		assert.strictEqual(
			lightbox.$location.text(),
			'Location: 50° 10′ 20″ N, 70° 30′ 40″ E',
			'Location text is set as expected - if this fails it may be due to i18n issues.'
		);

		assert.strictEqual(
			lightbox.$location.prop( 'href' ),
			'http://tools.wmflabs.org/geohack/geohack.php?pagename=File:Foobar.jpg&params=12.3456789_N_98.7654321_E_&language=en',
			'Location URL is set as expected'
		);
	} );

	QUnit.test( 'Fullscreen mode', 3, function ( assert ) {
		var lightbox = new mw.LightboxInterface( mw.mediaViewer ),
			oldFnEnterFullscreen = $.fn.enterFullscreen,
			oldFnExitFullscreen = $.fn.exitFullscreen;

		// Since we don't want these tests to really open fullscreen
		// which is subject to user security confirmation,
		// we use a mock that pretends regular jquery.fullscreen behavior happened
		$.fn.enterFullscreen = mw.mmvTestHelpers.enterFullscreenMock;
		$.fn.exitFullscreen = mw.mmvTestHelpers.exitFullscreenMock;

		// Attach lightbox to testing fixture to avoid interference with other tests.
		lightbox.attach( '#qunit-fixture' );
		lightbox.viewer.ui = lightbox;
		lightbox.viewer.lightbox = lightbox;

		assert.strictEqual( lightbox.$imageMetadata.is( ':visible' ) , true, 'Image metadata is visible' );

		// Entering fullscreen
		lightbox.$fullscreenButton.click();

		assert.strictEqual( lightbox.$imageMetadata.is( ':visible' ) , false, 'Image metadata is hidden' );

		// Exiting fullscreen
		lightbox.$fullscreenButton.click();

		assert.strictEqual( lightbox.$imageMetadata.is( ':visible' ) , true, 'Image metadata is visible' );

		// Unattach lightbox from document
		lightbox.unattach();

		$.fn.enterFullscreen = oldFnEnterFullscreen;
		$.fn.exitFullscreen = oldFnExitFullscreen;
	} );

	QUnit.test( 'Metadata scrolling', 13, function ( assert ) {
		var lightbox = new mw.LightboxInterface( mw.mediaViewer ),
			keydown = $.Event( 'keydown' ),
			$document = $( document ),
			scrollTopBeforeOpeningLightbox,
			originalJQueryScrollTop = $.fn.scrollTop,
			memorizedScrollToScroll = 0,
			originalJQueryScrollTo = $.scrollTo,
			oldMWLightbox = mw.mediaViewer.lightbox,
			oldMWUI = mw.mediaViewer.ui;

		// Pretend that we have things hooked up
		mw.mediaViewer.ui = lightbox;

		// We need to set up a proxy on the jQuery scrollTop function
		// that will let us pretend that the document really scrolled
		// and that will return values as if the scroll happened
		$.fn.scrollTop = function ( scrollTop ) {
			// On some browsers $.scrollTo() != $document
			if ( $.scrollTo().is( this ) ) {
				if ( scrollTop !== undefined ) {
					memorizedScrollToScroll = scrollTop;
					return this;
				} else {
					return memorizedScrollToScroll;
				}
			}

			return originalJQueryScrollTop.call( this, scrollTop );
		};

		// Same idea as above, for the scrollTo plugin
		$.scrollTo = function ( scrollTo ) {
			var $element;

			if ( scrollTo !== undefined ) {
				memorizedScrollToScroll = scrollTo;
			}

			$element = originalJQueryScrollTo.call( this, scrollTo, 0 );

			if ( scrollTo !== undefined ) {
				// Trigger event manually
				mw.mediaViewer.scroll();
			}

			return $element;
		};

		// First phase of the test: up and down arrows

		// Attach lightbox to testing fixture to avoid interference with other tests.
		lightbox.attach( '#qunit-fixture' );

		// Pretend that we have things hooked up
		mw.mediaViewer.lightbox = { currentIndex: 0 };

		// This lets us avoid pushing a state to the history, which might interfere with other tests
		lightbox.comingFromPopstate = true;
		// Load is needed to start listening to metadata events
		lightbox.load( { getImageElement: function() { return $.Deferred().reject(); } } );

		assert.strictEqual( $.scrollTo().scrollTop(), 0, 'scrollTo scrollTop should be set to 0' );
		assert.strictEqual( lightbox.$dragIcon.hasClass( 'pointing-down' ), false,
			'Chevron pointing up' );

		keydown.which = 38; // Up arrow
		$document.trigger( keydown );

		assert.strictEqual( $.scrollTo().scrollTop(), lightbox.$imageMetadata.height() + 1,
			'scrollTo scrollTop should be set to the metadata height + 1 after pressing up arrow' );
		assert.strictEqual( lightbox.$dragIcon.hasClass( 'pointing-down' ), true,
			'Chevron pointing down after pressing up arrow' );

		keydown.which = 40; // Down arrow
		$document.trigger( keydown );

		assert.strictEqual( $.scrollTo().scrollTop(), 0,
			'scrollTo scrollTop should be set to 0 after pressing down arrow' );
		assert.strictEqual( lightbox.$dragIcon.hasClass( 'pointing-down' ), false,
			'Chevron pointing up after pressing down arrow' );

		lightbox.$dragIcon.click();

		assert.strictEqual( $.scrollTo().scrollTop(), lightbox.$imageMetadata.height() + 1,
			'scrollTo scrollTop should be set to the metadata height + 1 after clicking the chevron once' );
		assert.strictEqual( lightbox.$dragIcon.hasClass( 'pointing-down' ), true,
			'Chevron pointing down after clicking the chevron once' );

		lightbox.$dragIcon.click();

		assert.strictEqual( $.scrollTo().scrollTop(), 0,
			'scrollTo scrollTop should be set to 0 after clicking the chevron twice' );
		assert.strictEqual( lightbox.$dragIcon.hasClass( 'pointing-down' ), false,
			'Chevron pointing up after clicking the chevron twice' );

		// Unattach lightbox from document
		lightbox.unattach();


		// Second phase of the test: scroll memory

		// Scroll down a little bit to check that the scroll memory works
		$.scrollTo( 10, 0 );

		scrollTopBeforeOpeningLightbox = $.scrollTo().scrollTop();

		// Attach lightbox to testing fixture to avoid interference with other tests.
		lightbox.attach( '#qunit-fixture' );

		// To make sure that the details are out of view, the lightbox is supposed to scroll to the top when open
		assert.strictEqual( $.scrollTo().scrollTop(), 0, 'Page scrollTop should be set to 0' );

		// Scroll down to check that the scrollTop memory doesn't affect prev/next (bug 59861)
		$.scrollTo( 20, 0 );

		// This extra attach() call simulates the effect of prev/next seen in bug 59861
		lightbox.attach( '#qunit-fixture' );

		// The lightbox was already open at this point, the scrollTop should be left untouched
		assert.strictEqual( $.scrollTo().scrollTop(), 20, 'Page scrollTop should be set to 20' );

		// Unattach lightbox from document
		lightbox.unattach();

		// Lightbox is supposed to restore the document scrollTop value that was set prior to opening it
		assert.strictEqual( $.scrollTo().scrollTop(), scrollTopBeforeOpeningLightbox, 'document scrollTop value has been restored correctly' );



		// Let's restore all originals, to make sure this test is free of side-effect
		$.fn.scrollTop = originalJQueryScrollTop;
		$.scrollTo = originalJQueryScrollTo;
		mw.mediaViewer.lightbox = oldMWLightbox;
		mw.mediaViewer.ui = oldMWUI;
	} );
}( mediaWiki, jQuery ) );
