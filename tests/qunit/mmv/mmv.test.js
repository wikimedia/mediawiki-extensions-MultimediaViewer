const { MultimediaViewer } = require( 'mmv' );
const { getMultimediaViewer } = require( './mmv.testhelpers.js' );
const { MultimediaViewerBootstrap, LightboxImage } = require( 'mmv.bootstrap' );
const router = require( 'mediawiki.router' );
const config = require( 'mmv/mmv/config.json' );

QUnit.module( 'mmv', QUnit.newMwEnvironment( {
	beforeEach: function () {
		// prevent a real "back" navigation from taking place
		this.sandbox.stub( router, 'back' );

		// T277470: Apply consistent $wgMediaViewerUseThumbnailGuessing=false default
		sinon.replace( config, 'useThumbnailGuessing', false );
	},
	afterEach: function () {
		router.resetForTest();
	}
} ) );

QUnit.test( 'New image loaded while another one is loading', async function ( assert ) {
	const viewer = getMultimediaViewer();
	const firstImageDeferred = $.Deferred();
	const secondImageDeferred = $.Deferred();
	const firstLightboxInfoDeferred = $.Deferred();
	const secondLightboxInfoDeferred = $.Deferred();
	const firstImage = {
		filePageTitle: new mw.Title( 'File:Foo.jpg' ),
		thumbnail: new Image( 100, 100 ),
		index: 0
	};
	const secondImage = {
		filePageTitle: new mw.Title( 'File:Bar.jpg' ),
		thumbnail: new Image( 100, 100 ),
		index: 1
	};
	const clock = this.sandbox.useFakeTimers();

	viewer.fetchSizeIndependentLightboxInfo = this.sandbox.stub();
	viewer.fetchThumbnail = this.sandbox.stub();
	viewer.ui = {
		setFileReuseData: function () {},
		setupForLoad: function () {},
		canvas: {
			set: function () {},
			showError: function () {},
			getCurrentImageWidths: function () {
				return { real: 0 };
			},
			getDimensions: function () {
				return {};
			}
		},
		panel: {
			setImageInfo: this.sandbox.stub(),
			showError: function () {},
			scroller: {
				animateMetadataOnce: function () {}
			},
			empty: function () {}
		},
		open: function () {},
		empty: function () {} };
	viewer.displayRealThumbnail = this.sandbox.stub();
	viewer.preloadImagesMetadata = function () {};
	viewer.imageInfoProvider.get = () => $.Deferred().reject( {} );

	viewer.fetchThumbnail.returns( firstImageDeferred.promise() );
	viewer.fetchSizeIndependentLightboxInfo.returns( firstLightboxInfoDeferred.promise() );
	viewer.loadImage( firstImage );
	clock.tick( 10 );
	assert.strictEqual( viewer.ui.panel.setImageInfo.called, false, 'Metadata of the first image should not be shown' );

	viewer.fetchThumbnail.returns( secondImageDeferred.promise() );
	viewer.fetchSizeIndependentLightboxInfo.returns( secondLightboxInfoDeferred.promise() );
	viewer.loadImage( secondImage );
	clock.tick( 10 );

	firstImageDeferred.resolve( { url: 'first-url' } );
	firstLightboxInfoDeferred.resolve( {} );
	clock.tick( 10 );
	await null;
	assert.strictEqual( viewer.displayRealThumbnail.called, false, 'The first image being done loading should have no effect' );

	viewer.displayRealThumbnail = this.sandbox.spy( () => viewer.close() );
	secondImageDeferred.resolve( { url: 'second-url' } );
	secondLightboxInfoDeferred.resolve( {} );
	clock.tick( 10 );
	await null;
	assert.strictEqual( viewer.displayRealThumbnail.called, true, 'The second image being done loading should result in the image being shown' );

	clock.restore();
} );

QUnit.test( 'Events are not trapped after the viewer is closed', function ( assert ) {
	const viewer = getMultimediaViewer();
	const $document = $( document );
	const $qf = $( '#qunit-fixture' );
	const eventTypes = [ 'keydown', 'keyup', 'keypress', 'click', 'mousedown', 'mouseup' ];
	const modifiers = [ undefined, 'altKey', 'ctrlKey', 'shiftKey', 'metaKey' ];
	// Events are async, we need to wait for the last event to be caught before ending the test
	const done = assert.async();
	const oldScrollTo = $.scrollTo;

	assert.expect( 0 );

	// animation would keep running, conflict with other tests
	this.sandbox.stub( $.fn, 'animate' ).returnsThis();

	$.scrollTo = function () {
		return { scrollTop: () => {}, on: () => {}, off: () => {} };
	};

	viewer.setupEventHandlers();

	viewer.imageInfoProvider.get = () => $.Deferred().reject();
	viewer.thumbnailInfoProvider.get = () => $.Deferred().reject();

	viewer.initWithThumbs( [] );

	viewer.loadImage(
		{
			filePageTitle: new mw.Title( 'File:Stuff.jpg' ),
			thumbnail: new Image( 10, 10 )
		},
		new Image()
	);

	viewer.ui.$closeButton.trigger( 'click' );

	function eventHandler( e ) {
		if ( e.isDefaultPrevented() ) {
			assert.true( false, 'Event was incorrectly trapped: ' + e.which );
		}

		e.preventDefault();

		// Wait for the last event
		if ( e.which === 32 && e.type === 'mouseup' ) {
			$document.off( '.mmvtest' );
			viewer.cleanupEventHandlers();
			$.scrollTo = oldScrollTo;
			done();
		}
	}

	for ( let j = 0; j < eventTypes.length; j++ ) {
		$document.on( eventTypes[ j ] + '.mmvtest', eventHandler );

		eventloop:
		for ( let i = 0; i < 256; i++ ) {
			// Save some time by not testing unlikely values for mouse events
			if ( i > 32 ) {
				switch ( eventTypes[ j ] ) {
					case 'click':
					case 'mousedown':
					case 'mouseup':
						break eventloop;
				}
			}

			for ( let k = 0; k < modifiers.length; k++ ) {
				const eventParameters = { which: i };
				if ( modifiers[ k ] !== undefined ) {
					eventParameters[ modifiers[ k ] ] = true;
				}
				$qf.trigger( $.Event( eventTypes[ j ], eventParameters ) );
			}
		}
	}
} );

QUnit.test( 'Viewer is closed when navigating to #foo/bar/baz (page section including slash)', async ( assert ) => {
	const waitForHashChange = () => new Promise( ( resolve ) => {
		window.addEventListener( 'hashchange', () => {
			setTimeout( resolve, 0 );
		}, { once: true } );
	} );

	const bootstrap = new MultimediaViewerBootstrap();
	bootstrap.setupEventHandlers();

	let hashChanged = waitForHashChange();
	location.hash = '#/media/File:Foo.jpg';
	await hashChanged;
	const viewer = await bootstrap.viewerPromise;
	viewer.isOpen = true;

	hashChanged = waitForHashChange();
	location.hash = '#foo/bar/baz';
	await hashChanged;

	assert.false( viewer.isOpen, 'The viewer was closed' );
	location.hash = '#';
	bootstrap.cleanupEventHandlers();
} );

QUnit.test.each( 'Refuse to load too-big thumbnail', {
	'thumb for non-vector image should be capped to original size': {
		thumb: $( '<img>' ).attr( {
			src: 'https://example.test/images/0/0a/Foobar.png',
			width: 200,
			height: 150,
			'data-file-width': '800',
			'data-file-height': '600'
		} )[ 0 ],
		expected: 800
	},
	'thumb for vector image can be larger': {
		thumb: $( '<img>' ).attr( {
			src: 'https://example.test/images/thumb/1/1b/Foobar.svg/200px-Foobar.svg',
			width: 200,
			height: 150,
			'data-file-width': '800',
			'data-file-height': '600'
		} )[ 0 ],
		expected: 1000
	}

}, ( assert, { thumb, expected } ) => {
	const viewer = getMultimediaViewer();

	let actualWidth;
	viewer.thumbnailInfoProvider.get = function ( fileTitle, sampleUrl, width ) {
		actualWidth = width;
		return $.Deferred().reject();
	};

	const image = new LightboxImage(
		thumb.src,
		mw.Title.newFromImg( thumb ),
		0,
		1,
		thumb,
		'My caption'
	);
	viewer.fetchThumbnail( image, 1000 );
	assert.strictEqual( actualWidth, expected, 'actual width' );
} );

QUnit.test.each( 'fetchThumbnail()', {
	'cannot guess falls back to API': {
		sampleURL: 'https://example.test/thumb/8/8b/Copyleft.svg/300_guess_fail_no_px.png',
		callCount: {
			guessedThumbnailInfo: 1,
			imageinfoApi: 1
		},
		expectedUrl: 'apiURL'
	},
	'guessed URL is used': {
		sampleURL: 'https://example.test/thumb/8/8b/Copyleft.svg/300px-Copyleft.svg.png',
		callCount: {
			guessedThumbnailInfo: 1,
			imageinfoApi: 0
		},
		expectedUrl: 'https://example.test/thumb/8/8b/Copyleft.svg/600px-Copyleft.svg.png'
	},
	'with useThumbnailGuessing=false the API is used directly': {
		useThumbnailGuessing: false,
		sampleURL: 'https://example.test/thumb/8/8b/Copyleft.svg/300px-Copyleft.svg.png',
		callCount: {
			guessedThumbnailInfo: 0,
			imageinfoApi: 1
		},
		expectedUrl: 'apiURL'
	}
}, ( assert, fixture ) => {
	config.useThumbnailGuessing = fixture.useThumbnailGuessing ?? true;
	const clock = sinon.useFakeTimers();
	const viewer = new MultimediaViewer( {
		language: function () {}
	} );
	const guessedThumbnailInfoStub = sinon.spy( viewer.guessedThumbnailInfoProvider, 'get' );
	const thumbnailInfoStub = viewer.thumbnailInfoProvider.get = sinon.stub()
		.returns( $.Deferred().resolve( { url: 'apiURL' } ) );

	const thumb = $( '<img>' ).attr( {
		src: fixture.sampleURL,
		width: 300,
		height: 300,
		'data-file-width': '1000',
		'data-file-height': '1000'
	} )[ 0 ];
	const image = new LightboxImage(
		thumb.getAttribute( 'src' ),
		new mw.Title( 'File:Copyleft.svg' ),
		0,
		1,
		thumb,
		'My caption'
	);
	let resolvedThumbnail;
	viewer.fetchThumbnail( image, 600 ).then( ( thumbnail ) => {
		resolvedThumbnail = thumbnail;
	} );

	clock.tick( 10 );
	assert.propEqual( {
		guessedThumbnailInfo: guessedThumbnailInfoStub.callCount,
		imageinfoApi: thumbnailInfoStub.callCount
	}, fixture.callCount, 'call counts' );
	assert.strictEqual( resolvedThumbnail.url, fixture.expectedUrl, 'thumbnail URL' );
	clock.restore();
} );

QUnit.test( 'document.title', function ( assert ) {
	const viewer = getMultimediaViewer();
	const bootstrap = new MultimediaViewerBootstrap();
	const title = new mw.Title( 'File:This_should_show_up_in_document_title.png' );
	const oldDocumentTitle = document.title;

	this.sandbox.stub( mw.loader, 'using' ).returns( $.Deferred().resolve( viewer ) );
	viewer.currentImage = { filePageTitle: title };
	bootstrap.setupEventHandlers();
	viewer.setTitle();

	assert.notStrictEqual( document.title.match( title.getNameText() ), null, 'File name is visible in title' );

	viewer.close();
	bootstrap.cleanupEventHandlers();

	assert.strictEqual( document.title, oldDocumentTitle, 'Original title restored after viewer is closed' );
} );
