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

const { LightboxImage } = require( 'mmv.bootstrap' );
const { Canvas } = require( 'mmv' );

QUnit.module( 'mmv.ui.Canvas', QUnit.newMwEnvironment() );

QUnit.test( 'Constructor sense check', ( assert ) => {
	const $qf = $( '#qunit-fixture' );
	const canvas = new Canvas( $qf, $qf, $qf );

	assert.strictEqual( canvas.$imageDiv.length, 1, 'Image container is created.' );
	assert.strictEqual( canvas.$imageWrapper, $qf, '$imageWrapper is set correctly.' );
	assert.strictEqual( canvas.$mainWrapper, $qf, '$mainWrapper is set correctly.' );
} );

QUnit.test( 'empty() and set()', ( assert ) => {
	const $qf = $( '#qunit-fixture' );
	const canvas = new Canvas( $qf );
	const image = new Image();
	const $imageElem = $( image );
	const imageRawMetadata = new LightboxImage( 'foo.png' );

	canvas.empty();

	assert.strictEqual( canvas.$imageDiv.html(), '', 'Canvas is empty.' );
	assert.strictEqual( canvas.$imageDiv.hasClass( 'empty' ), true, 'Canvas is not visible.' );

	canvas.set( imageRawMetadata, $imageElem );

	assert.strictEqual( canvas.$image, $imageElem, 'Image element set correctly.' );
	assert.strictEqual( canvas.imageRawMetadata, imageRawMetadata, 'Raw metadata set correctly.' );
	assert.strictEqual( canvas.$imageDiv.html(), '<img>', 'Image added to container.' );
	assert.strictEqual( canvas.$imageDiv.hasClass( 'empty' ), false, 'Canvas is visible.' );

	canvas.empty();

	assert.strictEqual( canvas.$imageDiv.html(), '', 'Canvas is empty.' );
	assert.strictEqual( canvas.$imageDiv.hasClass( 'empty' ), true, 'Canvas is not visible.' );
} );

QUnit.test( 'maybeDisplayPlaceholder: placeholder big enough to show, actual image bigger than the lightbox', ( assert ) => {
	const $qf = $( '#qunit-fixture' );
	const imageRawMetadata = new LightboxImage( 'foo.png' );
	const canvas = new Canvas( $qf );

	imageRawMetadata.filePageTitle = {
		getExtension: function () {
			return 'png';
		}
	};
	canvas.imageRawMetadata = imageRawMetadata;

	canvas.set = function () {
		assert.true( true, 'Placeholder shown' );
	};
	canvas.getCurrentImageWidths = function () {
		return { cssWidth: 300, cssHeight: 150 };
	};

	const $image = $( '<img>' ).width( 200 ).height( 100 );

	canvas.maybeDisplayPlaceholder(
		{ width: 1000, height: 500 },
		$image
	);

	assert.strictEqual( $image.width(), 300, 'Placeholder has the right width' );
	assert.strictEqual( $image.height(), 150, 'Placeholder has the right height' );
} );

QUnit.test( 'maybeDisplayPlaceholder: big-enough placeholder to show, actual image smaller than the lightbox', ( assert ) => {
	const $qf = $( '#qunit-fixture' );
	const imageRawMetadata = new LightboxImage( 'foo.png' );
	const canvas = new Canvas( $qf );

	imageRawMetadata.filePageTitle = {
		getExtension: function () {
			return 'png';
		}
	};
	canvas.imageRawMetadata = imageRawMetadata;

	canvas.set = function () {
		assert.true( true, 'Placeholder shown' );
	};
	canvas.getCurrentImageWidths = function () {
		return { cssWidth: 1200, cssHeight: 600 };
	};

	const $image = $( '<img>' ).width( 100 ).height( 50 );

	canvas.maybeDisplayPlaceholder(
		{ width: 1000, height: 500 },
		$image
	);

	assert.strictEqual( $image.width(), 1000, 'Placeholder has the right width' );
	assert.strictEqual( $image.height(), 500, 'Placeholder has the right height' );
} );
