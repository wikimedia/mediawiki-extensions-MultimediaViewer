const { License, ImageModel } = require( 'mmv' );
const { EmbedFileFormatter } = require( 'mmv.ui.reuse' );

QUnit.module( 'mmv.EmbedFileFormatter', QUnit.newMwEnvironment() );

function createEmbedFileInfo( options ) {
	const license = options.licenseShortName ?
		new License(
			options.licenseShortName,
			options.licenseInternalName,
			options.licenseLongName,
			options.licenseUrl
		) : undefined;
	const imageInfo = new ImageModel(
		options.title,
		options.title.getNameText(),
		undefined,
		undefined,
		undefined,
		undefined,
		options.imgUrl,
		options.filePageUrl,
		options.shortFilePageUrl,
		42,
		'repo',
		undefined,
		undefined,
		undefined,
		undefined,
		options.source,
		options.author,
		options.authorCount,
		license
	);
	return {
		imageInfo: imageInfo,
		caption: options.caption
	};
}

QUnit.test( 'EmbedFileFormatter constructor sense check', ( assert ) => {
	const formatter = new EmbedFileFormatter();
	assert.true( formatter instanceof EmbedFileFormatter, 'constructor with no argument works' );
} );

QUnit.test( 'getByline():', ( assert ) => {
	const formatter = new EmbedFileFormatter();
	const author = '<span class="mw-mmv-author">Homer</span>';
	const source = '<span class="mw-mmv-source">Iliad</span>';
	const attribution = '<span class="mw-mmv-attr">Cat</span>';

	// Works with no arguments
	let byline = formatter.getByline();
	assert.strictEqual( byline, undefined, 'No argument case handled correctly.' );

	// Attribution present
	byline = formatter.getByline( author, source, attribution );
	assert.strictEqual( byline, '<span class="mw-mmv-attr">Cat</span>', 'Attribution found in bylines' );

	// Author and source present
	byline = formatter.getByline( author, source );
	assert.strictEqual( byline, '(multimediaviewer-credit: <span class="mw-mmv-author">Homer</span>, <span class="mw-mmv-source">Iliad</span>)', 'Author and source found in bylines' );

	// Only author present
	byline = formatter.getByline( author );
	assert.strictEqual( byline, '<span class="mw-mmv-author">Homer</span>', 'Author found in bylines.' );

	// Only source present
	byline = formatter.getByline( undefined, source );
	assert.strictEqual( byline, '<span class="mw-mmv-source">Iliad</span>', 'Source found in bylines.' );
} );

QUnit.test( 'getThumbnailHtml():', ( assert ) => {
	const formatter = new EmbedFileFormatter();
	const titleText = 'Music Room';
	const title = mw.Title.newFromText( titleText );
	const imgUrl = 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg';
	const filePageUrl = 'https://commons.wikimedia.org/wiki/File:Foobar.jpg';
	const filePageShortUrl = 'https://commons.wikimedia.org/wiki/index.php?curid=42';
	const siteName = 'Site Name';
	const siteUrl = '//site.url/';
	const licenseShortName = 'Public License';
	const licenseInternalName = '-';
	const licenseLongName = 'Public Domain, copyrights have lapsed';
	const licenseUrl = '//example.com/pd';
	const author = '<span class="mw-mmv-author">Homer</span>';
	const source = '<span class="mw-mmv-source">Iliad</span>';
	const thumbUrl = 'https://upload.wikimedia.org/wikipedia/thumb/Foobar.jpg';
	const width = 700;
	const height = 500;

	// Bylines, license and site
	let info = createEmbedFileInfo( { title: title, imgUrl: imgUrl, filePageUrl: filePageUrl,
		shortFilePageUrl: filePageShortUrl, siteName: siteName, siteUrl: siteUrl,
		licenseShortName: licenseShortName, licenseInternalName: licenseInternalName,
		licenseLongName: licenseLongName, licenseUrl: licenseUrl, author: author, source: source } );

	let generatedHtml = formatter.getThumbnailHtml( info, thumbUrl, width, height );
	assert.notStrictEqual( generatedHtml.match( titleText ), null, 'Title appears in generated HTML.' );
	assert.notStrictEqual( generatedHtml.match( filePageUrl ), null, 'Page url appears in generated HTML.' );
	assert.notStrictEqual( generatedHtml.match( thumbUrl ), null, 'Thumbnail url appears in generated HTML' );
	assert.notStrictEqual( generatedHtml.match( 'Public License' ), null, 'License appears in generated HTML' );
	assert.notStrictEqual( generatedHtml.match( 'Homer' ), null, 'Author appears in generated HTML' );
	assert.notStrictEqual( generatedHtml.match( 'Iliad' ), null, 'Source appears in generated HTML' );
	assert.notStrictEqual( generatedHtml.match( width ), null, 'Width appears in generated HTML' );
	assert.notStrictEqual( generatedHtml.match( height ), null, 'Height appears in generated HTML' );
	// .includes() for checking the short url since it contains a ? (bad for regex). Could escape instead.

	assert.notStrictEqual( generatedHtml.includes( filePageShortUrl ), null, 'Short URL appears in generated HTML' );

	// Bylines, no license and site
	info = createEmbedFileInfo( { title: title, imgUrl: imgUrl, filePageUrl: filePageUrl,
		shortFilePageUrl: filePageShortUrl, siteName: siteName, siteUrl: siteUrl,
		author: author, source: source } );
	generatedHtml = formatter.getThumbnailHtml( info, thumbUrl, width, height );

	assert.notStrictEqual( generatedHtml.match( titleText ), null, 'Title appears in generated HTML.' );
	assert.notStrictEqual( generatedHtml.match( filePageUrl ), null, 'Page url appears in generated HTML.' );
	assert.notStrictEqual( generatedHtml.match( thumbUrl ), null, 'Thumbnail url appears in generated HTML' );
	assert.strictEqual( generatedHtml.match( 'Public License' ), null, 'License should not appear in generated HTML' );
	assert.notStrictEqual( generatedHtml.match( 'Homer' ), null, 'Author appears in generated HTML' );
	assert.notStrictEqual( generatedHtml.match( 'Iliad' ), null, 'Source appears in generated HTML' );
	assert.notStrictEqual( generatedHtml.match( width ), null, 'Width appears in generated HTML' );
	assert.notStrictEqual( generatedHtml.match( height ), null, 'Height appears in generated HTML' );

	assert.notStrictEqual( generatedHtml.includes( filePageShortUrl ), null, 'Short URL appears in generated HTML' );

	// No bylines, license and site
	info = createEmbedFileInfo( { title: title, imgUrl: imgUrl, filePageUrl: filePageUrl,
		siteName: siteName, siteUrl: siteUrl, licenseShortName: licenseShortName,
		licenseInternalName: licenseInternalName, licenseLongName: licenseLongName,
		licenseUrl: licenseUrl, shortFilePageUrl: filePageShortUrl } );
	generatedHtml = formatter.getThumbnailHtml( info, thumbUrl, width, height );

	assert.notStrictEqual( generatedHtml.match( titleText ), null, 'Title appears in generated HTML.' );
	assert.notStrictEqual( generatedHtml.match( filePageUrl ), null, 'Page url appears in generated HTML.' );
	assert.notStrictEqual( generatedHtml.match( thumbUrl ), null, 'Thumbnail url appears in generated HTML' );
	assert.notStrictEqual( generatedHtml.match( 'Public License' ), null, 'License appears in generated HTML' );
	assert.strictEqual( generatedHtml.match( 'Homer' ), null, 'Author should not appear in generated HTML' );
	assert.strictEqual( generatedHtml.match( 'Iliad' ), null, 'Source should not appear in generated HTML' );
	assert.notStrictEqual( generatedHtml.match( width ), null, 'Width appears in generated HTML' );
	assert.notStrictEqual( generatedHtml.match( height ), null, 'Height appears in generated HTML' );

	assert.notStrictEqual( generatedHtml.includes( filePageShortUrl ), null, 'Short URL appears in generated HTML' );

	// No bylines, no license and site
	info = createEmbedFileInfo( { title: title, imgUrl: imgUrl, filePageUrl: filePageUrl,
		siteName: siteName, siteUrl: siteUrl, shortFilePageUrl: filePageShortUrl } );
	generatedHtml = formatter.getThumbnailHtml( info, thumbUrl, width, height );

	assert.notStrictEqual( generatedHtml.match( titleText ), null, 'Title appears in generated HTML.' );
	assert.notStrictEqual( generatedHtml.match( filePageUrl ), null, 'Page url appears in generated HTML.' );
	assert.notStrictEqual( generatedHtml.match( thumbUrl ), null, 'Thumbnail url appears in generated HTML' );
	assert.strictEqual( generatedHtml.match( 'Public License' ), null, 'License should not appear in generated HTML' );
	assert.strictEqual( generatedHtml.match( 'Homer' ), null, 'Author should not appear in generated HTML' );
	assert.strictEqual( generatedHtml.match( 'Iliad' ), null, 'Source should not appear in generated HTML' );
	assert.notStrictEqual( generatedHtml.match( width ), null, 'Width appears in generated HTML' );
	assert.notStrictEqual( generatedHtml.match( height ), null, 'Height appears in generated HTML' );

	assert.notStrictEqual( generatedHtml.includes( filePageShortUrl ), null, 'Short URL appears in generated HTML' );

} );

QUnit.test( 'getThumbnailWikitext():', ( assert ) => {
	const formatter = new EmbedFileFormatter();
	const title = mw.Title.newFromText( 'File:Foobar.jpg' );
	const imgUrl = 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg';
	const filePageUrl = 'https://commons.wikimedia.org/wiki/File:Foobar.jpg';
	const caption = 'Foobar caption.';
	const width = 700;

	// Title, width and caption
	let info = createEmbedFileInfo( { title: title, imgUrl: imgUrl, filePageUrl: filePageUrl,
		caption: caption } );
	let wikitext = formatter.getThumbnailWikitextFromEmbedFileInfo( info, width );

	assert.strictEqual(
		wikitext,
		'[[File:Foobar.jpg|700px|thumb|Foobar caption.]]',
		'Wikitext generated correctly.' );

	// Title, width and no caption
	info = createEmbedFileInfo( { title: title, imgUrl: imgUrl, filePageUrl: filePageUrl } );
	wikitext = formatter.getThumbnailWikitextFromEmbedFileInfo( info, width );

	assert.strictEqual(
		wikitext,
		'[[File:Foobar.jpg|700px|thumb|Foobar]]',
		'Wikitext generated correctly.' );

	// Title, no width and no caption
	info = createEmbedFileInfo( { title: title, imgUrl: imgUrl, filePageUrl: filePageUrl } );
	wikitext = formatter.getThumbnailWikitextFromEmbedFileInfo( info );

	assert.strictEqual(
		wikitext,
		'[[File:Foobar.jpg|thumb|Foobar]]',
		'Wikitext generated correctly.' );
} );

QUnit.test( 'getCreditText():', function ( assert ) {
	const author = '<span class="mw-mmv-author">Homer</span>';
	const source = '<span class="mw-mmv-source">Iliad</span>';
	const formatter = new EmbedFileFormatter();

	let txt = formatter.getCreditText( {
		author,
		source,
		descriptionShortUrl: 'link',
		title: {
			getNameText: function () {
				return 'Image Title';
			}
		}
	}
	);

	assert.strictEqual( txt, '(multimediaviewer-text-embed-credit-text-b: (multimediaviewer-credit: Homer, Iliad), link)', 'Sense check' );

	txt = formatter.getCreditText( {
		author,
		source,
		descriptionShortUrl: 'link',
		title: {
			getNameText: function () {
				return 'Image Title';
			}
		},
		license: {
			getShortName: function () {
				return 'WTFPL v2';
			},
			longName: 'Do What the Fuck You Want Public License Version 2',
			isFree: this.sandbox.stub().returns( true )
		}
	}
	);

	assert.strictEqual( txt, '(multimediaviewer-text-embed-credit-text-bl: (multimediaviewer-credit: Homer, Iliad), WTFPL v2, link)', 'License message works' );
} );

QUnit.test( 'getCreditHtml():', function ( assert ) {
	const author = '<span class="mw-mmv-author">Homer</span>';
	const source = '<span class="mw-mmv-source">Iliad</span>';
	const formatter = new EmbedFileFormatter();

	let html = formatter.getCreditHtml( {
		author,
		source,
		descriptionShortUrl: 'some link',
		title: {
			getNameText: function () {
				return 'Image Title';
			}
		}
	}
	);

	assert.strictEqual(
		html,
		'(multimediaviewer-html-embed-credit-text-b: (multimediaviewer-credit: <span class="mw-mmv-author">Homer</span>, <span class="mw-mmv-source">Iliad</span>), <a href="some link">(multimediaviewer-html-embed-credit-link-text)</a>)',
		'Sense check'
	);

	html = formatter.getCreditHtml( {
		author,
		source,
		descriptionShortUrl: 'some link',
		title: {
			getNameText: function () {
				return 'Image Title';
			}
		},
		license: {
			getShortLink: function () {
				return '<a href="http://www.wtfpl.net/">WTFPL v2</a>';
			},
			longName: 'Do What the Fuck You Want Public License Version 2',
			isFree: this.sandbox.stub().returns( true )
		}
	}
	);

	assert.strictEqual(
		html,
		'(multimediaviewer-html-embed-credit-text-bl: (multimediaviewer-credit: <span class="mw-mmv-author">Homer</span>, <span class="mw-mmv-source">Iliad</span>), <a href="http://www.wtfpl.net/">WTFPL v2</a>, <a href="some link">(multimediaviewer-html-embed-credit-link-text)</a>)',
		'Sense check'
	);
} );
