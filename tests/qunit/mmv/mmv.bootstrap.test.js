const { MultimediaViewerBootstrap } = require( 'mmv.bootstrap' );
const { asyncMethod, waitForAsync, getMultimediaViewer } = require( './mmv.testhelpers.js' );

QUnit.module( 'mmv.bootstrap', QUnit.newMwEnvironment( {
	// mw.Title relies on these three config vars
	// Restore them after each test run
	config: {
		wgFormattedNamespaces: {
			'-2': 'Media',
			'-1': 'Special',
			0: '',
			1: 'Talk',
			2: 'User',
			3: 'User talk',
			4: 'Wikipedia',
			5: 'Wikipedia talk',
			6: 'File',
			7: 'File talk',
			8: 'MediaWiki',
			9: 'MediaWiki talk',
			10: 'Template',
			11: 'Template talk',
			12: 'Help',
			13: 'Help talk',
			14: 'Category',
			15: 'Category talk',
			// testing custom / localized namespace
			100: 'Penguins'
		},
		wgNamespaceIds: {
			/* eslint-disable camelcase */
			media: -2,
			special: -1,
			'': 0,
			talk: 1,
			user: 2,
			user_talk: 3,
			wikipedia: 4,
			wikipedia_talk: 5,
			file: 6,
			file_talk: 7,
			mediawiki: 8,
			mediawiki_talk: 9,
			template: 10,
			template_talk: 11,
			help: 12,
			help_talk: 13,
			category: 14,
			category_talk: 15,
			image: 6,
			image_talk: 7,
			project: 4,
			project_talk: 5,
			// Testing custom namespaces and aliases
			penguins: 100,
			antarctic_waterfowl: 100
			/* eslint-enable camelcase */
		},
		wgCaseSensitiveNamespaces: []
	},
	beforeEach: function () {
		mw.config.set( 'wgMediaViewer', true );
		mw.config.set( 'wgMediaViewerOnClick', true );
		this.sandbox.stub( mw.user, 'isAnon' ).returns( false );
	}
} ) );

function createLegacyGallery( imageSrc, caption ) {
	const $div = $( '<div>' ).addClass( 'gallery' ).appendTo( '#qunit-fixture' );
	const $galleryBox = $( '<div>' ).addClass( 'gallerybox' ).appendTo( $div );
	const $thumbwrap = $( '<div>' ).addClass( 'thumb' ).appendTo( $galleryBox );
	const $link = $( '<a>' ).addClass( 'image' ).appendTo( $thumbwrap );

	$( '<img>' ).attr( 'src', ( imageSrc || 'thumb.jpg' ) ).appendTo( $link );
	$( '<div>' ).addClass( 'gallerytext' ).text( caption || 'Foobar' ).appendTo( $galleryBox );

	return $div;
}

function createLegacyThumb( imageSrc, caption, alt ) {
	const $div = $( '<div>' ).addClass( 'thumb' ).appendTo( '#qunit-fixture' );
	const $link = $( '<a>' ).addClass( 'image' ).appendTo( $div );

	$( '<div>' ).addClass( 'thumbcaption' ).appendTo( $div ).text( caption );
	$( '<img>' ).attr( 'src', ( imageSrc || 'thumb.jpg' ) ).attr( 'alt', alt ).appendTo( $link );

	return $div;
}

function createBlockImage( imageSrc, caption, alt, link ) {
	const $figure = $( '<figure>' ).attr( 'typeof', 'mw:File/Thumb' ).appendTo( '#qunit-fixture' );

	const $link = $( '<a>' ).appendTo( $figure );
	if ( link ) {
		$link.attr( 'href', link );
		// Added by mediawiki.page.media.js
		$( '<a>' ).addClass( 'mw-file-magnify' ).appendTo( $figure );
	} else {
		$link.addClass( 'mw-file-description' );
	}

	$( '<figcaption>' ).appendTo( $figure ).text( caption );
	$( '<img>' ).attr( 'src', ( imageSrc || 'thumb.jpg' ) ).attr( 'alt', alt ).appendTo( $link );

	return $figure;
}

function createInlineImage( imageSrc, caption, alt ) {
	const $span = $( '<span>' ).attr( 'typeof', 'mw:File' ).appendTo( '#qunit-fixture' );
	const $link = $( '<a>' ).attr( 'title', caption ).addClass( 'mw-file-description' ).appendTo( $span );

	$( '<img>' ).attr( 'src', ( imageSrc || 'thumb.jpg' ) ).attr( 'alt', alt ).appendTo( $link );

	return $span;
}

function createGallery( imageSrc, caption ) {
	const $ol = $( '<ol>' ).addClass( 'gallery' ).appendTo( '#qunit-fixture' );
	const $galleryBox = $( '<li>' ).addClass( 'gallerybox' ).appendTo( $ol );
	const $thumbwrap = $( '<div>' ).addClass( 'thumb' ).appendTo( $galleryBox );

	// The caption is deliberately omitted here to ensure
	// we're getting from the gallerytext
	createInlineImage( imageSrc ).appendTo( $thumbwrap );

	$( '<div>' ).addClass( 'gallerytext' ).text( caption ).appendTo( $galleryBox );

	return $ol;
}

function createLegacyNormal( imageSrc, caption ) {
	const $link = $( '<a>' ).prop( 'title', caption ).addClass( 'image' ).appendTo( '#qunit-fixture' );
	$( '<img>' ).prop( 'src', ( imageSrc || 'thumb.jpg' ) ).appendTo( $link );
	return $link;
}

function createLegacyMultipleImage( images ) {
	const $contain = $( '<div>' ).addClass( 'thumb' );
	const $thumbinner = $( '<div>' ).addClass( 'thumbinner' ).appendTo( $contain );
	for ( let i = 0; i < images.length; ++i ) {
		const $div = $( '<div>' ).appendTo( $thumbinner );
		const $thumbimage = $( '<div>' ).addClass( 'thumbimage' ).appendTo( $div );
		const $link = $( '<a>' ).addClass( 'image' ).appendTo( $thumbimage );
		$( '<img>' ).prop( 'src', images[ i ][ 0 ] ).appendTo( $link );
		$( '<div>' ).addClass( 'thumbcaption' ).text( images[ i ][ 1 ] ).appendTo( $div );
	}
	return $contain;
}

// Simulates the post-transform markup produced by MobileFrontend's
// lazy-load image transform in legacy parser output (T427542). When a
// caption is given, the link is wrapped in the figure/figcaption
// markup the transform operates on (T428648).
function createLazyImagePlaceholder( title, src, caption ) {
	let $parent = $( '#qunit-fixture' );
	if ( caption !== undefined ) {
		$parent = $( '<figure>' )
			.attr( 'typeof', 'mw:File/Thumb' )
			.appendTo( $parent );
	}
	const $link = $( '<a>' )
		.addClass( 'mw-file-description' )
		.attr( 'href', '/wiki/' + title )
		.appendTo( $parent );
	$( '<span>' )
		.addClass( 'lazy-image-placeholder' )
		.attr( 'data-mw-src', src )
		.attr( 'data-alt', '' )
		.attr( 'data-width', '220' )
		.attr( 'data-height', '220' )
		.appendTo( $link );
	if ( caption !== undefined ) {
		$( '<figcaption>' ).text( caption ).appendTo( $parent );
	}
	return $link;
}

// Simulates a {{Infobox}} image cell: a .infobox-image <td> holding one or more
// mw:File images and, optionally, a sibling .infobox-caption (T429839).
function createInfoboxImage( imageSrc, caption ) {
	const $table = $( '<table>' ).addClass( 'infobox' ).appendTo( '#qunit-fixture' );
	const $cell = $( '<td>' ).addClass( 'infobox-image' )
		.appendTo( $( '<tr>' ).appendTo( $( '<tbody>' ).appendTo( $table ) ) );

	const addImage = ( src ) => {
		const $span = $( '<span>' ).attr( 'typeof', 'mw:File/Frameless' ).appendTo( $cell );
		const $link = $( '<a>' ).addClass( 'mw-file-description' ).appendTo( $span );
		$( '<img>' ).attr( 'src', src ).appendTo( $link );
		return $link;
	};

	const $link = addImage( imageSrc || 'thumb.jpg' );
	if ( caption !== null && caption !== undefined ) {
		$( '<div>' ).addClass( 'infobox-caption' ).text( caption ).appendTo( $cell );
	}

	return { $table, $cell, $link, addImage };
}

function createBootstrap( viewer ) {
	const bootstrap = new MultimediaViewerBootstrap();

	bootstrap.processThumbs( $( '#qunit-fixture' ) );

	// MultimediaViewerBootstrap.ensureEventHandlersAreSetUp() is a weird workaround for gadget bugs.
	// MediaViewer should work without it, and so should the tests.
	bootstrap.ensureEventHandlersAreSetUp = function () {};

	bootstrap.viewer = viewer || {
		loadImageByTitle: function () {},
		initWithThumbs: function () {},
		hash: function () {},
		router: { checkRoute: function () {} }
	};

	return bootstrap;
}

function hashTest( prefix, bootstrap, assert ) {
	const hash = prefix + '/foo';
	let callCount = 0;

	bootstrap.loadViewer = function () {
		callCount++;
		return $.Deferred().reject();
	};

	// Hijack loadViewer, which will return a promise that we'll have to
	// wait for if we want to see these tests through
	asyncMethod( bootstrap, 'loadViewer' );

	// invalid hash, should not trigger MMV load
	location.hash = 'Foo';

	// actual hash we want to test for, should trigger MMV load
	// use setTimeout to add new hash change to end of the call stack,
	// ensuring that event handlers for our previous change can execute
	// without us interfering with another immediate change
	setTimeout( () => {
		location.hash = hash;
	} );

	return waitForAsync().then( () => {
		assert.strictEqual( callCount, 1, 'Viewer should be loaded once' );
		bootstrap.cleanupEventHandlers();
		location.hash = '';
	} );
}

QUnit.test( 'Promise does not hang on ResourceLoader errors', async function ( assert ) {
	const errorMessage = 'loading failed';

	this.sandbox.stub( mw.loader, 'using' )
		.returns( $.Deferred().reject( new Error( errorMessage ) ) );

	const bootstrap = createBootstrap();
	this.sandbox.stub( bootstrap, 'setupOverlay' );
	this.sandbox.stub( bootstrap, 'cleanupOverlay' );

	await assert.rejects(
		bootstrap.loadViewer(),
		new Error( errorMessage ),
		'promise is rejected with the error when loading fails'
	);

	assert.strictEqual( bootstrap.setupOverlay.called, true, 'Overlay was set up' );
	assert.strictEqual( bootstrap.cleanupOverlay.called, true, 'Overlay was cleaned up' );
} );

QUnit.test( 'Clicks are not captured once the loading fails', function ( assert ) {
	const bootstrap = new MultimediaViewerBootstrap();
	const clock = this.sandbox.useFakeTimers();

	this.sandbox.stub( mw.loader, 'using' )
		.callsArgWith( 2, new Error( 'loading failed', [ 'mmv' ] ) )
		.withArgs( 'mediawiki.notification' ).returns( $.Deferred().reject() ); // needed for mw.notify
	bootstrap.ensureEventHandlersAreSetUp = function () {};

	// trigger first click, which will cause MMV to be loaded (which we've
	// set up to fail)
	const event = new $.Event( 'click', { button: 0, which: 1 } );
	const returnValue = bootstrap.click( event, mw.Title.newFromText( 'Foo' ) );
	clock.tick( 10 );
	assert.true( event.isDefaultPrevented(), 'First click is caught' );
	assert.strictEqual( returnValue, false, 'First click is caught' );
	clock.restore();
} );

// FIXME: Tests suspended as they do not pass in QUnit 2.x+ – T192932
QUnit.skip( 'Check viewer invoked when clicking on valid image links', function ( assert ) {
	// TODO: Is <div class="gallery"><span class="image"><img/></span></div> valid ???
	const viewer = { initWithThumbs: function () {}, loadImageByTitle: this.sandbox.stub() };
	const clock = this.sandbox.useFakeTimers();

	// Create gallery with valid link image
	const div = createLegacyGallery();
	const $link = div.find( 'a.image' );

	// Valid isolated thumbnail
	const $link2 = $( '<a>' ).addClass( 'image' ).appendTo( '#qunit-fixture' );
	$( '<img>' ).attr( 'src', 'thumb2.jpg' ).appendTo( $link2 );

	// Non-valid fragment
	const $link3 = $( '<a>' ).addClass( 'noImage' ).appendTo( div );
	$( '<img>' ).attr( 'src', 'thumb3.jpg' ).appendTo( $link3 );

	mw.config.set( 'wgTitle', 'Thumb4.jpg' );
	mw.config.set( 'wgNamespaceNumber', 6 );
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
	const bootstrap = createBootstrap( viewer );
	this.sandbox.stub( bootstrap, 'setupOverlay' );

	const $link4 = $( '.fullMedia .mw-mmv-view-expanded' );
	assert.ok( $link4.length, 'Link for viewing expanded file was set up.' );

	// Click on valid link
	$link.trigger( { type: 'click', which: 1 } );
	clock.tick( 10 );
	// FIXME: Actual bootstrap.setupOverlay.callCount: 2
	assert.equal( bootstrap.setupOverlay.callCount, 1, 'setupOverlay called (1st click)' );
	assert.equal( viewer.loadImageByTitle.callCount, 1, 'loadImageByTitle called (1st click)' );
	this.sandbox.reset();

	// Click on valid link
	$link2.trigger( { type: 'click', which: 1 } );
	clock.tick( 10 );
	assert.equal( bootstrap.setupOverlay.callCount, 1, 'setupOverlay called (2nd click)' );
	assert.equal( viewer.loadImageByTitle.callCount, 1, 'loadImageByTitle called (2nd click)' );
	this.sandbox.reset();

	// Click on valid link
	$link4.trigger( { type: 'click', which: 1 } );
	clock.tick( 10 );
	assert.equal( bootstrap.setupOverlay.callCount, 1, 'setupOverlay called (3rd click)' );
	assert.equal( viewer.loadImageByTitle.callCount, 1, 'loadImageByTitle called (3rd click)' );
	this.sandbox.reset();

	// Click on valid link even when preference says not to
	mw.config.set( 'wgMediaViewerOnClick', false );
	$link4.trigger( { type: 'click', which: 1 } );
	clock.tick( 10 );
	mw.config.set( 'wgMediaViewerOnClick', true );
	assert.equal( bootstrap.setupOverlay.callCount, 1, 'setupOverlay called on-click with pref off' );
	assert.equal( viewer.loadImageByTitle.callCount, 1, 'loadImageByTitle called on-click with pref off' );
	this.sandbox.reset();

	// @todo comment that above clicks should result in call, below clicks should not

	// Click on non-valid link
	$link3.trigger( { type: 'click', which: 1 } );
	clock.tick( 10 );
	assert.equal( bootstrap.setupOverlay.callCount, 0, 'setupOverlay not called on non-valid link click' );
	assert.equal( viewer.loadImageByTitle.callCount, 0, 'loadImageByTitle not called on non-valid link click' );
	this.sandbox.reset();

	// Click on valid links with preference off
	mw.config.set( 'wgMediaViewerOnClick', false );
	$link.trigger( { type: 'click', which: 1 } );
	$link2.trigger( { type: 'click', which: 1 } );
	clock.tick( 10 );
	assert.equal( bootstrap.setupOverlay.callCount, 0, 'setupOverlay not called on non-valid link click with pref off' );
	assert.equal( viewer.loadImageByTitle.callCount, 0, 'loadImageByTitle not called on non-valid link click with pref off' );

	clock.restore();
} );

QUnit.test( 'Skip images with invalid extensions', function ( assert ) {
	const viewer = { initWithThumbs: function () {}, loadImageByTitle: this.sandbox.stub() };
	const clock = this.sandbox.useFakeTimers();

	// Create gallery with image that has invalid name extension
	const div = createLegacyGallery( 'thumb.badext' );
	const link = div.find( 'a.image' );

	// Create a new bootstrap object to trigger the DOM scan, etc.
	createBootstrap( viewer );

	// Click on valid link with wrong image extension
	link.trigger( { type: 'click', which: 1 } );
	clock.tick( 10 );

	assert.strictEqual( viewer.loadImageByTitle.called, false, 'Image should not be loaded' );

	clock.restore();
} );

// FIXME: Tests suspended as they do not pass in QUnit 2.x+ – T192932
QUnit.skip( 'Accept only left clicks without modifier keys, skip the rest', function ( assert ) {
	const viewer = { initWithThumbs: function () {}, loadImageByTitle: this.sandbox.stub() };
	const clock = this.sandbox.useFakeTimers();

	// Create gallery with image that has valid name extension
	const $div = createLegacyGallery();

	// Create a new bootstrap object to trigger the DOM scan, etc.
	const bootstrap = createBootstrap( viewer );
	this.sandbox.stub( bootstrap, 'setupOverlay' );

	const $link = $div.find( 'a.image' );

	// Handle valid left click, it should try to load the image
	$link.trigger( { type: 'click', which: 1 } );
	clock.tick( 10 );

	// FIXME: Actual bootstrap.setupOverlay.callCount: 2
	assert.equal( bootstrap.setupOverlay.callCount, 1, 'Left-click: Set up overlay' );
	assert.equal( viewer.loadImageByTitle.callCount, 1, 'Left-click: Load image' );
	this.sandbox.reset();

	// Skip Ctrl-left-click, no image is loaded
	$link.trigger( { type: 'click', which: 1, ctrlKey: true } );
	clock.tick( 10 );
	assert.equal( bootstrap.setupOverlay.callCount, 0, 'Ctrl-left-click: No overlay' );
	assert.equal( viewer.loadImageByTitle.callCount, 0, 'Ctrl-left-click: No image load' );
	this.sandbox.reset();

	// Skip invalid right click, no image is loaded
	$link.trigger( { type: 'click', which: 2 } );
	clock.tick( 10 );
	assert.equal( bootstrap.setupOverlay.callCount, 0, 'Right-click: No overlay' );
	assert.equal( viewer.loadImageByTitle.callCount, 0, 'Right-click: Image was not loaded' );

	clock.restore();
} );

QUnit.test( 'Ensure that the correct title is loaded when clicking', function ( assert ) {
	const viewer = { initWithThumbs: function () {}, loadImageByTitle: this.sandbox.stub() };
	const clock = this.sandbox.useFakeTimers();

	// Create a new bootstrap object to trigger the DOM scan, etc.
	const bootstrap = createBootstrap( viewer );
	this.sandbox.stub( bootstrap, 'setupOverlay' );

	bootstrap.route( 'File:Foo.jpg' );
	clock.tick( 10 );
	assert.true( bootstrap.setupOverlay.called, 'Overlay was set up' );
	assert.strictEqual( viewer.loadImageByTitle.firstCall.args[ 0 ].getPrefixedDb(), 'File:Foo.jpg', 'Titles are identical' );

	clock.tick( 10 );
	clock.restore();
} );

QUnit.test( 'Validate new LightboxImage object has sensible constructor parameters', function ( assert ) {
	const viewer = getMultimediaViewer();
	const fname = 'valid.jpg';
	const imgSrc = '/' + fname + '/300px-' + fname;
	createLegacyThumb( imgSrc, 'Blah blah', 'meow' );

	// Create a new bootstrap object to trigger the DOM scan, etc.
	const bootstrap = createBootstrap( viewer );
	this.sandbox.stub( bootstrap, 'setupOverlay' );
	viewer.loadImage = function () {};
	const done = assert.async();
	bootstrap.loadViewer().then( () => {
		assert.strictEqual( bootstrap.thumbs.length, 1, 'One thumbnail' );
		/** @type {LightboxImage} */
		const thumb = bootstrap.thumbs[ 0 ];
		assert.true( new RegExp( imgSrc + '$' ).test( thumb.src ), 'Thumbnail URL used in creating new image object' );
		assert.strictEqual( thumb.filePageTitle.title, fname, 'Filename is correct when passed into new image constructor' );
		assert.strictEqual( thumb.index, 0, 'The only image we created in the gallery is set at index 0 in the images array' );
		assert.strictEqual( thumb.caption, 'Blah blah', 'The caption passed in is correct' );
		assert.strictEqual( thumb.alt, 'meow', 'The alt text passed in is correct' );
		done();
	} );
	bootstrap.setupOverlay.reset();
} );

QUnit.test( 'Only load the viewer on a valid hash', ( assert ) => {
	location.hash = '';

	const bootstrap = createBootstrap();

	return hashTest( '/media', bootstrap, assert );
} );

QUnit.test( 'Overlay is set up on hash change', function ( assert ) {
	location.hash = '#/media/foo';

	const bootstrap = createBootstrap();
	this.sandbox.stub( bootstrap, 'setupOverlay' );

	bootstrap.hash();

	assert.true( bootstrap.setupOverlay.called, 'Overlay is set up' );
} );

QUnit.test( 'Overlay is not set up on an irrelevant hash change', function ( assert ) {
	location.hash = '#foo';

	const bootstrap = createBootstrap();
	this.sandbox.stub( bootstrap, 'setupOverlay' );
	bootstrap.loadViewer();
	bootstrap.setupOverlay.reset();

	bootstrap.hash();

	assert.strictEqual( bootstrap.setupOverlay.called, false, 'Overlay is not set up' );
} );

QUnit.test( 'Restoring article scroll position', function ( assert ) {
	let stubbedScrollTop;
	const bootstrap = createBootstrap();
	const $window = $( window );
	const done = assert.async();

	this.sandbox.stub( $.fn, 'scrollTop', function ( scrollTop ) {
		if ( scrollTop !== undefined ) {
			stubbedScrollTop = scrollTop;
			return this;
		} else {
			return stubbedScrollTop;
		}
	} );

	$window.scrollTop( 50 );
	bootstrap.setupOverlay();
	// Calling this a second time because it can happen in history navigation context
	bootstrap.setupOverlay();
	// Clear scrollTop to check it is restored
	$window.scrollTop( 0 );
	bootstrap.cleanupOverlay();

	// Scroll restoration is on a setTimeout
	setTimeout( () => {
		assert.strictEqual( $( window ).scrollTop(), 50, 'Scroll is correctly reset to original top position' );
		done();
	} );
} );

QUnit.test( 'Preload JS/CSS dependencies on thumb hover', function ( assert ) {
	const clock = this.sandbox.useFakeTimers();
	const viewer = { initWithThumbs: function () {} };

	// Create thumb that has valid name extension
	const $div = createLegacyThumb();

	// Create a new bootstrap object to trigger the DOM scan, etc.
	const bootstrap = createBootstrap( viewer );

	this.sandbox.stub( mw.loader, 'load' );

	$div.trigger( 'mouseenter' );
	clock.tick( bootstrap.hoverWaitDuration - 50 );
	$div.trigger( 'mouseleave' );

	assert.strictEqual( mw.loader.load.called, false, 'Dependencies should not be preloaded if the thumb is not hovered long enough' );

	$div.trigger( 'mouseenter' );
	clock.tick( bootstrap.hoverWaitDuration + 50 );
	$div.trigger( 'mouseleave' );

	assert.strictEqual( mw.loader.load.called, true, 'Dependencies should be preloaded if the thumb is hovered long enough' );

	clock.restore();
} );

QUnit.test( 'isAllowedThumb', ( assert ) => {
	const $container = $( '<div>' );
	const $thumb = $( '<img>' ).appendTo( $container );
	const bootstrap = createBootstrap();

	assert.strictEqual( bootstrap.isAllowedThumb( $thumb ), true, 'Normal image in a div is allowed.' );

	$container.addClass( 'metadata' );
	assert.strictEqual( bootstrap.isAllowedThumb( $thumb ), false, 'Image in a metadata container is disallowed.' );

	$container.removeClass().addClass( 'noviewer' );
	assert.strictEqual( bootstrap.isAllowedThumb( $thumb ), false, 'Image in a noviewer container is disallowed.' );

	$container.removeClass().addClass( 'noarticletext' );
	assert.strictEqual( bootstrap.isAllowedThumb( $thumb ), false, 'Image in an empty article is disallowed.' );

	$container.removeClass().addClass( 'noviewer' );
	assert.strictEqual( bootstrap.isAllowedThumb( $thumb ), false, 'Image with a noviewer class is disallowed.' );
} );

QUnit.test( 'findLegacyCaption', ( assert ) => {
	const gallery = createLegacyGallery( 'foo.jpg', 'Baz' );
	const thumb = createLegacyThumb( 'foo.jpg', 'Quuuuux' );
	const link = createLegacyNormal( 'foo.jpg', 'Foobar' );
	const multiple = createLegacyMultipleImage( [
		[ 'foo.jpg', 'Image #1' ],
		[ 'bar.jpg', 'Image #2' ],
		[ 'foobar.jpg', 'Image #3' ]
	] );
	const bootstrap = createBootstrap();

	assert.strictEqual( bootstrap.findLegacyCaption( gallery.find( '.thumb' ), gallery.find( 'a.image' ) ), 'Baz', 'A gallery caption is found.' );
	assert.strictEqual( bootstrap.findLegacyCaption( thumb, thumb.find( 'a.image' ) ), 'Quuuuux', 'A thumbnail caption is found.' );
	assert.strictEqual( bootstrap.findLegacyCaption( $(), link ), 'Foobar', 'The caption is found even if the image is not a thumbnail.' );
	assert.strictEqual( bootstrap.findLegacyCaption( multiple, multiple.find( 'img[src="bar.jpg"]' ).closest( 'a' ) ), 'Image #2', 'The caption is found in {{Multiple image}}.' );

	const infobox = createInfoboxImage( 'foo.jpg', 'Infobox' );
	assert.strictEqual( bootstrap.findLegacyCaption( $(), infobox.$link ), 'Infobox', 'An infobox caption is found when the image is not a thumbnail.' );
} );

QUnit.test( 'findCaption', ( assert ) => {
	const $inline = createInlineImage( 'foo.jpg', 'Inline' );
	const $block = createBlockImage( 'foo.jpg', 'Block' );
	const $gallery = createGallery( 'foo.jpg', 'Gallery' ).find( '[typeof*="mw:File"]' );
	const bootstrap = createBootstrap();

	assert.strictEqual( bootstrap.findCaption( $inline, $inline.children().first() ), 'Inline', 'Inline image caption is found.' );
	assert.strictEqual( bootstrap.findCaption( $block, $block.children().first() ), 'Block', 'Block image caption is found.' );
	assert.strictEqual( bootstrap.findCaption( $gallery, $gallery.children().first() ), 'Gallery', 'Gallery image caption is found.' );

	const infobox = createInfoboxImage( 'foo.jpg', 'Infobox' );
	assert.strictEqual( bootstrap.findCaption( infobox.$link.parent(), infobox.$link ), 'Infobox', 'Infobox image caption is found.' );
} );

QUnit.test( 'findInfoboxCaption (T429839)', ( assert ) => {
	const bootstrap = createBootstrap();

	// Standard {{Infobox}} image: caption lives in the image's own cell.
	const withCaption = createInfoboxImage( 'foo.jpg', 'A caption' );
	assert.strictEqual( bootstrap.findInfoboxCaption( withCaption.$link ), 'A caption', 'Caption in the image\'s own .infobox-image cell is found.' );

	// Logo / flag with no caption in the cell: show nothing.
	const noCaption = createInfoboxImage( 'foo.jpg', null );
	assert.strictEqual( bootstrap.findInfoboxCaption( noCaption.$link ), undefined, 'A caption-less infobox image returns nothing.' );

	// Single-image guard: a cell with two images and one caption is ambiguous,
	// so no caption is attached (e.g. light/dark logo variants).
	const shared = createInfoboxImage( 'light.png', 'Shared caption' );
	shared.addImage( 'dark.png' );
	assert.strictEqual( bootstrap.findInfoboxCaption( shared.$link ), undefined, 'A cell with multiple images does not share a caption.' );

	// Wrong-association guard: a signature in a non-.infobox-image cell must not
	// inherit the portrait's caption elsewhere in the same infobox.
	const portrait = createInfoboxImage( 'portrait.jpg', 'Portrait caption' );
	const $sigCell = $( '<td>' ).addClass( 'infobox-full-data' )
		.appendTo( $( '<tr>' ).appendTo( portrait.$table.find( 'tbody' ) ) );
	const $sigLink = $( '<a>' ).addClass( 'mw-file-description' )
		.append( $( '<img>' ).attr( 'src', 'signature.svg' ) )
		.appendTo( $( '<span>' ).attr( 'typeof', 'mw:File' ).appendTo( $sigCell ) );
	assert.strictEqual( bootstrap.findInfoboxCaption( portrait.$link ), 'Portrait caption', 'The portrait keeps its own caption.' );
	assert.strictEqual( bootstrap.findInfoboxCaption( $sigLink ), undefined, 'A signature outside the .infobox-image cell inherits no caption.' );

	// An image outside any infobox is unaffected.
	const $inline = createInlineImage( 'foo.jpg', 'title' );
	assert.strictEqual( bootstrap.findInfoboxCaption( $inline.children().first() ), undefined, 'A non-infobox image returns nothing.' );
} );

QUnit.test( 'Infobox captions flow through to thumbs (T429839)', ( assert ) => {
	createInfoboxImage( 'foo.jpg', 'Infobox caption' );

	const bootstrap = createBootstrap();

	assert.strictEqual( bootstrap.thumbs.length, 1, 'Infobox image registered as a thumb' );
	assert.strictEqual( bootstrap.thumbs[ 0 ].caption, 'Infobox caption', 'The infobox caption is attached to the thumb' );
} );

QUnit.test( 'Recognize thumbs with mw-file-magnify links', function ( assert ) {
	const cases = [
		[ 'foo.jpg', 'Foo' ],
		[ 'bar.jpg', 'Bar', null, 'http://example.com' ]
	];
	cases.forEach( ( arr ) => createBlockImage( ...arr ) );

	const bootstrap = createBootstrap();
	this.sandbox.stub( bootstrap, 'setupOverlay' );
	const done = assert.async();
	bootstrap.loadViewer().then( () => {
		assert.strictEqual( bootstrap.thumbs.length, cases.length, `${ cases.length } thumbnails` );
		bootstrap.thumbs.forEach( ( thumb, i ) => {
			assert.strictEqual( thumb.caption, cases[ i ][ 1 ], 'The caption passed in is correct' );
		} );
		done();
	} );
	bootstrap.setupOverlay.reset();
} );

QUnit.test( 'Lazy-load placeholders are mapped to thumbs', ( assert ) => {
	createLazyImagePlaceholder( 'File:Lazy.jpg', '/Lazy.jpg/300px-Lazy.jpg' );

	const bootstrap = createBootstrap();

	assert.strictEqual( bootstrap.thumbs.length, 1, 'Placeholder registered a thumb' );
	assert.strictEqual(
		bootstrap.thumbs[ 0 ].filePageTitle.getPrefixedText(),
		'File:Lazy.jpg',
		'Title derived from the placeholder data-mw-src'
	);
} );

QUnit.test( 'Lazy-load placeholders in figures get their figcaption', ( assert ) => {
	createLazyImagePlaceholder( 'File:Lazy.jpg', '/Lazy.jpg/300px-Lazy.jpg', 'Lazy caption' );
	createLazyImagePlaceholder( 'File:Bare.jpg', '/Bare.jpg/300px-Bare.jpg' );

	const bootstrap = createBootstrap();

	assert.strictEqual( bootstrap.thumbs.length, 2, 'Both placeholders registered thumbs' );
	assert.strictEqual(
		bootstrap.thumbs[ 0 ].caption,
		'Lazy caption',
		'Caption taken from the surrounding figure\'s figcaption (T428648)'
	);
	assert.strictEqual(
		bootstrap.thumbs[ 1 ].caption,
		undefined,
		'Placeholder without figure/figcaption still has no caption'
	);
} );

QUnit.test( 'Thumbs are registered in document order regardless of type', ( assert ) => {
	// Interleave non-legacy (mw:File) thumbs with a legacy lazy-load
	// placeholder, as MobileFrontend produces when the lead section is left
	// un-lazied while later sections are transformed. Legacy and non-legacy
	// thumbs are processed by different code paths; this.thumbs must still
	// reflect the order the images appear on the page (T427542).
	createBlockImage( '/Alpha.jpg/300px-Alpha.jpg', 'Alpha' );
	createLazyImagePlaceholder( 'File:Beta.jpg', '/Beta.jpg/300px-Beta.jpg' );
	createBlockImage( '/Gamma.jpg/300px-Gamma.jpg', 'Gamma' );

	const bootstrap = createBootstrap();

	assert.deepEqual(
		bootstrap.thumbs.map( ( t ) => t.filePageTitle.getPrefixedText() ),
		[ 'File:Alpha.jpg', 'File:Beta.jpg', 'File:Gamma.jpg' ],
		'thumbs follow document order, not legacy-then-non-legacy grouping'
	);
} );
