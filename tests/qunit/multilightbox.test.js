( function () {
	QUnit.module( 'ext.multimediaViewer.multilightbox.multiLightbox', QUnit.newMwEnvironment() );

	QUnit.test( 'Smoke test', 3, function ( assert ) {
		function DummyClass() {}
		var lightboxImage = new window.LightboxImage( 'http://en.wikipedia.org/w/skins/vector/images/search-ltr.png' ),
			multiLightbox = new window.MultiLightbox( [lightboxImage] ),
			multilightbox2 = new window.MultiLightbox( [lightboxImage], 0, DummyClass );

		assert.strictEqual( multiLightbox.currentIndex, 0, 'currentIndex initialized correctly.' );
		assert.ok( multiLightbox.iface instanceof window.LightboxInterface, 'Using default LightboxInterface class' );
		assert.ok( multilightbox2.iface instanceof DummyClass, 'Using injected DummyClass' );
	} );

}( mediaWiki, jQuery ) );
