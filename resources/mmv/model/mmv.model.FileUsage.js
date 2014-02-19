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
	/**
	 * Represents information about the wiki pages using a given file
	 * @class mw.mmv.model.FileUsage
	 * @constructor
	 * @param {mw.Title} file see {@link mw.mmv.model.FileUsage#file}
	 * @param {mw.mmv.model.FileUsage.Scope} scope see {@link mw.mmv.model.FileUsage#scope}
	 * @param {{wiki: (string|null), page: mw.Title}[]} pages see {@link mw.mmv.model.FileUsage#pages}
	 * @param {number} [totalCount] see {@link mw.mmv.model.FileUsage#totalCount}
	 * @param {boolean} [totalCountIsLowerBound = false] see {@link mw.mmv.model.FileUsage#totalCountIsLowerBound}
	 */
	function FileUsage(
		file,
		scope,
		pages,
		totalCount,
		totalCountIsLowerBound
	) {
		/**
		 * The file in question.
		 * @property {mw.Title}
		 */
		this.file = file;

		/**
		 * Shows what wikis we are interested in.
		 * @property {mw.mmv.model.FileUsage.Scope}
		 */
		this.scope = scope;

		/**
		 * A list of pages which use this file. Each page is an object with a 'page' field
		 * containing the wiki page (a Title object) and a 'wiki' field which is a domain name,
		 * or null for local files.
		 * @property {{wiki: (string|null), page: mw.Title}[]}
		 */
		this.pages = pages;

		/**
		 * Total number of pages where the file is used (the list passed in pages parameter might
		 * be cut off at some limit).
		 * @property {number} totalCount
		 */
		this.totalCount = totalCount || pages.length;

		/**
		 * For files which are used on a huge amount of pages, getting an exact count might be
		 * impossible. In such a case this field tells us that the count is "fake". For example
		 * if totalCount is 100 and totalCountIsLowerBound is true, a message about usage count
		 * should be something like "this file is used on more than 100 pages". (This would happen
		 * when we query the api with a limit of 100; the real usage count could be in the millions
		 * for all we know.)
		 * @property {boolean}
		 */
		this.totalCountIsLowerBound = !!totalCountIsLowerBound;
	}

	/**
	 * Shows which wikis are included in the file usage list.
	 * @enum {string} mw.mmv.model.FileUsage.Scope
	 */
	FileUsage.Scope = {
		/**
		 * Only pages from the local wiki (the one where the user is now)
		 */
		LOCAL: 'local',

		/**
		 * Only pages from other wikis
		 */
		GLOBAL: 'global'
	};

	mw.mmv.model.FileUsage = FileUsage;
}( mediaWiki ) );
