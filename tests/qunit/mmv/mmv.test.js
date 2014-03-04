( function ( mw, $ ) {
	var oldSetupEventHandlers;

	QUnit.module( 'mmv', QUnit.newMwEnvironment() );

	// Because we don't want that throwaway instance to listen to events, could interfere with other tests
	function newViewer() {
		oldSetupEventHandlers = mw.mmv.MultimediaViewer.prototype.setupEventHandlers;
		mw.mmv.MultimediaViewer.prototype.setupEventHandlers = $.noop;
		return new mw.mmv.MultimediaViewer();
	}

	function cleanNewViewer() {
		mw.mmv.MultimediaViewer.prototype.setupEventHandlers = oldSetupEventHandlers;
	}

	QUnit.test( 'Metadata div is only animated once', 4, function ( assert ) {
		localStorage.removeItem( 'mmv.hasOpenedMetadata' );

		var viewer = newViewer(),
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

		cleanNewViewer();
	} );

	QUnit.test( 'eachPrealoadableLightboxIndex()', 11, function ( assert ) {
		var viewer = mw.mmv.mediaViewer,
			oldLightbox,
			oldPreloadDistance,
			oldPosition,
			oldThumbs,
			expectedIndices,
			i;

		oldLightbox = viewer.lightbox;
		viewer.lightbox = viewer.lightbox || {}; // might not be set up at this point
		oldPreloadDistance = viewer.preloadDistance;
		oldPosition = viewer.lightbox.currentIndex;
		oldThumbs = viewer.thumbs;

		viewer.preloadDistance = 3;
		viewer.thumbs = [];

		// 0..10
		for ( i = 0; i < 11; i++ ) {
			viewer.thumbs.push( { image : false } );
		}

		viewer.lightbox.currentIndex = 2;
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

		viewer.lightbox = oldLightbox;
		viewer.preloadDistance = oldPreloadDistance;
		viewer.thumbs = oldThumbs;

		if ( viewer.lightbox ) {
			viewer.lightbox.currentIndex = oldPosition;
		}
	} );

	QUnit.test( 'Hash handling', 7, function ( assert ) {
		var oldUnattach,
			viewer = mw.mmv.mediaViewer,
			multiLightbox = new mw.mmv.MultiLightbox( 0, mw.mmv.LightboxInterface ),
			lightbox = new mw.mmv.LightboxInterface( viewer ),
			oldLoadImage = viewer.loadImageByTitle,
			oldLightbox = viewer.lightbox,
			imageSrc = 'Foo bar.jpg',
			image = { filePageTitle: new mw.Title( 'File:' + imageSrc ) };

		window.location.hash = '';

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

		viewer.lightbox = oldLightbox;
		viewer.loadImageByTitle = oldLoadImage;

		window.location.hash = '';
	} );

	QUnit.test( 'Progress', 3, function ( assert ) {
		var imageDeferred = $.Deferred(),
			viewer = newViewer(),
			oldImageGet = mw.mmv.provider.Image.prototype.get,
			oldImageInfoGet = mw.mmv.provider.ImageInfo.prototype.get,
			oldThumbnailInfoGet = mw.mmv.provider.ThumbnailInfo.prototype.get,
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

		mw.mmv.provider.Image.prototype.get = function() { return imageDeferred.promise(); };
		mw.mmv.provider.ImageInfo.prototype.get = function() { return $.Deferred().resolve(); };
		mw.mmv.provider.ThumbnailInfo.prototype.get = function() { return $.Deferred().resolve( {} ); };

		viewer.loadImage( { filePageTitle : new mw.Title( 'File:Stuff.jpg' ) }, new Image() );

		imageDeferred.notify( 'response', 45 );
		imageDeferred.resolve();

		viewer.close();

		mw.mmv.provider.Image.prototype.get = oldImageGet;
		mw.mmv.provider.ImageInfo.prototype.get = oldImageInfoGet;
		mw.mmv.provider.ThumbnailInfo.prototype.get = oldThumbnailInfoGet;

		cleanNewViewer();
	} );

	QUnit.test( 'resetBlurredThumbnailStates', 4, function ( assert ) {
		var viewer = newViewer();

		assert.ok( !viewer.realThumbnailShown, 'Real thumbnail state is correct' );
		assert.ok( !viewer.blurredThumbnailShown, 'Placeholder state is correct' );

		viewer.realThumbnailShown = true;
		viewer.blurredThumbnailShown = true;

		viewer.resetBlurredThumbnailStates();

		assert.ok( !viewer.realThumbnailShown, 'Real thumbnail state is correct' );
		assert.ok( !viewer.blurredThumbnailShown, 'Placeholder state is correct' );

		cleanNewViewer();
	} );

	QUnit.test( 'Placeholder first, then real thumbnail', 4, function ( assert ) {
		var viewer = newViewer();

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

		cleanNewViewer();
	} );

	QUnit.test( 'Real thumbnail first, then placeholder', 4, function ( assert ) {
		var viewer = newViewer();

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

		cleanNewViewer();
	} );

	QUnit.test( 'displayRealThumbnail', 1, function ( assert ) {
		var viewer = newViewer();

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

		cleanNewViewer();
	} );

	QUnit.test( 'New image loaded while another one is loading', 1, function ( assert ) {
		var imageDeferred,
			ligthboxInfoDeferred,
			viewer = newViewer(),
			oldImageGet = mw.mmv.provider.Image.prototype.get,
			oldImageInfoGet = mw.mmv.provider.ImageInfo.prototype.get,
			oldThumbnailInfoGet = mw.mmv.provider.ThumbnailInfo.prototype.get,
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

		mw.mmv.provider.Image.prototype.get = function() { return imageDeferred.promise(); };
		mw.mmv.provider.ImageInfo.prototype.get = function() { return $.Deferred().reject(); };
		mw.mmv.provider.ThumbnailInfo.prototype.get = function() { return $.Deferred().resolve( {} ); };

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
		};

		secondImageDeferred.resolve();
		secondLigthboxInfoDeferred.resolve();

		viewer.close();

		mw.mmv.provider.Image.prototype.get = oldImageGet;
		mw.mmv.provider.ImageInfo.prototype.get = oldImageInfoGet;
		mw.mmv.provider.ThumbnailInfo.prototype.get = oldThumbnailInfoGet;

		cleanNewViewer();
	} );
}( mediaWiki, jQuery ) );
