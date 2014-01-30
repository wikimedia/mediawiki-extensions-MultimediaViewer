( function ( mw, $ ) {
	QUnit.module( 'mmv.ui.fileUsage', QUnit.newMwEnvironment() );

	QUnit.test( 'File usage panel with no usage', 1, function( assert ) {
		var fileUsage = new mw.mmv.ui.FileUsage( $( '#qunit-fixture' ) ),
			file = new mw.Title( 'File:Foo' ),
			localUsage = new mw.mmv.model.FileUsage( file, 'local', [] ),
			globalUsage = new mw.mmv.model.FileUsage( file, 'global', [] );

		fileUsage.init();
		fileUsage.set( localUsage, globalUsage );

		assert.ok( $( '#qunit-fixture' ).hasClass( 'empty' ) );
	} );

	QUnit.test( 'File usage panel with local usage', 7, function( assert ) {
		var $list,
			fileUsage = new mw.mmv.ui.FileUsage( $( '#qunit-fixture' ) ),
			file = new mw.Title( 'File:Foo' ),
			localUsage = new mw.mmv.model.FileUsage( file, 'local', [
				{ wiki: null, page: new mw.Title( 'Bar' ) },
				{ wiki: null, page: new mw.Title( 'Baz' ) }
			] ),
			globalUsage = new mw.mmv.model.FileUsage( file, 'global', [] );

		fileUsage.init();
		fileUsage.set( localUsage, globalUsage );

		assert.ok( ! $( '#qunit-fixture' ).hasClass( 'empty' ) );

		$list = $( '#qunit-fixture li:not([class])' );
		assert.strictEqual( $list.length, 2 );
		assert.strictEqual( $list.eq( 0 ).text(), 'Bar' );
		assert.strictEqual( $list.eq( 1 ).text(), 'Baz' );

		assert.strictEqual( $( '#qunit-fixture .mw-mlb-fileusage-local-section' ).length, 1 );
		assert.strictEqual( $( '#qunit-fixture .mw-mlb-fileusage-global-section' ).length, 0 );
		assert.strictEqual( $( '#qunit-fixture .mw-mlb-fileusage-view-all' ).length, 0 );
	} );

	QUnit.test( 'File usage panel with local usage and overflow', 3, function( assert ) {
		var $list,
			fileUsage = new mw.mmv.ui.FileUsage( $( '#qunit-fixture' ) ),
			file = new mw.Title( 'File:Foo' ),
			localUsage = new mw.mmv.model.FileUsage( file, 'local', [
				{ wiki: null, page: new mw.Title( 'Bar' ) },
				{ wiki: null, page: new mw.Title( 'Baz' ) },
				{ wiki: null, page: new mw.Title( 'Boom' ) },
				{ wiki: null, page: new mw.Title( 'Boing' ) }
			] ),
			globalUsage = new mw.mmv.model.FileUsage( file, 'global', [] );

		fileUsage.init();
		fileUsage.set( localUsage, globalUsage );

		assert.ok( ! $( '#qunit-fixture' ).hasClass( 'empty' ) );

		$list = $( '#qunit-fixture li:not([class])' );
		assert.strictEqual( $list.length, fileUsage.MAX_LOCAL );
		assert.strictEqual( $( '#qunit-fixture .mw-mlb-fileusage-view-all' ).length, 1 );
	} );

	QUnit.test( 'File usage panel with global usage', 9, function( assert ) {
		var $list,
			fileUsage = new mw.mmv.ui.FileUsage( $( '#qunit-fixture' ) ),
			file = new mw.Title( 'File:Foo' ),
			localUsage = new mw.mmv.model.FileUsage( file, 'local', [] ),
			globalUsage = new mw.mmv.model.FileUsage( file, 'global', [
				{ wiki: 'x.com', page: new mw.Title( 'Bar' ) },
				{ wiki: 'y.com', page: new mw.Title( 'Baz' ) }
			] );

		fileUsage.init();
		fileUsage.set( localUsage, globalUsage );

		assert.ok( ! $( '#qunit-fixture' ).hasClass( 'empty' ) );

		$list = $( '#qunit-fixture li:not([class])' );
		assert.strictEqual( $list.length, 2 );
		assert.strictEqual( $list.eq( 0 ).find( 'a' ).text(), 'Bar' );
		assert.strictEqual( $list.eq( 1 ).find( 'a' ).text(), 'Baz' );
		assert.strictEqual( $list.eq( 0 ).find( 'aside' ).text(), 'x.com' );
		assert.strictEqual( $list.eq( 1 ).find( 'aside' ).text(), 'y.com' );

		assert.strictEqual( $( '#qunit-fixture .mw-mlb-fileusage-local-section' ).length, 0 );
		assert.strictEqual( $( '#qunit-fixture .mw-mlb-fileusage-global-section' ).length, 1 );
		assert.strictEqual( $( '#qunit-fixture .mw-mlb-fileusage-view-all' ).length, 0 );
	} );

	QUnit.test( 'File usage panel with lots of uses', 3, function( assert ) {
		var $list,
			totalCount = 100,
			fileUsage = new mw.mmv.ui.FileUsage( $( '#qunit-fixture' ) ),
			file = new mw.Title( 'File:Foo' ),
			localUsage = new mw.mmv.model.FileUsage( file, 'local', [
				{ wiki: null, page: new mw.Title( 'Bar' ) },
				{ wiki: null, page: new mw.Title( 'Baz' ) },
				{ wiki: null, page: new mw.Title( 'Boom' ) },
				{ wiki: null, page: new mw.Title( 'Boing' ) }
			], totalCount, true ),
			globalUsage = new mw.mmv.model.FileUsage( file, 'global', [
				{ wiki: 'x.com', page: new mw.Title( 'Bar' ) },
				{ wiki: 'x.com', page: new mw.Title( 'Baz' ) },
				{ wiki: 'y.com', page: new mw.Title( 'Bar' ) },
				{ wiki: 'y.com', page: new mw.Title( 'Baz' ) }
			] );

		fileUsage.init();
		fileUsage.set( localUsage, globalUsage );

		$list = $( '#qunit-fixture li:not([class])' );
		assert.strictEqual( $list.length, fileUsage.MAX_LOCAL + fileUsage.MAX_GLOBAL );
		assert.strictEqual( $( '#qunit-fixture .mw-mlb-fileusage-view-all' ).length, 2 );
		assert.ok( $( '#qunit-fixture h3' ).text().match( totalCount ) );
	} );

	QUnit.test( 'The interface is emptied properly when necessary', 4, function( assert ) {
		var $list,
			fileUsage = new mw.mmv.ui.FileUsage( $( '#qunit-fixture' ) ),
			file = new mw.Title( 'File:Foo' ),
			localUsage = new mw.mmv.model.FileUsage( file, 'local', [
				{ wiki: null, page: new mw.Title( 'Bar' ) },
				{ wiki: null, page: new mw.Title( 'Baz' ) }
			] ),
			globalUsage = new mw.mmv.model.FileUsage( file, 'global', [] );

		fileUsage.init();
		fileUsage.set( localUsage, globalUsage );

		assert.ok( ! $( '#qunit-fixture' ).hasClass( 'empty' ) );

		fileUsage.empty();

		assert.ok( $( '#qunit-fixture' ).hasClass( 'empty' ) );

		$list = $( '#qunit-fixture li:not([class])' );
		assert.strictEqual( $list.length, 0 );

		assert.strictEqual( $( '#qunit-fixture h3' ).text(), '' );
	} );
}( mediaWiki, jQuery ) );
