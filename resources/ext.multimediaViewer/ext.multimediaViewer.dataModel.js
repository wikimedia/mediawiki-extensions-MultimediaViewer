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
	 * @class mw.mmv.model.Image
	 * Represents information about a single image
	 * @constructor
	 * @param {mw.Title} title
	 * @param {number} size Filesize in bytes of the original image
	 * @param {number} width Width of the original image
	 * @param {number} height Height of the original image
	 * @param {string} mimeType
	 * @param {string} url URL to the image itself (original version)
	 * @param {string} descriptionUrl URL to the image description page
	 * @param {string} repo The repository this image belongs to
	 * @param {string} lastUploader The last person to upload a version of this image.
	 * @param {string} lastUploadDateTime The time and date the last upload occurred
	 * @param {string} originalUploadDateTime The time and date the original upload occurred
	 * @param {string} description
	 * @param {string} source
	 * @param {string} author
	 * @param {string} license
	 * @param {number} latitude
	 * @param {number} longitude
	 */
	function Image(
			title,
			size,
			width,
			height,
			mimeType,
			url,
			descriptionUrl,
			repo,
			lastUploader,
			uploadDateTime,
			creationDateTime,
			description,
			source,
			author,
			license,
			latitude,
			longitude
	) {
		/** @property {mw.Title} title The title of the image file */
		this.title = title;

		/** @property {number} size The filesize, in bytes, of the original image */
		this.size = size;

		/** @property {number} width The width, in pixels, of the original image */
		this.width = width;

		/** @property {number} height The height, in pixels, of the original image */
		this.height = height;

		/** @property {string} mimeType The MIME type of the original image */
		this.mimeType = mimeType;

		/** @property {string} url The URL to the original image */
		this.url = url;

		/** @property {string} descriptionUrl The URL to the description page for the image */
		this.descriptionUrl = descriptionUrl;

		/** @property {string} repo The name of the repository where this image is stored */
		this.repo = repo;

		/** @property {string} lastUploader The person who uploaded the last version of the file */
		this.lastUploader = lastUploader;

		/** @property {string} uploadDateTime The date and time of the last upload */
		this.uploadDateTime = uploadDateTime;

		/** @property {string} creationDateTime The date and time that the image was created */
		this.creationDateTime = creationDateTime;

		/** @property {string} description The description from the file page - unsafe HTML sometimes goes here */
		this.description = description;

		/** @property {string} source The source for the image (could be an organization, e.g.) - unsafe HTML sometimes goes here */
		this.source = source;

		/** @property {string} author The author of the image - unsafe HTML sometimes goes here */
		this.author = author;

		/** @property {string} license The license under which the image is distributed */
		this.license = license;

		/** @property {number} latitude The latitude of the place where the image was created */
		this.latitude = latitude;

		/** @property {number} longitude The longitude of the place where the image was created */
		this.longitude = longitude;

		/**
		 * @property {Object} thumbUrls
		 * An object indexed by image widths
		 * with URLs to appropriately sized thumbnails
		 */
		this.thumbUrls = {};
	}

	/**
	 * @method
	 * @static
	 * Constructs a new Image object out of an object containing
	 * imageinfo data from an API response.
	 * @param {mw.Title} title
	 * @param {Object} imageInfo
	 * @returns {mw.mmv.model.Image}
	 */
	Image.newFromImageInfo = function ( title, imageInfo ) {
		var uploadDateTime, creationDateTime, imageData,
			description, source, author, license,
			latitude, longitude,
			innerInfo = imageInfo.imageinfo[0],
			extmeta = innerInfo.extmetadata;

		if ( extmeta ) {
			creationDateTime = extmeta.DateTimeOriginal;
			uploadDateTime = extmeta.DateTime;

			if ( uploadDateTime ) {
				uploadDateTime = uploadDateTime.value.replace( /<.*?>/g, '' );
			}

			if ( creationDateTime ) {
				creationDateTime = creationDateTime.value.replace( /<.*?>/g, '' );
			}

			description = extmeta.ImageDescription && extmeta.ImageDescription.value;
			source = extmeta.Credit && extmeta.Credit.value;
			author = extmeta.Artist && extmeta.Artist.value;
			license = extmeta.License && extmeta.License.value;

			latitude = extmeta.GPSLatitude && parseFloat( extmeta.GPSLatitude.value );
			longitude = extmeta.GPSLongitude && parseFloat( extmeta.GPSLongitude.value );
		}

		imageData = new Image(
			title,
			innerInfo.size,
			innerInfo.width,
			innerInfo.height,
			innerInfo.mime,
			innerInfo.url,
			innerInfo.descriptionurl,
			imageInfo.imagerepository,
			innerInfo.user,
			uploadDateTime,
			creationDateTime,
			description,
			source,
			author,
			license,
			latitude,
			longitude
		);

		if ( innerInfo.thumburl ) {
			imageData.addThumbUrl(
				innerInfo.thumbwidth,
				innerInfo.thumburl
			);
		}

		return imageData;
	};

	/**
	 * @method
	 * Add a thumb URL
	 * @param {number} width
	 * @param {string} url
	 */
	Image.prototype.addThumbUrl = function ( width, url ) {
		this.thumbUrls[width] = url;
	};

	/**
	 * @method
	 * Get a thumb URL if we have it.
	 * @param {number} width
	 * @returns {string|undefined}
	 */
	Image.prototype.getThumbUrl = function ( width ) {
		return this.thumbUrls[width];
	};

	/**
	 * @method
	 * Check whether the image is CC-licensed.
	 * @returns {boolean}
	 */
	Image.prototype.isCcLicensed = function () {
		return this.license && this.license.substr( 0, 2 ) === 'cc';
	};

	/**
	 * @method
	 * Check whether the image has geolocation data.
	 * @returns {boolean}
	 */
	Image.prototype.hasCoords = function () {
		return this.hasOwnProperty( 'latitude' ) && this.hasOwnProperty( 'longitude' ) &&
			this.latitude !== undefined && this.latitude !== null &&
			this.longitude !== undefined && this.longitude !== null;
	};

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
	 * @class mw.mmv.model.ForeignDbRepo
	 * Represents information about a foreign, shared DB repository
	 * @extends mw.mmv.model.Repo
	 * @constructor
	 * @inheritdoc
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
	 * @class mw.mmv.model.FileUsage
	 * Represents information about the wiki pages using a given file
	 * @constructor
	 * @param {mw.Title} file
	 * @param {mw.mmv.model.FileUsage.Scope} scope
	 * @param {{wiki: String|null, page: mw.Title}[]} pages
	 *     A list of pages which use this file. Each page is an object with a 'page' field
	 *     containing the wiki page (a Title object) and a 'wiki' field which is a domain name,
	 *     or null for local files.
	 * @param {Number} [totalCount] total number of pages where the file is used (the list passed
	 *     in pages parameter might be cut off at some limit)
	 * @param {boolean} [totalCountIsLowerBound = false] False means totalCount is accurate,
	 *     true means it is a lower bound (the real count can be way greater).
	 *
	 */
	function FileUsage(
		file,
		scope,
		pages,
		totalCount,
		totalCountIsLowerBound
	) {
		/** @property {mw.Title} mw.mmv.model.FileUsage.file */
		this.file = file;

		/** @property {mw.mmv.model.FileUsage.Scope} mw.mmv.model.FileUsage.scope */
		this.scope = scope;

		/** @property {{wiki: String|null, page: mw.Title}[]} mw.mmv.model.FileUsage.pages */
		this.pages = pages;

		/** @property {Number} mw.mmv.model.FileUsage.totalCount
		 */
		this.totalCount = totalCount || pages.length;

		/**
		 * For files which are used on a huge amount of pages, getting an exact count might be
		 * impossible. In such a case this field tells us that the count is "fake". For example
		 * if totalCount is 100 and totalCountIsLowerBound is true, a message about usage count
		 * should be something like "this file is used on more than 100 pages". (This would happen
		 * when we query the api with a limit of 100; the real usage count could be in the millions
		 * for all we know.)
		 * @property {boolean} mw.mmv.model.FileUsage.totalCountIsLowerBound
		 */
		this.totalCountIsLowerBound = !!totalCountIsLowerBound;
	}

	/**
	 * @typedef {mw.mmv.model.FileUsage.Scope}
	 * @enum
	 * @type {String}
	 */
	FileUsage.Scope = {
		/**
		 * Only pages from the local wiki (the one where the user is now)
		 */
		LOCAL: 'local',

		/**
		 * All pages, including other wikis
		 */
		GLOBAL: 'global'
	};

	mw.mmv.model = {};
	mw.mmv.model.Image = Image;
	mw.mmv.model.Repo = Repo;
	mw.mmv.model.ForeignApiRepo = ForeignApiRepo;
	mw.mmv.model.ForeignDbRepo = ForeignDbRepo;
	mw.mmv.model.FileUsage = FileUsage;
}( mediaWiki, OO ) );
