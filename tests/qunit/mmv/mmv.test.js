( function ( mw, $ ) {
	QUnit.module( 'mmv', QUnit.newMwEnvironment() );

	QUnit.test( 'Metadata div is only animated once', 4, function ( assert ) {
		localStorage.removeItem( 'mmv.hasOpenedMetadata' );

		var viewer = new mw.mmv.MultimediaViewer(),
			backupAnimation = $.fn.animate,
			animationRan = false;

		$.fn.animate = function () {
			animationRan = true;
			return this;
		};

		viewer.animateMetadataDivOnce();
		assert.strictEqual( viewer.hasAnimatedMetadata, true, 'The first call to animateMetadataDivOnce set hasAnimatedMetadata to true' );
		assert.strictEqual( animationRan, true, 'The first call to animateMetadataDivOnce led to an animation' );

		animationRan = false;
		viewer.animateMetadataDivOnce();
		assert.strictEqual( viewer.hasAnimatedMetadata, true, 'The second call to animateMetadataDivOnce did not change the value of hasAnimatedMetadata' );
		assert.strictEqual( animationRan, false, 'The second call to animateMetadataDivOnce did not lead to an animation' );

		$.fn.animate = backupAnimation;
	} );

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

		viewer.lightbox = { currentIndex : 2 };
		i = 0;
		expectedIndices = [2, 3, 1, 4, 0, 5];
		viewer.eachPrealoadableLightboxIndex( function( index ) {
			assert.strictEqual( index, expectedIndices[i++], 'preload on left edge');
		} );

		viewer.lightbox.currentIndex = 9;
		i = 0;
		expectedIndices = [9, 10, 8, 7, 6];
		viewer.eachPrealoadableLightboxIndex( function( index ) {
			assert.strictEqual( index, expectedIndices[i++], 'preload on right edge');
		} );
	} );

	QUnit.test( 'Hash handling', 7, function ( assert ) {
		var oldUnattach,
			viewer = new mw.mmv.MultimediaViewer(),
			multiLightbox = new mw.mmv.MultiLightbox( 0, mw.mmv.LightboxInterface ),
			lightbox = new mw.mmv.LightboxInterface( viewer ),
			imageSrc = 'Foo bar.jpg',
			image = { filePageTitle: new mw.Title( 'File:' + imageSrc ) };

		window.location.hash = '';

		viewer.setupEventHandlers();
		oldUnattach = lightbox.unattach;

		lightbox.unattach = function () {
			assert.ok( true, 'Lightbox was unattached' );
			oldUnattach.call( this );
		};

		viewer.lightbox = multiLightbox;
		viewer.lightbox.iface = lightbox;
		viewer.close();

		assert.ok( !viewer.isOpen, 'Viewer is closed' );

		viewer.isOpen = true;

		// Verify that passing an invalid mmv hash when the mmv is open triggers unattach()
		window.location.hash = 'Foo';
		viewer.hash();

		// Verify that mmv doesn't reset a foreign hash
		assert.strictEqual( window.location.hash, '#Foo', 'Foreign hash remains intact' );
		assert.ok( !viewer.isOpen, 'Viewer is closed' );

		lightbox.unattach = function () {
			assert.ok( false, 'Lightbox was not unattached' );
			oldUnattach.call( this );
		};

		// Verify that passing an invalid mmv hash  when the mmv is closed doesn't trigger unattach()
		window.location.hash = 'Bar';
		viewer.hash();

		// Verify that mmv doesn't reset a foreign hash
		assert.strictEqual( window.location.hash, '#Bar', 'Foreign hash remains intact' );

		viewer.lightbox = { images: [ image ] };

		$( '#qunit-fixture' ).append( '<a class="image"><img src="' + imageSrc + '"></a>' );

		viewer.loadImageByTitle = function( title ) {
			assert.strictEqual( title, 'File:' + imageSrc, 'The title matches' );
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

	QUnit.test( 'Progress', 3, function ( assert ) {
		var imageDeferred = $.Deferred(),
			viewer = new mw.mmv.MultimediaViewer(),
			i = 0;

		viewer.thumbs = [];
		viewer.displayPlaceholderThumbnail = $.noop;
		viewer.setImage = $.noop;
		viewer.scroll = $.noop;
		viewer.preloadFullscreenThumbnail = $.noop;
		viewer.fetchSizeIndependentLightboxInfo = function () { return $.Deferred().resolve(); };
		viewer.lightbox = { iface : {
			setupForLoad : $.noop,
			canvas : { set : $.noop,
				getCurrentImageWidths : function () { return { real : 0 }; } },
			panel : { setImageInfo : $.noop,
				percent : function ( percent ) {
					if ( i === 0 ) {
						assert.strictEqual( percent, 0,
							'Percentage correctly reset by loadImage' );
					} else if ( i === 1 ) {
						assert.strictEqual( percent, 5,
							'Percentage correctly animated to 5 by loadImage' );
					} else {
						assert.strictEqual( percent, 45,
							'Percentage correctly funneled to panel UI' );
					}

					i++;
				} }
		},
		open : $.noop };

		viewer.imageProvider.get = function() { return imageDeferred.promise(); };
		viewer.imageInfoProvider.get = function() { return $.Deferred().resolve(); };
		viewer.thumbnailInfoProvider.get = function() { return $.Deferred().resolve( {} ); };

		viewer.loadImage( { filePageTitle : new mw.Title( 'File:Stuff.jpg' ) }, new Image() );

		imageDeferred.notify( 'response', 45 );
		imageDeferred.resolve();

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
		viewer.lightbox = { iface : { canvas : {
			setThumbnailForDisplay : function() { return true; }
		} } };

		viewer.displayPlaceholderThumbnail( undefined, undefined, undefined);

		assert.ok( viewer.blurredThumbnailShown, 'Placeholder state is correct' );
		assert.ok( !viewer.realThumbnailShown, 'Real thumbnail state is correct' );

		viewer.displayRealThumbnail();

		assert.ok( viewer.realThumbnailShown, 'Real thumbnail state is correct' );
		assert.ok( viewer.blurredThumbnailShown, 'Placeholder state is correct' );
	} );

	QUnit.test( 'Real thumbnail first, then placeholder', 4, function ( assert ) {
		var viewer = new mw.mmv.MultimediaViewer();

		viewer.setImage = $.noop;
		viewer.lightbox = { iface : {
			showImage : $.noop
		} };

		viewer.displayRealThumbnail();

		assert.ok( viewer.realThumbnailShown, 'Real thumbnail state is correct' );
		assert.ok( !viewer.blurredThumbnailShown, 'Placeholder state is correct' );

		viewer.displayPlaceholderThumbnail( undefined, undefined, undefined);

		assert.ok( viewer.realThumbnailShown, 'Real thumbnail state is correct' );
		assert.ok( !viewer.blurredThumbnailShown, 'Placeholder state is correct' );
	} );

	QUnit.test( 'displayRealThumbnail', 1, function ( assert ) {
		var viewer = new mw.mmv.MultimediaViewer();

		viewer.setImage = $.noop;
		viewer.lightbox = { iface : { canvas : {
			unblur : function () { assert.ok( false, 'Image should not be unblurred yet' ); }
		} } };
		viewer.blurredThumbnailShown = true;

		// Should not result in an unblur (image cache from cache)
		viewer.displayRealThumbnail( undefined, undefined, undefined, 5 );

		viewer.lightbox.iface.canvas.unblur = function () {
			assert.ok( true, 'Image needs to be unblurred' );
		};

		// Should result in an unblur (image didn't come from cache)
		viewer.displayRealThumbnail( undefined, undefined, undefined, 1000 );
	} );

	QUnit.test( 'New image loaded while another one is loading', 1, function ( assert ) {
		var imageDeferred,
			ligthboxInfoDeferred,
			viewer = new mw.mmv.MultimediaViewer(),
			firstImageDeferred = $.Deferred(),
			secondImageDeferred = $.Deferred(),
			firstLigthboxInfoDeferred = $.Deferred(),
			secondLigthboxInfoDeferred = $.Deferred();

		viewer.preloadFullscreenThumbnail = $.noop;
		viewer.fetchSizeIndependentLightboxInfo = function () { return ligthboxInfoDeferred.promise(); };
		viewer.lightbox = { iface : {
			setupForLoad : $.noop,
			canvas : { set : $.noop,
				getCurrentImageWidths : function () { return { real : 0 }; } },
			panel : { setImageInfo : function () {
					assert.ok( false, 'Metadata of the first image should not be shown' );
				},
				percent : function ( response, percent ) {
					if ( percent === 45 ) {
						assert.ok( false, 'Progress of the first image should not be shown' );
					}
				}  },
			empty: $.noop
		},
		open : $.noop };
		viewer.eachPrealoadableLightboxIndex = $.noop;
		viewer.animateMetadataDivOnce = function () {
			assert.ok( false, 'Metadata of the first image should not be animated' );
			return $.Deferred().reject();
		};

		viewer.imageProvider.get = function() { return imageDeferred.promise(); };
		viewer.imageInfoProvider.get = function() { return $.Deferred().reject(); };
		viewer.thumbnailInfoProvider.get = function() { return $.Deferred().resolve( {} ); };

		imageDeferred = firstImageDeferred;
		ligthboxInfoDeferred = firstLigthboxInfoDeferred;
		viewer.loadImage( { filePageTitle : new mw.Title( 'File:Foo.jpg' ), index : 0 }, new Image() );

		imageDeferred = secondImageDeferred;
		ligthboxInfoDeferred = secondLigthboxInfoDeferred;
		viewer.loadImage( { filePageTitle : new mw.Title( 'File:Bar.jpg' ), index : 1 }, new Image() );

		viewer.displayRealThumbnail = function () {
			assert.ok( false, 'The first image being done loading should have no effect');
		};

		firstImageDeferred.notify( undefined, 45 );
		firstImageDeferred.resolve();
		firstLigthboxInfoDeferred.resolve();

		viewer.lightbox.iface.panel.setImageInfo = $.noop;
		viewer.animateMetadataDivOnce = function() { return $.Deferred().reject(); };

		viewer.displayRealThumbnail = function () {
			assert.ok( true, 'The second image being done loading should result in the image being shown');
			QUnit.start();
			viewer.close();
		};

		QUnit.stop();
		secondImageDeferred.resolve();
		secondLigthboxInfoDeferred.resolve();
	} );

	QUnit.test( 'Events are not trapped after the viewer is closed', 0, function( assert ) {
		var i, j, k, eventParameters,
			viewer = new mw.mmv.MultimediaViewer(),
			$document = $( document ),
			$qf = $( '#qunit-fixture' ),
			eventTypes = [ 'keydown', 'keyup', 'keypress', 'click', 'mousedown', 'mouseup' ],
			modifiers = [ undefined, 'altKey', 'ctrlKey', 'shiftKey', 'metaKey' ];

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

		viewer.lightbox.iface.$closeButton.click();

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
}( mediaWiki, jQuery ) );
