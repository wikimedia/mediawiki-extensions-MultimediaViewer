QUnit.module( 'mmv.lightboximage', QUnit.newMwEnvironment() );

QUnit.test( 'Sense test', function ( assert ) {
	var lightboxImage = new mw.mmv.LightboxImage( 'foo.png' );

	assert.ok( lightboxImage, 'Object created' );
} );
