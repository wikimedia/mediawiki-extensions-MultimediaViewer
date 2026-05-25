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

const License = require( './mmv.model.License.js' );

/**
 * Represents information about a single image
 */
class ImageModel {
	/**
	 * @param {mw.Title} title The title of the image file
	 * @param {Object} imageInfo Raw page object from the imageinfo API response
	 */
	constructor( title, imageInfo ) {
		this.title = title;
		this.imageInfo = imageInfo;
	}

	/** @return {Object} The first imageinfo entry */
	get innerInfo() {
		return this.imageInfo.imageinfo[ 0 ];
	}

	/** @return {Object} The extmetadata block */
	get extmeta() {
		return this.innerInfo.extmetadata;
	}

	/** @return {string} Title of the artwork, or human-readable file name */
	get name() {
		const name = ImageModel.parseExtmeta( this.extmeta && this.extmeta.ObjectName, 'plaintext' );
		return name || this.title.getNameText();
	}

	/** @return {number} The filesize, in bytes, of the original image */
	get size() {
		return this.innerInfo.size;
	}

	/** @return {number} The width, in pixels, of the original image */
	get width() {
		return this.innerInfo.width;
	}

	/** @return {number} The height, in pixels, of the original image */
	get height() {
		return this.innerInfo.height;
	}

	/** @return {string} The MIME type of the original image */
	get mimeType() {
		return this.innerInfo.mime;
	}

	/** @return {string} The URL to the original image */
	get url() {
		return this.innerInfo.url;
	}

	/** @return {string} The URL to the file description page */
	get descriptionUrl() {
		return this.innerInfo.descriptionurl;
	}

	/** @return {string} A short URL to the file description page */
	get descriptionShortUrl() {
		return this.innerInfo.descriptionshorturl;
	}

	/** @return {number} ID of the description page for the image */
	get pageID() {
		return this.imageInfo.pageid;
	}

	/** @return {string} The name of the repository where this image is stored */
	get repo() {
		return this.imageInfo.imagerepository;
	}

	/** @return {string} The date and time of the last upload */
	get uploadDateTime() {
		return ImageModel.parseExtmeta( this.extmeta && this.extmeta.DateTime, 'datetime' );
	}

	/** @return {string} The anonymized date and time of the last upload */
	get anonymizedUploadDateTime() {
		const value = this.uploadDateTime;
		if ( value === undefined ) {
			return undefined;
		}
		// Convert to "timestamp" format commonly used in EventLogging,
		// then anonymise to day granularity so the file is not identifiable
		const digits = value.replace( /[^\d]/g, '' );
		return `${ digits.slice( 0, digits.length - 6 ) }000000`;
	}

	/** @return {string} The date and time that the image was created */
	get creationDateTime() {
		return ImageModel.parseExtmeta( this.extmeta && this.extmeta.DateTimeOriginal, 'datetime' );
	}

	/** @return {string} The description from the file page - unsafe HTML sometimes goes here */
	get description() {
		return ImageModel.parseExtmeta( this.extmeta && this.extmeta.ImageDescription, 'string' );
	}

	/** @return {string} The source for the image - may include unsafe HTML */
	get source() {
		return ImageModel.parseExtmeta( this.extmeta && this.extmeta.Credit, 'string' );
	}

	/** @return {string} The author of the image - may include unsafe HTML */
	get author() {
		return ImageModel.parseExtmeta( this.extmeta && this.extmeta.Artist, 'string' );
	}

	/**
	 * @return {number} The number of different authors of the image.
	 * This is guessed by the number of templates with author fields, which might be less
	 * than the number of actual authors.
	 */
	get authorCount() {
		return ImageModel.parseExtmeta( this.extmeta && this.extmeta.AuthorCount, 'integer' );
	}

	/** @return {License} */
	get license() {
		const extmeta = this.extmeta;
		if ( !extmeta || !extmeta.LicenseShortName ) {
			return undefined;
		}
		return new License(
			ImageModel.parseExtmeta( extmeta.LicenseShortName, 'string' ),
			ImageModel.parseExtmeta( extmeta.License, 'string' ),
			ImageModel.parseExtmeta( extmeta.UsageTerms, 'string' ),
			ImageModel.parseExtmeta( extmeta.LicenseUrl, 'string' ),
			ImageModel.parseExtmeta( extmeta.AttributionRequired, 'boolean' ),
			ImageModel.parseExtmeta( extmeta.NonFree, 'boolean' )
		);
	}

	/** @return {string} Additional license conditions by the author (note that this is usually a big ugly HTML blob) */
	get permission() {
		return ImageModel.parseExtmeta( this.extmeta && this.extmeta.Permission, 'string' );
	}

	/** @return {string} custom attribution string set by uploader that replaces credit line */
	get attribution() {
		return ImageModel.parseExtmeta( this.extmeta && this.extmeta.Attribution, 'string' );
	}

	/** @return {string} reason for pending deletion, undefined if image is not about to be deleted */
	get deletionReason() {
		return ImageModel.parseExtmeta( this.extmeta && this.extmeta.DeletionReason, 'string' );
	}

	/** @return {number} The latitude of the place where the image was created */
	get latitude() {
		return ImageModel.parseExtmeta( this.extmeta && this.extmeta.GPSLatitude, 'float' );
	}

	/** @return {number} The longitude of the place where the image was created */
	get longitude() {
		return ImageModel.parseExtmeta( this.extmeta && this.extmeta.GPSLongitude, 'float' );
	}

	/** @return {string[]} Any re-use restrictions for the image, eg trademarked */
	get restrictions() {
		return ImageModel.parseExtmeta( this.extmeta && this.extmeta.Restrictions, 'list' );
	}

	/**
	 * @return {Object} An object indexed by image widths with URLs to appropriately sized thumbnails
	 */
	get thumbUrls() {
		const inner = this.innerInfo;
		return inner.thumburl ? { [ inner.thumbwidth ]: inner.thumburl } : {};
	}

	/**
	 * Reads and parses a value from the imageinfo API extmetadata field.
	 *
	 * @param {Array} data
	 * @param {string} type one of 'plaintext', 'string', 'float', 'boolean', 'list', 'datetime'
	 * @return {string|number|boolean|Array} value or undefined if it is missing
	 */
	static parseExtmeta( data, type ) {
		let value = data && data.value;
		if ( value === null || value === undefined ) {
			return undefined;
		}
		if ( type === 'plaintext' ) {
			return value.toString().replace( /<.*?>/g, '' );
		}
		if ( type === 'string' ) {
			return value.toString();
		}
		if ( type === 'integer' ) {
			return parseInt( value, 10 );
		}
		if ( type === 'float' ) {
			return parseFloat( value );
		}
		if ( type === 'boolean' ) {
			value = value.toString().toLowerCase().replace( /^\s+|\s+$/g, '' );
			if ( value in { 1: null, yes: null, true: null } ) {
				return true;
			}
			if ( value in { 0: null, no: null, false: null } ) {
				return false;
			}
			return undefined;
		}
		if ( type === 'datetime' ) {
			value = value.toString();
			// https://datatracker.ietf.org/doc/html/rfc3339
			// adapted from https://stackoverflow.com/questions/3143070/regex-to-match-an-iso-8601-datetime-string
			const rfc3339 = /\d{4}-[01]\d-[0-3]\d(T[0-2]\d:[0-5]\d:[0-5]\d(\.\d+)?Z?)?/;
			const match = value.match( rfc3339 );
			if ( !match ) {
				return value.replace( /<.*?>/g, '' );
			}
			value = match[ 0 ];
			if ( value.match( /^\d{4}-00-00/ ) ) {
				// assume yyyy
				return value.slice( 0, 4 );
			}
			return value;
		}
		if ( type === 'list' ) {
			return value === '' ? [] : value.split( '|' );
		}
		throw new Error( 'Image.parseExtmeta: unknown type' );
	}
}

module.exports = ImageModel;
