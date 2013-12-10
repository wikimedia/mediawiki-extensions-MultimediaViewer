( function () {
	QUnit.module( 'ext.multimediaViewer.multiLightbox', QUnit.newMwEnvironment() );

	QUnit.test( 'Smoke test', 1, function ( assert ) {
		var lightboxImage = new window.LightboxImage( 'http://en.wikipedia.org/w/skins/vector/images/search-ltr.png' ),
			multiLightbox = new window.MultiLightbox( [lightboxImage] );

		assert.strictEqual( multiLightbox.currentIndex, 0, 'currentIndex initialized correctly.' );
	} );

}( mediaWiki, jQuery ) );
