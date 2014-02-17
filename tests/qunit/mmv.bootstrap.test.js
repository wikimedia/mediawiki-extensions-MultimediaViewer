( function ( mw, $ ) {
	var oldUsing;

	QUnit.module( 'mmv.bootstrap', QUnit.newMwEnvironment() );

	function createGallery ( imageSrc ) {
		var div = $( '<div>' ).addClass( 'gallery' ).appendTo( '#qunit-fixture' ),
			link = $( '<a>' ).addClass( 'image' ).appendTo( div );

		$( '<img>' ).attr( 'src',  ( imageSrc || 'thumb.jpg' ) ).appendTo( link );

		return div;
	}

	function createThumb( imageSrc, caption ) {
		var div = $( '<div>' ).addClass( 'thumb' ).appendTo( '#qunit-fixture' ),
			link = $( '<a>' ).addClass( 'image' ).appendTo( div );

		$( '<div>' ).addClass( 'thumbcaption' ).appendTo( div ).text( caption );
		$( '<img>' ).attr( 'src', ( imageSrc || 'thumb.jpg' ) ).appendTo( link );

		return div;
	}

	function setupUsing ( assert ) {
		oldUsing = mw.loader.using;

		mw.loader.using = function( module ) {
			if ( module === 'mmv' ) {
				assert.ok( true, 'mmv requested to be loaded' );
			}
		};
	}

	function restoreUsing () {
		mw.loader.using = oldUsing;
	}

	QUnit.test( 'Check viewer invoked when clicking on legit image links', 2, function ( assert ) {
		// TODO: Is <div class="gallery"><span class="image"><img/></span></div> valid ???
		var div, link, link2, link3, bootstrap;

		setupUsing( assert );

		// Create gallery with legit link image
		div = createGallery();
		link = div.find( 'a.image' );

		// Legit isolated thumbnail
		link2 = $( '<a>' ).addClass( 'image' ).appendTo( '#qunit-fixture' );
		$( '<img>' ).attr( 'src',  'thumb2.jpg' ).appendTo( link2 );

		// Non-legit fragment
		link3 = $( '<a>' ).addClass( 'noImage' ).appendTo( div );
		$( '<img>' ).attr( 'src',  'thumb3.jpg' ).appendTo( link3 );

		// Create a new bootstrap object to trigger the DOM scan, etc.
		bootstrap = new mw.mmv.MultimediaViewerBootstrap();

		// Click on legit link
		link.trigger( { type : 'click', which : 1 } );

		// Click on legit link
		link2.trigger( { type : 'click', which : 1 } );

		// Click on non-legit link
		link3.trigger( { type : 'click', which : 1 } );

		bootstrap.shutdown();
		restoreUsing();
	} );

	QUnit.test( 'Skip images with invalid extensions', 0, function ( assert ) {
		var div, link, bootstrap;

		setupUsing( assert );

		// Create gallery with image that has invalid name extension
		div = createGallery( 'thumb.badext' );
		link = div.find( 'a.image' );

		// Create a new bootstrap object to trigger the DOM scan, etc.
		bootstrap = new mw.mmv.MultimediaViewerBootstrap();

		// Click on legit link with wrong image extension
		link.trigger( { type : 'click', which : 1 } );

		bootstrap.shutdown();
		restoreUsing();
	} );

	QUnit.test( 'Accept only left clicks without modifier keys, skip the rest', 1, function ( assert ) {
		var $div, $link, bootstrap;

		setupUsing( assert );

		// Create gallery with image that has invalid name extension
		$div = createGallery();

		// Create a new bootstrap object to trigger the DOM scan, etc.
		bootstrap = new mw.mmv.MultimediaViewerBootstrap();

		$link = $div.find( 'a.image' );

		// Handle valid left click, it should try to load the image
		$link.trigger( { type : 'click', which : 1 } );

		// Skip Ctrl-left-click, no image is loaded
		$link.trigger( { type : 'click', which : 1, ctrlKey : true } );

		// Skip invalid right click, no image is loaded
		$link.trigger( { type : 'click', which : 2 } );

		bootstrap.shutdown();
		restoreUsing();
	} );

	QUnit.asyncTest( 'Ensure that the correct title is loaded when clicking', 1, function ( assert ) {
		// Preload mmv
		mw.loader.using( 'mmv', function () {
			QUnit.start();

			var bootstrap,
				oldByTitle,
				$div = createGallery( 'foo.jpg' ),
				$link = $div.find( 'a.image' );

			oldByTitle = mw.mediaViewer.loadImageByTitle;

			mw.mediaViewer.loadImageByTitle = function ( loadedTitle ) {
				assert.strictEqual( loadedTitle, 'File:Foo.jpg', 'Titles are identical' );
			};

			// Create a new bootstrap object to trigger the DOM scan, etc.
			bootstrap = new mw.mmv.MultimediaViewerBootstrap();

			$link.trigger( { type : 'click', which : 1 } );

			bootstrap.shutdown();
			mw.mediaViewer.loadImageByTitle = oldByTitle;
		} );
	} );

	QUnit.asyncTest( 'Validate new LightboxImage object has sane constructor parameters', 6, function ( assert ) {
		// Preload mmv
		mw.loader.using( 'mmv', function () {
			QUnit.start();

			var bootstrap,
				$div,
				$link,
				oldNewImage = mw.mediaViewer.createNewImage,
				oldLoadImage = mw.mediaViewer.loadImage,
				fname = 'valid',
				imgSrc = '/' + fname + '.jpg/300px-' + fname + '.jpg',
				imgRegex = new RegExp( imgSrc + '$' );

			$div = createThumb( imgSrc, 'Blah blah' );
			$link = $div.find( 'a.image' );

			// Create a new bootstrap object to trigger the DOM scan, etc.
			bootstrap = new mw.mmv.MultimediaViewerBootstrap();

			mw.mediaViewer.loadImage = $.noop;

			mw.mediaViewer.createNewImage = function ( fileLink, filePageLink, fileTitle, index, thumb, caption ) {
				assert.ok( fileLink.match( imgRegex ), 'Thumbnail URL used in creating new image object' );
				assert.strictEqual( filePageLink, '', 'File page link is sane when creating new image object' );
				assert.strictEqual( fileTitle.title, fname, 'Filename is correct when passed into new image constructor' );
				assert.strictEqual( index, 0, 'The only image we created in the gallery is set at index 0 in the images array' );
				assert.strictEqual( thumb.outerHTML, '<img src="' + imgSrc + '">', 'The image element passed in is the thumbnail we want.' );
				assert.strictEqual( caption, 'Blah blah', 'The caption passed in is correct' );
			};

			$link.trigger( { type : 'click', which : 1 } );

			mw.mediaViewer.createNewImage = oldNewImage;
			mw.mediaViewer.loadImage = oldLoadImage;

			bootstrap.shutdown();
		} );
	} );

	QUnit.asyncTest( 'Hash handling', 3, function ( assert ) {
		// Preload mmv
		mw.loader.using( 'mmv', function () {
			QUnit.start();

			var bootstrap,
				oldLoadImage = mw.mediaViewer.loadImageByTitle,
				oldLightbox = mw.mediaViewer.lightbox,
				imageSrc = 'Foo bar.jpg',
				image = { filePageTitle: new mw.Title( 'File:' + imageSrc ) };

			// Create a new bootstrap object to trigger the DOM scan, etc.
			bootstrap = new mw.mmv.MultimediaViewerBootstrap();

			document.location.hash = '';

			mw.mediaViewer.lightbox = { iface: { unattach: function() {
				assert.ok( true, 'Interface unattached' );
			} } };

			// Verify that passing an invalid mmv hash triggers unattach()
			document.location.hash = 'Foo';

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

			bootstrap.shutdown();
		} );
	} );
}( mediaWiki, jQuery ) );
