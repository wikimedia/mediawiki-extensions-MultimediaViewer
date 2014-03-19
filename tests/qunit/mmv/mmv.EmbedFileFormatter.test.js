( function ( mw, $ ) {
	QUnit.module( 'mmv.EmbedFileFormatter', QUnit.newMwEnvironment() );

	QUnit.test( 'EmbedFileFormatter constructor sanity check', 1, function ( assert ) {
		var formatter = new mw.mmv.EmbedFileFormatter();
		assert.ok( formatter, 'constructor with no argument works');
	} );

	QUnit.test( 'getBylines():', 7, function ( assert ) {
		var formatter = new mw.mmv.EmbedFileFormatter(),
			$author = $( '<span class="mw-mlb-author">Homer</span>' ),
			$source = $( '<span class="mw-mlb-source">Iliad</span>' ),
			author = {
				plain: $author.text(),
				html: $author.get( 0 ).outerHTML
			},
			source = {
				plain: $source.text(),
				html: $source.get( 0 ).outerHTML
			},
			bylines;

		// Works with no arguments
		bylines = formatter.getBylines();

		assert.deepEqual( bylines, {}, 'No argument case handled correctly.' );

		// Author and source present
		bylines = formatter.getBylines( author, source );

		assert.ok( bylines.plain.match( /Homer|Iliad/ ), 'Author and source found in plain bylines' );
		assert.ok( bylines.html.match ( /Homer|Iliad/ ), 'Author and source found in html bylines' );

		// Only author present
		bylines = formatter.getBylines( author );

		assert.ok( bylines.plain.match( /^Homer$/ ), 'Author found in plain bylines.' );
		assert.ok( bylines.html.match ( /Homer/ ), 'Author found in html bylines.' );

		// Only source present
		bylines = formatter.getBylines( undefined, source );

		assert.ok( bylines.plain.match( /^Iliad$/ ), 'Source found in plain bylines.' );
		assert.ok( bylines.html.match ( /Iliad/ ), 'Source found in html bylines.' );
	} );

	QUnit.test( 'getThumbnailHtml():', 72, function ( assert ) {
		var formatter = new mw.mmv.EmbedFileFormatter(),
			title = 'Music Room',
			imgUrl = 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg',
			filePageUrl = 'https://commons.wikimedia.org/wiki/File:Foobar.jpg',
			siteName = 'Site Name',
			$license = $( '<a class="mw-mlb-license empty" href="/wiki/File:License.txt">Public License</a>' ),
			$author = $( '<span class="mw-mlb-author">Homer</span>' ),
			$source = $( '<span class="mw-mlb-source">Iliad</span>' ),
			license = {
				plain: $license && $license.text(),
				html: $license && $license.get( 0 ).outerHTML
			},
			author = {
				plain: $author && $author.text(),
				html: $author && $author.get( 0 ).outerHTML
			},
			source = {
				plain: $source && $source.text(),
				html: $source && $source.get( 0 ).outerHTML
			},
			thumbUrl = 'https://upload.wikimedia.org/wikipedia/thumb/Foobar.jpg',
			width = 700,
			height = 500,
			info,
			generatedHtml;

		// No bylines, no license and no site
		info = new mw.mmv.model.EmbedFileInfo( new mw.Title( title ), imgUrl, filePageUrl );
		generatedHtml = formatter.getThumbnailHtml( info, thumbUrl );

		assert.ok( generatedHtml.match( title ), 'Title appears in generated HTML.');
		assert.ok( generatedHtml.match( filePageUrl ), 'Page url appears in generated HTML.' );
		assert.ok( generatedHtml.match( thumbUrl ), 'Thumbnail url appears in generated HTML' );
		assert.ok( ! generatedHtml.match( siteName ), 'Site name should not appear in generated HTML' );
		assert.ok( ! generatedHtml.match( 'Public License' ), 'License should not appear in generated HTML' );
		assert.ok( ! generatedHtml.match( 'Homer' ), 'Author should not appear in generated HTML' );
		assert.ok( ! generatedHtml.match( 'Iliad' ), 'Source should not appear in generated HTML' );
		assert.ok( ! generatedHtml.match( width ), 'Width should not appear in generated HTML' );
		assert.ok( ! generatedHtml.match( height ), 'Height should not appear in generated HTML' );

		// Bylines, license and site
		info = new mw.mmv.model.EmbedFileInfo( new mw.Title( title ), imgUrl, filePageUrl,
			siteName, license, author, source );
		generatedHtml = formatter.getThumbnailHtml( info, thumbUrl, width, height);

		assert.ok( generatedHtml.match( title ), 'Title appears in generated HTML.' );
		assert.ok( generatedHtml.match( filePageUrl ), 'Page url appears in generated HTML.' );
		assert.ok( generatedHtml.match( thumbUrl ), 'Thumbnail url appears in generated HTML' );
		assert.ok( generatedHtml.match( siteName ), 'Site name appears in generated HTML' );
		assert.ok( generatedHtml.match( 'Public License' ), 'License appears in generated HTML' );
		assert.ok( generatedHtml.match( 'Homer' ), 'Author appears in generated HTML' );
		assert.ok( generatedHtml.match( 'Iliad' ), 'Source appears in generated HTML' );
		assert.ok( generatedHtml.match( width ), 'Width appears in generated HTML' );
		assert.ok( generatedHtml.match( height ), 'Height appears in generated HTML' );

		// Bylines, license and no site
		info = new mw.mmv.model.EmbedFileInfo( new mw.Title( title ), imgUrl, filePageUrl,
			undefined, license, author, source );
		generatedHtml = formatter.getThumbnailHtml( info, thumbUrl, width, height);

		assert.ok( generatedHtml.match( title ), 'Title appears in generated HTML.' );
		assert.ok( generatedHtml.match( filePageUrl ), 'Page url appears in generated HTML.' );
		assert.ok( generatedHtml.match( thumbUrl ), 'Thumbnail url appears in generated HTML' );
		assert.ok( ! generatedHtml.match( siteName ), 'Site name should not appear in generated HTML' );
		assert.ok( generatedHtml.match( 'Public License' ), 'License appears in generated HTML' );
		assert.ok( generatedHtml.match( 'Homer' ), 'Author appears in generated HTML' );
		assert.ok( generatedHtml.match( 'Iliad' ), 'Source appears in generated HTML' );
		assert.ok( generatedHtml.match( width ), 'Width appears in generated HTML' );
		assert.ok( generatedHtml.match( height ), 'Height appears in generated HTML' );

		// Bylines, no license and site
		info = new mw.mmv.model.EmbedFileInfo( new mw.Title( title ), imgUrl, filePageUrl,
			siteName, undefined, author, source );
		generatedHtml = formatter.getThumbnailHtml( info, thumbUrl, width, height);

		assert.ok( generatedHtml.match( title ), 'Title appears in generated HTML.' );
		assert.ok( generatedHtml.match( filePageUrl ), 'Page url appears in generated HTML.' );
		assert.ok( generatedHtml.match( thumbUrl ), 'Thumbnail url appears in generated HTML' );
		assert.ok( generatedHtml.match( siteName ), 'Site name appears in generated HTML' );
		assert.ok( ! generatedHtml.match( 'Public License' ), 'License should not appear in generated HTML' );
		assert.ok( generatedHtml.match( 'Homer' ), 'Author appears in generated HTML' );
		assert.ok( generatedHtml.match( 'Iliad' ), 'Source appears in generated HTML' );
		assert.ok( generatedHtml.match( width ), 'Width appears in generated HTML' );
		assert.ok( generatedHtml.match( height ), 'Height appears in generated HTML' );

		// Bylines, no license and no site
		info = new mw.mmv.model.EmbedFileInfo( new mw.Title( title ), imgUrl, filePageUrl,
			undefined, undefined, author, source );
		generatedHtml = formatter.getThumbnailHtml( info, thumbUrl, width, height);

		assert.ok( generatedHtml.match( title ), 'Title appears in generated HTML.' );
		assert.ok( generatedHtml.match( filePageUrl ), 'Page url appears in generated HTML.' );
		assert.ok( generatedHtml.match( thumbUrl ), 'Thumbnail url appears in generated HTML' );
		assert.ok( ! generatedHtml.match( siteName ), 'Site name should not appear in generated HTML' );
		assert.ok( ! generatedHtml.match( 'Public License' ), 'License should not appear in generated HTML' );
		assert.ok( generatedHtml.match( 'Homer' ), 'Author appears in generated HTML' );
		assert.ok( generatedHtml.match( 'Iliad' ), 'Source appears in generated HTML' );
		assert.ok( generatedHtml.match( width ), 'Width appears in generated HTML');
		assert.ok( generatedHtml.match( height ), 'Height appears in generated HTML');

		// No bylines, license and site
		info = new mw.mmv.model.EmbedFileInfo( new mw.Title( title ), imgUrl, filePageUrl,
			siteName, license );
		generatedHtml = formatter.getThumbnailHtml( info, thumbUrl, width, height);

		assert.ok( generatedHtml.match( title ), 'Title appears in generated HTML.');
		assert.ok( generatedHtml.match( filePageUrl ), 'Page url appears in generated HTML.' );
		assert.ok( generatedHtml.match( thumbUrl ), 'Thumbnail url appears in generated HTML' );
		assert.ok( generatedHtml.match( siteName ), 'Site name appears in generated HTML' );
		assert.ok( generatedHtml.match( 'Public License' ), 'License appears in generated HTML' );
		assert.ok( ! generatedHtml.match( 'Homer' ), 'Author should not appear in generated HTML' );
		assert.ok( ! generatedHtml.match( 'Iliad' ), 'Source should not appear in generated HTML' );
		assert.ok( generatedHtml.match( width ), 'Width appears in generated HTML' );
		assert.ok( generatedHtml.match( height ), 'Height appears in generated HTML' );

		// No bylines, license and no site
		info = new mw.mmv.model.EmbedFileInfo( new mw.Title( title ), imgUrl, filePageUrl,
			undefined, license );
		generatedHtml = formatter.getThumbnailHtml( info, thumbUrl, width, height);

		assert.ok( generatedHtml.match( title ), 'Title appears in generated HTML.');
		assert.ok( generatedHtml.match( filePageUrl ), 'Page url appears in generated HTML.' );
		assert.ok( generatedHtml.match( thumbUrl ), 'Thumbnail url appears in generated HTML' );
		assert.ok( ! generatedHtml.match( siteName ), 'Site name should not appear in generated HTML' );
		assert.ok( generatedHtml.match( 'Public License' ), 'License appears in generated HTML' );
		assert.ok( ! generatedHtml.match( 'Homer' ), 'Author should not appear in generated HTML' );
		assert.ok( ! generatedHtml.match( 'Iliad' ), 'Source should not appear in generated HTML' );
		assert.ok( generatedHtml.match( width ), 'Width appears in generated HTML' );
		assert.ok( generatedHtml.match( height ), 'Height appears in generated HTML' );

		// No bylines, no license and site
		info = new mw.mmv.model.EmbedFileInfo( new mw.Title( title ), imgUrl, filePageUrl,
			siteName );
		generatedHtml = formatter.getThumbnailHtml( info, thumbUrl, width, height);

		assert.ok( generatedHtml.match( title ), 'Title appears in generated HTML.');
		assert.ok( generatedHtml.match( filePageUrl ), 'Page url appears in generated HTML.' );
		assert.ok( generatedHtml.match( thumbUrl ), 'Thumbnail url appears in generated HTML' );
		assert.ok( generatedHtml.match( siteName ), 'Site name should appear in generated HTML' );
		assert.ok( ! generatedHtml.match( 'Public License' ), 'License should not appear in generated HTML' );
		assert.ok( ! generatedHtml.match( 'Homer' ), 'Author should not appear in generated HTML' );
		assert.ok( ! generatedHtml.match( 'Iliad' ), 'Source should not appear in generated HTML' );
		assert.ok( generatedHtml.match( width ), 'Width appears in generated HTML' );
		assert.ok( generatedHtml.match( height ), 'Height appears in generated HTML' );

	} );

	QUnit.test( 'getThumbnailWikitext():', 3, function ( assert ) {
		var formatter = new mw.mmv.EmbedFileFormatter(),
			title = mw.Title.newFromText( 'File:Foobar.jpg' ),
			imgUrl = 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg',
			filePageUrl = 'https://commons.wikimedia.org/wiki/File:Foobar.jpg',
			caption = 'Foobar caption.',
			width = 700,
			info,
			wikitext;

		// Title, width and caption
		info = new mw.mmv.model.EmbedFileInfo.fromHtml( title, imgUrl, filePageUrl, undefined,
			undefined, undefined, undefined, caption );
		wikitext = formatter.getThumbnailWikitextFromEmbedFileInfo( info, width );

		assert.strictEqual(
			wikitext,
			'[[File:Foobar.jpg|700px|thumb|Foobar caption.]]',
			'Wikitext generated correctly.' );

		// Title, width and no caption
		info = new mw.mmv.model.EmbedFileInfo.fromHtml( title, imgUrl, filePageUrl );
		wikitext = formatter.getThumbnailWikitextFromEmbedFileInfo( info , width );

		assert.strictEqual(
			wikitext,
			'[[File:Foobar.jpg|700px|thumb|Foobar]]',
			'Wikitext generated correctly.' );

		// Title, no width and no caption
		info = new mw.mmv.model.EmbedFileInfo.fromHtml( title, imgUrl, filePageUrl );
		wikitext = formatter.getThumbnailWikitextFromEmbedFileInfo( info );

		assert.strictEqual(
			wikitext,
			'[[File:Foobar.jpg|thumb|Foobar]]',
			'Wikitext generated correctly.' );
	} );

}( mediaWiki, jQuery ) );
