/*
 * This file is part of the MediaWiki extension MediaViewer.
 *
 * MediaViewer is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * MediaViewer is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with MediaViewer.  If not, see <http://www.gnu.org/licenses/>.
 */

( function( mw, $ ) {
	QUnit.module( 'mmv.ui.TruncatableTextField', QUnit.newMwEnvironment() );

	QUnit.test( 'Normal constructor', 2, function ( assert ) {
		var $container = $( '#qunit-fixture' ),
			$element = $( '<div>' ).appendTo( $container ).text( 'This is a unique string.' ),
			ttf = new mw.mmv.ui.TruncatableTextField( $container, $element );

		assert.strictEqual( ttf.$element.text(), 'This is a unique string.', 'The constructor set the element to the right thing.' );
		assert.strictEqual( ttf.$element.closest( '#qunit-fixture' ).length, 1, 'The constructor put the element into the container.' );
	} );

	QUnit.test( 'Set method', 1, function ( assert ) {
		var $container = $( '#qunit-fixture' ).empty(),
			$element = $( '<div>' ).appendTo( $container ),
			text = ( new Array( 500 ) ).join( 'a' ),
			ttf = new mw.mmv.ui.TruncatableTextField( $container, $element );

		ttf.htmlUtils.htmlToTextWithLinks = function ( value ) { return value; };
		ttf.shrink = $.noop;
		ttf.set( text );

		assert.strictEqual( $container.text(), text, 'Text is set accurately.' );
	} );

	QUnit.test( 'setTitle()', 4, function ( assert ) {
		var $container = $( '#qunit-fixture' ).empty(),
			$element = $( '<div>' ).appendTo( $container ),
			text = ( new Array( 500 ) ).join( 'a' ),
			normalTitle = 'normal',
			truncatedTitle = 'truncated',
			ttf = new mw.mmv.ui.TruncatableTextField( $container, $element );

		ttf.htmlUtils.htmlToTextWithLinks = function ( value ) { return value; };
		ttf.set( text );
		ttf.setTitle( normalTitle, truncatedTitle );

		assert.strictEqual( $element.attr( 'original-title' ), truncatedTitle, 'Title is set accurately.' );
		ttf.grow();
		assert.strictEqual( $element.attr( 'original-title' ), normalTitle, 'Title is set accurately.' );

		ttf.set( '.' );

		ttf.shrink();
		assert.strictEqual( $element.attr( 'original-title' ), normalTitle, 'Title is set accurately.' );
		ttf.grow();
		assert.strictEqual( $element.attr( 'original-title' ), normalTitle, 'Title is set accurately.' );
	} );

	QUnit.test( 'Truncate method', 1, function ( assert ) {
		var $truncatedElement,
			$container = $( '#qunit-fixture' ).empty(),
			$element = $( '<div>' ).appendTo( $container ),
			textOne = ( new Array( 50 ) ).join( 'a' ),
			textTwo = ( new Array( 100 ) ).join( 'b' ),
			ttf = new mw.mmv.ui.TruncatableTextField( $container, $element );

		$element.append(
			$( '<span>' ).text( textOne ),
			$( '<span>' ).text( textTwo )
		);

		// We only want to test the element exclusion here
		ttf.truncateText = function () { return ''; };

		$truncatedElement = ttf.truncate( $element.get( 0 ), ttf.max, false );

		assert.strictEqual( $truncatedElement.text(), textOne, 'The too-long element is excluded.' );
	} );

	QUnit.test( 'Truncate method', 2, function ( assert ) {
		var $truncatedElement,
			$container = $( '#qunit-fixture' ).empty(),
			$element = $( '<div>' ).appendTo( $container ),
			textOne = ( new Array( 5 ) ).join( 'a' ),
			textTwo = ( new Array( 5 ) ).join( 'b' ),
			textThree = ( new Array( 5 ) ).join( 'c' ),
			textFour = ( new Array( 5 ) ).join( 'd' ),
			textFive = ( new Array( 100 ) ).join( 'e' ),
			textFiveTruncated = ( new Array( 85 ) ).join( 'e' ),
			textSix = ( new Array( 100 ) ).join( 'f' ),
			ttf = new mw.mmv.ui.TruncatableTextField( $container, $element );

		$element.append(
			$( '<span>' )
				.append(
					textOne,
					$( '<span>' ).text( textTwo )
						.append(
							$( '<span>' ).text( textThree ),
							$( '<span>' ).text( textFour )
						),
					$( '<span>' ).text( textFive ),
					textSix
				)
		);

		$truncatedElement = ttf.truncate( $element.get( 0 ), ttf.max, false );

		assert.strictEqual( $truncatedElement.text().length, ttf.max, 'Correctly truncated to max length' );

		assert.strictEqual(
			$truncatedElement.text(),
				textOne + textTwo + textThree + textFour + textFiveTruncated,
				'Markup truncated correctly.' );
	} );

	QUnit.test( 'Truncate method for text', 2, function ( assert ) {
		var $container = $( '#qunit-fixture' ).empty(),
			$element = $( '<div>' ).appendTo( $container ),
			text = ( new Array( 500 ) ).join( 'a' ),
			ttf = new mw.mmv.ui.TruncatableTextField( $container, $element ),
			newText = ttf.truncateText( text, ttf.max );

		assert.strictEqual( newText.length, 100, 'Text is the right length.' );
		assert.strictEqual( newText, ( new Array( 101 ) ).join( 'a' ), 'Text has the right content.' );
	} );

	QUnit.test( 'Different max length - text truncation', 2, function ( assert ) {
		var $container = $( '#qunit-fixture' ).empty(),
			$element = $( '<div>' ).appendTo( $container ),
			text = ( new Array( 500 ) ).join( 'a' ),
			ttf = new mw.mmv.ui.TruncatableTextField( $container, $element, { max: 200 } ),
			newText = ttf.truncateText( text, ttf.max );

		assert.strictEqual( newText.length, 200, 'Text is the right length.' );
		assert.strictEqual( newText, ( new Array( 201 ) ).join( 'a' ), 'Text has the right content.' );
	} );

	QUnit.test( 'Different max length - DOM truncation', 1, function ( assert ) {
		var $truncatedElement,
			$container = $( '#qunit-fixture' ).empty(),
			$element = $( '<div>' ).appendTo( $container ),
			textOne = ( new Array( 150 ) ).join( 'a' ),
			textTwo = ( new Array( 100 ) ).join( 'b' ),
			ttf = new mw.mmv.ui.TruncatableTextField( $container, $element, { max: 200 } );

		$element.append(
			$( '<span>' ).text( textOne ),
			$( '<span>' ).text( textTwo )
		);

		// We only want to test the element exclusion here
		ttf.truncateText = function () { return ''; };
		$truncatedElement = ttf.truncate( $element.get( 0 ), ttf.max, false );

		assert.strictEqual( $truncatedElement.text(), textOne, 'The too-long element is removed.' );
	} );

	QUnit.test( 'Changing style for slightly too-long elements', 6, function ( assert ) {
		var $container = $( '#qunit-fixture' ).empty(),
			$element = $( '<div>' ).appendTo( $container ).text( ( new Array( 500 ) ).join( 'a' ) ),
			ttf = new mw.mmv.ui.TruncatableTextField( $container, $element );

		ttf.changeStyle();
		assert.ok( ttf.$element.hasClass( 'mw-mmv-reduce-toolong' ), 'Reduce class set on too-long text.' );
		assert.ok( ttf.$element.hasClass( 'mw-mmv-truncate-toolong' ), 'Truncate class set on too-long text.' );
		ttf.$element.text( 'a' );
		ttf.changeStyle();
		assert.ok( !ttf.$element.hasClass( 'mw-mmv-reduce-toolong' ), 'Reduce class unset on too-long text.' );
		assert.ok( !ttf.$element.hasClass( 'mw-mmv-truncate-toolong' ), 'Truncate class unset on too-long text.' );
		ttf.$element.text( ( new Array( 90 ) ).join( 'a' ) );
		ttf.changeStyle();
		assert.ok( ttf.$element.hasClass( 'mw-mmv-reduce-toolong' ), 'Reduce class set on slightly long text.' );
		assert.ok( !ttf.$element.hasClass( 'mw-mmv-truncate-toolong' ), 'Truncate class unset on slightly long text.' );
	} );

	QUnit.test( 'Shrink/grow', 10, function ( assert ) {
		var $container = $( '#qunit-fixture' ).empty(),
			$element = $( '<div>' ).appendTo( $container ),
			textOne = ( new Array( 50 ) ).join( 'a' ),
			textTwo = ( new Array( 100 ) ).join( 'b' ),
			ttf = new mw.mmv.ui.TruncatableTextField( $container, $element );

		ttf.max = 50;

		ttf.set( '<a>' + textOne + '</a><a>' + textTwo + '</a>' ); // calls shrink
		assert.strictEqual( $element.text(), textOne + '…', 'The too-long element is excluded.' );
		assert.ok( ttf.truncated, 'State flag is correct.' );

		ttf.grow();
		assert.strictEqual( $element.text(), textOne + textTwo, 'The full text is readable after calling grow().' );
		assert.ok( !ttf.truncated, 'State flag is correct.' );

		ttf.grow();
		assert.strictEqual( $element.text(), textOne + textTwo, 'grow() is idempotent.' );
		assert.ok( !ttf.truncated, 'State flag is correct.' );

		ttf.shrink();
		assert.strictEqual( $element.text(), textOne + '…', 'The text is shortened again after calling shrink().' );
		assert.ok( ttf.truncated, 'State flag is correct.' );

		ttf.shrink();
		assert.strictEqual( $element.text(), textOne + '…', 'shrink() is idempotent.' );
		assert.ok( ttf.truncated, 'State flag is correct.' );
	} );

	QUnit.test( 'Shrink/grow noop', 2, function ( assert ) {
		var $container = $( '#qunit-fixture' ).empty(),
			$element = $( '<div>' ).appendTo( $container ),
			textOne = ( new Array( 5 ) ).join( 'a' ),
			textTwo = ( new Array( 10 ) ).join( 'b' ),
			ttf = new mw.mmv.ui.TruncatableTextField( $container, $element );

		ttf.max = 50;

		ttf.set( '<a>' + textOne + '</a><a>' + textTwo + '</a>' ); // calls shrink
		assert.strictEqual( $element.text(), textOne + textTwo, 'Text is intact.' );
		assert.ok( !ttf.truncated, 'State flag is correct.' );
	} );
}( mediaWiki, jQuery ) );
