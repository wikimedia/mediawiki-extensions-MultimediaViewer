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
	var $qf = $( '#qunit-fixture' );

	QUnit.module( 'mmv.ui.reuse.Embed', QUnit.newMwEnvironment() );

	QUnit.test( 'Sanity test, object creation and UI construction', 6, function ( assert ) {
		var embed = new mw.mmv.ui.reuse.Embed( $qf );

		assert.ok( embed, 'Embed UI element is created.' );
		assert.strictEqual( embed.$pane.length, 1, 'Pane div is created.' );
		assert.ok( embed.embedTextWikitext, 'Wikitext snipped text area created.' );
		assert.ok( embed.embedWtSizeSwitch, 'Size selection menu for wikitext created.' );
		assert.strictEqual( embed.$currentMainEmbedText.length, 1, 'Size selection menu for html created.' );
		assert.ok( embed.currentSizeMenu, 'Size selection menu for html created.' );
	} );

	QUnit.test( 'changeSize(): Wikitext size menu item selected.', 2, function ( assert ) {
		var embed = new mw.mmv.ui.reuse.Embed( $qf ),
		width = 10,
		height = 20;

		embed.updateWtEmbedText = function( w ) {
			assert.strictEqual( w, width, 'Correct width passed.' );
		};
		embed.select = function( ) {
			assert.ok( true, 'Item selected after update.' );
		};

		embed.changeSize( width, height );
	} );

	QUnit.test( 'updateWtEmbedText(): Do nothing if set() not called before.', 0, function ( assert ) {
		var embed = new mw.mmv.ui.reuse.Embed( $qf ),
		width = 10;

		embed.formatter.getThumbnailWikitext = function() {
			assert.ok( false, 'formatter.getThumbnailWikitext() should not have been called.');
		};
		embed.updateWtEmbedText( width );
	} );

	QUnit.test( 'updateWtEmbedText():', 3, function ( assert ) {
		var embed = new mw.mmv.ui.reuse.Embed( $qf ),
		title = mw.Title.newFromText( 'File:Foobar.jpg' ),
		src = 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg',
		url = 'https://commons.wikimedia.org/wiki/File:Foobar.jpg',
		embedFileInfo = new mw.mmv.model.EmbedFileInfo( title, src, url ),
		width = 10,
		height = 20;

		embed.set( { width: width, height: height }, embedFileInfo );

		embed.formatter.getThumbnailWikitext = function( t, w, c ) {
			assert.strictEqual( t, title, 'Title passed correctly.');
			assert.strictEqual( w, width, 'Width passed correctly.');
			assert.strictEqual( c, title.getNameText(), 'Caption passed correctly.');
		};
		embed.updateWtEmbedText( width );
	} );

	QUnit.test( 'Size options are correct', 3, function ( assert ) {
		var embed = new mw.mmv.ui.reuse.Embed( $qf ),
		exampleSizes = [
			// Big wide image
			{
				width: 2048, height: 1536,
				expected: {
					wikitext: {
						small: { width: 300, height: 225 },
						medium: { width: 400, height: 300 },
						large: { width: 500, height: 375 }
					}
				}
			},

			// Big tall image
			{
				width: 201, height: 1536,
				expected: {
					wikitext: {}
				}
			},

			// Very small image
			{
				width: 15, height: 20,
				expected: {
					wikitext: {}
				}
			}
		],
		i, cursize, opts;
		for ( i = 0; i < exampleSizes.length; i++ ) {
			cursize = exampleSizes[i];
			opts = embed.getSizeOptions( cursize.width, cursize.height );
			assert.deepEqual( opts, cursize.expected, 'We got the expected results out of the size calculation function.' );
		}
	} );

	QUnit.test( 'set():', 3, function ( assert ) {
		var embed = new mw.mmv.ui.reuse.Embed( $qf ),
		title = mw.Title.newFromText( 'File:Foobar.jpg' ),
		src = 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg',
		url = 'https://commons.wikimedia.org/wiki/File:Foobar.jpg',
		embedFileInfo = new mw.mmv.model.EmbedFileInfo( title, src, url ),
		width = 15,
		height = 20;

		embed.updateMenuOptions = function( sizes, options ) {
			assert.strictEqual( options.length, 4, 'Options passed correctly.' );
		};

		assert.ok( !embed.embedFileInfo, 'embedFileInfo not set yet.' );

		embed.set( { width: width, height: height }, embedFileInfo );

		assert.ok( embed.embedFileInfo, 'embedFileInfo correctly set.' );
	} );

	QUnit.test( 'updateMenuOptions():', 3, function ( assert ) {
		var embed = new mw.mmv.ui.reuse.Embed( $qf ),
		options = embed.embedWtSizeSwitch.getMenu().getItems(),
		width = 700,
		height = 500,
		sizes = embed.getSizeOptions( width, height ),
		oldMessage = mw.message;

		mw.message = function( messageKey ) {
			assert.ok( messageKey.match(/^multimediaviewer-(small|medium|large)/), 'messageKey passed correctly.' );

			return { text: $.noop };
		};

		embed.updateMenuOptions( sizes.wikitext, options );

		mw.message = oldMessage;
	} );

	QUnit.test( 'empty():', 3, function ( assert ) {
		var embed = new mw.mmv.ui.reuse.Embed( $qf ),
		title = mw.Title.newFromText( 'File:Foobar.jpg' ),
		src = 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg',
		url = 'https://commons.wikimedia.org/wiki/File:Foobar.jpg',
		embedFileInfo = new mw.mmv.model.EmbedFileInfo( title, src, url ),
		width = 15,
		height = 20;

		embed.set( { width: width, height: height }, embedFileInfo );
		embed.updateWtEmbedText( width );

		assert.notStrictEqual( embed.embedTextWikitext.getValue(), '', 'embedTextWikitext is not empty.' );

		embed.empty();

		assert.strictEqual( embed.embedTextWikitext.getValue(), '', 'embedTextWikitext is empty.' );
		assert.ok( ! embed.embedWtSizeSwitch.getMenu().isVisible(), 'Wikitext size menu should be hidden.' );
	} );

	QUnit.test( 'attach()/unattach():', 2, function ( assert ) {
		var embed = new mw.mmv.ui.reuse.Embed( $qf ),
		title = mw.Title.newFromText( 'File:Foobar.jpg' ),
		src = 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg',
		url = 'https://commons.wikimedia.org/wiki/File:Foobar.jpg',
		embedFileInfo = new mw.mmv.model.EmbedFileInfo( title, src, url ),
		width = 15,
		height = 20;

		embed.set( { width: width, height: height }, embedFileInfo );

		embed.selectAllOnEvent = function() {
			assert.ok( false, 'selectAllOnEvent should not have been called.' );
		};
		embed.handleSizeSwitch = function() {
			assert.ok( false, 'handleTypeSwitch should not have been called.' );
		};

		// Triggering action events before attaching should do nothing
		embed.embedTextWikitext.$element.focus();
		embed.embedWtSizeSwitch.getMenu().emit(
			'select', embed.embedWtSizeSwitch.getMenu().getSelectedItem() );

		embed.selectAllOnEvent = function() {
			assert.ok( true, 'selectAllOnEvent was called.' );
		};
		embed.handleSizeSwitch = function() {
			assert.ok( true, 'handleTypeSwitch was called.' );
		};

		embed.attach();

		// Action events should be handled now
		embed.embedTextWikitext.$element.focus();
		embed.embedWtSizeSwitch.getMenu().emit(
			'select', embed.embedWtSizeSwitch.getMenu().getSelectedItem() );

		// Test the unattach part
		embed.selectAllOnEvent = function() {
			assert.ok( false, 'selectAllOnEvent should not have been called.' );
		};
		embed.handleSizeSwitch = function() {
			assert.ok( false, 'handleTypeSwitch should not have been called.' );
		};

		embed.unattach();

		// Triggering action events now that we are unattached should do nothing
		embed.embedTextWikitext.$element.focus();
		embed.embedWtSizeSwitch.getMenu().emit(
			'select', embed.embedWtSizeSwitch.getMenu().getSelectedItem() );
	} );

}( mediaWiki, jQuery ) );
