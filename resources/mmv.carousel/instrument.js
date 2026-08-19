'use strict';

function getInstrumentPromise( instrumentName ) {
	// Instrumentation with TestKitchen as a soft dependency.
	// Discussion at
	// https://gerrit.wikimedia.org/r/c/mediawiki/extensions/MultimediaViewer/+/1297716/comments/4151eb46_78975b42.
	return mw.loader.using( 'ext.testKitchen' )
		.then( () => mw.testKitchen.getInstrument( instrumentName ) )
		.catch( () => {
			// eslint-disable-next-line no-console
			console.info( '[MultimediaViewer] TestKitchen not available: skipping instrumentation.' );
		} );
}

/*
 * This provides mw.testKitchen.InstrumentInterface-like
 * object that proxies to an actual instrument that may
 * not have yet been loaded (in which case the calls will
 * be stacked onto the promise and executed once the
 * instrument becomes available) or will not load at all
 * (in which case these will be a no-op)
 *
 * This simplifies implementation as it auto-queues events,
 * and makes existence-checking unnecessary. I'm not yet
 * entirely sure whether this is a good idea (mostly because
 * it hinges on the InstrumentInterface remaining stable)
 *
 * @param {string} instrumentName
 * @return {mw.testKitchen.InstrumentInterface}
 */
function getInstrumentProxy( instrumentName ) {
	const instrumentPromise = getInstrumentPromise( instrumentName );
	const instrumentProxy = new Proxy(
		{},
		{
			get: ( target, prop ) => {
				switch ( prop ) {
					// void methods
					case 'send':
					case 'sendImmediately':
					case 'submitInteraction':
						return function ( ...args ) {
							instrumentPromise.then( ( instrument ) => {
								if ( instrument ) {
									instrument[ prop ].apply( instrument, args );
								}
							} );
						};
					// `this` return methods
					case 'setSchema':
						return function ( ...args ) {
							instrumentPromise.then( ( instrument ) => {
								if ( instrument ) {
									instrument[ prop ].apply( instrument, args );
								}
							} );
							return instrumentProxy;
						};
					case 'isInSample':
						// This can't return a valid result, given that the
						// actual data is potentially not (yet) known.
						// Just hard-fail, even if if `instrumentPromise` has
						// already resolved, to make it clear that this can't
						// be supported reliably through this proxy, and devs
						// will need to ensure the instrument has completed
						// loading before attempting to call this!
						throw new Error( `Property ${ prop } not supported through instrument proxy` );
				}
			},
			has: ( target, key ) => [
				'send',
				'sendImmediately',
				'submitInteraction',
				'setSchema',
				'isInSample'
			].includes( key )
		}
	);

	return instrumentProxy;
}

module.exports = exports = {
	getInstrumentPromise,
	getInstrumentProxy
};
