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
			license
	) {
		/** @property {mw.Title} title */
		this.title = title;

		/** @property {number} size */
		this.size = size;

		/** @property {number} width */
		this.width = width;

		/** @property {number} height */
		this.height = height;

		/** @property {string} mimeType */
		this.mimeType = mimeType;

		/** @property {string} url */
		this.url = url;

		/** @property {string} descriptionUrl */
		this.descriptionUrl = descriptionUrl;

		/** @property {string} repo */
		this.repo = repo;

		/** @property {string} lastUploader */
		this.lastUploader = lastUploader;

		/** @property {string} uploadDateTime */
		this.uploadDateTime = uploadDateTime;

		/** @property {string} creationDateTime */
		this.creationDateTime = creationDateTime;

		/** @property {string} description */
		this.description = description;

		/** @property {string} source */
		this.source = source;

		/** @property {string} author */
		this.author = author;

		/** @property {string} license */
		this.license = license;

		/**
		 * @property {object} thumbUrls
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
	 * @param {object} imageInfo
	 * @returns {mw.mmv.model.Image}
	 */
	Image.newFromImageInfo = function ( title, imageInfo ) {
		var uploadDateTime, creationDateTime, imageData,
			description, source, author, license,
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
			license
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
		/** @property {string} displayName */
		this.displayName = displayName;

		/** @property {string} favIcon */
		this.favIcon = favIcon;

		/** @property {boolean} isLocal */
		this.isLocal = isLocal;
	}

	/**
	 * @method
	 * @static
	 * Creates a new object from repoInfo we found in an API response.
	 * @param {object} repoInfo
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
	 * @extends Repo
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

		/** @property {string} apiUrl */
		this.apiUrl = apiUrl;

		/** @property {string} server */
		this.server = server;

		/** @property {string} articlePath */
		this.articlePath = articlePath;

		/** @property {string} absoluteArticlePath */
		this.absoluteArticlePath = server + articlePath;
	}

	oo.inheritClass( ForeignApiRepo, Repo );

	/**
	 * @class mw.mmv.model.ForeignDbRepo
	 * Represents information about a foreign, shared DB repository
	 * @extends Repo
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

		/** @property {string} descBaseUrl */
		this.descBaseUrl = descBaseUrl;
	}

	oo.inheritClass( ForeignDbRepo, Repo );

	mw.mmv.model = {};
	mw.mmv.model.Image = Image;
	mw.mmv.model.Repo = Repo;
	mw.mmv.model.ForeignApiRepo = ForeignApiRepo;
	mw.mmv.model.ForeignDbRepo = ForeignDbRepo;
}( mediaWiki, OO ) );
