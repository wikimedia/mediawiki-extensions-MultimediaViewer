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

( function( mw ) {
	var AFP;

	/**
	 * Converts data in various formats needed by the Embed sub-dialog
	 * @class mw.mmv.EmbedFileFormatter
	 * @constructor
	 */
	function EmbedFileFormatter() {}
	AFP = EmbedFileFormatter.prototype;

	/**
	 * Helper function to generate thumbnail wikicode
	 * @param {mw.Title} title
	 * @param {number} [width]
	 * @param {string} [caption]
	 * @return {string}
	 */
	AFP.getThumbnailWikitext = function ( title, width, caption ) {
		var widthSection, captionSection;

		widthSection = width ? '|' + width + 'px' : '';
		captionSection = caption ? '|' + caption : '';

		return '[[File:' + title.getMain() + widthSection + '|thumb' + captionSection + ']]';
	};

	/**
	 * Helper function to generate thumbnail wikicode
	 * @param {mw.mmv.model.EmbedFileInfo} info
	 * @param {number} [width]
	 * @return {string}
	 */
	AFP.getThumbnailWikitextFromEmbedFileInfo = function ( info, width ) {
		var title = info.title,
			caption = info.caption;

		return this.getThumbnailWikitext( info.title, width,
			caption ? caption.plain : title.getNameText() );
	};

	mw.mmv.EmbedFileFormatter = EmbedFileFormatter;
}( mediaWiki ) );
