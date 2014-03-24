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
