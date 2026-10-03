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

const { ImageInfo, ImageModel } = require( 'mmv' );

QUnit.module( 'mmv.provider.ImageInfo', QUnit.newMwEnvironment( {
	// mw.Title relies on these three config vars
	// Restore them after each test run
	config: {
		wgFormattedNamespaces: {
			'-2': 'Media',
			'-1': 'Special',
			0: '',
			1: 'Talk',
			2: 'User',
			3: 'User talk',
			4: 'Wikipedia',
			5: 'Wikipedia talk',
			6: 'File',
			7: 'File talk',
			8: 'MediaWiki',
			9: 'MediaWiki talk',
			10: 'Template',
			11: 'Template talk',
			12: 'Help',
			13: 'Help talk',
			14: 'Category',
			15: 'Category talk',
			// testing custom / localized namespace
			100: 'Penguins'
		},
		wgNamespaceIds: {
			/* eslint-disable camelcase */
			media: -2,
			special: -1,
			'': 0,
			talk: 1,
			user: 2,
			user_talk: 3,
			wikipedia: 4,
			wikipedia_talk: 5,
			file: 6,
			file_talk: 7,
			mediawiki: 8,
			mediawiki_talk: 9,
			template: 10,
			template_talk: 11,
			help: 12,
			help_talk: 13,
			category: 14,
			category_talk: 15,
			image: 6,
			image_talk: 7,
			project: 4,
			project_talk: 5,
			// Testing custom namespaces and aliases
			penguins: 100,
			antarctic_waterfowl: 100
			/* eslint-enable camelcase */
		},
		wgCaseSensitiveNamespaces: []
	}
} ) );

QUnit.test( 'constructor', ( assert ) => {
	const api = { get: function () {} };
	const imageInfoProvider = new ImageInfo( api );

	assert.true( imageInfoProvider instanceof ImageInfo );
} );

QUnit.test( 'get() [good]', async ( assert ) => {
	let apiCallCount = 0;

	const api = { get: function () {
		apiCallCount++;
		return $.Deferred().resolve( {
			query: {
				pages: [
					{
						ns: 6,
						title: 'File:Stuff.jpg',
						missing: true,
						imagerepository: 'shared',
						imageinfo: [
							{
								timestamp: '2013-08-25T14:41:02Z',
								size: 346684,
								width: 720,
								height: 1412,
								url: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Stuff.jpg',
								descriptionurl: 'https://commons.wikimedia.org/wiki/File:Stuff.jpg',
								metadata: [],
								extmetadata: {
									ObjectName: {
										value: 'Some stuff',
										source: 'commons-templates'
									},
									License: {
										value: 'cc0',
										source: 'commons-templates',
										hidden: ''
									},
									LicenseShortName: {
										value: 'CC0',
										source: 'commons-templates'
									},
									UsageTerms: {
										value: 'Creative Commons Public Domain Dedication',
										source: 'commons-templates'
									},
									LicenseUrl: {
										value: 'http://creativecommons.org/publicdomain/zero/1.0/',
										source: 'commons-templates'
									},
									GPSLatitude: {
										value: '90.000000',
										source: 'commons-desc-page'
									},
									GPSLongitude: {
										value: ' 180.000000',
										source: 'commons-desc-page'
									},
									ImageDescription: {
										value: 'Wikis stuff',
										source: 'commons-desc-page'
									},
									DateTimeOriginal: {
										value: '<time class="dtstart" datetime="2009-02-18">18 February 2009</time>\u00a0(according to <a href="//en.wikipedia.org/wiki/Exchangeable_image_file_format" class="extiw" title="en:Exchangeable image file format">EXIF</a> data)',
										source: 'commons-desc-page'
									},
									DateTime: {
										value: '2013-08-25T14:41:02Z',
										source: 'commons-desc-page'
									},
									Credit: {
										value: 'Wikipedia',
										source: 'commons-desc-page',
										hidden: ''
									},
									Artist: {
										value: 'John Smith',
										source: 'commons-desc-page'
									},
									AuthorCount: {
										value: '2',
										source: 'commons-desc-page'
									},
									Attribution: {
										value: 'By John Smith',
										source: 'commons-desc-page'
									},
									Permission: {
										value: 'Do not use. Ever.',
										source: 'commons-desc-page'
									},
									AttributionRequired: {
										value: 'no',
										source: 'commons-desc-page'
									},
									NonFree: {
										value: 'yes',
										source: 'commons-desc-page'
									},
									Restrictions: {
										value: 'trademarked|insignia',
										source: 'commons-desc-page'
									},
									DeletionReason: {
										value: 'copyvio',
										source: 'commons-desc-page'
									}
								}
							}
						]
					}
				]
			}
		} );
	} };
	const file = new mw.Title( 'File:Stuff.jpg' );
	const imageInfoProvider = new ImageInfo( api );

	const image = await imageInfoProvider.get( file );
	// Flatten the getters
	const getters = Object.entries( Object.getOwnPropertyDescriptors( ImageModel.prototype ) )
		.filter( ( [ , descriptor ] ) => typeof descriptor.get === 'function' )
		.map( ( [ name ] ) => name );
	const imageObj = Object.fromEntries(
		getters.map( ( name ) => [ name, image[ name ] ] )
	);
	assert.strictEqual( image.title.getPrefixedDb(), 'File:Stuff.jpg', 'title is set correctly' );
	assert.propContains( imageObj, {
		name: 'Some stuff',
		size: 346684,
		width: 720,
		height: 1412,
		url: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Stuff.jpg',
		descriptionUrl: 'https://commons.wikimedia.org/wiki/File:Stuff.jpg',
		repo: 'shared',
		uploadDateTime: '2013-08-25T14:41:02Z',
		anonymizedUploadDateTime: '20130825000000',
		creationDateTime: '2009-02-18',
		description: 'Wikis stuff',
		source: 'Wikipedia',
		author: 'John Smith',
		authorCount: 2,
		attribution: 'By John Smith',
		permission: 'Do not use. Ever.',
		deletionReason: 'copyvio',
		latitude: 90,
		longitude: 180,
		restrictions: [ 'trademarked', 'insignia' ]
	} );
	assert.propContains( image.license, {
		shortName: 'CC0',
		internalName: 'cc0',
		longName: 'Creative Commons Public Domain Dedication',
		deedUrl: 'http://creativecommons.org/publicdomain/zero/1.0/',
		attributionRequired: false,
		nonFree: true
	} );

	// the provider should return a second call from cache instead of a second fetch
	await imageInfoProvider.get( file );
	assert.strictEqual( apiCallCount, 1 );
} );

QUnit.test( 'get() [fail 1]', async ( assert ) => {
	const api = { get: function () {
		return $.Deferred().resolve( {} );
	} };
	const file = new mw.Title( 'File:Stuff.jpg' );
	const imageInfoProvider = new ImageInfo( api );

	await assert.rejects(
		imageInfoProvider.get( file ),
		'reject when no data is returned'
	);
} );

QUnit.test( 'get() [fail 2]', async ( assert ) => {
	const api = { get: function () {
		return $.Deferred().resolve( {
			query: {
				pages: [
					{
						title: 'File:Stuff.jpg'
					}
				]
			}
		} );
	} };
	const file = new mw.Title( 'File:Stuff.jpg' );
	const imageInfoProvider = new ImageInfo( api );

	await assert.rejects(
		imageInfoProvider.get( file ),
		'reject when imageinfo is missing'
	);
} );

QUnit.test( 'get() [missing page]', async ( assert ) => {
	const api = { get: function () {
		return $.Deferred().resolve( {
			query: {
				pages: [
					{
						title: 'File:Stuff.jpg',
						missing: true,
						imagerepository: ''
					}
				]
			}
		} );
	} };
	const file = new mw.Title( 'File:Stuff.jpg' );
	const imageInfoProvider = new ImageInfo( api );

	await assert.rejects(
		imageInfoProvider.get( file ),
		/file does not exist: File:Stuff.jpg/,
		'error message for missing file'
	);
} );

QUnit.test( 'invalidate()', async ( assert ) => {
	let apiCallCount = 0;
	let shouldFail = true;
	const api = { get: function () {
		apiCallCount++;
		if ( shouldFail ) {
			// Mimic mw.Api's transport-level rejection (e.g. a network error).
			return $.Deferred().reject( 'http' );
		}
		return $.Deferred().resolve( {
			query: {
				pages: [ {
					ns: 6,
					title: 'File:Stuff.jpg',
					imageinfo: [ {
						url: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Stuff.jpg',
						extmetadata: {}
					} ]
				} ]
			}
		} );
	} };
	const file = new mw.Title( 'File:Stuff.jpg' );
	const imageInfoProvider = new ImageInfo( api );

	// The first request fails; getCachedPromise() caches the rejected promise.
	await assert.rejects( imageInfoProvider.get( file ), 'first request rejects' );

	// A second get() reuses the cached rejection without hitting the API again.
	await assert.rejects( imageInfoProvider.get( file ), 'cached rejection is reused' );
	assert.strictEqual( apiCallCount, 1, 'no new request while the rejection is cached' );

	// After invalidate(), the next get() re-runs the request and can succeed.
	shouldFail = false;
	imageInfoProvider.invalidate( file );
	const image = await imageInfoProvider.get( file );

	assert.strictEqual( apiCallCount, 2, 'invalidate() forces a fresh request' );
	assert.strictEqual(
		image.url,
		'https://upload.wikimedia.org/wikipedia/commons/1/19/Stuff.jpg',
		'the retried request resolves successfully'
	);
} );

QUnit.test( 'get() [with iiurlparam]', async ( assert ) => {
	const calls = [];
	const api = { get: function ( params ) {
		calls.push( params );
		return $.Deferred().resolve( {
			query: {
				pages: [ {
					ns: 6,
					title: 'File:Stuff.svg',
					imageinfo: [ {
						url: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Stuff.svg',
						extmetadata: {}
					} ]
				} ]
			}
		} );
	} };
	const file = new mw.Title( 'File:Stuff.svg' );
	const imageInfoProvider = new ImageInfo( api );

	await imageInfoProvider.get( file, 'langde' );
	assert.strictEqual( calls[ 0 ].iiurlparam, 'langde', 'iiurlparam is passed to the API' );

	// A different handler parameter is a distinct request, not a cache hit.
	await imageInfoProvider.get( file, 'langfr' );
	assert.strictEqual( calls.length, 2, 'a different iiurlparam triggers a new request' );

	// The same handler parameter reuses the cached promise.
	await imageInfoProvider.get( file, 'langde' );
	assert.strictEqual( calls.length, 2, 'the same iiurlparam is served from cache' );

	// No handler parameter is cached separately (and keyed by title alone).
	await imageInfoProvider.get( file );
	assert.strictEqual( calls.length, 3, 'the parameterless request is cached separately' );
	assert.strictEqual( calls[ 2 ].iiurlparam, undefined, 'no iiurlparam is sent when none is given' );
} );
