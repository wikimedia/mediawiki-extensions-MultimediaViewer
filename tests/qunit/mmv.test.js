( function ( mw, $ ) {
	QUnit.module( 'mmv', QUnit.newMwEnvironment() );

	QUnit.test( 'Metadata div is only animated once', 4, function ( assert ) {
		localStorage.removeItem( 'mmv.hasOpenedMetadata' );

		var viewer,
			backupAnimation = $.fn.animate,
			animationRan = false,
			oldSetupEventHandlers = mw.MultimediaViewer.prototype.setupEventHandlers;

		$.fn.animate = function () {
			animationRan = true;
			return this;
		};

		// Because we don't want that throwaway instance to listen to events, could interfere with other tests
		mw.MultimediaViewer.prototype.setupEventHandlers = $.noop;
		viewer = new mw.MultimediaViewer();

		viewer.animateMetadataDivOnce();
		assert.strictEqual( viewer.hasAnimatedMetadata, true, 'The first call to animateMetadataDivOnce set hasAnimatedMetadata to true' );
		assert.strictEqual( animationRan, true, 'The first call to animateMetadataDivOnce led to an animation' );

		animationRan = false;
		viewer.animateMetadataDivOnce();
		assert.strictEqual( viewer.hasAnimatedMetadata, true, 'The second call to animateMetadataDivOnce did not change the value of hasAnimatedMetadata' );
		assert.strictEqual( animationRan, false, 'The second call to animateMetadataDivOnce did not lead to an animation' );

		$.fn.animate = backupAnimation;

		mw.MultimediaViewer.prototype.setupEventHandlers = oldSetupEventHandlers;
	} );

	QUnit.test( 'eachPrealoadableLightboxIndex()', 11, function ( assert ) {
		var viewer = mw.mediaViewer,
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
			multiLightbox = new window.MultiLightbox(),
			lightbox = new mw.LightboxInterface( mw.mediaViewer ),
			oldLoadImage = mw.mediaViewer.loadImageByTitle,
			oldLightbox = mw.mediaViewer.lightbox,
			imageSrc = 'Foo bar.jpg',
			image = { filePageTitle: new mw.Title( 'File:' + imageSrc ) };

		document.location.hash = '';

		oldUnattach = lightbox.unattach;

		lightbox.unattach = function () {
			assert.ok( true, 'Lightbox was unattached' );
			oldUnattach.call( this );
		};

		mw.mediaViewer.lightbox = multiLightbox;
		mw.mediaViewer.lightbox.iface = lightbox;
		mw.mediaViewer.close();

		assert.ok( !mw.mediaViewer.isOpen, 'Viewer is closed' );

		// The mediaViewer won't be initialized through bootstrap by any other way than a valid action
		document.location.hash = 'mediaviewer/Foo';
		mw.mediaViewer.isOpen = true;
		// From now on we're certain that the viewer receives hash changes through bootstrap

		// Verify that passing an invalid mmv hash when the mmv is open triggers unattach()
		document.location.hash = 'Foo';

		// Verify that mmv doesn't reset a foreign hash
		assert.strictEqual( document.location.hash, '#Foo', 'Foreign hash remains intact' );
		assert.ok( !mw.mediaViewer.isOpen, 'Viewer is closed' );

		lightbox.unattach = function () {
			assert.ok( false, 'Lightbox was not unattached' );
			oldUnattach.call( this );
		};

		// Verify that passing an invalid mmv hash  when the mmv is closed doesn't trigger unattach()
		document.location.hash = 'Bar';

		// Verify that mmv doesn't reset a foreign hash
		assert.strictEqual( document.location.hash, '#Bar', 'Foreign hash remains intact' );

		mw.mediaViewer.lightbox = { images: [ image ] };

		$( '#qunit-fixture' ).append( '<a class="image"><img src="' + imageSrc + '"></a>' );

		mw.mediaViewer.loadImageByTitle = function( title ) {
			assert.strictEqual( title, 'File:' + imageSrc, 'The title matches' );
		};

		// Open a valid mmv hash link and check that the right image is requested.
		// imageSrc contains a space without any encoding on purpose
		document.location.hash = 'mediaviewer/File:' + imageSrc;

		// Reset the hash, because for some browsers switching from the non-URI-encoded to
		// the non-URI-encoded version of the same text with a space will not trigger a hash change
		document.location.hash = '';

		// Try again with an URI-encoded imageSrc containing a space
		document.location.hash = 'mediaviewer/File:' + encodeURIComponent( imageSrc );

		mw.mediaViewer.lightbox = oldLightbox;
		mw.mediaViewer.loadImageByTitle = oldLoadImage;

		document.location.hash = '';
	} );
}( mediaWiki, jQuery ) );
