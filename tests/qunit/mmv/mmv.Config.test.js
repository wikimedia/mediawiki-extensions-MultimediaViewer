/*
 * This file is part of the MediaWiki extension MediaViewer.
 *
 * MediaViewer is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * MediaViewer is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with MediaViewer.  If not, see <http://www.gnu.org/licenses/>.
 */

const { isMediaViewerEnabledOnClick } = require( 'mmv.head' );
const { Config } = require( 'mmv.bootstrap' );
const { createLocalStorage, getDisabledLocalStorage, getFakeLocalStorage, getUnsupportedLocalStorage } = require( './mmv.testhelpers.js' );
const config0 = mw.config;
const storage = mw.storage;
const user = mw.user;

( function () {
	QUnit.module( 'mmv.Config', QUnit.newMwEnvironment( {
		afterEach: function () {
			mw.config = config0;
			mw.storage = storage;
			mw.user = user;
		}
	} ) );

	QUnit.test( 'constructor', ( assert ) => {
		const config = new Config( {}, {} );
		assert.true( config instanceof Config );
	} );

	QUnit.test( 'getFromLocalStorage', function ( assert ) {
		let config;

		mw.storage = getUnsupportedLocalStorage(); // no browser support
		config = new Config( {}, {} );
		assert.strictEqual( config.getFromLocalStorage( 'foo' ), null, 'Returns null when not supported' );
		assert.strictEqual( config.getFromLocalStorage( 'foo', 'bar' ), 'bar', 'Returns fallback when not supported' );

		mw.storage = getDisabledLocalStorage(); // browser supports it but disabled
		config = new Config( {}, {} );
		assert.strictEqual( config.getFromLocalStorage( 'foo' ), null, 'Returns null when disabled' );
		assert.strictEqual( config.getFromLocalStorage( 'foo', 'bar' ), 'bar', 'Returns fallback when disabled' );

		mw.storage = createLocalStorage( { getItem: this.sandbox.stub() } );
		config = new Config( {}, {} );

		mw.storage.store.getItem.withArgs( 'foo' ).returns( null );
		assert.strictEqual( config.getFromLocalStorage( 'foo' ), null, 'Returns null when key not set' );
		assert.strictEqual( config.getFromLocalStorage( 'foo', 'bar' ), 'bar', 'Returns fallback when key not set' );

		mw.storage.store.getItem.reset();
		mw.storage.store.getItem.withArgs( 'foo' ).returns( 'boom' );
		assert.strictEqual( config.getFromLocalStorage( 'foo' ), 'boom', 'Returns correct value' );
		assert.strictEqual( config.getFromLocalStorage( 'foo', 'bar' ), 'boom', 'Returns correct value ignoring fallback' );
	} );

	QUnit.test( 'setInLocalStorage', function ( assert ) {
		let config;

		mw.storage = getUnsupportedLocalStorage(); // no browser support
		config = new Config( {}, {} );
		assert.strictEqual( config.setInLocalStorage( 'foo', 'bar' ), false, 'Returns false when not supported' );

		mw.storage = getDisabledLocalStorage(); // browser supports it but disabled
		config = new Config( {}, {} );
		assert.strictEqual( config.setInLocalStorage( 'foo', 'bar' ), false, 'Returns false when disabled' );

		mw.storage = createLocalStorage( { setItem: this.sandbox.stub(), removeItem: this.sandbox.stub() } );
		config = new Config( {}, {} );

		assert.strictEqual( config.setInLocalStorage( 'foo', 'bar' ), true, 'Returns true when works' );

		mw.storage.store.setItem.throwsException( 'localStorage full!' );
		assert.strictEqual( config.setInLocalStorage( 'foo', 'bar' ), false, 'Returns false on error' );
	} );

	QUnit.test( 'Localstorage remove', function ( assert ) {
		let config;

		mw.storage = getUnsupportedLocalStorage(); // no browser support
		config = new Config( {}, {} );
		assert.strictEqual( config.removeFromLocalStorage( 'foo' ), true, 'Returns true when not supported' );

		mw.storage = getDisabledLocalStorage(); // browser supports it but disabled
		config = new Config( {}, {} );
		assert.strictEqual( config.removeFromLocalStorage( 'foo' ), true, 'Returns true when disabled' );

		mw.storage = createLocalStorage( { removeItem: this.sandbox.stub() } );
		config = new Config( {}, {} );
		assert.strictEqual( config.removeFromLocalStorage( 'foo' ), true, 'Returns true when works' );
	} );

	QUnit.test( 'isMediaViewerEnabledOnClick', function ( assert ) {
		mw.storage = createLocalStorage( { getItem: this.sandbox.stub() } );
		mw.config = { get: this.sandbox.stub() };
		mw.user = { isNamed: this.sandbox.stub() };

		mw.user.isNamed.returns( true );
		mw.config.get.withArgs( 'wgMediaViewer' ).returns( true );
		mw.config.get.withArgs( 'wgMediaViewerOnClick' ).returns( true );
		assert.strictEqual( isMediaViewerEnabledOnClick( mw.config, mw.user ), true, 'Returns true for logged-in with standard settings' );

		mw.user.isNamed.returns( true );
		mw.config.get.withArgs( 'wgMediaViewer' ).returns( false );
		mw.config.get.withArgs( 'wgMediaViewerOnClick' ).returns( true );
		assert.strictEqual( isMediaViewerEnabledOnClick( mw.config, mw.user ), false, 'Returns false if opted out via user JS flag' );

		mw.user.isNamed.returns( true );
		mw.config.get.withArgs( 'wgMediaViewer' ).returns( true );
		mw.config.get.withArgs( 'wgMediaViewerOnClick' ).returns( false );
		assert.strictEqual( isMediaViewerEnabledOnClick( mw.config, mw.user ), false, 'Returns false if opted out via preferences' );

		mw.user.isNamed.returns( false );
		mw.config.get.withArgs( 'wgMediaViewer' ).returns( false );
		mw.config.get.withArgs( 'wgMediaViewerOnClick' ).returns( true );
		assert.strictEqual( isMediaViewerEnabledOnClick( mw.config, mw.user ), false, 'Returns false if anon user opted out via user JS flag' );

		mw.user.isNamed.returns( false );
		mw.config.get.withArgs( 'wgMediaViewer' ).returns( true );
		mw.config.get.withArgs( 'wgMediaViewerOnClick' ).returns( false );
		assert.strictEqual( isMediaViewerEnabledOnClick( mw.config, mw.user ), false, 'Returns false if anon user opted out in some weird way' ); // apparently someone created a browser extension to do this

		mw.user.isNamed.returns( false );
		mw.config.get.withArgs( 'wgMediaViewer' ).returns( true );
		mw.config.get.withArgs( 'wgMediaViewerOnClick' ).returns( true );
		mw.storage.store.getItem.withArgs( 'wgMediaViewerOnClick' ).returns( null );
		assert.strictEqual( isMediaViewerEnabledOnClick( mw.config, mw.user ), true, 'Returns true for anon with standard settings' );

		mw.user.isNamed.returns( false );
		mw.config.get.withArgs( 'wgMediaViewer' ).returns( true );
		mw.config.get.withArgs( 'wgMediaViewerOnClick' ).returns( true );
		mw.storage.store.getItem.withArgs( 'wgMediaViewerOnClick' ).returns( '0' );
		assert.strictEqual( isMediaViewerEnabledOnClick( mw.config, mw.user ), false, 'Returns true for anon opted out via localSettings' );
	} );

	QUnit.test( 'setMediaViewerEnabledOnClick sense check', function ( assert ) {
		mw.storage = createLocalStorage( {
			getItem: this.sandbox.stub(),
			setItem: this.sandbox.stub(),
			removeItem: this.sandbox.stub()
		} );
		mw.user = { isNamed: this.sandbox.stub() };
		mw.config = new mw.Map();
		mw.config.set( 'wgMediaViewerEnabledByDefault', false );
		const api = { saveOption: this.sandbox.stub().returns( $.Deferred().resolve() ) };
		const config = new Config( {}, api );

		mw.user.isNamed.returns( true );
		api.saveOption.returns( $.Deferred().resolve() );
		config.setMediaViewerEnabledOnClick( false );
		assert.true( api.saveOption.called, 'For logged-in users, pref change is via API' );

		mw.user.isNamed.returns( false );
		config.setMediaViewerEnabledOnClick( false );
		assert.true( mw.storage.store.setItem.called, 'For anons, opt-out is set in localStorage' );

		mw.user.isNamed.returns( false );
		config.setMediaViewerEnabledOnClick( true );
		assert.true( mw.storage.store.removeItem.called, 'For anons, opt-in means clearing localStorage' );
	} );

	QUnit.test( 'shouldShowStatusInfo', function ( assert ) {
		mw.config = new mw.Map();
		mw.storage = getFakeLocalStorage();
		mw.user = { isNamed: this.sandbox.stub() };
		const api = { saveOption: this.sandbox.stub().returns( $.Deferred().resolve() ) };

		mw.config.set( {
			wgMediaViewer: true,
			wgMediaViewerOnClick: true,
			wgMediaViewerEnabledByDefault: true
		} );
		let config = new Config( {}, api );
		mw.user.isNamed.returns( true );

		assert.strictEqual( config.shouldShowStatusInfo(), false, 'Status info is not shown by default' );
		config.setMediaViewerEnabledOnClick( false );
		assert.strictEqual( config.shouldShowStatusInfo(), true, 'Status info is shown after MMV is disabled the first time' );
		config.setMediaViewerEnabledOnClick( true );
		assert.strictEqual( config.shouldShowStatusInfo(), false, 'Status info is not shown when MMV is enabled' );
		config.setMediaViewerEnabledOnClick( false );
		assert.strictEqual( config.shouldShowStatusInfo(), true, 'Status info is shown after MMV is disabled the first time #2' );
		config.disableStatusInfo();
		assert.strictEqual( config.shouldShowStatusInfo(), false, 'Status info is not shown when already displayed once' );
		config.setMediaViewerEnabledOnClick( true );
		assert.strictEqual( config.shouldShowStatusInfo(), false, 'Further status changes have no effect' );
		config.setMediaViewerEnabledOnClick( false );
		assert.strictEqual( config.shouldShowStatusInfo(), false, 'Further status changes have no effect #2' );

		// make sure disabling calls maybeEnableStatusInfo() for logged-in as well
		mw.storage = getFakeLocalStorage();
		config = new Config( {}, api );
		mw.user.isNamed.returns( false );
		assert.strictEqual( config.shouldShowStatusInfo(), false, 'Status info is not shown by default for logged-in users' );
		config.setMediaViewerEnabledOnClick( false );
		assert.strictEqual( config.shouldShowStatusInfo(), true, 'Status info is shown after MMV is disabled the first time for logged-in users' );

		// make sure popup is not shown immediately on disabled-by-default sites, but still works otherwise
		mw.storage = getFakeLocalStorage();
		config = new Config( {}, api );
		mw.config.set( 'wgMediaViewerEnabledByDefault', false );
		assert.strictEqual( config.shouldShowStatusInfo(), false, 'Status info is not shown by default #2' );
		config.setMediaViewerEnabledOnClick( true );
		assert.strictEqual( config.shouldShowStatusInfo(), false, 'Status info is not shown when MMV is enabled #2' );
		config.setMediaViewerEnabledOnClick( false );
		assert.strictEqual( config.shouldShowStatusInfo(), true, 'Status info is shown after MMV is disabled the first time #2' );
	} );
}() );
