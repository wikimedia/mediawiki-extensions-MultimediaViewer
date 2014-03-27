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
		ttf.shrink = function () {};
		ttf.set( text );

		assert.strictEqual( $container.text(), text, 'Text is set accurately.' );
	} );

	QUnit.test( 'Truncate method', 1, function ( assert ) {
		var $container = $( '#qunit-fixture' ).empty(),
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
		ttf.truncate( $element.get( 0 ), ttf.max, false );

		assert.strictEqual( $container.text(), textOne, 'The too-long element is excluded.' );
	} );

	QUnit.test( 'Truncate method', 2, function ( assert ) {
		var $container = $( '#qunit-fixture' ).empty(),
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

		ttf.truncate( $element.get( 0 ), ttf.max, false );

		assert.strictEqual( $container.text().length, ttf.max, 'Correctly truncated to max length' );

		assert.strictEqual(
				$container.text(),
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

	QUnit.test( 'Shrink method', 2, function ( assert ) {
		var $container = $( '#qunit-fixture' ).empty(),
			$element = $( '<div>' ).appendTo( $container ),
			ttf = new mw.mmv.ui.TruncatableTextField( $container, $element );

		ttf.truncate = function ( ele, max, ell ) {
			assert.strictEqual( max, ttf.max, 'Max length is passed in right' );
			assert.strictEqual( ell, true, 'Ellipses are enabled on the first call' );
		};

		ttf.shrink();
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
		var $container = $( '#qunit-fixture' ).empty(),
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
		ttf.truncate( $element.get( 0 ), ttf.max, false );

		assert.strictEqual( $container.text(), textOne, 'The too-long element is removed.' );
	} );

	QUnit.test( 'Changing style for slightly too-long elements', 3, function ( assert ) {
		var $container = $( '#qunit-fixture' ).empty(),
			$element = $( '<div>' ).appendTo( $container ).text( ( new Array( 500 ) ).join( 'a' ) ),
			ttf = new mw.mmv.ui.TruncatableTextField( $container, $element );

		ttf.changeStyle();
		assert.ok( ttf.$element.hasClass( 'mw-mmv-truncate-toolong' ), 'Class set on too-long text.' );
		ttf.$element.text( 'a' );
		ttf.changeStyle();
		assert.ok( !ttf.$element.hasClass( 'mw-mmv-truncate-toolong' ), 'Class unset on short text.' );
		ttf.$element.text( ( new Array( 300 ) ).join( 'a' ) );
		ttf.changeStyle();
		assert.ok( ttf.$element.hasClass( 'mw-mmv-truncate-toolong' ), 'Class re-set on too-long text.' );
	} );
}( mediaWiki, jQuery ) );
