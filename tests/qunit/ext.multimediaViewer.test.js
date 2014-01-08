( function ( mw, $ ) {
	var logTests = [
			[ 'thumbnail-link-click', 'User clicked on thumbnail to open lightbox.' ],
			[ 'enlarge-link-click', 'User clicked on enlarge link to open lightbox.' ],
			[ 'fullscreen-link-click', 'User clicked on fullscreen button in lightbox.' ],
			[ 'defullscreen-link-click', 'User clicked on button to return to normal lightbox view.' ],
			[ 'close-link-click', 'User clicked on the lightbox close button.' ],
			[ 'site-link-click', 'User clicked on the link to the file description page.' ],
			[ 'Something happened', 'Something happened' ]
		],

		profileTests = [
			[ 'image-load', 'Profiling image load with ID $1', 'Finished image load with ID $1 in $2 milliseconds', 200, 200, 120348, 'jpg' ],
			[ 'image-resize', 'Profiling image resize with ID $1', 'Finished image resize with ID $1 in $2 milliseconds', 400, 400, 500000, 'png' ],
			[ 'metadata-fetch', 'Profiling image metadata fetch with ID $1', 'Finished image metadata fetch with ID $1 in $2 milliseconds' ],
			[ 'gender-fetch', 'Profiling uploader gender fetch with ID $1', 'Finished uploader gender fetch with ID $1 in $2 milliseconds' ]
		];


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

	QUnit.test( 'Do not load the resized image if no data returning from the api', 1, function ( assert ) {
		var ui,
			data,
			viewer = new mw.MultimediaViewer();

		// Calling loadResizedImage() with empty/undefined data should not fail.
		viewer.loadResizedImage( ui, data );
		viewer.loadResizedImage( ui, {} );
		viewer.loadResizedImage( ui, { query: {} } );

		assert.ok( true, 'Resized image is not replaced since we have not data.' );
	} );

	QUnit.test( 'Logging works as expected', 4 * logTests.length, function ( assert ) {
		var i, test, msgName, expectedMsg,
			viewer = new mw.MultimediaViewer(),
			backupLog = mw.log,
			backupEventLog = mw.eventLog;

		function checkLogging( msg ) {
			assert.strictEqual( msg, expectedMsg, 'Message ' + msgName + ' is logged correctly.' );
		}

		function checkLoggingEventLog( type, event ) {
			assert.strictEqual( type, 'MediaViewer', 'Eventlogging gets the right event type for message ' + msgName + '.' );
			assert.strictEqual( event.version, '1.1', 'Eventlogging gets the right version number for message ' + msgName + '.' );
			assert.strictEqual( event.action, msgName, 'Eventlogging gets the right action name for message ' + msgName + '.' );
		}

		mw.log = checkLogging;
		mw.eventLog = mw.eventLog || {};
		mw.eventLog.logEvent = checkLoggingEventLog;

		for ( i = 0; i < logTests.length; i++ ) {
			test = logTests[i];
			msgName = test[0];
			expectedMsg = test[1];
			viewer.log( msgName );
		}

		mw.log = backupLog;
		mw.eventLog = backupEventLog;
	} );

	QUnit.test( 'Profiling works as expected', ( 12 * profileTests.length ), function ( assert ) {
		var i, pid, test, msgName, expectedMsg, expectedImageWidth,
			expectedFileSize, expectedFileType, expectedImageHeight,
			viewer = new mw.MultimediaViewer(),
			backupLog = mw.log,
			backupEventLog = mw.eventLog;

		function checkLogging( msg ) {
			assert.strictEqual( msg, expectedMsg, 'Message ' + msgName + ' is logged correctly.' );
		}

		function checkProfileEventLog( type, msg ) {
			assert.strictEqual( type, 'MediaViewerPerf', 'EventLogging gets the right event type for profile message ' + msgName + '.' );
			assert.strictEqual( msg.version, '1.0', 'EventLogging gets the right version number for profile message ' + msgName + '.' );
			assert.strictEqual( msg.action, msgName, 'EventLogging gets the right action name for message ' + msgName + '.' );
			assert.strictEqual( msg.start, undefined, 'MultimediaViewer#profileEnd deletes the event start time from ' + msgName + ' profiles sent to EventLogging.' );
			assert.strictEqual( msg.fileSize, expectedFileSize, 'EventLogging sees the correct file size for ' + msgName + ' profiles.' );
			assert.strictEqual( msg.fileType, expectedFileType, 'EventLogging sees the correct filetype for ' + msgName + ' profiles.' );
			assert.strictEqual( msg.imageHeight, expectedImageHeight, 'EventLogging sees the correct image height for ' + msgName + ' profiles.' );
			assert.strictEqual( msg.imageWidth, expectedImageWidth, 'EventLogging sees the correct image width for ' + msgName + ' profiles.' );
			assert.strictEqual( msg.userAgent, navigator.userAgent, 'EventLogging logs the browser user-agent string for ' + msgName + ' profiles.' );
		}

		mw.log = checkLogging;
		mw.eventLog = mw.eventLog || {};
		mw.eventLog.logEvent = checkProfileEventLog;

		for ( i = 0; i < profileTests.length; i++ ) {
			test = profileTests[i];
			msgName = test[0];

			expectedMsg = test[1].replace( /\$1/g, i );
			expectedImageWidth = test[3];
			expectedImageHeight = test[4];
			expectedFileSize = test[5];
			expectedFileType = test[6];
			pid = viewer.profileStart( msgName, { width: expectedImageWidth, height: expectedImageHeight, filesize: expectedFileSize }, expectedFileType );
			assert.strictEqual( pid, i, 'nonce-style profile IDs come in order.' );

			expectedMsg = test[2].replace( /\$1/g, i ).replace( /\$2/g, 0 );
			viewer.profileEnd( pid, true );
		}

		mw.log = backupLog;
		mw.eventLog = backupEventLog;
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
	} );

	QUnit.test( 'Validate new LightboxImage object has sane constructor parameters', 5, function ( assert ) {
		var viewer,
			fname = 'valid',
			imgSrc = '/' + fname + '.jpg/300px-' + fname + '.jpg',
			imgRegex = new RegExp( imgSrc + '$' );

		createGallery( imgSrc );

		mw.MultimediaViewer.prototype.createNewImage = function ( fileLink, filePageLink, fileTitle, index, thumb ) {
			assert.ok( fileLink.match( imgRegex ), 'Thumbnail URL used in creating new image object' );
			assert.strictEqual( filePageLink, '', 'File page link is sane when creating new image object' );
			assert.strictEqual( fileTitle.title, fname, 'Filename is correct when passed into new image constructor' );
			assert.strictEqual( index, 0, 'The only image we created in the gallery is set at index 0 in the images array' );
			assert.strictEqual( thumb.outerHTML, '<img src="' + imgSrc + '">', 'The image element passed in is the thumbnail we want.' );
		};

		viewer = new mw.MultimediaViewer();
	} );

	QUnit.test( 'We get sane image sizes when we ask for them', 5, function ( assert ) {
		var viewer = new mw.MultimediaViewer();

		assert.strictEqual( viewer.findNextHighestImageSize( 200 ), 320, 'Low target size gives us lowest possible size bucket' );
		assert.strictEqual( viewer.findNextHighestImageSize( 320 ), 320, 'Asking for a bucket size gives us exactly that bucket size' );
		assert.strictEqual( viewer.findNextHighestImageSize( 320.00001 ), 640, 'Asking for greater than an image bucket definitely gives us the next size up' );
		assert.strictEqual( viewer.findNextHighestImageSize( 2000 ), 2560, 'The image bucketing also works on big screens' );
		assert.strictEqual( viewer.findNextHighestImageSize( 3000 ), 2880, 'The image bucketing also works on REALLY big screens' );
	} );

}( mediaWiki, jQuery ) );
