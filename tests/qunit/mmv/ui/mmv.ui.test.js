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
}( mediaWiki, jQuery ) );
