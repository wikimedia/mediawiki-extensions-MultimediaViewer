const { LightboxImage } = require( 'mmv.bootstrap' );

QUnit.module( 'mmv.lightboximage', QUnit.newMwEnvironment() );

QUnit.test( 'Sense test', ( assert ) => {
	const lightboxImage = new LightboxImage( 'foo.png' );

	assert.true( lightboxImage instanceof LightboxImage, 'Object created' );
} );

QUnit.test( 'getUrlParam', ( assert ) => {
	const getUrlParam = ( src ) => new LightboxImage( src ).getUrlParam();

	assert.deepEqual(
		getUrlParam( 'https://upload.wikimedia.org/thumb/1/1e/Foo.svg/langde-800px-Foo.svg.png' ),
		{ name: 'lang', value: 'de', urlParam: 'langde' },
		'multilingual SVG language is parsed'
	);
	assert.deepEqual(
		getUrlParam( 'https://upload.wikimedia.org/thumb/1/1e/Foo.svg/langzh-hans-330px-Foo.svg.png' ),
		{ name: 'lang', value: 'zh-hans', urlParam: 'langzh-hans' },
		'language subtags are parsed'
	);
	assert.deepEqual(
		getUrlParam( 'https://upload.wikimedia.org/thumb/a/ab/Foo.pdf/page2-800px-Foo.pdf.jpg' ),
		{ name: 'page', value: '2', urlParam: 'page2' },
		'PDF page is parsed'
	);
	assert.strictEqual(
		getUrlParam( 'https://upload.wikimedia.org/thumb/1/12/Foo.jpg/800px-Foo.jpg' ),
		null,
		'plain thumbnail has no handler parameter'
	);
} );
