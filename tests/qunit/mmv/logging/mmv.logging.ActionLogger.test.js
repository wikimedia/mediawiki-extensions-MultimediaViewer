( function ( mw, $ ) {
	QUnit.module( 'mmv.logging.ActionLogger', QUnit.newMwEnvironment() );

	QUnit.test( 'log()', 8, function ( assert ) {
		var fakeEventLog = { logEvent : this.sandbox.stub() },
			logger = new mw.mmv.logging.ActionLogger(),
			action1key = 'test-1',
			action1value = 'Test',
			action2key = 'test-2',
			action2value = 'Foo $1 $2 bar',
			unknownAction = 'test-3';

		this.sandbox.stub( logger, 'loadDependencies' ).returns( $.Deferred().resolve() );
		this.sandbox.stub( mw, 'log' );

		logger.samplingFactorMap = { 'default' : 1 };
		logger.setEventLog( fakeEventLog );
		logger.logActions = {};
		logger.logActions[ action1key ] = action1value;
		logger.logActions[ action2key ] = action2value;

		logger.log( unknownAction );

		assert.strictEqual( mw.log.getCall( 0 ).args[ 0 ], unknownAction , 'Log message defaults to unknown key' );
		assert.strictEqual( fakeEventLog.logEvent.callCount, 1, 'event log has been recorded' );

		logger.log( action1key );

		assert.strictEqual( mw.log.getCall( 1 ).args[ 0 ], action1value, 'Log message is translated to its text' );
		assert.strictEqual( fakeEventLog.logEvent.callCount, 2, 'event log has been recorded' );

		logger.log( action1key, true );

		assert.strictEqual( mw.log.getCall( 2 ).args[ 0 ], action1value, 'Log message is translated to its text' );
		assert.strictEqual( fakeEventLog.logEvent.callCount, 2, 'event log has been skipped' );

		logger.log( action2key, false, { '$1' : 'X', '$2' : 'Y' } );

		assert.strictEqual( mw.log.getCall( 3 ).args[ 0 ], 'Foo X Y bar',
			'Log message is translated to its text with substitutions' );
		assert.strictEqual( fakeEventLog.logEvent.callCount, 3, 'event log has been recorded' );
	} );
}( mediaWiki, jQuery ) );
