( function ( mw, $ ) {
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

	QUnit.asyncTest( 'Promise does not hang on ResourceLoader errors', 1, function ( assert ) {
		var oldUsing = mw.loader.using,
			bootstrap,
			errorMessage = 'loading failed';

		mw.loader.using = function ( module, success, error ) {
			if ( $.isFunction( error ) ) {
				error( new Error( errorMessage, ['mmv'] ) );
			}
		};
		bootstrap = new mw.mmv.MultimediaViewerBootstrap();

		bootstrap.loadViewer().fail( function ( message ) {
			assert.strictEqual( message, errorMessage, 'promise is rejected with the error message when loading fails' );
			QUnit.start();
		} );

		bootstrap.hash = $.noop;
		mw.loader.using = oldUsing;
	} );

	QUnit.test( 'Check viewer invoked when clicking on legit image links', 2, function ( assert ) {
		// TODO: Is <div class="gallery"><span class="image"><img/></span></div> valid ???
		var div, link, link2, link3, bootstrap,
			viewer = mw.mmv.mediaViewer,
			oldLoadImageByTitle = viewer.loadImageByTitle;

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

		viewer.loadImageByTitle = function() {
			assert.ok( true, 'Image loaded' );
		};

		// Click on legit link
		link.trigger( { type : 'click', which : 1 } );

		// Click on legit link
		link2.trigger( { type : 'click', which : 1 } );

		viewer.loadImageByTitle = function() {
			assert.ok( false, 'Image should not be loaded' );
		};

		// Click on non-legit link
		link3.trigger( { type : 'click', which : 1 } );

		viewer.loadImageByTitle = oldLoadImageByTitle;
		bootstrap.hash = $.noop;
	} );

	QUnit.test( 'Skip images with invalid extensions', 0, function ( assert ) {
		var div, link, bootstrap,
			viewer = mw.mmv.mediaViewer,
			oldLoadImageByTitle = viewer.loadImageByTitle;

		// Create gallery with image that has invalid name extension
		div = createGallery( 'thumb.badext' );
		link = div.find( 'a.image' );

		// Create a new bootstrap object to trigger the DOM scan, etc.
		bootstrap = new mw.mmv.MultimediaViewerBootstrap();

		viewer.loadImageByTitle = function() {
			assert.ok( false, 'Image should not be loaded' );
		};

		// Click on legit link with wrong image extension
		link.trigger( { type : 'click', which : 1 } );

		viewer.loadImageByTitle = oldLoadImageByTitle;
		bootstrap.hash = $.noop;
	} );

	QUnit.test( 'Accept only left clicks without modifier keys, skip the rest', 1, function ( assert ) {
		var $div, $link, bootstrap,
			viewer = mw.mmv.mediaViewer,
			oldLoadImageByTitle = viewer.loadImageByTitle;

		// Create gallery with image that has invalid name extension
		$div = createGallery();

		// Create a new bootstrap object to trigger the DOM scan, etc.
		bootstrap = new mw.mmv.MultimediaViewerBootstrap();

		$link = $div.find( 'a.image' );

		viewer.loadImageByTitle = function() {
			assert.ok( true, 'Image loaded' );
		};

		// Handle valid left click, it should try to load the image
		$link.trigger( { type : 'click', which : 1 } );

		viewer.loadImageByTitle = function() {
			assert.ok( false, 'Image should not be loaded' );
		};

		// Skip Ctrl-left-click, no image is loaded
		$link.trigger( { type : 'click', which : 1, ctrlKey : true } );

		// Skip invalid right click, no image is loaded
		$link.trigger( { type : 'click', which : 2 } );

		viewer.loadImageByTitle = oldLoadImageByTitle;
		bootstrap.hash = $.noop;
	} );

	QUnit.test( 'Ensure that the correct title is loaded when clicking', 1, function ( assert ) {
		var bootstrap,
			oldByTitle,
			viewer = mw.mmv.mediaViewer,
			$div = createGallery( 'foo.jpg' ),
			$link = $div.find( 'a.image' );

		oldByTitle = viewer.loadImageByTitle;

		viewer.loadImageByTitle = function ( loadedTitle ) {
			assert.strictEqual( loadedTitle, 'File:Foo.jpg', 'Titles are identical' );
		};

		// Create a new bootstrap object to trigger the DOM scan, etc.
		bootstrap = new mw.mmv.MultimediaViewerBootstrap();

		$link.trigger( { type : 'click', which : 1 } );

		viewer.loadImageByTitle = oldByTitle;
		bootstrap.hash = $.noop;
	} );

	QUnit.test( 'Validate new LightboxImage object has sane constructor parameters', 6, function ( assert ) {
		var bootstrap,
			$div,
			$link,
			viewer = mw.mmv.mediaViewer,
			oldNewImage = viewer.createNewImage,
			oldLoadImage = viewer.loadImage,
			fname = 'valid',
			imgSrc = '/' + fname + '.jpg/300px-' + fname + '.jpg',
			imgRegex = new RegExp( imgSrc + '$' );

		$div = createThumb( imgSrc, 'Blah blah' );
		$link = $div.find( 'a.image' );

		viewer.loadImage = $.noop;

		viewer.createNewImage = function ( fileLink, filePageLink, fileTitle, index, thumb, caption ) {
			assert.ok( fileLink.match( imgRegex ), 'Thumbnail URL used in creating new image object' );
			assert.strictEqual( filePageLink, '', 'File page link is sane when creating new image object' );
			assert.strictEqual( fileTitle.title, fname, 'Filename is correct when passed into new image constructor' );
			assert.strictEqual( index, 0, 'The only image we created in the gallery is set at index 0 in the images array' );
			assert.strictEqual( thumb.outerHTML, '<img src="' + imgSrc + '">', 'The image element passed in is the thumbnail we want.' );
			assert.strictEqual( caption, 'Blah blah', 'The caption passed in is correct' );
		};

		// Create a new bootstrap object to trigger the DOM scan, etc.
		bootstrap = new mw.mmv.MultimediaViewerBootstrap();

		$link.trigger( { type : 'click', which : 1 } );

		viewer.createNewImage = oldNewImage;
		viewer.loadImage = oldLoadImage;
		bootstrap.hash = $.noop;
	} );

	QUnit.asyncTest( 'Only load the viewer on a valid hash', 1, function ( assert ) {
		var bootstrap;

		window.location.hash = '';

		bootstrap = new mw.mmv.MultimediaViewerBootstrap();

		bootstrap.loadViewer = function () {
			assert.ok( false, 'Viewer should not be loaded' );
			return $.Deferred().reject();
		};

		window.location.hash = 'Foo';

		bootstrap.loadViewer = function () {
			QUnit.start();
			assert.ok( true, 'Viewer should be loaded' );
			bootstrap.hash = $.noop;
			window.location.hash = '';
			return $.Deferred().reject();
		};

		window.location.hash = 'mediaviewer/foo';
	} );

	QUnit.asyncTest( 'internalHashChange', 1, function ( assert ) {
		window.location.hash = '';

		var bootstrap = new mw.mmv.MultimediaViewerBootstrap(),
			hash = '#mediaviewer/foo',
			oldHash = bootstrap.hash;

		bootstrap.hash = function () {
			oldHash.call( this );

			bootstrap.hash = $.noop;
			window.location.hash = '';
			QUnit.start();
		};

		bootstrap.loadViewer = function () {
			assert.ok( false, 'Viewer should not be loaded' );
			return $.Deferred().reject();
		};

		bootstrap.internalHashChange( { hash: hash } );

		assert.strictEqual( window.location.hash, hash, 'Window\'s hash has been updated correctly' );
	} );

	QUnit.test( 'isCSSReady', 3, function ( assert ) {
		var bootstrap = new mw.mmv.MultimediaViewerBootstrap(),
			deferred = $.Deferred(),
			CSSclass = 'foo-' + $.now(),
			$style = $( '<style type="text/css" />' )
				.text( '.' + CSSclass + ' { display: inline; }' );

		bootstrap.readinessCSSClass = CSSclass;
		// This speeds up the test execution
		// It's not zero because if the test fails, the browser would get hammered indefinitely
		bootstrap.readinessWaitDuration = 30;

		bootstrap.isCSSReady( deferred );

		assert.strictEqual( deferred.state(), 'pending', 'The style isn\'t on the page yet' );

		QUnit.stop();

		deferred.then( function() {
			QUnit.start();
			assert.ok( true, 'The style is on the page' );
			assert.strictEqual( $( '.' + CSSclass ).length, 0, 'There are no leftover test elements' );
			$style.remove();
		} );

		$style.appendTo( 'head' );
	} );
}( mediaWiki, jQuery ) );
