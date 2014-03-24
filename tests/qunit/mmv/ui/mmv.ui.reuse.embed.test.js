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

	QUnit.test( 'Sanity test, object creation and UI construction', 9, function ( assert ) {
		var embed = new mw.mmv.ui.reuse.Embed( $qf );

		assert.ok( embed, 'Embed UI element is created.' );
		assert.strictEqual( embed.$pane.length, 1, 'Pane div is created.' );
		assert.ok( embed.embedTextHtml, 'Html snipped text area created.' );
		assert.ok( embed.embedTextWikitext, 'Wikitext snipped text area created.' );
		assert.ok( embed.embedSwitch, 'Snipped selection buttons created.' );
		assert.ok( embed.embedWtSizeSwitch, 'Size selection menu for wikitext created.' );
		assert.ok( embed.embedHtmlSizeSwitch, 'Size selection menu for html created.' );
		assert.strictEqual( embed.$currentMainEmbedText.length, 1, 'Size selection menu for html created.' );
		assert.ok( embed.currentSizeMenu, 'Size selection menu for html created.' );
	} );

	QUnit.test( 'changeSize(): Skip if no item selected.', 0, function ( assert ) {
		var embed = new mw.mmv.ui.reuse.Embed( $qf ),
		width = 10,
		height = 20;

		// deselect items
		embed.embedSwitch.selectItem();

		embed.setThumbnailURL = function() {
			assert.ok( false, 'No item selected, this should not have been called.' );
		};
		embed.updateWtEmbedText = function() {
			assert.ok( false, 'No item selected, this should not have been called.' );
		};

		embed.changeSize( width, height );
	} );

	QUnit.test( 'changeSize(): HTML size menu item selected.', 4, function ( assert ) {
		var embed = new mw.mmv.ui.reuse.Embed( $qf ),
		width = 10,
		height = 20;

		embed.embedSwitch.getSelectedItem = function() {
			return { getData: function() { return 'html'; } };
		};
		embed.setThumbnailURL = function( thumb, w, h ) {
			assert.strictEqual( thumb.url, undefined, 'Empty thumbnail passed.' );
			assert.strictEqual( w, width, 'Correct width passed.' );
			assert.strictEqual( h, height, 'Correct height passed.' );
		};
		embed.updateWtEmbedText = function () {
			assert.ok( false, 'Dealing with HTML menu, this should not have been called.' );
		};
		embed.select = function( ) {
			assert.ok( true, 'Item selected after update.' );
		};

		embed.changeSize( width, height );
	} );

	QUnit.test( 'changeSize(): Wikitext size menu item selected.', 2, function ( assert ) {
		var embed = new mw.mmv.ui.reuse.Embed( $qf ),
		width = 10,
		height = 20;

		embed.embedSwitch.getSelectedItem = function() {
			return { getData: function() { return 'wt'; } };
		};
		embed.setThumbnailURL = function() {
			assert.ok( false, 'Dealing with wikitext menu, this should not have been called.' );
		};
		embed.updateWtEmbedText = function( w ) {
			assert.strictEqual( w, width, 'Correct width passed.' );
		};
		embed.select = function( ) {
			assert.ok( true, 'Item selected after update.' );
		};

		embed.changeSize( width, height );
	} );

	QUnit.test( 'setThumbnailURL(): Do nothing if set() not called before.', 0, function ( assert ) {
		var embed = new mw.mmv.ui.reuse.Embed( $qf ),
		width = 10,
		height = 20;

		embed.formatter.getThumbnailHtml = function() {
			assert.ok( false, 'formatter.getThumbnailHtml() should not have been called.' );
		};
		embed.setThumbnailURL( {}, width, height );
	} );

	QUnit.test( 'setThumbnailURL():', 6, function ( assert ) {
		var embed = new mw.mmv.ui.reuse.Embed( $qf ),
		title = mw.Title.newFromText( 'File:Foobar.jpg' ),
		src = 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg',
		url = 'https://commons.wikimedia.org/wiki/File:Foobar.jpg',
		thumbUrl = 'https://upload.wikimedia.org/wikipedia/thumb/Foobar.jpg',
		embedFileInfo = new mw.mmv.model.EmbedFileInfo( title, src, url ),
		width = 10,
		height = 20;

		embed.set( { width: width, height: height }, embedFileInfo );

		// Small image, no thumbnail info is passed
		embed.formatter.getThumbnailHtml = function( info, url, w, h ) {
			assert.strictEqual( info, embedFileInfo, 'Info passed correctly.' );
			assert.strictEqual( url, src, 'Image src passed correctly.' );
			assert.strictEqual( w, width, 'Correct width passed.' );
			assert.strictEqual( h, height, 'Correct height passed.' );
		};
		embed.setThumbnailURL( {}, width, height );

		// Small image, thumbnail info present
		embed.formatter.getThumbnailHtml = function( info, url ) {
			assert.strictEqual( url, thumbUrl, 'Image src passed correctly.' );
		};
		embed.setThumbnailURL( { url: thumbUrl }, width, height );

		// Big image, thumbnail info present
		embed.formatter.getThumbnailHtml = function( info, url ) {
			assert.strictEqual( url, src, 'Image src passed correctly.' );
		};
		width = 1300;
		embed.setThumbnailURL( { url: thumbUrl }, width, height );
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
					html: {
						small: { width: 193, height: 145 },
						medium: { width: 640, height: 480 },
						large: { width: 1200, height: 900 },
						original: { width: 2048, height: 1536 }
					},
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
					html: {
						small: { width: 19, height: 145 },
						medium: { width: 63, height: 480 },
						large: { width: 118, height: 900 },
						original: { width: 201, height: 1536 }
					},
					wikitext: {}
				}
			},

			// Very small image
			{
				width: 15, height: 20,
				expected: {
					html: {
						original: { width: 15, height: 20 }
					},
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

	QUnit.test( 'set():', 6, function ( assert ) {
		var embed = new mw.mmv.ui.reuse.Embed( $qf ),
		title = mw.Title.newFromText( 'File:Foobar.jpg' ),
		src = 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg',
		url = 'https://commons.wikimedia.org/wiki/File:Foobar.jpg',
		embedFileInfo = new mw.mmv.model.EmbedFileInfo( title, src, url ),
		width = 15,
		height = 20;

		QUnit.stop();

		embed.updateMenuOptions = function( sizes, options ) {
			assert.strictEqual( options.length, 4, 'Options passed correctly.' );
		};
		embed.getThumbnailUrlPromise = function () {
			return $.Deferred().resolve().promise();
		};
		embed.setThumbnailURL = function () {
			assert.ok( true, 'setThumbnailURL() is called after data is collected.' );
		};
		embed.select = function () {
			assert.ok( true, 'select() is called after data is collected.' );
			QUnit.start();
		};

		assert.ok( !embed.embedFileInfo, 'embedFileInfo not set yet.' );

		embed.set( { width: width, height: height }, embedFileInfo );

		assert.ok( embed.embedFileInfo, 'embedFileInfo correctly set.' );
	} );

	QUnit.test( 'updateMenuOptions():', 6, function ( assert ) {
		var embed = new mw.mmv.ui.reuse.Embed( $qf ),
		options = embed.embedHtmlSizeSwitch.getMenu().getItems(),
		width = 700,
		height = 500,
		sizes = embed.getSizeOptions( width, height ),
		oldMessage = mw.message;

		mw.message = function( messageKey ) {
			assert.ok( messageKey.match(/^multimediaviewer-(small|medium|original|embed-dimensions)/), 'messageKey passed correctly.' );

			return { text: $.noop };
		};

		embed.updateMenuOptions( sizes.html, options );

		mw.message = oldMessage;
	} );

	QUnit.test( 'empty():', 6, function ( assert ) {
		var embed = new mw.mmv.ui.reuse.Embed( $qf ),
		title = mw.Title.newFromText( 'File:Foobar.jpg' ),
		src = 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg',
		url = 'https://commons.wikimedia.org/wiki/File:Foobar.jpg',
		embedFileInfo = new mw.mmv.model.EmbedFileInfo( title, src, url ),
		width = 15,
		height = 20;

		embed.set( { width: width, height: height }, embedFileInfo );
		embed.setThumbnailURL( {}, width, height );
		embed.updateWtEmbedText( width );

		assert.notStrictEqual( embed.embedTextHtml.getValue(), '', 'embedTextHtml is not empty.' );
		assert.notStrictEqual( embed.embedTextWikitext.getValue(), '', 'embedTextWikitext is not empty.' );

		embed.empty();

		assert.strictEqual( embed.embedTextHtml.getValue(), '', 'embedTextHtml is empty.' );
		assert.strictEqual( embed.embedTextWikitext.getValue(), '', 'embedTextWikitext is empty.' );
		assert.ok( ! embed.embedHtmlSizeSwitch.getMenu().isVisible(), 'Html size menu should be hidden.' );
		assert.ok( ! embed.embedWtSizeSwitch.getMenu().isVisible(), 'Wikitext size menu should be hidden.' );
	} );

	QUnit.test( 'attach()/unattach():', 5, function ( assert ) {
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
		embed.handleTypeSwitch = function() {
			assert.ok( false, 'handleTypeSwitch should not have been called.' );
		};
		embed.handleSizeSwitch = function() {
			assert.ok( false, 'handleTypeSwitch should not have been called.' );
		};

		// Triggering action events before attaching should do nothing
		embed.embedTextHtml.$element.focus();
		embed.embedTextWikitext.$element.focus();
		embed.embedSwitch.emit( 'select' );
		embed.embedHtmlSizeSwitch.getMenu().emit(
			'select', embed.embedHtmlSizeSwitch.getMenu().getSelectedItem() );
		embed.embedWtSizeSwitch.getMenu().emit(
			'select', embed.embedWtSizeSwitch.getMenu().getSelectedItem() );

		embed.selectAllOnEvent = function() {
			assert.ok( true, 'selectAllOnEvent was called.' );
		};
		embed.handleTypeSwitch = function() {
			assert.ok( true, 'handleTypeSwitch was called.' );
		};
		embed.handleSizeSwitch = function() {
			assert.ok( true, 'handleTypeSwitch was called.' );
		};

		embed.attach();

		// Action events should be handled now
		embed.embedTextHtml.$element.focus();
		embed.embedTextWikitext.$element.focus();
		embed.embedSwitch.emit( 'select' );
		embed.embedHtmlSizeSwitch.getMenu().emit(
			'select', embed.embedHtmlSizeSwitch.getMenu().getSelectedItem() );
		embed.embedWtSizeSwitch.getMenu().emit(
			'select', embed.embedWtSizeSwitch.getMenu().getSelectedItem() );

		// Test the unattach part
		embed.selectAllOnEvent = function() {
			assert.ok( false, 'selectAllOnEvent should not have been called.' );
		};
		embed.handleTypeSwitch = function() {
			assert.ok( false, 'handleTypeSwitch should not have been called.' );
		};
		embed.handleSizeSwitch = function() {
			assert.ok( false, 'handleTypeSwitch should not have been called.' );
		};

		embed.unattach();

		// Triggering action events now that we are unattached should do nothing
		embed.embedTextHtml.$element.focus();
		embed.embedTextWikitext.$element.focus();
		embed.embedSwitch.emit( 'select' );
		embed.embedHtmlSizeSwitch.getMenu().emit(
			'select', embed.embedHtmlSizeSwitch.getMenu().getSelectedItem() );
		embed.embedWtSizeSwitch.getMenu().emit(
			'select', embed.embedWtSizeSwitch.getMenu().getSelectedItem() );
	} );

	QUnit.test( 'handleTypeSwitch():', 2, function ( assert ) {
		var embed = new mw.mmv.ui.reuse.Embed( $qf );

		// HTML selected
		embed.handleTypeSwitch( { getData: function() { return 'html'; } } );

		assert.ok( ! embed.embedWtSizeSwitch.getMenu().isVisible(), 'Wikitext size menu should be hidden.' );

		// Wikitext selected
		embed.handleTypeSwitch( { getData: function() { return 'wt'; } } );

		assert.ok( ! embed.embedHtmlSizeSwitch.getMenu().isVisible(), 'HTML size menu should be hidden.' );
	} );

}( mediaWiki, jQuery ) );
