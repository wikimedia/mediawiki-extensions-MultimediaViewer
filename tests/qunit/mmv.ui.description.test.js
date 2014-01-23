( function ( mw, $ ) {
	QUnit.module( 'mmv.ui.description', QUnit.newMwEnvironment() );

	QUnit.test( 'Sanity test, object creation and UI construction', 4, function ( assert ) {
		var description = new mw.mmv.ui.Description( $( '#qunit-fixture' ) );

		assert.ok( description, 'Image description UI element is created' );
		assert.strictEqual( description.$imageDescDiv.length, 1, 'Image description div is created' );
		assert.strictEqual( description.$imageDesc.length, 1, 'Image description element is created' );
		assert.strictEqual( description.$imageCaption.length, 1, 'Image caption div is created' );
	} );

	QUnit.test( 'Setting data in different combinations works well', 7, function ( assert ) {
		var description = new mw.mmv.ui.Description( $( '#qunit-fixture' ) );

		description.set( '' );
		assert.strictEqual( description.$imageDescDiv.hasClass( 'empty' ), true, 'Image description div is marked empty when needed' );

		description.set( 'blah' );
		assert.strictEqual( description.$imageDescDiv.hasClass( 'empty' ), false, 'Image description div is not marked empty incorrectly' );
		assert.strictEqual( description.$imageDesc.text(), 'blah', 'Image description text is set correctly' );
		assert.strictEqual( description.$imageCaption.hasClass( 'empty' ), true, 'Image caption is empty when not set' );

		description.set( 'foo', 'bar' );
		assert.strictEqual( description.$imageDescDiv.hasClass( 'empty' ), false, 'Image description div is not marked empty incorrectly' );
		assert.strictEqual( description.$imageCaption.text(), 'bar', 'Image caption text is set correctly' );
		assert.strictEqual( description.$imageCaption.hasClass( 'empty' ), false, 'Image caption is not marked empty when set' );
	} );

	QUnit.test( 'Emptying data works as expected', 4, function ( assert ) {
		var description = new mw.mmv.ui.Description( $( '#qunit-fixture' ) );

		description.set( 'foo', 'bar' );
		description.empty();
		assert.strictEqual( description.$imageDescDiv.hasClass( 'empty' ), true, 'Image description div is marked empty when emptied' );
		assert.strictEqual( description.$imageCaption.hasClass( 'empty' ), true, 'Image caption is marked empty when emptied' );
		assert.strictEqual( description.$imageDesc.text(), '', 'Image description text is emptied correctly' );
		assert.strictEqual( description.$imageCaption.text(), '', 'Image caption text is emptied correctly' );
	} );
}( mediaWiki, jQuery ) );
