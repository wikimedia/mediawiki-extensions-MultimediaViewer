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
	var LP;

	/**
	 * Class for storing license information about an image. For available fields, see
	 * TemplateParser::$licenseFieldClasses in the CommonsMetadata extension.
	 * @class mw.mmv.model.License
	 * @param {string} shortName see {@link #shortName}
	 * @param {string} [internalName] see {@link #internalName}
	 * @param {string} [longName] see {@link #longName}
	 * @param {string} [deedUrl] see {@link #deedUrl}
	 * @constructor
	 */
	function License(
		shortName,
		internalName,
		longName,
		deedUrl
	) {
		if ( !shortName ) {
			throw 'mw.mmv.model.License: shortName is required';
		}

		/** @property {string} shortName short (abbreviated) name of the license (e.g. CC-BY-SA-3.0) */
		this.shortName = shortName;

		/** @property {string} internalName internal name of the license, used for localization (e.g. cc-by-sa ) */
		this.internalName = internalName;

		/** @property {string} longName full name of the license (e.g. Creative Commons etc. etc.) */
		this.longName = longName;

		/** @property {string} deedUrl URL to the description of the license (e.g. the CC deed) */
		this.deedUrl = deedUrl;

		/** @property {mw.mmv.HtmlUtils} htmlUtils - */
		this.htmlUtils = new mw.mmv.HtmlUtils();
	}
	LP = License.prototype;

	/**
	 * Check whether this is a Creative Commons license.
	 * @returns {boolean}
	 */
	LP.isCc = function () {
		return this.internalName ? this.internalName.substr( 0, 2 ) === 'cc' : false;
	};

	/**
	 * Returns the short name of the license:
	 * - if we have interface messages for this license (basically just CC and PD), use those
	 * - otherwise use the short name from the license template (might or might not be translated
	 *   still, depending on how the template is set up)
	 * @return {string}
	 * FIXME a model should not depend on an i18n class. We should probably use view models.
	 */
	LP.getShortName = function() {
		var message = 'multimediaviewer-license-' + ( this.internalName || '' );
		if ( mw.messages.exists( message ) ) {
			return mw.message( message ).text();
		} else {
			return this.shortName;
		}
	};


	/**
	 * Returns a short HTML representation of the license.
	 * @return {string}
	 */
	LP.getShortLink = function () {
		if ( this.deedUrl ) {
			return this.htmlUtils.jqueryToHtml(
				$( '<a>' ).prop( {
					href: this.deedUrl,
					title: this.longName
				} ).text( this.getShortName() )
			);
		} else {
			return this.shortName;
		}
	};

	mw.mmv.model.License = License;
}( mediaWiki, jQuery ) );
