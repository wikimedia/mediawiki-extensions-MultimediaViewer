( function ( mw, $ ) {
	QUnit.module( 'mmv', QUnit.newMwEnvironment() );

	function createGallery( imageSrc ) {
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

	QUnit.test( 'Check viewer invoked when clicking on an legit image links', 4, function ( assert ) {
		// TODO: Is <div class="gallery"><span class="image"><img/></span></div> valid ???
		var div, link, link2, link3, viewer;

		// Create viewer, no images in page.
		viewer = new mw.MultimediaViewer();

		assert.strictEqual( viewer.lightbox, null, 'There are not legit links, a lightbox should not be created.' );

		// Create gallery with legit link image
		div = createGallery();
		link = div.find( 'a.image' );

		// Legit isolated thumbnail
		link2 = $( '<a>' ).addClass( 'image' ).appendTo( '#qunit-fixture' );
		$( '<img>' ).attr( 'src',  'thumb2.jpg' ).appendTo( link2 );

		// Non-legit fragment
		link3 = $( '<a>' ).addClass( 'noImage' ).appendTo( div );
		$( '<img>' ).attr( 'src',  'thumb3.jpg' ).appendTo( link3 );

		// Create another viewer so link analysis happens now that we have some images.
		viewer = new mw.MultimediaViewer();

		// Mock clickLink callback
		viewer.clickLinkCallback = function () {
			assert.ok( true, 'click callback called.' );
		};

		// Click on legit link
		link.trigger( 'click' );

		// Click on legit link
		link2.trigger( 'click' );

		// Click on non-legit link
		link3.trigger( 'click' );

		assert.notStrictEqual( viewer.lightbox, null, 'There are legit links, a lightbox should be created.' );

		// Clean up the viewer, to avoid seeing it catch events when running other tests
		mw.mmvTestHelpers.resetViewer();
	} );

	QUnit.test( 'Skip images with invalid extensions', 1, function ( assert ) {
		var div, link, viewer;

		// Create gallery with image that has invalid name extension
		div = createGallery( 'thumb.badext' );
		link = div.find( 'a.image' );

		// Create viewer so link analysis happens now that we have some images.
		viewer = new mw.MultimediaViewer();

		// Mock clickLink callback
		viewer.clickLinkCallback = function () {
			assert.ok( false, 'Wrong, handling an image with bad extension !' );
		};

		// Click on legit link with wrong image extension
		link.trigger( 'click' );

		assert.strictEqual( viewer.lightbox, null, 'There are not legit links, a lightbox should not be created.' );

		// Clean up the viewer, to avoid seeing it catch events when running other tests
		mw.mmvTestHelpers.resetViewer();
	} );

	QUnit.test( 'Accept only left clicks without modifier keys, skip the rest', 1, function ( assert ) {
		var div, link, viewer, leftClick, ctrlLeftClick, rightClick;

		// Create gallery with image that has invalid name extension
		div = createGallery();
		link = div.find( 'a.image' );

		// Create viewer so link analysis happens now that we have some images.
		viewer = new mw.MultimediaViewer();

		// Mock loadImage() function call
		viewer.loadImage = function () {
			assert.ok( true, 'Handling legit click.' );
		};

		leftClick = $.Event( 'click' );
		leftClick.which = 1;

		// Handle valid left click, it should try to load the image
		link.trigger( leftClick );

		ctrlLeftClick = $.Event( 'click' );
		ctrlLeftClick.which = 1;
		ctrlLeftClick.ctrlKey = true;

		// Skip Ctrl-left-click, no image is loaded
		link.trigger( ctrlLeftClick );

		rightClick = $.Event( 'click' );
		rightClick.which = 2;

		// Skip invalid right click, no image is loaded
		link.trigger( rightClick );

		// Clean up the viewer, to avoid seeing it catch events when running other tests
		mw.mmvTestHelpers.resetViewer();
	} );

	QUnit.test( 'Ensure that the click callback is getting the appropriate initial value for image loading', 1, function ( assert ) {
		var imgSrc = '300px-valid.jpg',
			div = createGallery( imgSrc ),
			link = div.find( 'a.image' ),
			viewer = new mw.MultimediaViewer();

		viewer.clickLinkCallback = function ( e, clickedEle, $thumbContain ) {
			assert.strictEqual( $thumbContain.find( 'img' ).prop( 'src' ).split( '/' ).pop(), imgSrc, 'The URL being used for the initial image load is correct' );
		};

		link.trigger( 'click' );

		// Clean up the viewer, to avoid seeing it catch events when running other tests
		mw.mmvTestHelpers.resetViewer();
	} );

	QUnit.test( 'Validate new LightboxImage object has sane constructor parameters', 6, function ( assert ) {
		var viewer,
			backup = mw.MultimediaViewer.prototype.createNewImage,
			fname = 'valid',
			imgSrc = '/' + fname + '.jpg/300px-' + fname + '.jpg',
			imgRegex = new RegExp( imgSrc + '$' );

		createGallery( imgSrc );

		mw.MultimediaViewer.prototype.createNewImage = function ( fileLink, filePageLink, fileTitle, index, thumb, caption ) {
			assert.ok( fileLink.match( imgRegex ), 'Thumbnail URL used in creating new image object' );
			assert.strictEqual( filePageLink, '', 'File page link is sane when creating new image object' );
			assert.strictEqual( fileTitle.title, fname, 'Filename is correct when passed into new image constructor' );
			assert.strictEqual( index, 0, 'The only image we created in the gallery is set at index 0 in the images array' );
			assert.strictEqual( thumb.outerHTML, '<img src="' + imgSrc + '">', 'The image element passed in is the thumbnail we want.' );
			assert.strictEqual( caption, undefined, 'The caption does not get passed in for a gallery' );
		};

		viewer = new mw.MultimediaViewer();
		mw.MultimediaViewer.prototype.createNewImage = backup;

		// Clean up the viewer, to avoid seeing it catch events when running other tests
		mw.mmvTestHelpers.resetViewer();
	} );

	QUnit.test( 'Validate new LightboxImage object has sane constructor parameters', 6, function ( assert ) {
		var viewer,
			backup = mw.MultimediaViewer.prototype.createNewImage,
			fname = 'valid',
			imgSrc = '/' + fname + '.jpg/300px-' + fname + '.jpg',
			imgRegex = new RegExp( imgSrc + '$' );

		createThumb( imgSrc, 'Blah blah' );

		mw.MultimediaViewer.prototype.createNewImage = function ( fileLink, filePageLink, fileTitle, index, thumb, caption ) {
			assert.ok( fileLink.match( imgRegex ), 'Thumbnail URL used in creating new image object' );
			assert.strictEqual( filePageLink, '', 'File page link is sane when creating new image object' );
			assert.strictEqual( fileTitle.title, fname, 'Filename is correct when passed into new image constructor' );
			assert.strictEqual( index, 0, 'The only image we created in the gallery is set at index 0 in the images array' );
			assert.strictEqual( thumb.outerHTML, '<img src="' + imgSrc + '">', 'The image element passed in is the thumbnail we want.' );
			assert.strictEqual( caption, 'Blah blah', 'The caption passed in is correct' );
		};

		viewer = new mw.MultimediaViewer();
		mw.MultimediaViewer.prototype.createNewImage = backup;

		// Clean up the viewer, to avoid seeing it catch events when running other tests
		mw.mmvTestHelpers.resetViewer();
	} );

	QUnit.test( 'Metadata div is only animated once', 4, function ( assert ) {
		var viewer = new mw.MultimediaViewer(),
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

		// Clean up the viewer, to avoid seeing it catch events when running other tests
		mw.mmvTestHelpers.resetViewer();
	} );

	QUnit.test( 'HTML whitelisting works', 2, function ( assert ) {
		var viewer = new mw.MultimediaViewer(),
			okhtml = '<a href="/wiki/Blah">Blah</a> blah blah',
			needswhitelisting = '<div>Blah<br />blah</div>',
			whitelisted = 'Blahblah',
			okjq = $.parseHTML( okhtml ),
			nwljq = $.parseHTML( needswhitelisting ),
			$sandbox = $( '<div>' );

		viewer.whitelistHtml( $sandbox.empty().append( okjq ) );
		assert.strictEqual( $sandbox.html(), okhtml, 'Whitelisted elements are let through.' );

		viewer.whitelistHtml( $sandbox.empty().append( nwljq ) );
		assert.strictEqual( $sandbox.html(), whitelisted, 'Not-whitelisted elements are removed.' );

		// Clean up the viewer, to avoid seeing it catch events when running other tests
		mw.mmvTestHelpers.resetViewer();
	} );

	QUnit.asyncTest( 'loadAndSetImage(): Basic load', 3, function ( assert ) {
		var widths = new mw.mmv.model.ThumbnailWidth( 8, 8, 640 ), // Current area < imageData.width
			viewer = new mw.MultimediaViewer(),
			ui = new mw.LightboxInterface( viewer ),
			size = 120,
			width = 10,
			height = 11,
			imageUrl = 'http://en.wikipedia.org/w/skins/vector/images/search-ltr.png',
			imageData = new mw.mmv.model.Image(
				mw.Title.newFromText( 'File:Foobar.pdf.jpg' ),
				size, width, height, 'image/jpeg',
				imageUrl,
				'http://example.com',
				'example', 'tester', '2013-11-10', '2013-11-09', 'Blah blah blah',
				'A person', 'Another person', 'CC-BY-SA-3.0', 0, 0
			);

		ui.replaceImageWith = function ( image ) {
			assert.strictEqual( image.src, imageUrl, 'Image to replace has correct "src" attribute.' );
			assert.strictEqual( image.width, widths.css, 'Image to replace has correct "width" attribute.' );
		};
		viewer.updateControls = function () {
			assert.ok( true, 'Controls updated.' );
			QUnit.start();
		};

		// Test case when image loaded is bigger than current area
		viewer.loadAndSetImage( ui, imageData, widths );
		mw.mmvTestHelpers.resetViewer();
	} );

	QUnit.test( 'Hash handling', 5, function ( assert ) {
		var oldLoadImage = mw.mediaViewer.loadImage,
			oldLightbox = mw.mediaViewer.lightbox,
			imageSrc = 'Foo bar.jpg',
			image = { filePageTitle: new mw.Title( 'File:' + imageSrc ) };

		document.location.hash = '';

		mw.mediaViewer.lightbox = { iface: { unattach: function() {
			assert.ok( true, 'Interface unattached' );
		} } };

		// Verify that passing an invalid mmv hash triggers unattach()
		document.location.hash = 'Foo';

		mw.mediaViewer.lightbox = { images: [ image ] };

		$( '#qunit-fixture' ).append( '<a class="image"><img src="' + imageSrc + '"></a>' );

		mw.mediaViewer.loadImage = function( img, src ) {
			assert.strictEqual( img, image, 'The image object matches' );
			assert.ok( src.match( encodeURIComponent( imageSrc ) ), 'The image url matches' );
		};

		// Open a valid mmv hash link and check that the right image is requested.
		// imageSrc contains a space without any encoding on purpose
		document.location.hash = 'mediaviewer/File:' + imageSrc + '/0';

		// Reset the hash, because for some browsers switching from the non-URI-encoded to
		// the non-URI-encoded version of the same text with a space will not trigger a hash change
		document.location.hash = '';

		// Try again with an URI-encoded imageSrc containing a space
		document.location.hash = 'mediaviewer/File:' + encodeURIComponent( imageSrc ) + '/0';

		mw.mediaViewer.lightbox = oldLightbox;
		mw.mediaViewer.loadImage = oldLoadImage;

		document.location.hash = '';
	} );
}( mediaWiki, jQuery ) );
