( function ( mw, $ ) {
	QUnit.module( 'mmv.ui.categories', QUnit.newMwEnvironment() );

	QUnit.test( 'Sanity test, object creation and UI construction', 2, function ( assert ) {
		var $list = $( '<li>' ).appendTo( $( '#qunit-fixture' ) ).wrap( '<ul>' ),
			categories = new mw.mmv.ui.Categories( $list );

		assert.ok( categories, 'Image categories UI element is created' );
		assert.strictEqual( categories.$categoryTpl.length, 1, 'Image category template is created' );
	} );

	QUnit.test( 'Setting data in different combinations works well', 17, function ( assert ) {
		var i,
			j = 0,
			$list = $( '<li>' ).appendTo( $( '#qunit-fixture' ) ).wrap( '<ul>' ),
			categories = new mw.mmv.ui.Categories( $list ),
			categoryNames = [ 'Foo', undefined, null, 'Bar', 'Baz', '', 'Quux' ],
			categoryName,
			$category;

		categories.set( 'http://example.net/wiki/$1', categoryNames );

		assert.strictEqual( categories.$container.find( '.mw-mmv-tag' ).length, 4,
			'Only valid categories have an element created for them' );

		for ( i = 0; i < categoryNames.length; i ++ ) {
			categoryName = categoryNames[ i ];

			if ( !categoryName || !categoryName.length ) {
				continue;
			}
			$category = categories.$container.find( '.mw-mmv-tag' ).eq( j );

			assert.strictEqual( $category.find( '.comma-container' ).length, j > 0 ? 1 : 0,
				'Comma is properly set inside of them' );
			assert.strictEqual( $category.find( 'a' ).text(), categoryName,
				'Category elements have correct text inside of them' );
			assert.strictEqual( $category.find( 'a' ).prop( 'href' ),
				'http://example.net/wiki/Category:' + categoryName,
				'Category links are set to the right target' );

			j++;
		}

		for ( i = 0; i < 3; i ++ ) {
			assert.ok( !categories.$container.find( '.mw-mmv-tag' ).eq( i ).hasClass( 'extra' ),
				'Categories before the fourth are not marked as extra' );
		}

		assert.ok( categories.$container.find( '.mw-mmv-tag' ).eq( 3 ).hasClass( 'extra' ),
			'Categories after the third are marked as extra' );
	} );

	QUnit.test( 'Emptying data works as expected', 1, function ( assert ) {
		var $list = $( '<li>' ).appendTo( $( '#qunit-fixture' ) ).wrap( '<ul>' ),
			categories = new mw.mmv.ui.Categories( $list );

		categories.set( 'http://example.net/wiki/$1', [ 'Foo', 'Bar', 'Baz', 'Quux' ] );
		categories.empty();
		assert.strictEqual( $list.text(), '', 'Text is emptied correctly' );
	} );
}( mediaWiki, jQuery ) );
