( function ( mw ) {
	QUnit.module( 'mmv.EmbedFileFormatter', QUnit.newMwEnvironment() );

	QUnit.test( 'EmbedFileFormatter constructor sanity check', 1, function ( assert ) {
		var formatter = new mw.mmv.EmbedFileFormatter();
		assert.ok( formatter, 'constructor with no argument works');
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

}( mediaWiki ) );
