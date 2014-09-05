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
	var IP;

	/**
	 * Represents information about a single image
	 * @class mw.mmv.model.Image
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
	 * @param {string} uploadDateTime The time and date the last upload occurred
	 * @param {string} creationDateTime The time and date the original upload occurred
	 * @param {string} description
	 * @param {string} source
	 * @param {string} author
	 * @param {mw.mmv.model.License} license
	 * @param {string} permission
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
			permission,
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

		/** @property {mw.mmv.model.License} license The license under which the image is distributed */
		this.license = license;

		/** @property {string} additional license conditions by the author (note that this is usually a big ugly HTML blob) */
		this.permission = permission;

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
	IP = Image.prototype;

	/**
	 * Constructs a new Image object out of an object containing
	 * imageinfo data from an API response.
	 * @static
	 * @param {mw.Title} title
	 * @param {Object} imageInfo
	 * @returns {mw.mmv.model.Image}
	 */
	Image.newFromImageInfo = function ( title, imageInfo ) {
		var uploadDateTime, creationDateTime, imageData,
			description, source, author, license, permission,
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

			description = this.parseExtmeta( extmeta.ImageDescription, 'string' );
			source = this.parseExtmeta( extmeta.Credit, 'string' );
			author = this.parseExtmeta( extmeta.Artist, 'string' );

			if ( extmeta.LicenseShortName ) {
				license = new mw.mmv.model.License(
					this.parseExtmeta( extmeta.LicenseShortName, 'string' ),
					this.parseExtmeta( extmeta.License, 'string' ),
					this.parseExtmeta( extmeta.UsageTerms, 'string' ),
					this.parseExtmeta( extmeta.LicenseUrl, 'string' )
				);
			}

			permission = this.parseExtmeta( extmeta.Permission, 'string' );

			latitude = this.parseExtmeta( extmeta.GPSLatitude, 'float' );
			longitude = this.parseExtmeta( extmeta.GPSLongitude, 'float' );
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
			permission,
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
	 * Reads and parses a value from the imageinfo API extmetadata field.
	 * @param {Array} data
	 * @param {string} type one of 'string', 'float', 'list'
	 * @return {string|number|Array} value or undefined if it is missing
	 */
	Image.parseExtmeta = function ( data, type ) {
		var value = data && data.value;
		if ( value === null || value === undefined ) {
			return undefined;
		} else if ( type === 'string' ) {
			return value.toString();
		} else if ( type === 'float' ) {
			return parseFloat( value );
		} else if ( type === 'list' ) {
			return value === '' ? [] : value.split( '|' );
		} else {
			throw 'mw.mmv.model.Image.parseExtmeta: unknown type';
		}
	};

	/**
	 * Add a thumb URL
	 * @param {number} width
	 * @param {string} url
	 */
	IP.addThumbUrl = function ( width, url ) {
		this.thumbUrls[width] = url;
	};

	/**
	 * Get a thumb URL if we have it.
	 * @param {number} width
	 * @returns {string|undefined}
	 */
	IP.getThumbUrl = function ( width ) {
		return this.thumbUrls[width];
	};

	/**
	 * Check whether the image has geolocation data.
	 * @returns {boolean}
	 */
	IP.hasCoords = function () {
		return this.hasOwnProperty( 'latitude' ) && this.hasOwnProperty( 'longitude' ) &&
			this.latitude !== undefined && this.latitude !== null &&
			this.longitude !== undefined && this.longitude !== null;
	};

	mw.mmv.model.Image = Image;
}( mediaWiki ) );
