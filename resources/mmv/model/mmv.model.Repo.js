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

( function ( mw, oo ) {
	/**
	 * @class mw.mmv.model.Repo
	 * Represents information about a single image repository
	 * @constructor
	 * @param {string} displayName
	 * @param {string} favIcon URL to the repo's favicon
	 * @param {boolean} isLocal
	 */
	function Repo(
		displayName,
		favIcon,
		isLocal
	) {
		/** @property {string} displayName Human-readable name of the repository */
		this.displayName = displayName;

		/** @property {string} favIcon An icon that represents the repository */
		this.favIcon = favIcon;

		/** @property {boolean} isLocal Whether the repository is the local wiki */
		this.isLocal = isLocal;
	}

	/**
	 * @method
	 * @static
	 * Creates a new object from repoInfo we found in an API response.
	 * @param {Object} repoInfo
	 * @returns {mw.mmv.model.Repo}
	 */
	Repo.newFromRepoInfo = function ( repoInfo ) {
		if ( repoInfo.apiurl ) {
			return new ForeignApiRepo(
				repoInfo.displayname,
				repoInfo.favicon,
				false,
				repoInfo.apiurl,
				repoInfo.server,
				repoInfo.articlepath
			);
		} else if ( repoInfo.descBaseUrl ) {
			return new ForeignDbRepo(
				repoInfo.displayname,
				repoInfo.favicon,
				false,
				repoInfo.descBaseUrl
			);
		} else {
			return new Repo( repoInfo.displayname, repoInfo.favicon, repoInfo.local );
		}
	};

	/**
	* @method
	* Gets the article path for the repository.
	* @return {string} Replace $1 with the page name you want to link to.
	*/
	Repo.prototype.getArticlePath = function () { return mw.config.get( 'wgArticlePath' ); };

	/**
	 * @class mw.mmv.model.ForeignApiRepo
	 * Represents information about a foreign API repository
	 * @extends mw.mmv.model.Repo
	 * @constructor
	 * @inheritdoc
	 * @param {string} apiUrl URL to the wiki's api.php
	 * @param {string} server Hostname for the wiki
	 * @param {string} articlePath Path to articles on the wiki, relative to the hostname.
	 */
	function ForeignApiRepo(
		displayName,
		favIcon,
		isLocal,
		apiUrl,
		server,
		articlePath
	) {
		Repo.call( this, displayName, favIcon, isLocal );

		/** @property {string} apiUrl URL to the wiki's api.php */
		this.apiUrl = apiUrl;

		/** @property {string} server Hostname for the wiki */
		this.server = server;

		/** @property {string} articlePath Path to articles on the wiki, relative to the hostname */
		this.articlePath = articlePath;

		/** @property {string} absoluteArticlePath Path to articles on the wiki, relative to nothing */
		this.absoluteArticlePath = server + articlePath;
	}

	oo.inheritClass( ForeignApiRepo, Repo );

	/**
	* @method
	* @override
	* @inheritdoc
	*/
	ForeignApiRepo.prototype.getArticlePath = function () {
	    return this.absoluteArticlePath;
	};

	/**
	 * @class mw.mmv.model.ForeignDbRepo
	 * Represents information about a foreign, shared DB repository
	 * @extends mw.mmv.model.Repo
	 * @constructor
	 * @inheritdoc
	 * @param {string} descBaseUrl Base URL for description pages - should include the "File:" prefix or similar.
	 */
	function ForeignDbRepo(
		displayName,
		favIcon,
		isLocal,
		descBaseUrl
	) {
		Repo.call( this, displayName, favIcon, isLocal );

		/** @property {string} descBaseUrl Base URL for descriptions on the wiki - append a file's title to this to get the description page */
		this.descBaseUrl = descBaseUrl;
	}

	oo.inheritClass( ForeignDbRepo, Repo );

	/**
	* @method
	* @override
	* @inheritdoc
	*/
	ForeignDbRepo.prototype.getArticlePath = function () {
		return this.descBaseUrl.replace( /[^\/:]*:$/, '$1' );
	};

	mw.mmv.model.Repo = Repo;
	mw.mmv.model.ForeignApiRepo = ForeignApiRepo;
	mw.mmv.model.ForeignDbRepo = ForeignDbRepo;
}( mediaWiki, OO ) );
