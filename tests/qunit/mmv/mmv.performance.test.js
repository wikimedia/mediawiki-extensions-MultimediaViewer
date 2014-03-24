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

( function ( mw, $ ) {
	var stats;

	QUnit.module( 'mmv.performance', QUnit.newMwEnvironment() );

	function captureEventLog() {
		mw.eventLog = {
			logEvent: function( type, e ) {
				if ( type === 'MultimediaViewerNetworkPerformance' ) {
					stats = e;
				}
			}
		};
	}

	function createFakeXHR( response )  {
		return {
			readyState: 0,
			open: $.noop,
			send: function () {
				var xhr = this;

				setTimeout( function () {
					xhr.readyState = 4;
					xhr.response = response;
					if ( $.isFunction( xhr.onreadystatechange ) ) {
						xhr.onreadystatechange();
					}
				}, 0 );
			}
		};
	}

	QUnit.test( 'recordEntry: basic', 5, function ( assert ) {
		var performance = new mw.mmv.Performance(),
			oldEventLog = mw.eventLog,
			type = 'gender',
			total = 10;

		captureEventLog();

		stats = undefined;

		performance.isInSample = function() { return false; };

		performance.recordEntry( type, total );

		assert.strictEqual( stats, undefined, 'No stats should be recorded if not in sample' );

		stats = undefined;

		performance.isInSample = function() { return true; };

		performance.recordEntry( type, total );

		assert.strictEqual( stats.type, type, 'Type of event matches' );
		assert.strictEqual( stats.total, total, 'total is correct' );

		stats = undefined;

		performance.recordEntry( type, total, 'URL' );

		assert.ok( stats !== undefined, 'Stats should be recorded' );

		stats = undefined;

		performance.recordEntry( type, total, 'URL' );

		assert.strictEqual( stats, undefined, 'Stats should not be recorded a second time for the same URL' );

		stats = undefined;

		mw.eventLog = oldEventLog;
	} );

	QUnit.test( 'recordEntry: with Navigation Timing data', 28, function ( assert ) {
		var fakeRequest,
			varnish1 = 'cp1061',
			varnish2 = 'cp3006',
			varnish3 = 'cp3005',
			varnish1hits = 0,
			varnish2hits = 2,
			varnish3hits = 1,
			xvarnish = '1754811951 1283049064, 1511828531, 1511828573 1511828528',
			xcache = varnish1 + ' miss (0), ' + varnish2  + ' miss (2), ' + varnish3 + ' frontend hit (1), malformed(5)',
			age = '12345',
			contentLength = '23456',
			urlHost = 'fail',
			date = 'Tue, 04 Feb 2014 11:11:50 GMT',
			timestamp = 1391512310,
			url = 'https://' + urlHost + '/balls.jpg',
			redirect = 500,
			dns = 2,
			tcp = 10,
			request = 25,
			response = 50,
			cache = 1,
			perfData = {
				initiatorType: 'xmlhttprequest',
				name: url,
				duration: 12345,
				redirectStart: 1000,
				redirectEnd: 1500,
				domainLookupStart: 2,
				domainLookupEnd: 4,
				connectStart: 50,
				connectEnd: 60,
				requestStart: 125,
				responseStart: 150,
				responseEnd: 200,
				fetchStart: 1
			},
			country = 'FR',
			oldGeo = window.Geo,
			oldEventLog = mw.eventLog,
			type = 'image',
			performance = new mw.mmv.Performance(),
			status = 200,
			metered = true,
			bandwidth = 45.67;

		stats = undefined;

		performance.getWindowPerformance = function() {
			return {
				getEntriesByName: function () {
					return [perfData, {
						initiatorType: 'bogus',
						duration: 1234,
						name: url
					}];
				}
			};
		};

		performance.getNavigatorConnection = function() {
			return {
				metered: metered,
				bandwidth: bandwidth
			};
		};

		performance.isInSample = function() { return true; };

		fakeRequest = {
			getResponseHeader: function ( header ) {
				switch ( header ) {
					case 'X-Cache':
						return xcache;
					case 'X-Varnish':
						return xvarnish;
					case 'Age':
						return age;
					case 'Content-Length':
						return contentLength;
					case 'Date':
						return date;
				}
			},
			status: status
		};

		window.Geo = {
			country: country
		};

		captureEventLog();

		performance.recordEntry( type, 1, url, fakeRequest );

		assert.strictEqual( stats.type, type, 'Type of event matches' );
		assert.strictEqual( stats.varnish1, varnish1, 'First varnish server name extracted' );
		assert.strictEqual( stats.varnish2, varnish2, 'Second varnish server name extracted' );
		assert.strictEqual( stats.varnish3, varnish3, 'Third varnish server name extracted' );
		assert.strictEqual( stats.varnish4, undefined, 'Fourth varnish server is undefined' );
		assert.strictEqual( stats.varnish1hits, varnish1hits, 'First varnish hit count extracted' );
		assert.strictEqual( stats.varnish2hits, varnish2hits, 'Second varnish hit count extracted' );
		assert.strictEqual( stats.varnish3hits, varnish3hits, 'Third varnish hit count extracted' );
		assert.strictEqual( stats.varnish4hits, undefined, 'Fourth varnish hit count is undefined' );
		assert.strictEqual( stats.XVarnish, xvarnish, 'X-Varnish header passed as-is' );
		assert.strictEqual( stats.XCache, xcache, 'X-Cache header passed as-is' );
		assert.strictEqual( stats.age, parseInt( age, 10 ), 'Age header converted to integer' );
		assert.strictEqual( stats.contentLength, parseInt( contentLength, 10 ),
			'Content-Length header converted to integer' );
		assert.strictEqual( stats.contentHost, window.location.host, 'contentHost is correct' );
		assert.strictEqual( stats.urlHost, urlHost, 'urlHost is correct' );
		assert.strictEqual( stats.timestamp, timestamp, 'timestamp is correct' );
		assert.strictEqual( stats.total, perfData.duration, 'total is correct' );
		assert.strictEqual( stats.redirect, redirect, 'redirect is correct' );
		assert.strictEqual( stats.dns, dns, 'dns is correct' );
		assert.strictEqual( stats.tcp, tcp, 'tcp is correct' );
		assert.strictEqual( stats.request, request, 'request is correct' );
		assert.strictEqual( stats.response, response, 'response is correct' );
		assert.strictEqual( stats.cache, cache, 'cache is correct' );
		assert.strictEqual( stats.country, country, 'country is correct' );
		assert.strictEqual( stats.isHttps, true, 'isHttps is correct' );
		assert.strictEqual( stats.status, status, 'status is correct' );
		assert.strictEqual( stats.metered, metered, 'metered is correct' );
		assert.strictEqual( stats.bandwidth, Math.round( bandwidth ), 'bandwidth is correct' );

		window.Geo = oldGeo;
		mw.eventLog = oldEventLog;

		stats = undefined;
	} );

	QUnit.test( 'parseVarnishXCacheHeader', 15, function ( assert ) {
		var varnish1 = 'cp1061',
			varnish2 = 'cp3006',
			varnish3 = 'cp3005',
			testString = varnish1 + ' miss (0), ' + varnish2  + ' miss (0), ' + varnish3 + ' frontend hit (1)',
			performance = new mw.mmv.Performance(),
			varnishXCache = performance.parseVarnishXCacheHeader( testString );

		assert.strictEqual( varnishXCache.varnish1, varnish1, 'First varnish server name extracted' );
		assert.strictEqual( varnishXCache.varnish2, varnish2, 'Second varnish server name extracted' );
		assert.strictEqual( varnishXCache.varnish3, varnish3, 'Third varnish server name extracted' );
		assert.strictEqual( varnishXCache.varnish4, undefined, 'Fourth varnish server is undefined' );
		assert.strictEqual( varnishXCache.varnish1hits, 0, 'First varnish hit count extracted' );
		assert.strictEqual( varnishXCache.varnish2hits, 0, 'Second varnish hit count extracted' );
		assert.strictEqual( varnishXCache.varnish3hits, 1, 'Third varnish hit count extracted' );
		assert.strictEqual( varnishXCache.varnish4hits, undefined, 'Fourth varnish hit count is undefined' );

		testString = varnish1 + ' miss (36), ' + varnish2  + ' miss (2)';
		varnishXCache = performance.parseVarnishXCacheHeader( testString );

		assert.strictEqual( varnishXCache.varnish1, varnish1, 'First varnish server name extracted' );
		assert.strictEqual( varnishXCache.varnish2, varnish2, 'Second varnish server name extracted' );
		assert.strictEqual( varnishXCache.varnish3, undefined, 'Third varnish server is undefined' );
		assert.strictEqual( varnishXCache.varnish1hits, 36, 'First varnish hit count extracted' );
		assert.strictEqual( varnishXCache.varnish2hits, 2, 'Second varnish hit count extracted' );
		assert.strictEqual( varnishXCache.varnish3hits, undefined, 'Third varnish hit count is undefined' );

		varnishXCache = performance.parseVarnishXCacheHeader( 'garbage' );
		assert.ok( $.isEmptyObject( varnishXCache ), 'Varnish cache results are empty' );
	} );

	QUnit.test( 'record()', 4, function ( assert ) {
		var type = 'foo',
			url = 'http://example.com/',
			response = {},
			performance = new mw.mmv.Performance();

		performance.newXHR = function () { return createFakeXHR( response ); };

		QUnit.stop();
		performance.recordEntryDelayed = function ( recordType, _, recordUrl, recordRequest ) {
			assert.strictEqual( recordType, type, 'type is recorded correctly' );
			assert.strictEqual( recordUrl, url, 'url is recorded correctly' );
			assert.strictEqual( recordRequest.response, response, 'response is recorded correctly' );
			QUnit.start();
		};

		QUnit.stop();
		performance.record( type, url ).done( function ( recordResponse ) {
			assert.strictEqual( recordResponse, response, 'response is passed to callback' );
			QUnit.start();
		} );
	} );

	QUnit.asyncTest( 'record() with old browser', 1, function ( assert ) {
		var type = 'foo',
			url = 'http://example.com/',
			performance = new mw.mmv.Performance();

		performance.newXHR = function () { throw 'XMLHttpRequest? What\'s that?'; };

		performance.record( type, url ).fail( function () {
			assert.ok( true, 'the promise is rejected when XMLHttpRequest is not supported' );
			QUnit.start();
		} );
	} );

	QUnit.test( 'mw.mmv.Api', 3, function ( assert ) {
		var api,
			oldRecord = mw.mmv.Performance.prototype.recordJQueryEntryDelayed,
			oldAjax = mw.Api.prototype.ajax,
			ajaxCalled = false,
			fakeJqxhr = {};

		mw.Api.prototype.ajax = function() {
			ajaxCalled = true;
			return $.Deferred().resolve( {}, fakeJqxhr );
		};

		mw.mmv.Performance.prototype.recordJQueryEntryDelayed = function ( type, total, jqxhr ) {
			assert.strictEqual( type, 'foo', 'type was passed correctly' );
			assert.strictEqual( jqxhr, fakeJqxhr, 'jqXHR was passed correctly' );
		};

		api = new mw.mmv.Api( 'foo' );

		api.ajax();

		assert.ok( ajaxCalled, 'parent ajax() function was called' );

		mw.mmv.Performance.prototype.recordJQueryEntryDelayed = oldRecord;
		mw.Api.prototype.ajax = oldAjax;
	} );
}( mediaWiki, jQuery ) );
