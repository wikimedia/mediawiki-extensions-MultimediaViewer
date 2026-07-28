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

const { MetadataPanelScroller } = require( 'mmv' );

QUnit.module( 'mmv.ui.metadataPanelScroller', QUnit.newMwEnvironment( {
	beforeEach: function () {
		this.clock = this.sandbox.useFakeTimers();
	}
} ) );

/**
 * We need to set up a proxy on the jQuery scrollTop function and the jQuery.scrollTo plugin,
 * that will let us pretend that the document really scrolled and that will return values
 * as if the scroll happened.
 *
 * @param {sinon.sandbox} sandbox
 * @param {MetadataPanelScroller} scroller
 */
function stubScrollFunctions( sandbox, scroller ) {
	let memorizedScrollTop = 0;

	sandbox.stub( $.fn, 'scrollTop', function ( scrollTop ) {
		if ( scrollTop !== undefined ) {
			memorizedScrollTop = scrollTop;
			scroller.scroll();
			return this;
		} else {
			return memorizedScrollTop;
		}
	} );
	sandbox.stub( $.fn, 'animate', function ( props ) {
		if ( 'scrollTop' in props ) {
			memorizedScrollTop = props.scrollTop;
			scroller.scroll();
		}
		return this;
	} );
}

QUnit.test( 'Metadata scrolling', function ( assert ) {
	const $window = $( window );
	const $qf = $( '#qunit-fixture' );
	const $container = $( '<div>' ).css( 'height', 100 ).appendTo( $qf );
	const $aboveFold = $( '<div>' ).css( 'height', 50 ).appendTo( $container );
	const scroller = new MetadataPanelScroller( $container, $aboveFold );
	const keydown = $.Event( 'keydown' );

	stubScrollFunctions( this.sandbox, scroller );

	// First phase of the test: up and down arrows

	scroller.attach();

	assert.strictEqual( $window.scrollTop(), 0, 'scrollTop should be set to 0' );

	keydown.which = 38; // Up arrow
	scroller.keydown( keydown );

	keydown.which = 40; // Down arrow
	scroller.keydown( keydown );

	assert.strictEqual( $window.scrollTop(), 0,
		'scrollTop should be set to 0 after pressing down arrow' );

	// Unattach lightbox from document
	scroller.unattach();

	// Second phase of the test: scroll memory

	scroller.attach();

	// To make sure that the details are out of view, the lightbox is supposed to scroll to the top when open
	assert.strictEqual( $window.scrollTop(), 0, 'Page scrollTop should be set to 0' );

	// Scroll down to check that the scrollTop memory doesn't affect prev/next (bug 59861)
	$window.scrollTop( 20 );
	this.clock.tick( 100 );

	// This extra attach() call simulates the effect of prev/next seen in bug 59861
	scroller.attach();

	// The lightbox was already open at this point, the scrollTop should be left untouched
	assert.strictEqual( $window.scrollTop(), 20, 'Page scrollTop should be set to 20' );

	scroller.unattach();
} );
