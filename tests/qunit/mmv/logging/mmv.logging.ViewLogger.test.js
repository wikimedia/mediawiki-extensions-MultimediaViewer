( function ( mw, $ ) {
	QUnit.module( 'mmv.logging.ViewLogger', QUnit.newMwEnvironment( {
		setup: function () {
			this.clock = this.sandbox.useFakeTimers();
		}
	} ) );

	QUnit.test( 'unview()', 4, function ( assert ) {
		var logger = { log: $.noop },
			viewLogger = new mw.mmv.logging.ViewLogger( {}, {}, logger );

		this.sandbox.stub( logger, 'log' );

		viewLogger.unview();

		assert.ok( !logger.log.called, 'action logger not called' );

		viewLogger.setLastViewLogged( false );
		viewLogger.unview();

		assert.ok( !logger.log.called, 'action logger not called' );

		viewLogger.setLastViewLogged( true );
		viewLogger.unview();

		assert.ok( logger.log.calledOnce, 'action logger called' );

		viewLogger.unview();

		assert.ok( logger.log.calledOnce, 'action logger not called again' );
	} );

	QUnit.test( 'focus and blur', 1, function ( assert ) {
		var fakeWindow = $( '<div>' ),
			viewLogger = new mw.mmv.logging.ViewLogger( {}, fakeWindow, { log: $.noop } );

		this.clock.tick( 1 ); // This is just so that $.now() > 0 in the fake timer environment

		viewLogger.attach();

		this.clock.tick( 5 );

		fakeWindow.triggerHandler( 'blur' );

		this.clock.tick( 2 );

		fakeWindow.triggerHandler( 'focus' );

		this.clock.tick( 3 );

		fakeWindow.triggerHandler( 'blur' );

		this.clock.tick( 4 );

		assert.strictEqual( viewLogger.viewDuration, 8, 'Only focus duration was logged' );
	} );

	QUnit.test( 'stopViewDuration before startViewDuration', 1, function ( assert ) {
		var viewLogger = new mw.mmv.logging.ViewLogger( {}, {}, { log: $.noop } );

		this.clock.tick( 1 ); // This is just so that $.now() > 0 in the fake timer environment

		viewLogger.stopViewDuration();

		this.clock.tick( 2 );

		viewLogger.startViewDuration();

		this.clock.tick( 3 );

		viewLogger.stopViewDuration();

		assert.strictEqual( viewLogger.viewDuration, 3, 'Only last timeframe was logged' );
	} );
}( mediaWiki, jQuery ) );
