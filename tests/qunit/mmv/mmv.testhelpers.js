const { MultimediaViewer } = require( 'mmv' );

const MTH = {};

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

/**
 * Copy the values of an object's prototype getters into a plain object,
 * so that they can be compared with assert.propContains().
 *
 * @param {Object} obj
 * @return {Object}
 */
MTH.flattenGetters = function ( obj ) {
	return Object.fromEntries(
		Object.entries( Object.getOwnPropertyDescriptors( Object.getPrototypeOf( obj ) ) )
			.filter( ( [ , descriptor ] ) => typeof descriptor.get === 'function' )
			.map( ( [ name ] ) => [ name, obj[ name ] ] )
	);
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
