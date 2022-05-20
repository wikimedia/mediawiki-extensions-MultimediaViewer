QUnit.module( 'mmv.logging.AttributionLogger', QUnit.newMwEnvironment() );

QUnit.test( 'log()', function ( assert ) {
	var fakeEventLog = { logEvent: this.sandbox.stub() };
	var logger = new mw.mmv.logging.AttributionLogger();
	var image = { author: 'foo', source: 'bar', license: {} };
	var emptyImage = {};

	this.sandbox.stub( logger, 'loadDependencies' ).returns( $.Deferred().resolve() );
	this.sandbox.stub( mw, 'log' );

	logger.samplingFactor = 1;
	logger.setEventLog( fakeEventLog );

	logger.logAttribution( image );
	assert.true( true, 'logDimensions() did not throw errors' );

	logger.logAttribution( emptyImage );
	assert.true( true, 'logDimensions() did not throw errors for empty image' );
} );
