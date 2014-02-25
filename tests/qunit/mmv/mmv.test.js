( function ( mw, $ ) {
	QUnit.module( 'mmv', QUnit.newMwEnvironment() );

	QUnit.test( 'Metadata div is only animated once', 4, function ( assert ) {
		localStorage.removeItem( 'mmv.hasOpenedMetadata' );

		var viewer,
			backupAnimation = $.fn.animate,
			animationRan = false,
			oldSetupEventHandlers = mw.mmv.MultimediaViewer.prototype.setupEventHandlers;

		$.fn.animate = function () {
			animationRan = true;
			return this;
		};

		// Because we don't want that throwaway instance to listen to events, could interfere with other tests
		mw.mmv.MultimediaViewer.prototype.setupEventHandlers = $.noop;
		viewer = new mw.mmv.MultimediaViewer();

		viewer.animateMetadataDivOnce();
		assert.strictEqual( viewer.hasAnimatedMetadata, true, 'The first call to animateMetadataDivOnce set hasAnimatedMetadata to true' );
		assert.strictEqual( animationRan, true, 'The first call to animateMetadataDivOnce led to an animation' );

		animationRan = false;
		viewer.animateMetadataDivOnce();
		assert.strictEqual( viewer.hasAnimatedMetadata, true, 'The second call to animateMetadataDivOnce did not change the value of hasAnimatedMetadata' );
		assert.strictEqual( animationRan, false, 'The second call to animateMetadataDivOnce did not lead to an animation' );

		$.fn.animate = backupAnimation;

		mw.mmv.MultimediaViewer.prototype.setupEventHandlers = oldSetupEventHandlers;
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

	QUnit.test( 'Progress', 1, function ( assert ) {
		var imageDeferred = $.Deferred(),
			viewer = new mw.mmv.MultimediaViewer(),
			oldImageGet = mw.mmv.provider.Image.prototype.get,
			oldImageInfoGet = mw.mmv.provider.ImageInfo.prototype.get,
			oldThumbnailInfoGet = mw.mmv.provider.ThumbnailInfo.prototype.get;

		viewer.thumbs = [];
		viewer.displayPlaceholderThumbnail = $.noop;
		viewer.setImage = $.noop;
		viewer.scroll = $.noop;
		viewer.preloadFullscreenThumbnail = $.noop;
		viewer.fetchSizeIndependentLightboxInfo = function () { return $.Deferred().resolve(); };
		viewer.lightbox = { iface : {
			setupForLoad : $.noop,
			showImage : $.noop,
			getCurrentImageWidths : function () { return { real : 0 }; },
			panel : { setImageInfo : $.noop,
				percent : function ( percent ) {
					assert.strictEqual( percent, 45,
						'Percentage correctly funneled to panel UI' );
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
		viewer.lightbox = { iface : {
			showImage : $.noop
		} };

		viewer.displayPlaceholderThumbnail(
			{ width : 300 },
			undefined,
			$( '<img>' ).width( 100 ),
			{ css : 300, real : 300 }
		);

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

		viewer.displayPlaceholderThumbnail(
			{ width : 300 },
			undefined,
			$( '<img>' ).width( 100 ),
			{ css : 300, real : 300 }
		);

		assert.ok( viewer.realThumbnailShown, 'Real thumbnail state is correct' );
		assert.ok( !viewer.blurredThumbnailShown, 'Placeholder state is correct' );
	} );

	QUnit.test( 'displayRealThumbnail', 1, function ( assert ) {
		var viewer = new mw.mmv.MultimediaViewer();

		viewer.setImage = $.noop;
		viewer.lightbox = { iface : {
			unblur : function () { assert.ok( false, 'Image should not be unblurred yet' ); }
		} };
		viewer.blurredThumbnailShown = true;

		// Should not result in an unblur (image cache from cache)
		viewer.displayRealThumbnail( undefined, undefined, undefined, 5 );

		viewer.lightbox.iface.unblur = function () {
			assert.ok( true, 'Image needs to be unblurred' );
		};

		// Should result in an unblur (image didn't come from cache)
		viewer.displayRealThumbnail( undefined, undefined, undefined, 1000 );
	} );

	QUnit.test( 'displayPlaceholderThumbnail: placeholder big enough that it doesn\'t need blurring, actual image bigger than the lightbox', 5, function ( assert ) {
		var $image,
			viewer = new mw.mmv.MultimediaViewer();

		viewer.setImage = $.noop;
		viewer.lightbox = { iface : {
			showImage : function () { assert.ok ( true, 'Placeholder shown'); }
		} };

		$image = $( '<img>' ).width( 200 ).height( 100 );

		viewer.displayPlaceholderThumbnail(
			{ width : 1000, height : 500 },
			undefined,
			$image,
			{ css : 300, real : 300 }
		);

		assert.strictEqual( $image.width(), 300, 'Placeholder has the right width' );
		assert.strictEqual( $image.height(), 150, 'Placeholder has the right height' );
		assert.ok( !$image.hasClass( 'blurred' ), 'Placeholder is not blurred' );
		assert.ok( !viewer.blurredThumbnailShown, 'Placeholder state is correct' );
	} );

	QUnit.test( 'displayPlaceholderThumbnail: big-enough placeholder that needs blurring, actual image bigger than the lightbox', 5, function ( assert ) {
		var $image,
			viewer = new mw.mmv.MultimediaViewer();

		viewer.setImage = $.noop;
		viewer.lightbox = { iface : {
			showImage : function () { assert.ok ( true, 'Placeholder shown'); }
		} };

		$image = $( '<img>' ).width( 100 ).height( 50 );

		viewer.displayPlaceholderThumbnail(
			{ width : 1000, height : 500 },
			undefined,
			$image,
			{ css : 300, real : 300 }
		);

		assert.strictEqual( $image.width(), 300, 'Placeholder has the right width' );
		assert.strictEqual( $image.height(), 150, 'Placeholder has the right height' );
		assert.ok( $image.hasClass( 'blurred' ), 'Placeholder is blurred' );
		assert.ok( viewer.blurredThumbnailShown, 'Placeholder state is correct' );
	} );

	QUnit.test( 'displayPlaceholderThumbnail: big-enough placeholder that needs blurring, actual image smaller than the lightbox', 5, function ( assert ) {
		var $image,
			viewer = new mw.mmv.MultimediaViewer(),
			oldDevicePixelRatio = $.devicePixelRatio;

		$.devicePixelRatio = function () { return 2; };

		viewer.setImage = $.noop;
		viewer.lightbox = { iface : {
			showImage : function () { assert.ok ( true, 'Placeholder shown'); }
		} };

		$image = $( '<img>' ).width( 100 ).height( 50 );

		viewer.displayPlaceholderThumbnail(
			{ width : 1000, height : 500 },
			undefined,
			$image,
			{ css : 1200, real : 1200 }
		);

		assert.strictEqual( $image.width(), 1000, 'Placeholder has the right width' );
		assert.strictEqual( $image.height(), 500, 'Placeholder has the right height' );
		assert.ok( $image.hasClass( 'blurred' ), 'Placeholder is blurred' );
		assert.ok( viewer.blurredThumbnailShown, 'Placeholder state is correct' );

		$.devicePixelRatio = oldDevicePixelRatio;
	} );

	QUnit.test( 'displayPlaceholderThumbnail: placeholder too small to be displayed, actual image bigger than the lightbox', 4, function ( assert ) {
		var $image,
			viewer = new mw.mmv.MultimediaViewer();

		viewer.lightbox = { iface : {
			showImage : function () { assert.ok ( false, 'Placeholder shown when it should not'); }
		} };

		$image = $( '<img>' ).width( 10 ).height( 5 );

		viewer.displayPlaceholderThumbnail(
			{ width : 1000, height : 500 },
			undefined,
			$image,
			{ css : 300, real : 300 }
		);

		assert.strictEqual( $image.width(), 10, 'Placeholder has the right width' );
		assert.strictEqual( $image.height(), 5, 'Placeholder has the right height' );
		assert.ok( !$image.hasClass( 'blurred' ), 'Placeholder is not blurred' );
		assert.ok( !viewer.blurredThumbnailShown, 'Placeholder state is correct' );
	} );
}( mediaWiki, jQuery ) );
