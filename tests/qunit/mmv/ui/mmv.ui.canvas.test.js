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

QUnit.test( 'setImageAndMaxDimensions()', ( assert ) => {
	const $qf = $( '#qunit-fixture' );
	const $mainWrapper = $( '<div>' ).appendTo( $qf );
	const $innerWrapper = $( '<div>' ).appendTo( $mainWrapper );
	const $imageWrapper = $( '<div>' ).appendTo( $innerWrapper );
	const canvas = new Canvas( $innerWrapper, $imageWrapper, $mainWrapper );
	const imageRawMetadata = new LightboxImage( 'foo.png' );
	const image = new Image();
	const $imageElem = $( image );
	const image2 = new Image();
	let thumbnailWidth = 10;
	const screenWidth = 100;

	// Need to call set() before using setImageAndMaxDimensions()
	canvas.set( imageRawMetadata, $imageElem );
	const originalWidth = image.width;

	// Call with the same image
	canvas.setImageAndMaxDimensions(
		{ width: thumbnailWidth },
		image,
		{ cssWidth: screenWidth }
	);

	assert.strictEqual( image.width, originalWidth, 'Image width was not modified.' );
	assert.strictEqual( canvas.$image, $imageElem, 'Image element still set correctly.' );

	const $currentImage = canvas.$image;

	// Call with a new image bigger than screen size
	thumbnailWidth = 150;
	canvas.setImageAndMaxDimensions(
		{ width: thumbnailWidth },
		image2,
		{ cssWidth: screenWidth }
	);

	assert.strictEqual( image2.width, screenWidth, 'Image width was trimmed correctly.' );
	assert.notStrictEqual( canvas.$image, $currentImage, 'Image element switched correctly.' );
} );

QUnit.test( 'maybeDisplayPlaceholder: Constrained area for SVG files', ( assert ) => {
	const $qf = $( '#qunit-fixture' );
	const imageRawMetadata = new LightboxImage( 'foo.svg' );
	const canvas = new Canvas( $qf );

	imageRawMetadata.filePageTitle = {
		getExtension: function () {
			return 'svg';
		}
	};
	canvas.imageRawMetadata = imageRawMetadata;

	canvas.set = function () {
		assert.true( false, 'Placeholder is not shown' );
	};

	const $image = $( '<img>' ).width( 10 ).height( 5 );

	canvas.maybeDisplayPlaceholder(
		{ width: 200, height: 100 },
		$image,
		{ cssWidth: 300, cssHeight: 150 }
	);

	assert.strictEqual( $image.width(), 10, 'Placeholder width was not set to max' );
	assert.strictEqual( $image.height(), 5, 'Placeholder height was not set to max' );
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

	const $image = $( '<img>' ).width( 200 ).height( 100 );

	canvas.maybeDisplayPlaceholder(
		{ width: 1000, height: 500 },
		$image,
		{ cssWidth: 300, cssHeight: 150 }
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

	const $image = $( '<img>' ).width( 100 ).height( 50 );

	canvas.maybeDisplayPlaceholder(
		{ width: 1000, height: 500 },
		$image,
		{ cssWidth: 1200, cssHeight: 600 }
	);

	assert.strictEqual( $image.width(), 1000, 'Placeholder has the right width' );
	assert.strictEqual( $image.height(), 500, 'Placeholder has the right height' );
} );

QUnit.test( 'maybeDisplayPlaceholder: placeholder too small to be displayed, actual image bigger than the lightbox', ( assert ) => {
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
		assert.true( false, 'Placeholder shown when it should not' );
	};

	const $image = $( '<img>' ).width( 10 ).height( 5 );

	canvas.maybeDisplayPlaceholder(
		{ width: 1000, height: 500 },
		$image,
		{ cssWidth: 300, cssHeight: 150 }
	);

	assert.strictEqual( $image.width(), 10, 'Placeholder has the right width' );
	assert.strictEqual( $image.height(), 5, 'Placeholder has the right height' );
} );
