( function ( mw, $ ) {
	QUnit.module( 'mmv.ui', QUnit.newMwEnvironment() );

	QUnit.test( 'handleEvent()', 1, function ( assert ) {
		var element = new mw.mmv.ui.Element( $( '<div>' ) );

		element.handleEvent( 'mmv-foo', function () {
			assert.ok( true, 'Event is handled' );
		} );

		$( document ).trigger( new $.Event( 'mmv-foo' ) );

		element.clearEvents();

		$( document ).trigger( new $.Event( 'mmv-foo' ) );
	} );

	QUnit.test( 'setInlineStyle()', 3, function ( assert ) {
		var element = new mw.mmv.ui.Element( $( '<div>' ) ),
			$testDiv = $( '<div id="mmv-testdiv">!!!</div>' ).appendTo( '#qunit-fixture' );

		assert.ok( $testDiv.is( ':visible' ), 'Test div is visible' );

		element.setInlineStyle( 'test', '#mmv-testdiv { display: none; }' );

		assert.ok( !$testDiv.is( ':visible' ), 'Test div is hidden by inline style' );

		element.setInlineStyle( 'test', null );

		assert.ok( $testDiv.is( ':visible' ), 'Test div is visible again' );
	} );
}( mediaWiki, jQuery ) );
