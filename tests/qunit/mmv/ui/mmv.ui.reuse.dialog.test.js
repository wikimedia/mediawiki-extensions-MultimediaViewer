/*
 * This file is part of the MediaWiki extension MultimediaViewer.
 *
 * MultimediaViewer is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * MultimediaViewer is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with MultimediaViewer.  If not, see <http://www.gnu.org/licenses/>.
 */

( function ( mw, $ ) {
	function makeReuseDialog() {
		var $fixture = $( '#qunit-fixture' );
		return new mw.mmv.ui.reuse.Dialog( $fixture, $( '<div>' ).appendTo( $fixture ) );
	}

	QUnit.module( 'mmv.ui.reuse.Dialog', QUnit.newMwEnvironment() );

	QUnit.test( 'Sanity test, object creation and UI construction', 4, function ( assert ) {
		var reuseDialog = makeReuseDialog();

		assert.ok( reuseDialog, 'Reuse UI element is created.' );
		assert.strictEqual( reuseDialog.$reuseLink.length, 1, 'Reuse link created.' );
		assert.strictEqual( reuseDialog.$reuseDialog.length, 1, 'Reuse dialog div created.' );
		assert.ok( reuseDialog.reuseTabs, 'Reuse tabs created.' );
	} );

	QUnit.test( 'handleOpenCloseClick():', 2, function ( assert ) {
		var reuseDialog = makeReuseDialog();

		reuseDialog.openDialog = function () {
			assert.ok( true, 'openDialog called.' );
		};
		reuseDialog.closeDialog = function () {
			assert.ok( false, 'closeDialog should not have been called.' );
		};

		// Dialog is closed by default, we should open it
		reuseDialog.handleOpenCloseClick();

		reuseDialog.openDialog = function () {
			assert.ok( false, 'openDialog should not have been called.' );
		};
		reuseDialog.closeDialog = function () {
			assert.ok( true, 'closeDialog called.' );
		};
		reuseDialog.isOpen = true;

		// Dialog open now, we should close it.
		reuseDialog.handleOpenCloseClick();
	} );

	QUnit.test( 'handleTabSelection():', 4, function ( assert ) {
		var reuseDialog = makeReuseDialog();

		reuseDialog.tabs.share.show = function () {
			assert.ok( true, 'Share tab shown.' );
		};
		reuseDialog.tabs.embed.hide = function () {
			assert.ok( true, 'Embed tab hidden.' );
		};

		// Share pane is selected
		reuseDialog.handleTabSelection( { getData: function () { return 'share'; } } );

		reuseDialog.tabs.share.hide = function () {
			assert.ok( true, 'Share tab hidden.' );
		};
		reuseDialog.tabs.embed.show = function () {
			assert.ok( true, 'Embed tab shown.' );
		};

		// Embed pane is selected
		reuseDialog.handleTabSelection( { getData: function () { return 'embed'; } } );
	} );

	QUnit.test( 'attach()/unattach():', 2, function ( assert ) {
		var reuseDialog = makeReuseDialog();

		reuseDialog.handleOpenCloseClick = function() {
			assert.ok( false, 'handleOpenCloseClick should not have been called.' );
		};
		reuseDialog.handleTabSelection = function() {
			assert.ok( false, 'handleTabSelection should not have been called.' );
		};

		// Triggering action events before attaching should do nothing
		reuseDialog.$reuseLink.trigger( 'click' );
		reuseDialog.reuseTabs.emit( 'select' );

		reuseDialog.handleOpenCloseClick = function() {
			assert.ok( true, 'handleOpenCloseClick called.' );
		};
		reuseDialog.handleTabSelection = function() {
			assert.ok( true, 'handleTabSelection called.' );
		};

		reuseDialog.attach();

		// Action events should be handled now
		reuseDialog.$reuseLink.trigger( 'click' );
		reuseDialog.reuseTabs.emit( 'select' );

		// Test the unattach part
		reuseDialog.handleOpenCloseClick = function() {
			assert.ok( false, 'handleOpenCloseClick should not have been called.' );
		};
		reuseDialog.handleTabSelection = function() {
			assert.ok( false, 'handleTabSelection should not have been called.' );
		};

		reuseDialog.unattach();

		// Triggering action events now that we are unattached should do nothing
		reuseDialog.$reuseLink.trigger( 'click' );
		reuseDialog.reuseTabs.emit( 'select' );
	} );

	QUnit.test( 'start/stopListeningToOutsideClick():', 11, function ( assert ) {
		var reuseDialog = makeReuseDialog(),
			realCloseDialog = reuseDialog.closeDialog;

		function clickOutsideDialog() {
			var event = new $.Event( 'click', { target: reuseDialog.$container[0] } );
			reuseDialog.$container.trigger( event );
			return event;
		}
		function clickInsideDialog() {
			var event = new $.Event( 'click', { target: reuseDialog.$reuseDialog[0] } );
			reuseDialog.$reuseDialog.trigger( event );
			return event;
		}

		function assertDialogDoesNotCatchClicks() {
			var event;
			reuseDialog.closeDialog = function() { assert.ok( false, 'Dialog is not affected by click' ); };
			event = clickOutsideDialog();
			assert.ok( !event.isDefaultPrevented(), 'Dialog does not affect click' );
			assert.ok( !event.isPropagationStopped(), 'Dialog does not affect click propagation' );
		}
		function assertDialogCatchesOutsideClicksOnly() {
			var event;
			reuseDialog.closeDialog = function() { assert.ok( false, 'Dialog is not affected by inside click' ); };
			event = clickInsideDialog();
			assert.ok( !event.isDefaultPrevented(), 'Dialog does not affect inside click' );
			assert.ok( !event.isPropagationStopped(), 'Dialog does not affect inside click propagation' );
			reuseDialog.closeDialog = function() { assert.ok( true, 'Dialog is closed by outside click' ); };
			event = clickOutsideDialog();
			assert.ok( event.isDefaultPrevented(), 'Dialog catches outside click' );
			assert.ok( event.isPropagationStopped(), 'Dialog stops outside click propagation' );
		}

		assertDialogDoesNotCatchClicks();
		reuseDialog.openDialog();
		assertDialogCatchesOutsideClicksOnly();
		realCloseDialog.call( reuseDialog );
		assertDialogDoesNotCatchClicks();
		reuseDialog.openDialog();
		reuseDialog.unattach();
		assertDialogDoesNotCatchClicks();
	} );

	QUnit.test( 'set()/empty():', 3, function ( assert ) {
		var reuseDialog = makeReuseDialog(),
		title = mw.Title.newFromText( 'File:Foobar.jpg' ),
		src = 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg',
		url = 'https://commons.wikimedia.org/wiki/File:Foobar.jpg',
		image = { // fake mw.mmv.model.Image
			title: title,
			url: src,
			descriptionUrl: url,
			width: 100,
			height: 80
		},
		embedFileInfo = new mw.mmv.model.EmbedFileInfo( title, src, url );

		assert.ok( reuseDialog.$reuseLink.hasClass( 'empty' ), 'Dialog launch link is empty by default.' );

		reuseDialog.set( image, embedFileInfo );

		assert.ok( ! reuseDialog.$reuseLink.hasClass( 'empty' ), 'Dialog launch link is not empty after set().' );

		reuseDialog.empty();

		assert.ok( reuseDialog.$reuseLink.hasClass( 'empty' ), 'Dialog launch link is empty now.' );
	} );

	QUnit.test( 'openDialog()/closeDialog():', 3, function ( assert ) {
		var reuseDialog = makeReuseDialog(),
		title = mw.Title.newFromText( 'File:Foobar.jpg' ),
		src = 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg',
		url = 'https://commons.wikimedia.org/wiki/File:Foobar.jpg',
		image = { // fake mw.mmv.model.Image
			title: title,
			url: src,
			descriptionUrl: url,
			width: 100,
			height: 80
		},
		embedFileInfo = new mw.mmv.model.EmbedFileInfo( title, src, url );

		reuseDialog.set( image, embedFileInfo );

		assert.ok( ! reuseDialog.isOpen, 'Dialog closed by default.' );

		reuseDialog.openDialog();

		assert.ok( reuseDialog.isOpen, 'Dialog open now.' );

		reuseDialog.closeDialog();

		assert.ok( ! reuseDialog.isOpen, 'Dialog closed now.' );
	} );

}( mediaWiki, jQuery ) );
