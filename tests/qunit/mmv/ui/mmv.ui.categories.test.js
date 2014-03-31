( function ( mw, $ ) {
	QUnit.module( 'mmv.ui.categories', QUnit.newMwEnvironment() );

	QUnit.test( 'Sanity test, object creation and UI construction', 2, function ( assert ) {
		var categories = new mw.mmv.ui.Categories( $( '<ul>' ).appendTo( $( '#qunit-fixture' ) ) );

		assert.ok( categories, 'Image categories UI element is created' );
		assert.strictEqual( categories.$categoryTpl.length, 1, 'Image category template is created' );
	} );

	QUnit.test( 'Setting data in different combinations works well', 17, function ( assert ) {
		var i,
			j = 0,
			categories = new mw.mmv.ui.Categories( $( '<ul>' ).appendTo( $( '#qunit-fixture' ) ) ),
			categoryNames = [ 'Foo', undefined, null, 'Bar', 'Baz', '', 'Quux' ],
			categoryName;

		categories.set( 'http://example.net/wiki/$1', categoryNames );

		assert.strictEqual( $( '.mw-mmv-image-category > span' ).length, 4, 'Only valid categories have an element created for them' );

		for ( i = 0; i < categoryNames.length; i ++ ) {
			categoryName = categoryNames[ i ];

			if ( !categoryName || !categoryName.length ) {
				continue;
			}

			assert.strictEqual( $( '.mw-mmv-image-category > span' ).eq( j ).find( '.comma-container' ).length, j > 0 ? 1 : 0, 'Comma is properly set inside of them' );
			assert.strictEqual( $( '.mw-mmv-image-category > span' ).eq( j ).find( 'a' ).text(), categoryName, 'Category elements have correct text inside of them' );
			assert.strictEqual( $( '.mw-mmv-image-category > span' ).eq( j ).find( 'a' ).prop( 'href' ), 'http://example.net/wiki/Category:' + categoryName, 'Category links are set to the right target' );

			j++;
		}

		for ( i = 0; i < 3; i ++ ) {
			assert.ok( !$( '.mw-mmv-image-category > span' ).eq( i ).hasClass( 'extra' ), 'Categories before the fourth are not marked as extra' );
		}

		assert.ok( $( '.mw-mmv-image-category > span' ).eq( 3 ).hasClass( 'extra' ), 'Categories after the third are marked as extra' );
	} );

	QUnit.test( 'Emptying data works as expected', 4, function ( assert ) {
		var $list = $( '<ul>' ).appendTo( $( '#qunit-fixture' ) ),
			categories = new mw.mmv.ui.Categories( $list );

		categories.set( 'http://example.net/wiki/$1', [ 'Foo', 'Bar', 'Baz', 'Quux' ] );
		categories.empty();
		assert.strictEqual( $( '.mw-mmv-image-category > span' ).length, 0, 'All elements are removed from the DOM' );
		assert.strictEqual( $list.text(), '', 'Text is emptied correctly' );
		assert.strictEqual( $list.find( 'li' ).length, 0, 'List elements are all removed' );
		assert.strictEqual( categories.$categories, undefined, 'Category UI element is removed from object' );
	} );
}( mediaWiki, jQuery ) );
