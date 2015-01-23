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

( function ( mw, $ ) {
	QUnit.module( 'mmv.ui.metadataPanelScroller', QUnit.newMwEnvironment( {
		setup: function () {
			this.clock = this.sandbox.useFakeTimers();
		}
	} ) );

	QUnit.test( 'empty()', 1, function ( assert ) {
		var $qf = $( '#qunit-fixture' ),
			scroller = new mw.mmv.ui.MetadataPanelScroller( $qf, $( '<div>' ).appendTo( $qf ) );

		scroller.empty();
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

		scroller.unattach();
	} );

	QUnit.test( 'No localStorage', 1, function ( assert ) {
		var $qf = $( '#qunit-fixture' ),
			scroller = new mw.mmv.ui.MetadataPanelScroller( $qf, $( '<div>' ).appendTo( $qf ) );

		this.sandbox.stub( $, 'scrollTo', function () { return { scrollTop: function () { return 10; } }; } );

		scroller.scroll();

		assert.strictEqual( scroller.hasOpenedMetadata, true, 'We store hasOpenedMetadata flag for the session' );
	} );

	QUnit.test( 'localStorage is full', 2, function ( assert ) {
		var $qf = $( '#qunit-fixture' ),
			localStorage = { getItem: $.noop, setItem: this.sandbox.stub().throwsException( 'I am full' ) },
			scroller = new mw.mmv.ui.MetadataPanelScroller( $qf, $( '<div>' ).appendTo( $qf ), localStorage );

		this.sandbox.stub( $, 'scrollTo', function () { return {
			scrollTop: function () { return 10; },
			on: $.noop,
			off: $.noop
		}; } );

		scroller.attach();

		scroller.scroll();

		assert.strictEqual( scroller.hasOpenedMetadata, true, 'We store hasOpenedMetadata flag for the session' );

		scroller.scroll();

		assert.ok( localStorage.setItem.calledOnce, 'localStorage only written once' );

		scroller.unattach();
	} );

	/**
	 * We need to set up a proxy on the jQuery scrollTop function and the jQuery.scrollTo plugin,
	 * that will let us pretend that the document really scrolled and that will return values
	 * as if the scroll happened.
	 * @param {sinon.sandbox} sandbox
	 * @param {mw.mmv.ui.MetadataPanelScroller} scroller
	 */
	function stubScrollFunctions( sandbox, scroller ) {
		var memorizedScrollToScroll = 0,
			originalJQueryScrollTop = $.fn.scrollTop,
			originalJQueryScrollTo = $.scrollTo;

		sandbox.stub( $.fn, 'scrollTop', function ( scrollTop ) {
			// On some browsers $.scrollTo() != $document
			if ( $.scrollTo().is( this ) ) {
				if ( scrollTop !== undefined ) {
					memorizedScrollToScroll = scrollTop;
					return this;
				} else {
					return memorizedScrollToScroll;
				}
			}

			return originalJQueryScrollTop.call( this, scrollTop );
		} );

		sandbox.stub( $, 'scrollTo', function ( scrollTo ) {
			var $element;

			if ( scrollTo !== undefined ) {
				memorizedScrollToScroll = scrollTo;
			}

			$element = originalJQueryScrollTo.call( this, scrollTo, 0 );

			if ( scrollTo !== undefined ) {
				// Trigger event manually
				scroller.scroll();
			}

			return $element;
		} );
	}

	QUnit.test( 'Metadata scrolling', 6, function ( assert ) {
		var $qf = $( '#qunit-fixture' ),
			$container = $( '<div>' ).css( 'height', 100 ).appendTo( $qf ),
			$aboveFold = $( '<div>' ).css( 'height', 50 ).appendTo( $container ),
			fakeLocalStorage = { getItem: $.noop, setItem: $.noop },
			scroller = new mw.mmv.ui.MetadataPanelScroller( $container, $aboveFold, fakeLocalStorage ),
			keydown = $.Event( 'keydown' );

		stubScrollFunctions( this.sandbox, scroller );

		this.sandbox.stub( fakeLocalStorage, 'setItem' );

		// First phase of the test: up and down arrows

		scroller.hasAnimatedMetadata = false;

		scroller.attach();

		assert.strictEqual( $.scrollTo().scrollTop(), 0, 'scrollTo scrollTop should be set to 0' );

		assert.ok( !fakeLocalStorage.setItem.called, 'The metadata hasn\'t been open yet, no entry in localStorage' );

		keydown.which = 38; // Up arrow
		scroller.keydown( keydown );
		this.clock.tick( scroller.toggleScrollDuration );

		assert.ok( fakeLocalStorage.setItem.calledWithExactly( 'mmv.hasOpenedMetadata', true ), 'localStorage knows that the metadata has been open' );

		keydown.which = 40; // Down arrow
		scroller.keydown( keydown );
		this.clock.tick( scroller.toggleScrollDuration );

		assert.strictEqual( $.scrollTo().scrollTop(), 0,
			'scrollTo scrollTop should be set to 0 after pressing down arrow' );

		// Unattach lightbox from document
		scroller.unattach();


		// Second phase of the test: scroll memory

		scroller.attach();

		// To make sure that the details are out of view, the lightbox is supposed to scroll to the top when open
		assert.strictEqual( $.scrollTo().scrollTop(), 0, 'Page scrollTop should be set to 0' );

		// Scroll down to check that the scrollTop memory doesn't affect prev/next (bug 59861)
		$.scrollTo( 20, 0 );
		this.clock.tick( 100 );

		// This extra attach() call simulates the effect of prev/next seen in bug 59861
		scroller.attach();

		// The lightbox was already open at this point, the scrollTop should be left untouched
		assert.strictEqual( $.scrollTo().scrollTop(), 20, 'Page scrollTop should be set to 20' );

		scroller.unattach();
	} );

	QUnit.test( 'Metadata scroll logging', 4, function ( assert ) {
		var $qf = $( '#qunit-fixture' ),
			$container = $( '<div>' ).css( 'height', 100 ).appendTo( $qf ),
			$aboveFold = $( '<div>' ).css( 'height', 50 ).appendTo( $container ),
			scroller = new mw.mmv.ui.MetadataPanelScroller( $container, $aboveFold ),
			keydown = $.Event( 'keydown' );

		stubScrollFunctions( this.sandbox, scroller );

		this.sandbox.stub( mw.mmv.actionLogger, 'log' );

		keydown.which = 38; // Up arrow
		scroller.keydown( keydown );
		this.clock.tick( scroller.toggleScrollDuration );

		assert.ok( mw.mmv.actionLogger.log.calledWithExactly( 'metadata-open' ), 'Opening keypress logged' );
		mw.mmv.actionLogger.log.reset();

		keydown.which = 38; // Up arrow
		scroller.keydown( keydown );
		this.clock.tick( scroller.toggleScrollDuration );

		assert.ok( mw.mmv.actionLogger.log.calledWithExactly( 'metadata-close' ), 'Closing keypress logged' );
		mw.mmv.actionLogger.log.reset();

		keydown.which = 40; // Down arrow
		scroller.keydown( keydown );
		this.clock.tick( scroller.toggleScrollDuration );

		assert.ok( mw.mmv.actionLogger.log.calledWithExactly( 'metadata-open' ), 'Opening keypress logged' );
		mw.mmv.actionLogger.log.reset();

		keydown.which = 40; // Down arrow
		scroller.keydown( keydown );
		this.clock.tick( scroller.toggleScrollDuration );

		assert.ok( mw.mmv.actionLogger.log.calledWithExactly( 'metadata-close' ), 'Closing keypress logged' );
		mw.mmv.actionLogger.log.reset();
	} );
}( mediaWiki, jQuery ) );
