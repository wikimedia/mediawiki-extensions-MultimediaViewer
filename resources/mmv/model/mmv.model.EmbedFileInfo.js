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
	/**
	 * Contains information needed to embed and share files.
	 * @class mw.mmv.model.EmbedFileInfo
	 * @constructor
	 * @param {mw.Title} title
	 * @param {string} src
	 * @param {string} url
	 * @param {string} [siteName]
	 * @param {Object} [license]
	 * @param {string} [license.plain]
	 * @param {string} [license.html]
	 * @param {Object} [author]
	 * @param {string} [author.plain]
	 * @param {string} [author.html]
	 * @param {Object} [source]
	 * @param {string} [source.plain]
	 * @param {string} [source.html]
	 * @param {Object} [caption]
	 * @param {string} [caption.plain]
	 * @param {string} [caption.html]
	 */
	function EmbedFileInfo(
			title,
			src,
			url,
			siteName,
			license,
			author,
			source,
			caption
	) {
		if ( !title || !src || !url ) {
			throw 'title, src and url are required and must have a value';
		}

		/** @property {mw.Title} title The title of the file */
		this.title = title;

		/** @property {string} src The URL to the original file */
		this.src = src;

		/** @property {string} url The URL to the file description page */
		this.url = url;

		/** @property {string} [siteName] Human-readable name of the site the file is on */
		this.siteName = siteName;

		/** @property {Object} [license] Description of the license of the file - with links */
		this.license = license;

		/** @property {Object} [author] Author of the file - with links */
		this.author = author;

		/** @property {Object} [source] Source for the file - with links */
		this.source = source;

		/** @property {Object} [caption] Image caption, if any */
		this.caption = caption;
	}

	/**
	 * Helper function to turn HTML to plaintext
	 * @private
	 * @param {string} html
	 * @return {{plain: string, html: string}|null}
	 */
	function htmlToObject ( html ) {
		if ( html && html.length ) {
			return {
				plain: $( '<div>' + html + '</div>' ).text(),
				html: html
			};
		} else {
			return null;
		}
	}

	/**
	 * Factory method for creating an info object from html
	 * @param {mw.Title} title
	 * @param {string} src
	 * @param {string} url
	 * @param {string} [siteName]
	 * @param {string} [licenseHtml]
	 * @param {string} [authorHtml]
	 * @param {string} [sourceHtml]
	 * @param {string} [captionHtml]
	 * @return {mw.mmv.model.EmbedFileInfo}
	 */
	EmbedFileInfo.fromHtml = function (
		title,
		src,
		url,
		siteName,
		licenseHtml,
		authorHtml,
		sourceHtml,
		captionHtml
	) {
		return new EmbedFileInfo(
			title,
			src,
			url,
			siteName,
			htmlToObject( licenseHtml ),
			htmlToObject( authorHtml ),
			htmlToObject( sourceHtml ),
			htmlToObject( captionHtml )
		);
	};

	/**
	 * Turns image info into EmbedFileInfo
	 * @param {mw.mmv.model.Image} imageInfo
	 * @param {string} [siteName]
	 * @param {string} [caption]
	 * @return {mw.mmv.model.EmbedFileInfo}
	 */
	EmbedFileInfo.fromImageInfo = function ( imageInfo, siteName, caption ) {
		var title = imageInfo.title,
			src = imageInfo.url,
			url = imageInfo.descriptionUrl,
			license = imageInfo.license && imageInfo.license.internalName,
			author = imageInfo.author,
			source = imageInfo.source;

		return EmbedFileInfo.fromHtml( title, src, url, siteName, license, author, source, caption );
	};

	/**
	 * Turns a jQuery object into a plaintext/HTML pair
	 * @param $jq
	 * @return {{plain: string, html:string}|null}
	 */
	EmbedFileInfo.jqueryToObject = function ( $jq ) {
		if ( $jq && $jq.length ) {
			return {
				plain: $jq.text(),
				html: $jq.get( 0 ).outerHTML
			};
		} else {
			return null;
		}
	};

	mw.mmv.model.EmbedFileInfo = EmbedFileInfo;
}( mediaWiki, jQuery ) );
