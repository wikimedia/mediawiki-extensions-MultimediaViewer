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
	QUnit.module( 'mmv.ui.metadataPanelScroller', QUnit.newMwEnvironment() );

	QUnit.test( 'empty()', 2, function ( assert ) {
		var $qf = $( '#qunit-fixture' ),
			scroller = new mw.mmv.ui.MetadataPanelScroller( $qf, $( '<div>' ).appendTo( $qf ) );

		scroller.empty();
		assert.ok( !scroller.$dragIcon.hasClass( 'pointing-down' ), 'We successfully reset the chevron' );
		assert.ok( !scroller.$container.hasClass( 'invite' ), 'We successfully reset the invite' );
	} );

	QUnit.test( 'Metadata div is only animated once', 5, function ( assert ) {
		var $qf = $( '#qunit-fixture' ),
			displayCount,
			scroller = new mw.mmv.ui.MetadataPanelScroller( $qf, $( '<div>' ).appendTo( $qf ), {
				// We simulate localStorage to avoid test side-effects
				getItem: function () { return displayCount; },
				setItem: function ( _, val ) { displayCount = val; }
			} );

		scroller.attach();

		scroller.animateMetadataOnce();

		assert.ok( scroller.hasAnimatedMetadata,
			'The first call to animateMetadataOnce set hasAnimatedMetadata to true' );
		assert.ok( $qf.hasClass( 'invite' ),
			'The first call to animateMetadataOnce led to an animation' );

		$qf.removeClass( 'invite' );

		scroller.animateMetadataOnce();

		assert.strictEqual( scroller.hasAnimatedMetadata, true, 'The second call to animateMetadataOnce did not change the value of hasAnimatedMetadata' );
		assert.ok( !$qf.hasClass( 'invite' ),
			'The second call to animateMetadataOnce did not lead to an animation' );

		scroller.unattach();

		scroller.attach();

		scroller.animateMetadataOnce();
		assert.ok( $qf.hasClass( 'invite' ),
			'After closing and opening the viewer, the panel is animated again' );
	} );

	QUnit.test( 'No localStorage', 1, function( assert ) {
		var $qf = $( '#qunit-fixture' ),
			scroller = new mw.mmv.ui.MetadataPanelScroller( $qf, $( '<div>' ).appendTo( $qf ) );

		this.sandbox.stub( $, 'scrollTo', function() { return { scrollTop : function() { return 10; } }; } );

		scroller.scroll();

		assert.ok( !scroller.savedHasOpenedMetadata, 'No localStorage, we don\'t try to save the opened flag' );
	} );

	QUnit.test( 'localStorage is full', 1, function( assert ) {
		var $qf = $( '#qunit-fixture' ),
			scroller = new mw.mmv.ui.MetadataPanelScroller( $qf, $( '<div>' ).appendTo( $qf ),
				{ getItem : $.noop, setItem : function() { throw 'I am full'; } } );

		this.sandbox.stub( $, 'scrollTo', function() { return { scrollTop : function() { return 10; } }; } );

		scroller.scroll();

		assert.ok( scroller.savedHasOpenedMetadata, 'Full localStorage, we don\'t try to save the opened flag more than once' );
	} );
}( mediaWiki, jQuery ) );
