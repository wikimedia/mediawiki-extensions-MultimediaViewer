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

const { Download: DownloadPane, Utils } = require( 'mmv.ui.reuse' );
const { ImageModel } = require( 'mmv' );
const { fixtures } = require( '../mmv.testhelpers.js' );

QUnit.module( 'mmv.ui.download.pane', QUnit.newMwEnvironment() );

QUnit.test( 'Sense test, object creation and UI construction', ( assert ) => {
	const download = new DownloadPane( $( '#qunit-fixture' ) );

	assert.true( download instanceof DownloadPane, 'download UI element is created.' );
	assert.strictEqual( download.$downloadButton.length, 1, 'Download button created.' );
	assert.strictEqual( download.$downloadSizeMenu.length, 1, 'Image size pulldown menu created.' );
	assert.strictEqual( download.$downloadSizeMenu.children().length, 5, 'Image size pulldown menu created.' );
	assert.strictEqual( download.$previewLink.length, 1, 'Preview link created.' );

	assert.strictEqual( download.$downloadButton.attr( 'href' ), undefined, 'Button href is empty.' );
	assert.strictEqual( download.$previewLink.attr( 'href' ), undefined, 'Preview link href is empty.' );
} );

QUnit.test( 'set()/empty():', ( assert ) => {
	const download = new DownloadPane( $( '#qunit-fixture' ) );
	const image = new ImageModel(
		new mw.Title( 'File:Foobar.jpg' ),
		fixtures.imageinfoApi.makeBasic( {
			url: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg'
		} )
	);

	assert.strictEqual( download.imageExtension, undefined, 'Image extension is not set.' );

	const updateMenuOptions = Utils.updateMenuOptions;
	Utils.updateMenuOptions = function () {
		assert.true( true, 'Menu options updated.' );
	};

	download.setAttributionText = () => {};
	download.set( image );

	assert.strictEqual( download.imageExtension, 'jpg', 'Image extension is set correctly.' );

	download.empty();

	assert.strictEqual( download.imageExtension, undefined, 'Image extension is not set.' );

	Utils.updateMenuOptions = updateMenuOptions;
} );

QUnit.test( 'handleSizeSwitch():', function ( assert ) {
	const download = new DownloadPane( $( '#qunit-fixture' ) );
	const thumbnailUrl = 'https://upload.wikimedia.org/wikipedia/commons/3/3a/NewFoobar.jpg';
	const originalUrl = 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg';

	download.image = new ImageModel(
		new mw.Title( 'File:Foobar.jpg' ),
		fixtures.imageinfoApi.makeBasic( {
			url: originalUrl,
			thumburls: { 500: { url: thumbnailUrl, width: 500 } }
		} )
	);
	const getThumbnailUrl = this.sandbox.spy( download.image, 'getThumbnailUrl' );

	download.setDownloadUrl = function ( url ) {
		assert.strictEqual( url, thumbnailUrl, 'Thumbnail URL passed to setDownloadUrl for non-original size' );
	};

	// data-width is normally populated by Utils.updateSelectOptions() via set()
	download.$downloadSizeMenu.find( 'option[value="small"]' ).data( 'width', 500 );
	download.$downloadSizeMenu.val( 'small' );
	download.handleSizeSwitch();
	assert.true( getThumbnailUrl.calledWith( 500 ), 'getThumbnailUrl() called with the selected width' );

	download.setDownloadUrl = function ( url ) {
		assert.strictEqual( url, originalUrl, 'Original URL passed to setDownloadUrl for original size' );
	};
	getThumbnailUrl.resetHistory();

	download.$downloadSizeMenu.val( 'original' );
	download.handleSizeSwitch();
	assert.false( getThumbnailUrl.called, 'getThumbnailUrl() not called for original size' );
} );

QUnit.test( 'getExtensionFromUrl():', ( assert ) => {
	const download = new DownloadPane( $( '#qunit-fixture' ) );

	assert.strictEqual( download.getExtensionFromUrl( 'http://example.com/bing/foo.bar.png' ),
		'png', 'Extension is parsed correctly' );
} );

QUnit.test( 'setDownloadUrl', ( assert ) => {
	const download = new DownloadPane( $( '#qunit-fixture' ) );
	const imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/3/3a/NewFoobar.jpg';

	download.setDownloadUrl( imageUrl );

	assert.strictEqual( download.$downloadButton.attr( 'href' ), imageUrl + '?download', 'Download link is set correctly.' );
	assert.strictEqual( download.$previewLink.attr( 'href' ), imageUrl, 'Preview link is set correctly.' );
	assert.strictEqual( download.$downloadButton.hasClass( 'disabledLink' ), false, 'Download link is enabled.' );
} );
