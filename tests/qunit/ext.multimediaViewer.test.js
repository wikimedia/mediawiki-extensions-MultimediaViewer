( function ( mw, $ ) {
	QUnit.module( 'ext.multimediaViewer', QUnit.newMwEnvironment() );

	function createGallery( imageSrc ) {
		var div = $( '<div>' ).addClass( 'gallery' ).appendTo( '#qunit-fixture' ),
				link = $( '<a>' ).addClass( 'image' ).appendTo( div );
		$( '<img>' ).attr( 'src',  ( imageSrc || 'thumb.jpg' ) ).appendTo( link );

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
	} );

}( mediaWiki, jQuery ) );
