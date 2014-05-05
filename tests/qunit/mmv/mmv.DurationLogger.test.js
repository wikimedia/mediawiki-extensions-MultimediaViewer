( function ( mw, $ ) {
	QUnit.module( 'mmv.DurationLogger', QUnit.newMwEnvironment({
		setup: function () {
			this.clock = this.sandbox.useFakeTimers();
		}
	} ) );

	QUnit.test( 'start()', 8, function ( assert ) {
		var durationLogger = new mw.mmv.durationLogger.constructor();

		try {
			durationLogger.start();
		} catch ( e ) {
			assert.ok( true, 'Exception raised when calling start() without parameters' );
		}
		assert.ok( $.isEmptyObject( durationLogger.starts ), 'No events saved by DurationLogger' );

		durationLogger.start( 'foo' );
		assert.strictEqual( durationLogger.starts.foo, 0, 'Event start saved' );

		this.clock.tick( 1000 );
		durationLogger.start( 'bar' );
		assert.strictEqual( durationLogger.starts.bar, 1000, 'Later event start saved' );

		durationLogger.start( 'foo' );
		assert.strictEqual( durationLogger.starts.foo, 0, 'Event start not overritten' );

		this.clock.tick( 666 );
		durationLogger.start( [ 'baz', 'bob', 'bar' ] );
		assert.strictEqual( durationLogger.starts.baz, 1666, 'First simultaneous event start saved' );
		assert.strictEqual( durationLogger.starts.bob, 1666, 'Second simultaneous event start saved' );
		assert.strictEqual( durationLogger.starts.bar, 1000, 'Third simultaneous event start not overwritten' );
	} );

	QUnit.test( 'stop()', 12, function ( assert ) {
		var dependenciesDeferred = $.Deferred(),
			fakeEventLog = { logEvent : $.noop },
			durationLogger = new mw.mmv.durationLogger.constructor();

		this.sandbox.stub( mw.user, 'isAnon' ).returns( false );
		this.sandbox.stub( fakeEventLog, 'logEvent' );
		this.sandbox.stub( durationLogger, 'loadDependencies' ).returns ( dependenciesDeferred.promise() );

		try {
			durationLogger.stop();
		} catch ( e ) {
			assert.ok( true, 'Exception raised when calling stop() without parameters' );
		}

		durationLogger.setEventLog( fakeEventLog );

		durationLogger.start( 'bar' );
		this.clock.tick( 1000 );
		durationLogger.stop( 'bar' );

		assert.ok( !fakeEventLog.logEvent.called, 'Event queued if dependencies not loaded' );

		// Queue a second item

		durationLogger.start( 'bob' );
		this.clock.tick( 4000 );
		durationLogger.stop( 'bob' );

		assert.ok( !fakeEventLog.logEvent.called, 'Event queued if dependencies not loaded' );

		dependenciesDeferred.resolve();

		assert.ok( fakeEventLog.logEvent.calledWithMatch( 'MultimediaViewerDuration', { type : 'bar', duration : 1000, loggedIn : true } ),
			'Data passed to EventLogging is correct' );
		assert.ok( fakeEventLog.logEvent.calledWithMatch( 'MultimediaViewerDuration', { type : 'bob', duration : 4000, loggedIn : true } ),
			'Data passed to EventLogging is correct' );
		assert.strictEqual( fakeEventLog.logEvent.callCount, 2, 'logEvent called when processing the queue' );

		durationLogger.start( 'foo' );
		this.clock.tick( 3000 );
		durationLogger.stop( 'foo' );

		assert.ok( fakeEventLog.logEvent.calledWithMatch( 'MultimediaViewerDuration', { type : 'foo', duration : 3000, loggedIn : true } ),
			'Data passed to EventLogging is correct' );

		assert.strictEqual( durationLogger.starts.bar, undefined, 'Start value deleted after stop' );

		durationLogger.setGeo( { country : 'FR' } );
		mw.user.isAnon.returns( true );

		durationLogger.start( 'baz' );
		this.clock.tick( 2000 );
		durationLogger.stop( 'baz' );

		assert.ok( fakeEventLog.logEvent.calledWithMatch( 'MultimediaViewerDuration', { type : 'baz', duration : 2000, loggedIn : false, country : 'FR' } ),
			'Data passed to EventLogging is correct' );

		assert.strictEqual( durationLogger.starts.bar, undefined, 'Start value deleted after stop' );

		assert.strictEqual( fakeEventLog.logEvent.callCount, 4, 'logEvent has been called four times at this point in the test' );

		durationLogger.stop( 'foo' );

		assert.strictEqual( fakeEventLog.logEvent.callCount, 4, 'Stop without a start doesn\'t get logged' );
	} );

	QUnit.test( 'loadDependencies()', 3, function ( assert ) {
		var promise,
			durationLogger = new mw.mmv.durationLogger.constructor();

		this.sandbox.stub( mw.loader, 'using' );

		mw.loader.using.withArgs( 'ext.centralNotice' ).throws( 'CentralNotice is missing' );
		mw.loader.using.withArgs( 'ext.eventLogging' ).throws( 'EventLogging is missing' );

		promise = durationLogger.loadDependencies();

		assert.strictEqual( promise.state(), 'rejected', 'Promise is rejected' );

		// It's necessary to reset the stub, otherwise the original withArgs keeps running alongside the new one
		mw.loader.using.restore();
		this.sandbox.stub( mw.loader, 'using' );

		mw.loader.using.withArgs( 'ext.centralNotice' ).callsArg( 1 );
		mw.loader.using.withArgs( 'ext.eventLogging' ).throws( 'EventLogging is missing' );

		promise = durationLogger.loadDependencies();

		assert.strictEqual( promise.state(), 'rejected', 'Promise is rejected' );

		// It's necessary to reset the stub, otherwise the original withArgs keeps running alongside the new one
		mw.loader.using.restore();
		this.sandbox.stub( mw.loader, 'using' );

		mw.loader.using.withArgs( 'ext.centralNotice' ).throws( 'CentralNotice is missing' );
		mw.loader.using.withArgs( 'ext.eventLogging' ).callsArg( 1 );

		promise = durationLogger.loadDependencies();

		assert.strictEqual( promise.state(), 'resolved', 'Promise is resolved' );
	} );
}( mediaWiki, jQuery ) );
