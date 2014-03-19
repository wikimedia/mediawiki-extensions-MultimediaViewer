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

( function( mw, $ ) {
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

	/**
	 * Byline construction
	 * @param {{html: string, plain: string}} [author]
	 * @param {{html: string, plain: string}} [source]
	 * @return {{html: string, plain: string}} byline in plain text and html
	 */
	AFP.getBylines = function ( author, source ) {
		var bylines = {};

		if ( author && source) {
			bylines.plain = mw.message(
				'multimediaviewer-credit',
				author.plain,
				source.plain
			).text();

			bylines.html = mw.message(
				'multimediaviewer-credit',
				author.html,
				source.html
			).parse();
		} else if ( author ) {
			bylines.plain = author.plain;
			bylines.html = author.html;
		} else if ( source ) {
			bylines.plain = source.plain;
			bylines.html = source.html;
		}

		return bylines;
	};

	/**
	 * Generates the HTML embed code for the image credit line.
	 * @param {mw.mmv.model.EmbedFileInfo} info
	 * @return {string}
	 */
	AFP.getCreditHtml = function ( info ) {
		var creditText, creditFormat, creditParams,
			title = info.title.getNameText(),
			bylines = this.getBylines( info.author, info.source );

		creditFormat = 't';
		creditParams = [ title ];
		if ( bylines.html ) {
			creditFormat += 'b';
			creditParams.push( bylines.html );
		}
		if ( info.license && info.license.plain.length ) {
			creditFormat += 'l';
			creditParams.push( info.license.plain );
		}
		if ( info.siteName ) {
			creditFormat += 's';
			creditParams.push( info.siteName );
		}

		if ( creditFormat === 't' || creditFormat === 'ts' ) {
			creditText = '"' + title + '"';
		} else {
			creditParams.unshift( 'multimediaviewer-html-embed-credit-text-' + creditFormat );
			creditText = mw.message.apply( mw, creditParams ).plain();
		}

		return creditText;
	};

	/**
	 * Generates the HTML embed code for the image.
	 *
	 * @param {mw.mmv.model.EmbedFileInfo} info
	 * @param {string} imgUrl URL to the file itself.
	 * @param {number} [width] Width to put into the image element.
	 * @param {number} [height] Height to put into the image element.
	 * @return {string} Embed code.
	 */
	AFP.getThumbnailHtml = function ( info, imgUrl, width, height ) {
		return $( '<div>' ).append(
			$( '<p>' ).append(
				$( '<a>' )
					.attr( 'href', info.url )
					.append(
						$( '<img>' )
							.attr( 'src', imgUrl )
							.attr( 'height', height )
							.attr( 'width', width )
					),
				$( '<br>' ),
				this.getCreditHtml( info )
			)
		).html();
	};

	mw.mmv.EmbedFileFormatter = EmbedFileFormatter;
}( mediaWiki, jQuery ) );
