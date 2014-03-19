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
	QUnit.module( 'mmv.model', QUnit.newMwEnvironment() );

	QUnit.test( 'Image model constructor sanity check', 21, function ( assert ) {
		var
			title = mw.Title.newFromText( 'File:Foobar.jpg' ),
			size = 100,
			width = 10,
			height = 15,
			mime = 'image/jpeg',
			url = 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg',
			descurl = 'https://commons.wikimedia.org/wiki/File:Foobar.jpg',
			repo = 'wikimediacommons',
			user = 'Kaldari',
			datetime = '2011-07-04T23:31:14Z',
			origdatetime = '2010-07-04T23:31:14Z',
			description = 'This is a test file.',
			source = 'WMF',
			author = 'Ryan Kaldari',
			permission = 'only use for good, not evil',
			license = 'cc0',
			latitude = 39.12381283,
			longitude = 100.983829,
			categories = [ 'Foo', 'Bar', 'Baz' ],
			imageData = new mw.mmv.model.Image(
				title, size, width, height, mime, url,
				descurl, repo, user, datetime, origdatetime,
				description, source, author, license, permission,
				latitude, longitude, categories );

		assert.strictEqual( imageData.title, title, 'Title is set correctly' );
		assert.strictEqual( imageData.size, size, 'Size is set correctly' );
		assert.strictEqual( imageData.width, width, 'Width is set correctly' );
		assert.strictEqual( imageData.height, height, 'Height is set correctly' );
		assert.strictEqual( imageData.mimeType, mime, 'MIME type is set correctly' );
		assert.strictEqual( imageData.url, url, 'URL for original image is set correctly' );
		assert.strictEqual( imageData.descriptionUrl, descurl, 'URL for image description page is set correctly' );
		assert.strictEqual( imageData.repo, repo, 'Repository name is set correctly' );
		assert.strictEqual( imageData.lastUploader, user, 'Name of last uploader is set correctly' );
		assert.strictEqual( imageData.uploadDateTime, datetime, 'Date and time of last upload is set correctly' );
		assert.strictEqual( imageData.creationDateTime, origdatetime, 'Date and time of original upload is set correctly' );
		assert.strictEqual( imageData.description, description, 'Description is set correctly' );
		assert.strictEqual( imageData.source, source, 'Source is set correctly' );
		assert.strictEqual( imageData.author, author, 'Author is set correctly' );
		assert.strictEqual( imageData.license, license, 'License is set correctly' );
		assert.strictEqual( imageData.permission, permission, 'Permission is set correctly' );
		assert.strictEqual( imageData.latitude, latitude, 'Latitude is set correctly' );
		assert.strictEqual( imageData.longitude, longitude, 'Longitude is set correctly' );
		assert.strictEqual( imageData.categories[0], 'Foo', 'Categories are set to the right values' );
		assert.strictEqual( imageData.categories.length, 3, 'Categories are all set in the model' );
		assert.ok( imageData.thumbUrls, 'Thumb URL cache is set up properly' );
	} );

	QUnit.test( 'hasCoords works properly', 2, function ( assert ) {
		var
			firstImageData = new mw.mmv.model.Image(
				mw.Title.newFromText( 'File:Foobar.pdf.jpg' ),
				10, 10, 10, 'image/jpeg', 'http://example.org', 'http://example.com',
				'example', 'tester', '2013-11-10', '2013-11-09', 'Blah blah blah',
				'A person', 'Another person', 'CC-BY-SA-3.0', 'Permitted'
			),
			secondImageData = new mw.mmv.model.Image(
				mw.Title.newFromText( 'File:Foobar.pdf.jpg' ),
				10, 10, 10, 'image/jpeg', 'http://example.org', 'http://example.com',
				'example', 'tester', '2013-11-10', '2013-11-09', 'Blah blah blah',
				'A person', 'Another person', 'CC-BY-SA-3.0', 'Permitted',
				'39.91820938', '78.09812938'
			);

		assert.strictEqual( firstImageData.hasCoords(), false, 'No coordinates present means hasCoords returns false.' );
		assert.strictEqual( secondImageData.hasCoords(), true, 'Coordinates present means hasCoords returns true.' );
	} );

	QUnit.test( 'File usage constructor sanity check', 5, function ( assert ) {
		var file = new mw.Title( 'File:Foo' ),
			scope = 'local',
			pages = [
				{ wiki: null, page: new mw.Title( 'Project:Bar' ) },
				{ wiki: null, page: new mw.Title( 'Baz' ) }
			],
			totalCount = 23,
			totalCountIsLowerBound = false,
			fileUsage = new mw.mmv.model.FileUsage( file, scope, pages, totalCount, totalCountIsLowerBound );

		assert.strictEqual( fileUsage.file, file, 'File is set correctly' );
		assert.strictEqual( fileUsage.scope, scope, 'Scope is set correctly' );
		assert.strictEqual( fileUsage.pages, pages, 'Pages are set correctly' );
		assert.strictEqual( fileUsage.totalCount, totalCount, 'Total count is set correctly' );
		assert.strictEqual( fileUsage.totalCountIsLowerBound, totalCountIsLowerBound, 'Count flag is set correctly' );
	} );

	QUnit.test( 'Getting the article path works', 3, function ( assert ) {
		var repo = new mw.mmv.model.Repo( 'Foo', 'http://example.com/favicon.ico', true),
			dbRepo = new mw.mmv.model.ForeignDbRepo( 'Bar', 'http://example.org/favicon.ico', false, 'http://example.org/wiki/File:' ),
			apiRepo = new mw.mmv.model.ForeignApiRepo( 'Baz', 'http://example.net/favicon.ico', false, 'http://example.net/w/api.php', 'http://example.net', '/wiki/$1' );

		assert.strictEqual( repo.getArticlePath(), mw.config.get( 'wgArticlePath' ), 'Local article path is set correctly to corresponding global variable value');
		assert.strictEqual( dbRepo.getArticlePath(), 'http://example.org/wiki/$1', 'DB article path is set correctly' );
		assert.strictEqual( apiRepo.getArticlePath(), 'http://example.net/wiki/$1', 'API article path is set correctly' );
	} );

	QUnit.test( 'Thumbnail constructor sanity check', 4, function ( assert ) {
		var width = 23,
			height = 42,
			url = 'http://example.com/foo.jpg',
			thumbnail = new mw.mmv.model.Thumbnail( url, width, height );

		assert.strictEqual( thumbnail.url, url, 'Url is set correctly' );
		assert.strictEqual( thumbnail.width, width, 'Width is set correctly' );
		assert.strictEqual( thumbnail.height, height, 'Height is set correctly' );

		try {
			thumbnail = new mw.mmv.model.Thumbnail( url, width );
		} catch (e) {
			assert.ok( e, 'Exception is thrown when parameters are missing');
		}
	} );

	QUnit.test( 'ThumbnailWidth constructor sanity check', 5, function ( assert ) {
		var cssWidth = 23,
			cssHeight = 29,
			screenWidth = 42,
			realWidth = 123,
			thumbnailWidth = new mw.mmv.model.ThumbnailWidth(
				cssWidth, cssHeight, screenWidth, realWidth );

		assert.strictEqual( thumbnailWidth.cssWidth, cssWidth, 'Width is set correctly' );
		assert.strictEqual( thumbnailWidth.cssHeight, cssHeight, 'Height is set correctly' );
		assert.strictEqual( thumbnailWidth.screen, screenWidth, 'Screen width is set correctly' );
		assert.strictEqual( thumbnailWidth.real, realWidth, 'Real width is set correctly' );

		try {
			thumbnailWidth = new mw.mmv.model.ThumbnailWidth( cssWidth, screenWidth );
		} catch (e) {
			assert.ok( e, 'Exception is thrown when parameters are missing');
		}
	} );

	QUnit.test( 'User constructor sanity check', 3, function ( assert ) {
		var username = 'John Doe',
			gender = 'male',
			user = new mw.mmv.model.User( username, gender );

		assert.strictEqual( user.username, username, 'Username is set correctly' );
		assert.strictEqual( user.gender , gender , 'Gender is set correctly' );

		try {
			user = new mw.mmv.model.User();
		} catch (e) {
			assert.ok( e, 'Exception is thrown when parameters are missing');
		}
	} );

	QUnit.test( 'User constructor gender validation', 4, function ( assert ) {
		var user,
			username = 'John Doe';

		assert.ok( new mw.mmv.model.User( username, mw.mmv.model.User.Gender.MALE ), 'Male gender is valid' );
		assert.ok( new mw.mmv.model.User( username, mw.mmv.model.User.Gender.FEMALE ), 'Female gender is valid' );
		assert.ok( new mw.mmv.model.User( username, mw.mmv.model.User.Gender.UNKNOWN ), 'Unknown gender is valid' );

		try {
			user = new mw.mmv.model.User( username, '???' );
		} catch (e) {
			assert.ok( e, 'Exception is thrown when gender parameter is not understood');
		}
	} );

	QUnit.test( 'EmbedFileInfo constructor sanity check', 9, function ( assert ) {
		var title = mw.Title.newFromText( 'File:Foobar.jpg' ),
			src = 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg',
			url = 'https://commons.wikimedia.org/wiki/File:Foobar.jpg',
			siteName = 'Name of the web site',
			$license = $( '<a class="mw-mlb-license empty" href="/wiki/File:License.txt">Public License</a>' ),
			$author = $( '<span class="mw-mlb-author">Homer</span>' ),
			$source = $( '<span class="mw-mlb-source">Iliad</span>' ),
			license = {
				plain: $license && $license.text(),
				html: $license && $license.html()
			},
			author = {
				plain: $author && $author.text(),
				html: $author && $author.get( 0 ).outerHTML
			},
			source = {
				plain: $source && $source.text(),
				html: $source && $source.get( 0 ).outerHTML
			},
			caption = {
				plain: 'Plain image caption',
				html: '<b>HTML imgae caption</b>'
			},
			embedFileInfo = new mw.mmv.model.EmbedFileInfo(
				title, src, url, siteName, license, author, source, caption );

		assert.strictEqual( embedFileInfo.title, title, 'Title is set correctly' );
		assert.strictEqual( embedFileInfo.src, src, 'Src is set correctly' );
		assert.strictEqual( embedFileInfo.url, url, 'Url is set correctly' );
		assert.strictEqual( embedFileInfo.siteName, siteName, 'Site name is set correctly' );
		assert.strictEqual( embedFileInfo.license, license, 'License is set correctly' );
		assert.strictEqual( embedFileInfo.author, author, 'Author is set correctly' );
		assert.strictEqual( embedFileInfo.source, source, 'Source is set correctly' );
		assert.strictEqual( embedFileInfo.caption, caption, 'Caption is set correctly' );

		try {
			embedFileInfo = new mw.mmv.model.EmbedFileInfo( title );
		} catch (e) {
			assert.ok( e, 'Exception is thrown when parameters are missing' );
		}
	} );

}( mediaWiki, jQuery ) );
