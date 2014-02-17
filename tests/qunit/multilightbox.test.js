( function () {
	QUnit.module( 'multilightbox', QUnit.newMwEnvironment() );

	QUnit.test( 'Smoke test', 3, function ( assert ) {
		function DummyClass() {}
		var multiLightbox = new window.MultiLightbox(),
			multilightbox2 = new window.MultiLightbox( 0, DummyClass );

		assert.strictEqual( multiLightbox.currentIndex, 0, 'currentIndex initialized correctly.' );
		assert.ok( multiLightbox.iface instanceof window.LightboxInterface, 'Using default LightboxInterface class' );
		assert.ok( multilightbox2.iface instanceof DummyClass, 'Using injected DummyClass' );
	} );

}( mediaWiki, jQuery ) );
