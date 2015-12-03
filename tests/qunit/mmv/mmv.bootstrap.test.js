( function ( mw, $ ) {
	QUnit.module( 'mmv.bootstrap', QUnit.newMwEnvironment( {
		setup: function () {
			mw.config.set( 'wgMediaViewer', true );
			mw.config.set( 'wgMediaViewerOnClick', true );
			this.sandbox.stub( mw.user, 'isAnon' ).returns( false );
			this.clock = this.sandbox.useFakeTimers();
		}
	} ) );

	function createGallery( imageSrc, caption ) {
		var div = $( '<div>' ).addClass( 'gallery' ).appendTo( '#qunit-fixture' ),
			galleryBox = $( '<div>' ).addClass( 'gallerybox' ).appendTo( div ),
			thumbwrap = $( '<div>' ).addClass( 'thumb' ).appendTo( galleryBox ),
			link = $( '<a>' ).addClass( 'image' ).appendTo( thumbwrap );

		$( '<img>' ).attr( 'src', ( imageSrc || 'thumb.jpg' ) ).appendTo( link );
		$( '<div>' ).addClass( 'gallerytext' ).text( caption || 'Foobar' ).appendTo( galleryBox );

		return div;
	}

	function createThumb( imageSrc, caption, alt ) {
		var div = $( '<div>' ).addClass( 'thumb' ).appendTo( '#qunit-fixture' ),
			link = $( '<a>' ).addClass( 'image' ).appendTo( div );

		$( '<div>' ).addClass( 'thumbcaption' ).appendTo( div ).text( caption );
		$( '<img>' ).attr( 'src', ( imageSrc || 'thumb.jpg' ) ).attr( 'alt', alt ).appendTo( link );

		return div;
	}

	function createNormal( imageSrc, caption ) {
		var link = $( '<a>' ).prop( 'title', caption ).addClass( 'image' ).appendTo( '#qunit-fixture' );
		$( '<img>' ).prop( 'src', ( imageSrc || 'thumb.jpg' ) ).appendTo( link );
		return link;
	}

	function createMultipleImage( images ) {
		var contain = $( '<div>' ).addClass( 'thumb' ),
			thumbinner = $( '<div>' ).addClass( 'thumbinner' ).appendTo( contain );
		for ( var i = 0; i < images.length; ++i ) {
			var div = $( '<div>' ).appendTo( thumbinner );
			var thumbimage = $( '<div>' ).addClass( 'thumbimage' ).appendTo( div );
			var link = $( '<a>' ).addClass( 'image' ).appendTo( thumbimage );
			$( '<img>' ).prop( 'src', images[i][0] ).appendTo( link );
			$( '<div>' ).addClass( 'thumbcaption' ).text( images[i][1] ).appendTo( div );
		}
		return contain;
	}

	function createBootstrap( viewer ) {
		var bootstrap = new mw.mmv.MultimediaViewerBootstrap();

		// MultimediaViewerBootstrap.ensureEventHandlersAreSetUp() is a weird workaround for gadget bugs.
		// MediaViewer should work without it, and so should the tests.
		bootstrap.ensureEventHandlersAreSetUp = $.noop;

		bootstrap.getViewer = function () { return viewer ? viewer : { initWithThumbs: $.noop, hash: $.noop }; };

		return bootstrap;
	}

	function hashTest( prefix, bootstrap, assert ) {
		var hash = prefix + '/foo';

		bootstrap.setupEventHandlers();

		bootstrap.loadViewer = function () {
			assert.ok( false, 'Viewer should not be loaded' );
			return $.Deferred().reject();
		};

		window.location.hash = 'Foo';

		bootstrap.loadViewer = function () {
			QUnit.start();
			assert.ok( true, 'Viewer should be loaded' );
			bootstrap.cleanupEventHandlers();
			window.location.hash = '';

			return $.Deferred().reject();
		};

		QUnit.stop();
		window.location.hash = hash;
	}

	QUnit.test( 'Promise does not hang on ResourceLoader errors', 3, function ( assert ) {
		var bootstrap,
			errorMessage = 'loading failed';

		this.sandbox.stub( mw.loader, 'using' )
			.callsArgWith( 2, new Error( errorMessage, ['mmv'] ) )
			.withArgs( 'mediawiki.notification' ).returns( $.Deferred().reject() ); // needed for mw.notify

		bootstrap = createBootstrap();

		bootstrap.setupOverlay = function () {
			assert.ok( true, 'Overlay was set up' );
		};

		bootstrap.cleanupOverlay = function () {
			assert.ok( true, 'Overlay was cleaned up' );
		};

		QUnit.stop();

		bootstrap.loadViewer( true ).fail( function ( message ) {
			assert.strictEqual( message, errorMessage, 'promise is rejected with the error message when loading fails' );
			QUnit.start();
		} );
	} );

	QUnit.test( 'Clicks are not captured once the loading fails', 4, function ( assert ) {
		var event, returnValue,
			bootstrap = new mw.mmv.MultimediaViewerBootstrap();

		this.sandbox.stub( mw.loader, 'using' )
			.callsArgWith( 2, new Error( 'loading failed', ['mmv'] ) )
			.withArgs( 'mediawiki.notification' ).returns( $.Deferred().reject() ); // needed for mw.notify
		bootstrap.ensureEventHandlersAreSetUp = $.noop;

		event = new $.Event( 'click', { button: 0, which: 1 } );
		returnValue = bootstrap.click( {}, event, 'foo' );
		assert.ok( event.isDefaultPrevented(), 'First click is caught' );
		assert.strictEqual( returnValue, false, 'First click is caught' );

		event = new $.Event( 'click', { button: 0, which: 1 } );
		returnValue = bootstrap.click( {}, event, 'foo' );
		assert.ok( !event.isDefaultPrevented(), 'Click after loading failure is not caught' );
		assert.notStrictEqual( returnValue, false, 'Click after loading failure is not caught' );
	} );

	QUnit.test( 'Check viewer invoked when clicking on legit image links', 10, function ( assert ) {
		// TODO: Is <div class="gallery"><span class="image"><img/></span></div> valid ???
		var div, link, link2, link3, link4, link5, bootstrap,
			viewer = { initWithThumbs: $.noop };

		// Create gallery with legit link image
		div = createGallery();
		link = div.find( 'a.image' );

		// Legit isolated thumbnail
		link2 = $( '<a>' ).addClass( 'image' ).appendTo( '#qunit-fixture' );
		$( '<img>' ).attr( 'src', 'thumb2.jpg' ).appendTo( link2 );

		// Non-legit fragment
		link3 = $( '<a>' ).addClass( 'noImage' ).appendTo( div );
		$( '<img>' ).attr( 'src', 'thumb3.jpg' ).appendTo( link3 );

		$( '<div>' ).addClass( 'fullMedia' ).appendTo( div );
		$( '<img>' ).attr( 'src', 'thumb4.jpg' ).appendTo(
			$( '<a>' )
				.appendTo(
					$( '<div>' )
						.attr( 'id', 'file' )
						.appendTo( '#qunit-fixture' )
				)
		);

		// Create a new bootstrap object to trigger the DOM scan, etc.
		bootstrap = createBootstrap( viewer );

		link4 = $( '.fullMedia .mw-mmv-view-expanded' );
		assert.ok( link4.length, 'Link for viewing expanded file was set up.' );

		link5 = $( '.fullMedia .mw-mmv-view-config' );
		assert.ok( link5.length, 'Link for opening enable/disable configuration was set up.' );

		bootstrap.setupOverlay = function () {
			assert.ok( true, 'Overlay was set up' );
		};

		viewer.loadImageByTitle = function () {
			assert.ok( true, 'Image loaded' );
		};

		// Click on legit link
		link.trigger( { type: 'click', which: 1 } );

		// Click on legit link
		link2.trigger( { type: 'click', which: 1 } );

		// Click on legit link
		link4.trigger( { type: 'click', which: 1 } );

		// Click on legit link even when preference says not to
		mw.config.set( 'wgMediaViewerOnClick', false );
		link4.trigger( { type: 'click', which: 1 } );
		mw.config.set( 'wgMediaViewerOnClick', true );

		bootstrap.setupOverlay = function () {
			assert.ok( false, 'Overlay was not set up' );
		};

		viewer.loadImageByTitle = function () {
			assert.ok( false, 'Image should not be loaded' );
		};

		// Click on non-legit link
		link3.trigger( { type: 'click', which: 1 } );

		// Click on legit links with preference off
		mw.config.set( 'wgMediaViewerOnClick', false );
		link.trigger( { type: 'click', which: 1 } );
		link2.trigger( { type: 'click', which: 1 } );
	} );

	QUnit.test( 'Skip images with invalid extensions', 0, function ( assert ) {
		var div, link, bootstrap,
			viewer = { initWithThumbs: $.noop };

		// Create gallery with image that has invalid name extension
		div = createGallery( 'thumb.badext' );
		link = div.find( 'a.image' );

		// Create a new bootstrap object to trigger the DOM scan, etc.
		bootstrap = createBootstrap( viewer );

		viewer.loadImageByTitle = function () {
			assert.ok( false, 'Image should not be loaded' );
		};

		// Click on legit link with wrong image extension
		link.trigger( { type: 'click', which: 1 } );
	} );

	QUnit.test( 'Accept only left clicks without modifier keys, skip the rest', 2, function ( assert ) {
		var $div, $link, bootstrap,
			viewer = { initWithThumbs: $.noop };

		// Create gallery with image that has valid name extension
		$div = createGallery();

		// Create a new bootstrap object to trigger the DOM scan, etc.
		bootstrap = createBootstrap( viewer );

		$link = $div.find( 'a.image' );

		bootstrap.setupOverlay = function () {
			assert.ok( true, 'Overlay was set up' );
		};

		viewer.loadImageByTitle = function () {
			assert.ok( true, 'Image loaded' );
		};

		// Handle valid left click, it should try to load the image
		$link.trigger( { type: 'click', which: 1 } );

		bootstrap.setupOverlay = function () {
			assert.ok( false, 'Overlay was not set up' );
		};

		viewer.loadImageByTitle = function () {
			assert.ok( false, 'Image should not be loaded' );
		};

		// Skip Ctrl-left-click, no image is loaded
		$link.trigger( { type: 'click', which: 1, ctrlKey: true } );

		// Skip invalid right click, no image is loaded
		$link.trigger( { type: 'click', which: 2 } );
	} );

	QUnit.test( 'Ensure that the correct title is loaded when clicking', 2, function ( assert ) {
		var bootstrap,
			viewer = { initWithThumbs: $.noop },
			$div = createGallery( 'foo.jpg' ),
			$link = $div.find( 'a.image' );

		viewer.loadImageByTitle = function ( loadedTitle ) {
			assert.strictEqual( loadedTitle.getPrefixedDb(), 'File:Foo.jpg', 'Titles are identical' );
		};

		// Create a new bootstrap object to trigger the DOM scan, etc.
		bootstrap = createBootstrap( viewer );

		bootstrap.setupOverlay = function () {
			assert.ok( true, 'Overlay was set up' );
		};

		$link.trigger( { type: 'click', which: 1 } );
	} );

	QUnit.test( 'Validate new LightboxImage object has sane constructor parameters', 9, function ( assert ) {
		var bootstrap,
			$div,
			$link,
			viewer = new mw.mmv.MultimediaViewer( { get: $.noop } ),
			fname = 'valid',
			imgSrc = '/' + fname + '.jpg/300px-' + fname + '.jpg',
			imgRegex = new RegExp( imgSrc + '$' );

		$div = createThumb( imgSrc, 'Blah blah', 'meow' );
		$link = $div.find( 'a.image' );

		viewer.loadImage = $.noop;

		viewer.createNewImage = function ( fileLink, filePageLink, fileTitle, index, thumb, caption, alt ) {
			var html = thumb.outerHTML;

			assert.ok( fileLink.match( imgRegex ), 'Thumbnail URL used in creating new image object' );
			assert.strictEqual( filePageLink, '', 'File page link is sane when creating new image object' );
			assert.strictEqual( fileTitle.title, fname, 'Filename is correct when passed into new image constructor' );
			assert.strictEqual( index, 0, 'The only image we created in the gallery is set at index 0 in the images array' );
			assert.ok( html.indexOf( ' src="' + imgSrc + '"' ) > 0, 'The image element passed in contains the src=... we want.' );
			assert.ok( html.indexOf( ' alt="meow"' ) > 0, 'The image element passed in contains the alt=... we want.' );
			assert.strictEqual( caption, 'Blah blah', 'The caption passed in is correct' );
			assert.strictEqual( alt, 'meow', 'The alt text passed in is correct' );
		};

		// Create a new bootstrap object to trigger the DOM scan, etc.
		bootstrap = createBootstrap( viewer );

		bootstrap.setupOverlay = function () {
			assert.ok( true, 'Overlay was set up' );
		};

		$link.trigger( { type: 'click', which: 1 } );
	} );

	QUnit.test( 'Only load the viewer on a valid hash (modern browsers)', 1, function ( assert ) {
		var bootstrap;

		window.location.hash = '';

		bootstrap = createBootstrap();

		hashTest( '/media', bootstrap, assert );
	} );

	QUnit.test( 'Only load the viewer on a valid hash (old browsers)', 1, function ( assert ) {
		var bootstrap;

		window.location.hash = '';

		bootstrap = createBootstrap();
		bootstrap.browserHistory = undefined;

		hashTest( '/media', bootstrap, assert );
	} );

	QUnit.test( 'Load the viewer on a legacy hash (modern browsers)', 1, function ( assert ) {
		var bootstrap;

		window.location.hash = '';

		bootstrap = createBootstrap();

		hashTest( 'mediaviewer', bootstrap, assert );
	} );

	QUnit.test( 'Load the viewer on a legacy hash (old browsers)', 1, function ( assert ) {
		var bootstrap;

		window.location.hash = '';

		bootstrap = createBootstrap();
		bootstrap.browserHistory = undefined;

		hashTest( 'mediaviewer', bootstrap, assert );
	} );

	QUnit.test( 'Overlay is set up on hash change', 1, function( assert ) {
		var bootstrap;

		window.location.hash = '#/media/foo';

		bootstrap = createBootstrap();
		this.sandbox.stub( bootstrap, 'setupOverlay' );

		bootstrap.hash();

		assert.ok( bootstrap.setupOverlay.called, 'Overlay is set up' );
	} );

	QUnit.test( 'Overlay is not set up on an irrelevant hash change', 1, function( assert ) {
		var bootstrap;

		window.location.hash = '#foo';

		bootstrap = createBootstrap();
		this.sandbox.stub( bootstrap, 'setupOverlay' );
		bootstrap.loadViewer();
		bootstrap.setupOverlay.reset();

		bootstrap.hash();

		assert.ok( !bootstrap.setupOverlay.called, 'Overlay is not set up' );
	} );

	QUnit.test( 'internalHashChange', 1, function ( assert ) {
		var bootstrap = createBootstrap(),
			hash = '#/media/foo';

		window.location.hash = '';

		bootstrap.setupEventHandlers();

		bootstrap.loadViewer = function () {
			assert.ok( false, 'Viewer should not be loaded' );
			return $.Deferred().reject();
		};

		bootstrap.internalHashChange( { hash: hash } );

		assert.strictEqual( window.location.hash, hash, 'Window\'s hash has been updated correctly' );

		bootstrap.cleanupEventHandlers();

		window.location.hash = '';
	} );

	QUnit.test( 'internalHashChange (legacy)', 1, function ( assert ) {
		var bootstrap = createBootstrap(),
			hash = '#mediaviewer/foo';

		window.location.hash = '';

		bootstrap.setupEventHandlers();

		bootstrap.loadViewer = function () {
			assert.ok( false, 'Viewer should not be loaded' );
			return $.Deferred().reject();
		};

		bootstrap.internalHashChange( { hash: hash } );

		assert.strictEqual( window.location.hash, hash, 'Window\'s hash has been updated correctly' );

		bootstrap.cleanupEventHandlers();

		window.location.hash = '';
	} );

	QUnit.test( 'Restoring article scroll position', 2, function ( assert ) {
		var bootstrap = createBootstrap(),
			scrollTop = 50,
			scrollLeft = 60,
			stubbedScrollTop = scrollTop,
			stubbedScrollLeft = scrollLeft;

		this.sandbox.stub( $, 'scrollTo', function ( target ) {
			if ( target ) {
				stubbedScrollTop = target.top;
				stubbedScrollLeft = target.left;
			} else {
				return {
					scrollTop: function () { return stubbedScrollTop; },
					scrollLeft: function () { return stubbedScrollLeft; }
				};
			}
		} );

		bootstrap.setupOverlay();
		// Calling this a second time because it can happen in history navigation context
		bootstrap.setupOverlay();
		bootstrap.cleanupOverlay();

		assert.strictEqual( stubbedScrollTop, scrollTop, 'Scroll is correctly reset to original top position' );
		assert.strictEqual( stubbedScrollLeft, scrollLeft, 'Scroll is correctly reset to original left position' );
	} );

	QUnit.test( 'Preload JS/CSS dependencies on thumb hover', 2, function ( assert ) {
		var $div, bootstrap,
			viewer = { initWithThumbs: $.noop };

		// Create gallery with image that has valid name extension
		$div = createThumb();

		// Create a new bootstrap object to trigger the DOM scan, etc.
		bootstrap = createBootstrap( viewer );

		this.sandbox.stub( mw.loader, 'load' );

		$div.mouseenter();
		this.clock.tick( bootstrap.hoverWaitDuration - 50 );
		$div.mouseleave();

		assert.ok( !mw.loader.load.called, 'Dependencies should not be preloaded if the thumb is not hovered long enough' );

		$div.mouseenter();
		this.clock.tick( bootstrap.hoverWaitDuration + 50 );
		$div.mouseleave();

		assert.ok( mw.loader.load.called, 'Dependencies should be preloaded if the thumb is hovered long enough' );
	} );

	QUnit.test( 'isAllowedThumb', 5, function ( assert ) {
		var $container = $( '<div>' ),
			$thumb = $( '<img>' ).appendTo( $container ),
			bootstrap = createBootstrap();


		assert.ok( bootstrap.isAllowedThumb( $thumb ), 'Normal image in a div is allowed.' );

		$container.addClass( 'metadata' );
		assert.strictEqual( bootstrap.isAllowedThumb( $thumb ), false, 'Image in a metadata container is disallowed.' );

		$container.prop( 'class', '' );
		$container.addClass( 'noviewer' );
		assert.strictEqual( bootstrap.isAllowedThumb( $thumb ), false, 'Image in a noviewer container is disallowed.' );

		$container.prop( 'class', '' );
		$container.addClass( 'noarticletext' );
		assert.strictEqual( bootstrap.isAllowedThumb( $thumb ), false, 'Image in an empty article is disallowed.' );

		$container.prop( 'class', '' );
		$thumb.addClass( 'noviewer' );
		assert.strictEqual( bootstrap.isAllowedThumb( $thumb ), false, 'Image with a noviewer class is disallowed.' );
	} );

	QUnit.test( 'findCaption', 4, function ( assert ) {
		var gallery = createGallery( 'foo.jpg', 'Baz' ),
			thumb = createThumb( 'foo.jpg', 'Quuuuux' ),
			link = createNormal( 'foo.jpg', 'Foobar' ),
			multiple = createMultipleImage( [ [ 'foo.jpg', 'Image #1' ], [ 'bar.jpg', 'Image #2' ],
				[ 'foobar.jpg', 'Image #3' ] ] ),
			bootstrap = createBootstrap();

		assert.strictEqual( bootstrap.findCaption( gallery.find( '.thumb' ), gallery.find( 'a.image' ) ), 'Baz', 'A gallery caption is found.' );
		assert.strictEqual( bootstrap.findCaption( thumb, thumb.find( 'a.image' ) ), 'Quuuuux', 'A thumbnail caption is found.' );
		assert.strictEqual( bootstrap.findCaption( $(), link ), 'Foobar', 'The caption is found even if the image is not a thumbnail.' );
		assert.strictEqual( bootstrap.findCaption( multiple, multiple.find( 'img[src="bar.jpg"]' ).closest( 'a' ) ), 'Image #2', 'The caption is found in {{Multiple image}}.' );
	} );
}( mediaWiki, jQuery ) );
