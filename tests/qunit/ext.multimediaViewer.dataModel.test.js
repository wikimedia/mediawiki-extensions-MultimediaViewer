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

( function ( mw ) {
	QUnit.module( 'ext.multimediaViewer.dataModel', QUnit.newMwEnvironment() );

	QUnit.test( 'Image model constructor sanity check', 16, function ( assert ) {
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
			license = 'cc0',
			imageData = new mw.mmv.model.Image(
				title, size, width, height, mime, url,
				descurl, repo, user, datetime, origdatetime,
				description, source, author, license );

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
		assert.ok( imageData.thumbUrls, 'Thumb URL cache is set up properly' );
	} );
}( mediaWiki ) );
