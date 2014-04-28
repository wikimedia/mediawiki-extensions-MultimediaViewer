( function ( mw, $ ) {
	QUnit.module( 'mmv.DurationLogger', QUnit.newMwEnvironment({
		setup: function () {
			this.clock = this.sandbox.useFakeTimers();
		}
	} ) );

	QUnit.test( 'start()', 7, function ( assert ) {
		var durationLogger = new mw.mmv.DurationLogger.constructor();

		durationLogger.start();
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

	QUnit.test( 'stop()', 6, function ( assert ) {
		var logEvent,
			durationLogger = new mw.mmv.DurationLogger.constructor(),
			fakeEventLogging = false,
			fakeGeo = false;

		if ( window.Geo === undefined ) {
			window.Geo = { country : 'FR' };
			fakeGeo = true;
		}

		if ( mw.eventLog === undefined ) {
			mw.eventLog = { logEvent : $.noop };
			fakeEventLogging = true;
		}

		this.sandbox.stub( mw.user, 'isAnon', function() { return false; } );
		this.sandbox.stub( window.Geo, 'country', 'FR' );

		logEvent = this.sandbox.stub( mw.eventLog, 'logEvent', function( schema, e ) {
				assert.strictEqual( e.type, 'bar', 'Type passed to EventLogging is correct' );
				assert.strictEqual( e.duration, 1000, 'Duration passed to EventLogging is correct' );
				assert.strictEqual( e.loggedIn, true, 'Loggedin information passed to EventLogging is correct' );
				assert.strictEqual( e.country, 'FR', 'Country passed to EventLogging is correct' );
			} );

		durationLogger.stop( 'foo' );
		assert.ok( !logEvent.called, 'Stop without a start doesn\'t get logged' );

		durationLogger.start( 'bar' );
		this.clock.tick( 1000 );
		durationLogger.stop( 'bar' );

		assert.strictEqual( durationLogger.starts.bar, undefined, 'Start value deleted after stop' );

		if ( fakeGeo ) {
			delete window.Geo;
		}

		if ( fakeEventLogging ) {
			delete mw.eventLog;
		}
	} );
}( mediaWiki, jQuery ) );
