const { MultimediaViewer } = require( 'mmv' );

const MTH = {};

/**
 * Creates an mw.storage-like object.
 *
 * @param {Object} storage localStorage stub with getItem, setItem, removeItem methods
 * @return {mw.SafeStorage} Local storage-like object
 */
MTH.createLocalStorage = function ( storage ) {
	return new ( Object.getPrototypeOf( mw.storage ) ).constructor( storage );
};

/**
 * Returns a viewer object with all the appropriate placeholder functions.
 *
 * @return {MultimediaViewer}
 */
MTH.getMultimediaViewer = function () {
	return new MultimediaViewer( {
		language: function () {},
		recordVirtualViewBeaconURI: function () {},
		extensions: function () {
			return { jpg: 'default' };
		}
	} );
};

MTH.fixtures = {};
MTH.fixtures.imageinfoApi = {};
MTH.fixtures.imageinfoApi.makeBasic = function ( imageinfo = {} ) {
	return {
		pageid: 42,
		imagerepository: 'repo',
		imageinfo: [ {
			// iiprop=size
			size: 1,
			width: 0,
			height: 0,
			// iiprop=mime
			mime: 'image/jpeg',
			// iiprop=url
			url: undefined,
			descriptionurl: undefined,
			descriptionshorturl: undefined,
			...imageinfo,
			// iiprop=extmetadata
			extmetadata: {
				// uploadDateTime
				DateTime: { value: '2011-04-01 09:00:00' },
				// creationDateTime
				DateTimeOriginal: { value: '1991-10-18 14:00:00' },
				// description
				ImageDescription: { value: 'My example description' },
				Credit: undefined,
				// author
				Artist: undefined,
				// authorCount
				AuthorCount: undefined,
				// license
				LicenseShortName: undefined,
				License: undefined,
				UsageTerms: undefined,
				LicenseUrl: undefined,
				// permission
				Permission: undefined,
				// attribution
				Attribution: undefined,
				// deletionReason
				DeletionReason: undefined,
				...imageinfo.extmetadata
			}
		} ]
	};
};

module.exports = MTH;
