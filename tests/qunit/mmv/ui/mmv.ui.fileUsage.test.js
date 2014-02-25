( function ( mw, $ ) {
	QUnit.module( 'mmv.ui.fileUsage', QUnit.newMwEnvironment() );

	QUnit.test( 'File usage panel with no usage', 1, function( assert ) {
		var fileUsage = new mw.mmv.ui.FileUsage( $( '#qunit-fixture' ) ),
			file = new mw.Title( 'File:Foo' ),
			localUsage = new mw.mmv.model.FileUsage( file, 'local', [] ),
			globalUsage = new mw.mmv.model.FileUsage( file, 'global', [] );

		fileUsage.init();
		fileUsage.set( localUsage, globalUsage );

		assert.ok( fileUsage.$box.hasClass( 'empty' ) );
	} );

	QUnit.test( 'File usage panel with local usage', 8, function( assert ) {
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

		assert.ok( ! fileUsage.$box.hasClass( 'empty' ), 'The container is not empty' );

		$list = $( '#qunit-fixture li:not([class])' );
		assert.strictEqual( $list.length, 2 );
		assert.strictEqual( $list.eq( 0 ).text(), 'Bar' );
		assert.strictEqual( $list.eq( 1 ).text(), 'Baz' );

		assert.strictEqual( $( '#qunit-fixture .mw-mlb-fileusage-local-section' ).length, 1, 'There is a local section' );
		assert.strictEqual( $( '#qunit-fixture .mw-mlb-fileusage-global-section' ).length, 0, 'There is no global section' );
		assert.strictEqual( $( '#qunit-fixture .mw-mlb-fileusage-local-section .mw-mlb-fileusage-view-all' ).length, 0, 'The local section has no "view all uses" link' );
		assert.strictEqual( $( '#qunit-fixture .mw-mlb-fileusage-global-section .mw-mlb-fileusage-view-all' ).length, 0, 'The global section has no "view all uses" link' );
	} );

	QUnit.test( 'File usage panel with local usage and overflow', 6, function( assert ) {
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

		assert.ok( ! fileUsage.$box.hasClass( 'empty' ), 'The container is not empty' );

		$list = $( '#qunit-fixture li:not([class])' );
		assert.strictEqual( $list.length, fileUsage.MAX_LOCAL );
		assert.strictEqual( $( '#qunit-fixture .mw-mlb-fileusage-local-section' ).length, 1, 'There is a local section' );
		assert.strictEqual( $( '#qunit-fixture .mw-mlb-fileusage-global-section' ).length, 0, 'There is no global section' );
		assert.strictEqual( $( '#qunit-fixture .mw-mlb-fileusage-local-section .mw-mlb-fileusage-view-all' ).length, 1, 'The local section has its "view all uses" link' );
		assert.strictEqual( $( '#qunit-fixture .mw-mlb-fileusage-global-section .mw-mlb-fileusage-view-all' ).length, 0, 'The global section has no "view all uses" link' );
	} );

	QUnit.test( 'File usage panel with global usage', 10, function( assert ) {
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

		assert.ok( ! fileUsage.$box.hasClass( 'empty' ), 'The container is not empty' );

		$list = $( '#qunit-fixture li:not([class])' );
		assert.strictEqual( $list.length, 2 );
		assert.strictEqual( $list.eq( 0 ).find( 'a' ).text(), 'Bar' );
		assert.strictEqual( $list.eq( 1 ).find( 'a' ).text(), 'Baz' );
		assert.strictEqual( $list.eq( 0 ).find( 'aside' ).text(), 'x.com' );
		assert.strictEqual( $list.eq( 1 ).find( 'aside' ).text(), 'y.com' );

		assert.strictEqual( $( '#qunit-fixture .mw-mlb-fileusage-local-section' ).length, 0, 'There is no local section' );
		assert.strictEqual( $( '#qunit-fixture .mw-mlb-fileusage-global-section' ).length, 1, 'There is a global section' );
		assert.strictEqual( $( '#qunit-fixture .mw-mlb-fileusage-local-section .mw-mlb-fileusage-view-all' ).length, 0, 'The local section has no "view all uses" link' );
		assert.strictEqual( $( '#qunit-fixture .mw-mlb-fileusage-global-section .mw-mlb-fileusage-view-all' ).length, 0, 'The global section has no "view all uses" link' );
	} );

	QUnit.test( 'File usage panel with lots of uses', 7, function( assert ) {
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

		assert.ok( ! fileUsage.$box.hasClass( 'empty' ), 'The container is not empty' );

		$list = $( '#qunit-fixture li:not([class])' );
		assert.strictEqual( $list.length, fileUsage.MAX_LOCAL + fileUsage.MAX_GLOBAL, 'Total amount of results is correctly capped' );
		assert.strictEqual( $( '#qunit-fixture .mw-mlb-fileusage-local-section' ).length, 1, 'There is a local section' );
		assert.strictEqual( $( '#qunit-fixture .mw-mlb-fileusage-global-section' ).length, 1, 'There is a global section' );
		assert.strictEqual( $( '#qunit-fixture .mw-mlb-fileusage-local-section .mw-mlb-fileusage-view-all' ).length, 1, 'The local section has its "view all uses" link' );
		assert.strictEqual( $( '#qunit-fixture .mw-mlb-fileusage-global-section .mw-mlb-fileusage-view-all' ).length, 1, 'The global section has its "view all uses" link' );
		assert.ok( $( '#qunit-fixture h3' ).text().match( totalCount ), 'The "Used in" counter has the right total' );
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

		assert.ok( ! fileUsage.$box.hasClass( 'empty' ), 'The container is not empty' );

		fileUsage.empty();

		assert.ok( fileUsage.$box.hasClass( 'empty' ), 'The container is empty' );

		$list = $( '#qunit-fixture li:not([class])' );
		assert.strictEqual( $list.length, 0, 'The list is empty' );

		assert.strictEqual( $( '#qunit-fixture .mw-mlb-fileusage-container h3' ).text(), '', 'The "Used in" counter is empty' );
	} );
}( mediaWiki, jQuery ) );
