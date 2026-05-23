const { getMultimediaViewer } = require( './mmv.testhelpers.js' );
const { MultimediaViewerBootstrap } = require( 'mmv.bootstrap' );
const router = require( 'mediawiki.router' );

QUnit.module( 'mmv', QUnit.newMwEnvironment( {
	beforeEach: function () {
		// prevent a real "back" navigation from taking place
		this.sandbox.stub( router, 'back' );
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

	viewer.fetchImageInfo = this.sandbox.stub();
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

	viewer.fetchImageInfo.returns( firstLightboxInfoDeferred.promise() );
	viewer.loadImage( firstImage );
	clock.tick( 10 );
	assert.strictEqual( viewer.ui.panel.setImageInfo.called, false, 'Metadata of the first image should not be shown' );

	viewer.fetchImageInfo.returns( secondLightboxInfoDeferred.promise() );
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
