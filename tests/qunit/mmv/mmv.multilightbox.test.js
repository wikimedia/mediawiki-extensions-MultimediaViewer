( function ( mw ) {
	QUnit.module( 'mmv.multilightbox', QUnit.newMwEnvironment() );

	QUnit.test( 'Smoke test', 2, function ( assert ) {
		function DummyClass() {}
		var multiLightbox = new mw.mmv.MultiLightbox( 0, DummyClass );

		assert.strictEqual( multiLightbox.currentIndex, 0, 'currentIndex initialized correctly.' );
		assert.ok( multiLightbox.iface instanceof DummyClass, 'interface initialized correctly.' );
	} );

}( mediaWiki, jQuery ) );
