( function ( mw, $ ) {
	QUnit.module( 'mmv', QUnit.newMwEnvironment() );

	QUnit.test( 'eachPrealoadableLightboxIndex()', 11, function ( assert ) {
		var viewer = new mw.mmv.MultimediaViewer(),
			expectedIndices,
			i;

		viewer.preloadDistance = 3;
		viewer.thumbs = [];

		// 0..10
		for ( i = 0; i < 11; i++ ) {
			viewer.thumbs.push( { image : false } );
		}

		viewer.currentIndex = 2;
		i = 0;
		expectedIndices = [2, 3, 1, 4, 0, 5];
		viewer.eachPrealoadableLightboxIndex( function( index ) {
			assert.strictEqual( index, expectedIndices[i++], 'preload on left edge');
		} );

		viewer.currentIndex = 9;
		i = 0;
		expectedIndices = [9, 10, 8, 7, 6];
		viewer.eachPrealoadableLightboxIndex( function( index ) {
			assert.strictEqual( index, expectedIndices[i++], 'preload on right edge');
		} );
	} );

	QUnit.test( 'Hash handling', 7, function ( assert ) {
		var oldUnattach,
			viewer = new mw.mmv.MultimediaViewer(),
			ui = new mw.mmv.LightboxInterface(),
			imageSrc = 'Foo bar.jpg',
			image = { filePageTitle: new mw.Title( 'File:' + imageSrc ) };

		window.location.hash = '';

		viewer.setupEventHandlers();
		oldUnattach = ui.unattach;

		ui.unattach = function () {
			assert.ok( true, 'Lightbox was unattached' );
			oldUnattach.call( this );
		};

		viewer.ui = ui;
		viewer.close();

		assert.ok( !viewer.isOpen, 'Viewer is closed' );

		viewer.isOpen = true;

		// Verify that passing an invalid mmv hash when the mmv is open triggers unattach()
		window.location.hash = 'Foo';
		viewer.hash();

		// Verify that mmv doesn't reset a foreign hash
		assert.strictEqual( window.location.hash, '#Foo', 'Foreign hash remains intact' );
		assert.ok( !viewer.isOpen, 'Viewer is closed' );

		ui.unattach = function () {
			assert.ok( false, 'Lightbox was not unattached' );
			oldUnattach.call( this );
		};

		// Verify that passing an invalid mmv hash  when the mmv is closed doesn't trigger unattach()
		window.location.hash = 'Bar';
		viewer.hash();

		// Verify that mmv doesn't reset a foreign hash
		assert.strictEqual( window.location.hash, '#Bar', 'Foreign hash remains intact' );

		viewer.ui = { images: [ image ] };

		$( '#qunit-fixture' ).append( '<a class="image"><img src="' + imageSrc + '"></a>' );

		viewer.loadImageByTitle = function( title ) {
			assert.strictEqual( title.getPrefixedText(), 'File:' + imageSrc, 'The title matches' );
		};

		// Open a valid mmv hash link and check that the right image is requested.
		// imageSrc contains a space without any encoding on purpose
		window.location.hash = 'mediaviewer/File:' + imageSrc;
		viewer.hash();

		// Reset the hash, because for some browsers switching from the non-URI-encoded to
		// the non-URI-encoded version of the same text with a space will not trigger a hash change
		window.location.hash = '';
		viewer.hash();

		// Try again with an URI-encoded imageSrc containing a space
		window.location.hash = 'mediaviewer/File:' + encodeURIComponent( imageSrc );
		viewer.hash();

		viewer.cleanupEventHandlers();

		window.location.hash = '';
	} );

	QUnit.test( 'Progress', 4, function ( assert ) {
		var imageDeferred = $.Deferred(),
			viewer = new mw.mmv.MultimediaViewer();

		viewer.thumbs = [];
		viewer.displayPlaceholderThumbnail = $.noop;
		viewer.setImage = $.noop;
		viewer.scroll = $.noop;
		viewer.preloadFullscreenThumbnail = $.noop;
		viewer.fetchSizeIndependentLightboxInfo = function () { return $.Deferred().resolve(); };
		viewer.ui = {
			setupForLoad : $.noop,
			canvas : { set : $.noop,
				unblurWithAnimation: $.noop,
				unblur: $.noop,
				getCurrentImageWidths : function () { return { real : 0 }; } },
			panel : {
				setImageInfo : $.noop,
				animateMetadataOnce : $.noop,
				progressBar: {
					animateTo: this.sandbox.stub(),
					jumpTo: this.sandbox.stub()
				}
			},
			open : $.noop };

		viewer.imageProvider.get = function() { return imageDeferred.promise(); };
		viewer.imageInfoProvider.get = function() { return $.Deferred().resolve(); };
		viewer.thumbnailInfoProvider.get = function() { return $.Deferred().resolve( {} ); };

		viewer.loadImage( { filePageTitle : new mw.Title( 'File:Stuff.jpg' ) }, new Image() );
		assert.ok( viewer.ui.panel.progressBar.jumpTo.lastCall.calledWith( 0 ),
			'Percentage correctly reset by loadImage' );

		assert.ok( viewer.ui.panel.progressBar.animateTo.lastCall.calledWith( 5 ),
			'Percentage correctly animated to 5 by loadImage' );

		imageDeferred.notify( 'response', 45 );
		assert.ok( viewer.ui.panel.progressBar.animateTo.lastCall.calledWith( 45 ),
			'Percentage correctly funneled to panel UI' );

		imageDeferred.resolve();
		assert.ok( viewer.ui.panel.progressBar.animateTo.lastCall.calledWith( 100 ),
			'Percentage correctly funneled to panel UI' );

		viewer.close();
	} );

	QUnit.test( 'Progress when switching images', 11, function ( assert ) {
		var firstImageDeferred = $.Deferred(),
			secondImageDeferred = $.Deferred(),
			firstImage = { index: 1, filePageTitle : new mw.Title( 'File:First.jpg' ) },
			secondImage = { index: 2, filePageTitle : new mw.Title( 'File:Second.jpg' ) },
			viewer = new mw.mmv.MultimediaViewer();

		viewer.thumbs = [];
		viewer.displayPlaceholderThumbnail = $.noop;
		viewer.setImage = $.noop;
		viewer.scroll = $.noop;
		viewer.preloadFullscreenThumbnail = $.noop;
		viewer.preloadImagesMetadata = $.noop;
		viewer.preloadThumbnails = $.noop;
		viewer.fetchSizeIndependentLightboxInfo = function () { return $.Deferred().resolve(); };
		viewer.ui = {
			setupForLoad : $.noop,
			canvas : { set : $.noop,
				unblurWithAnimation: $.noop,
				unblur: $.noop,
				getCurrentImageWidths : function () { return { real : 0 }; } },
			panel : {
				setImageInfo : $.noop,
				animateMetadataOnce : $.noop,
				progressBar: {
					hide: this.sandbox.stub(),
					animateTo: this.sandbox.stub(),
					jumpTo: this.sandbox.stub()
				}
			},
			open : $.noop,
			empty: $.noop };

		viewer.imageInfoProvider.get = function() { return $.Deferred().resolve(); };
		viewer.thumbnailInfoProvider.get = function() { return $.Deferred().resolve( {} ); };

		// load some image
		viewer.imageProvider.get = this.sandbox.stub().returns( firstImageDeferred );
		viewer.loadImage( firstImage, new Image() );

		assert.ok( viewer.ui.panel.progressBar.jumpTo.lastCall.calledWith( 0 ),
			'Percentage correctly reset for new first image' );
		assert.ok( viewer.ui.panel.progressBar.animateTo.lastCall.calledWith( 5 ),
			'Percentage correctly animated to 5 for first new image' );

		firstImageDeferred.notify( 'response', 20 );

		assert.ok( viewer.ui.panel.progressBar.animateTo.lastCall.calledWith( 20 ),
			'Percentage correctly animated when active image is loading' );

		// change to another image
		viewer.imageProvider.get = this.sandbox.stub().returns( secondImageDeferred );
		viewer.loadImage( secondImage, new Image() );

		assert.ok( viewer.ui.panel.progressBar.jumpTo.lastCall.calledWith( 0 ),
			'Percentage correctly reset for second new image' );
		assert.ok( viewer.ui.panel.progressBar.animateTo.lastCall.calledWith( 5 ),
			'Percentage correctly animated to 5 for second new image' );

		secondImageDeferred.notify( 'response', 30 );

		assert.ok( viewer.ui.panel.progressBar.animateTo.lastCall.calledWith( 30 ),
			'Percentage correctly animated when active image is loading' );

		// this is the most convenient way of checking for new calls - just reset() and check called
		viewer.ui.panel.progressBar.animateTo.reset();
		viewer.ui.panel.progressBar.jumpTo.reset();

		firstImageDeferred.notify( 'response', 40 );

		assert.ok( !viewer.ui.panel.progressBar.animateTo.called,
			'Percentage not animated when inactive image is loading' );
		assert.ok( !viewer.ui.panel.progressBar.jumpTo.called,
			'Percentage not changed when inactive image is loading' );

		secondImageDeferred.notify( 'response', 50 );

		// change back to first image
		viewer.loadImage( firstImage, new Image() );

		assert.ok( viewer.ui.panel.progressBar.jumpTo.lastCall.calledWith( 40 ),
			'Percentage jumps to right value when changing images' );

		secondImageDeferred.resolve();
		assert.ok( !viewer.ui.panel.progressBar.hide.called,
			'Progress bar not hidden when something finishes in the background' );

		// change to second image which has finished loading
		viewer.imageProvider.get = this.sandbox.stub().returns( secondImageDeferred );
		viewer.loadImage( secondImage, new Image() );

		assert.ok( viewer.ui.panel.progressBar.hide.called,
			'Progress bar not hidden when switching to finished image' );

		viewer.close();
	} );

	QUnit.test( 'resetBlurredThumbnailStates', 4, function ( assert ) {
		var viewer = new mw.mmv.MultimediaViewer();

		assert.ok( !viewer.realThumbnailShown, 'Real thumbnail state is correct' );
		assert.ok( !viewer.blurredThumbnailShown, 'Placeholder state is correct' );

		viewer.realThumbnailShown = true;
		viewer.blurredThumbnailShown = true;

		viewer.resetBlurredThumbnailStates();

		assert.ok( !viewer.realThumbnailShown, 'Real thumbnail state is correct' );
		assert.ok( !viewer.blurredThumbnailShown, 'Placeholder state is correct' );
	} );

	QUnit.test( 'Placeholder first, then real thumbnail', 4, function ( assert ) {
		var viewer = new mw.mmv.MultimediaViewer();

		viewer.setImage = $.noop;
		viewer.ui = { canvas : {
			unblurWithAnimation: $.noop,
			unblur: $.noop,
			maybeDisplayPlaceholder : function() { return true; }
		} };
		viewer.imageInfoProvider.get = this.sandbox.stub();

		viewer.displayPlaceholderThumbnail( { originalWidth: 100, originalHeight: 100 }, undefined, undefined);

		assert.ok( viewer.blurredThumbnailShown, 'Placeholder state is correct' );
		assert.ok( !viewer.realThumbnailShown, 'Real thumbnail state is correct' );

		viewer.displayRealThumbnail();

		assert.ok( viewer.realThumbnailShown, 'Real thumbnail state is correct' );
		assert.ok( viewer.blurredThumbnailShown, 'Placeholder state is correct' );
	} );

	QUnit.test( 'Placeholder first, then real thumbnail - missing size', 4, function ( assert ) {
		var viewer = new mw.mmv.MultimediaViewer();

		viewer.currentIndex = 1;
		viewer.setImage = $.noop;
		viewer.ui = { canvas : {
			unblurWithAnimation: $.noop,
			unblur: $.noop,
			maybeDisplayPlaceholder : function() { return true; }
		} };
		viewer.imageInfoProvider.get = this.sandbox.stub().returns( $.Deferred().resolve( {width: 100, height: 100 } ) );

		viewer.displayPlaceholderThumbnail( { index: 1 }, undefined, undefined);

		assert.ok( viewer.blurredThumbnailShown, 'Placeholder state is correct' );
		assert.ok( !viewer.realThumbnailShown, 'Real thumbnail state is correct' );

		viewer.displayRealThumbnail();

		assert.ok( viewer.realThumbnailShown, 'Real thumbnail state is correct' );
		assert.ok( viewer.blurredThumbnailShown, 'Placeholder state is correct' );
	} );

	QUnit.test( 'Real thumbnail first, then placeholder', 4, function ( assert ) {
		var viewer = new mw.mmv.MultimediaViewer();

		viewer.setImage = $.noop;
		viewer.ui = {
			showImage : $.noop,
			canvas : {
				unblurWithAnimation: $.noop,
				unblur: $.noop
		} };

		viewer.displayRealThumbnail();

		assert.ok( viewer.realThumbnailShown, 'Real thumbnail state is correct' );
		assert.ok( !viewer.blurredThumbnailShown, 'Placeholder state is correct' );

		viewer.displayPlaceholderThumbnail( {}, undefined, undefined);

		assert.ok( viewer.realThumbnailShown, 'Real thumbnail state is correct' );
		assert.ok( !viewer.blurredThumbnailShown, 'Placeholder state is correct' );
	} );

	QUnit.test( 'displayRealThumbnail', 2, function ( assert ) {
		var viewer = new mw.mmv.MultimediaViewer();

		viewer.setImage = $.noop;
		viewer.ui = { canvas : {
			unblurWithAnimation : this.sandbox.stub(),
			unblur: $.noop
		} };
		viewer.blurredThumbnailShown = true;

		// Should not result in an unblurWithAnimation animation (image cache from cache)
		viewer.displayRealThumbnail( undefined, undefined, undefined, 5 );
		assert.ok( !viewer.ui.canvas.unblurWithAnimation.called, 'There should not be an unblurWithAnimation animation' );

		// Should result in an unblurWithAnimation (image didn't come from cache)
		viewer.displayRealThumbnail( undefined, undefined, undefined, 1000 );
		assert.ok( viewer.ui.canvas.unblurWithAnimation.called, 'There should be an unblurWithAnimation animation' );
	} );

	QUnit.test( 'New image loaded while another one is loading', 5, function ( assert ) {
		var viewer = new mw.mmv.MultimediaViewer(),
			firstImageDeferred = $.Deferred(),
			secondImageDeferred = $.Deferred(),
			firstLigthboxInfoDeferred = $.Deferred(),
			secondLigthboxInfoDeferred = $.Deferred();

		viewer.preloadFullscreenThumbnail = $.noop;
		viewer.fetchSizeIndependentLightboxInfo = this.sandbox.stub();
		viewer.ui = {
			setupForLoad : $.noop,
			canvas : { set : $.noop,
				getCurrentImageWidths : function () { return { real : 0 }; } },
			panel : {
				setImageInfo : this.sandbox.stub(),
				progressBar: {
					animateTo : this.sandbox.stub(),
					jumpTo : this.sandbox.stub()
				},
				empty: $.noop,
				animateMetadataOnce: $.noop
			},
			open : $.noop,
			empty: $.noop };
		viewer.displayRealThumbnail = this.sandbox.stub();
		viewer.eachPrealoadableLightboxIndex = $.noop;
		viewer.animateMetadataDivOnce = this.sandbox.stub().returns( $.Deferred().reject() );
		viewer.imageProvider.get = this.sandbox.stub();
		viewer.imageInfoProvider.get = function() { return $.Deferred().reject(); };
		viewer.thumbnailInfoProvider.get = function() { return $.Deferred().resolve( {} ); };

		viewer.imageProvider.get.returns( firstImageDeferred.promise() );
		viewer.fetchSizeIndependentLightboxInfo.returns( firstLigthboxInfoDeferred.promise() );
		viewer.loadImage( { filePageTitle : new mw.Title( 'File:Foo.jpg' ), index : 0 }, new Image() );
		assert.ok( !viewer.animateMetadataDivOnce.called, 'Metadata of the first image should not be animated' );
		assert.ok( !viewer.ui.panel.setImageInfo.called, 'Metadata of the first image should not be shown' );

		viewer.imageProvider.get.returns( secondImageDeferred.promise() );
		viewer.fetchSizeIndependentLightboxInfo.returns( secondLigthboxInfoDeferred.promise() );
		viewer.loadImage( { filePageTitle : new mw.Title( 'File:Bar.jpg' ), index : 1 }, new Image() );

		viewer.ui.panel.progressBar.animateTo.reset();
		firstImageDeferred.notify( undefined, 45 );
		assert.ok( !viewer.ui.panel.progressBar.animateTo.reset.called, 'Progress of the first image should not be shown' );

		firstImageDeferred.resolve();
		firstLigthboxInfoDeferred.resolve();
		assert.ok( !viewer.displayRealThumbnail.called, 'The first image being done loading should have no effect');

		viewer.displayRealThumbnail = this.sandbox.spy( function () { viewer.close(); } );
		secondImageDeferred.resolve();
		secondLigthboxInfoDeferred.resolve();
		assert.ok( viewer.displayRealThumbnail.called, 'The second image being done loading should result in the image being shown');
	} );

	QUnit.test( 'Events are not trapped after the viewer is closed', 0, function( assert ) {
		var i, j, k, eventParameters,
			viewer = new mw.mmv.MultimediaViewer(),
			$document = $( document ),
			$qf = $( '#qunit-fixture' ),
			eventTypes = [ 'keydown', 'keyup', 'keypress', 'click', 'mousedown', 'mouseup' ],
			modifiers = [ undefined, 'altKey', 'ctrlKey', 'shiftKey', 'metaKey' ],
			oldScrollTo = $.scrollTo;

		$.scrollTo = function () { return { scrollTop : $.noop, on : $.noop, off : $.noop }; };

		viewer.setupEventHandlers();

		viewer.imageProvider.get = function() { return $.Deferred().reject(); };
		viewer.imageInfoProvider.get = function() { return $.Deferred().reject(); };
		viewer.thumbnailInfoProvider.get = function() { return $.Deferred().reject(); };
		viewer.imageUsageProvider.get = function() { return $.Deferred().reject(); };
		viewer.fileRepoInfoProvider.get = function() { return $.Deferred().reject(); };

		viewer.preloadFullscreenThumbnail = $.noop;
		viewer.initWithThumbs( [] );

		viewer.loadImage( { filePageTitle : new mw.Title( 'File:Stuff.jpg' ),
			thumbnail : new mw.mmv.model.Thumbnail( 'foo', 10, 10 ) },
			new Image() );

		viewer.ui.$closeButton.click();

		function eventHandler ( e ) {
			if ( e.isDefaultPrevented() ) {
				assert.ok( false, 'Event was incorrectly trapped : ' + e.which );
			}

			e.preventDefault();

			// Wait for the last event
			if ( e.which === 32 && e.type === 'mouseup' ) {
				QUnit.start();
				$document.off( '.mmvtest' );
				viewer.cleanupEventHandlers();
				$.scrollTo = oldScrollTo;
			}
		}

		// Events are async, we need to wait for the last event to be caught before ending the test
		QUnit.stop();

		for ( j = 0; j < eventTypes.length; j++ ) {
			$document.on( eventTypes[ j ] + '.mmvtest', eventHandler );

		eventloop:
			for ( i = 0; i < 256; i++ ) {
				// Save some time by not testing unlikely values for mouse events
				if ( i > 32 ) {
					switch ( eventTypes[ j ] ) {
						case 'click':
						case 'mousedown':
						case 'mouseup':
							break eventloop;
					}
				}

				for ( k = 0; k < modifiers.length; k++ ) {
					eventParameters = { which : i };
					if ( modifiers[ k ] !== undefined ) {
						eventParameters[ modifiers[ k ] ] = true;
					}
					$qf.trigger( $.Event( eventTypes[ j ], eventParameters ) );
				}
			}
		}
	} );

	QUnit.test( 'Refuse to load too-big thumbnails', 1, function ( assert ) {
		var viewer = new mw.mmv.MultimediaViewer(),
			intendedWidth = 50,
			title = mw.Title.newFromText( 'File:Foobar.svg' );

		viewer.thumbnailInfoProvider.get = function ( fileTitle, width ) {
			assert.strictEqual( width, intendedWidth );
			return $.Deferred().reject();
		};

		viewer.fetchThumbnail( title, 1000, null, intendedWidth, 60 );
	} );

	QUnit.test( 'fetchThumbnail()', 14, function ( assert ) {
		var viewer = new mw.mmv.MultimediaViewer(),
			oldUseThumbnailGuessing = mw.config.get( 'wgMultimediaViewer' ).useThumbnailGuessing,
			file = new mw.Title( 'File:Copyleft.svg' ),
			sampleURL = 'http://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Copyleft.svg/300px-Copyleft.svg.png',
			width = 100,
			originalWidth = 1000,
			originalHeight = 1000,
			apiURL = 'foo',
			guessedURL = 'bar';

		mw.config.get( 'wgMultimediaViewer' ).useThumbnailGuessing = true;

		viewer.guessedThumbnailInfoProvider = {
			get: function() {
				assert.ok( false, 'Guessed thumbnail provider should not be called, because we lack sample URL and original dimensions' );
			}
		};

		viewer.thumbnailInfoProvider = {
			get: function() {
				assert.ok( true, 'Classic thumbnail info provider should be called, because we lack sample URL and original dimensions' );
				return $.Deferred().reject();
			}
		};

		viewer.fetchThumbnail( file, width );

		viewer.guessedThumbnailInfoProvider = {
			get: function() {
				assert.ok( true, 'Guessed thumbnail provider should be called' );
				return $.Deferred().reject();
			}
		};

		viewer.thumbnailInfoProvider = {
			get: function() {
				assert.ok( true, 'API thumbnail info provider should be called as a fallback, since we could not guess the URL' );
				return $.Deferred().reject();
			}
		};

		viewer.fetchThumbnail( file, width, sampleURL, originalWidth, originalHeight );

		viewer.thumbnailInfoProvider = {
			get: function() {
				assert.ok( true, 'API thumbnail info provider should be called as a fallback, since we could not guess the URL' );
				return $.Deferred().resolve( { url : apiURL } );
			}
		};

		viewer.imageProvider = {
			get: function( url ) {
				assert.strictEqual( url, apiURL, 'Image provider is called based on data provided by the API provider' );
				return $.Deferred().resolve();
			}
		};

		viewer.fetchThumbnail( file, width, sampleURL, originalWidth, originalHeight );

		viewer.guessedThumbnailInfoProvider = {
			get: function() {
				assert.ok( true, 'Guessed thumbnail provider should be called' );
				return $.Deferred().resolve( { url : guessedURL } );
			}
		};

		viewer.imageProvider = {
			get: function( url ) {
				assert.strictEqual( url, guessedURL, 'Image provider is called based on data provided by the guessed provider' );
				return $.Deferred().reject();
			}
		};

		viewer.thumbnailInfoProvider = {
			get: function() {
				assert.ok( true, 'API thumbnail info provider should be called as a fallback, since the URL we hit did not exist' );
				return $.Deferred().reject();
			}
		};

		viewer.fetchThumbnail( file, width, sampleURL, originalWidth, originalHeight );

		viewer.imageProvider = {
			get: function( url ) {
				assert.strictEqual( url, guessedURL, 'Image provider is called based on data provided by the guessed provider' );
				return $.Deferred().resolve();
			}
		};

		viewer.thumbnailInfoProvider = {
			get: function() {
				assert.ok( false, 'API thumbnail info provider should not be called as a fallback' );
				return $.Deferred().reject();
			}
		};

		QUnit.stop();

		viewer.fetchThumbnail( file, width, sampleURL, originalWidth, originalHeight ).then( function() {
			assert.ok( true, 'Guessed URL is all that was needed to load the thumb' );
			QUnit.start();
		} );

		mw.config.get( 'wgMultimediaViewer' ).useThumbnailGuessing = false;

		viewer.guessedThumbnailInfoProvider = {
			get: function() {
				assert.ok( false, 'Guessed thumbnail provider should not be called, since it was disabled in extension configuration' );
			}
		};

		viewer.thumbnailInfoProvider = {
			get: function() {
				assert.ok( true, 'Classic thumbnail info provider should be called, since guesser was disabled in extension configuration' );
				return $.Deferred().reject();
			}
		};

		viewer.fetchThumbnail( file, width );

		mw.config.get( 'wgMultimediaViewer' ).useThumbnailGuessing = oldUseThumbnailGuessing;
	} );
}( mediaWiki, jQuery ) );
