( function ( mw ) {
	QUnit.module( 'mmv.logger', QUnit.newMwEnvironment() );

	QUnit.test( 'log()', 14, function ( assert ) {
		var oldMwLog = mw.log,
			oldEventLog = mw.eventLog,
			oldLogActions = mw.mmv.logger.logActions,
			loggedMessage,
			action1key = 'test-1',
			action1value = 'Test',
			action2key = 'test-2',
			action2value = 'Foo $1 $2 bar',
			unknownAction = 'test-3',
			logEventCalled;

		mw.log = function( message ) {
			loggedMessage = message;
		};

		mw.eventLog = {
			logEvent : function ( name, event ) {
			logEventCalled = true;
			assert.strictEqual( event.version, '1.1', 'Correct version' );
			assert.strictEqual( name, 'MediaViewer', 'Event name is correct' );
		} };

		mw.mmv.logger.logActions = {};
		mw.mmv.logger.logActions[ action1key ] = action1value;
		mw.mmv.logger.logActions[ action2key ] = action2value;

		logEventCalled = false;
		mw.mmv.logger.log( unknownAction );

		assert.strictEqual( loggedMessage, unknownAction, 'Log message defaults to unknown key' );
		assert.ok( logEventCalled, 'event log has been recorded' );

		loggedMessage = undefined;
		logEventCalled = false;
		mw.mmv.logger.log( action1key );

		assert.strictEqual( loggedMessage, action1value, 'Log message is translated to its text' );
		assert.ok( logEventCalled, 'event log has been recorded' );

		loggedMessage = undefined;
		logEventCalled = false;
		mw.mmv.logger.log( action1key, true );

		assert.strictEqual( loggedMessage, action1value, 'Log message is translated to its text' );
		assert.ok( !logEventCalled, 'event log has been skipped' );

		loggedMessage = undefined;
		logEventCalled = false;
		mw.mmv.logger.log( action2key, false, { '$1' : 'X', '$2' : 'Y' } );
		assert.strictEqual( loggedMessage, 'Foo X Y bar',
			'Log message is translated to its text with substitutions' );
		assert.ok( logEventCalled, 'event log has been recorded' );

		mw.log = oldMwLog;
		mw.mmv.logger.logActions = oldLogActions;
		mw.eventLog = oldEventLog;
	} );
}( mediaWiki ) );
