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

( function ( mw, $ ) {
	QUnit.module( 'mmv.Config', QUnit.newMwEnvironment() );

	QUnit.test( 'Constructor sanity test', 1, function ( assert ) {
		var config = new mw.mmv.Config( {}, {}, {}, {}, null );
		assert.ok( config );
	} );

	QUnit.test( 'Localstorage get', 8, function ( assert ) {
		var localStorage, config;

		localStorage = undefined; // no browser support
		config = new mw.mmv.Config( {}, {}, {}, {}, localStorage );
		assert.strictEqual( config.getFromLocalStorage( 'foo' ), null, 'Returns null when not supported' );
		assert.strictEqual( config.getFromLocalStorage( 'foo', 'bar' ), 'bar', 'Returns fallback when not supported' );

		localStorage = null; // browser supports it but disabled
		config = new mw.mmv.Config( {}, {}, {}, {}, localStorage );
		assert.strictEqual( config.getFromLocalStorage( 'foo' ), null, 'Returns null when disabled' );
		assert.strictEqual( config.getFromLocalStorage( 'foo', 'bar' ), 'bar', 'Returns fallback when disabled' );

		localStorage = { getItem: this.sandbox.stub() };
		config = new mw.mmv.Config( {}, {}, {}, {}, localStorage );

		localStorage.getItem.withArgs( 'foo' ).returns( null );
		assert.strictEqual( config.getFromLocalStorage( 'foo' ), null, 'Returns null when key not set' );
		assert.strictEqual( config.getFromLocalStorage( 'foo', 'bar' ), 'bar', 'Returns fallback when key not set' );

		localStorage.getItem.reset();
		localStorage.getItem.withArgs( 'foo' ).returns( 'boom' );
		assert.strictEqual( config.getFromLocalStorage( 'foo' ), 'boom', 'Returns correct value' );
		assert.strictEqual( config.getFromLocalStorage( 'foo', 'bar' ), 'boom', 'Returns correct value ignoring fallback' );
	} );

	QUnit.test( 'Localstorage set', 4, function ( assert ) {
		var localStorage, config;

		localStorage = undefined; // no browser support
		config = new mw.mmv.Config( {}, {}, {}, {}, localStorage );
		assert.strictEqual( config.setInLocalStorage( 'foo', 'bar' ), false, 'Returns false when not supported' );

		localStorage = null; // browser supports it but disabled
		config = new mw.mmv.Config( {}, {}, {}, {}, localStorage );
		assert.strictEqual( config.setInLocalStorage( 'foo', 'bar' ), false, 'Returns false when disabled' );

		localStorage = { setItem: this.sandbox.stub() };
		config = new mw.mmv.Config( {}, {}, {}, {}, localStorage );

		assert.strictEqual( config.setInLocalStorage( 'foo', 'bar' ), true, 'Returns true when works' );

		localStorage.setItem.throwsException( 'localStorage full!' );
		assert.strictEqual( config.setInLocalStorage( 'foo', 'bar' ), false, 'Returns false on error' );
	} );

	QUnit.test( 'Localstorage remove', 4, function ( assert ) {
		var localStorage, config;

		localStorage = undefined; // no browser support
		config = new mw.mmv.Config( {}, {}, {}, {}, localStorage );
		assert.strictEqual( config.removeFromLocalStorage( 'foo' ), true, 'Returns true when not supported' );

		localStorage = null; // browser supports it but disabled
		config = new mw.mmv.Config( {}, {}, {}, {}, localStorage );
		assert.strictEqual( config.removeFromLocalStorage( 'foo' ), true , 'Returns true when disabled' );

		localStorage = { removeItem: this.sandbox.stub() };
		config = new mw.mmv.Config( {}, {}, {}, {}, localStorage );

		assert.strictEqual( config.removeFromLocalStorage( 'foo' ), true, 'Returns true when works' );

		localStorage.removeItem.throwsException( 'cannot write localStorage!' );
		assert.strictEqual( config.removeFromLocalStorage( 'foo' ), false, 'Returns false on error' );
	} );

	QUnit.test( 'isMediaViewerEnabledOnClick', 7, function ( assert ) {
		var localStorage = { getItem: this.sandbox.stub() },
			mwConfig = { get: this.sandbox.stub() },
			mwUser = { isAnon: this.sandbox.stub() },
			config = new mw.mmv.Config( {}, mwConfig, mwUser, {}, localStorage );

		mwUser.isAnon.returns( false );
		mwConfig.get.withArgs( 'wgMediaViewer' ).returns( true );
		mwConfig.get.withArgs( 'wgMediaViewerOnClick' ).returns( true );
		assert.strictEqual( config.isMediaViewerEnabledOnClick(), true, 'Returns true for logged-in with standard settings' );

		mwUser.isAnon.returns( false );
		mwConfig.get.withArgs( 'wgMediaViewer' ).returns( false );
		mwConfig.get.withArgs( 'wgMediaViewerOnClick' ).returns( true );
		assert.strictEqual( config.isMediaViewerEnabledOnClick(), false, 'Returns false if opted out via user JS flag' );

		mwUser.isAnon.returns( false );
		mwConfig.get.withArgs( 'wgMediaViewer' ).returns( true );
		mwConfig.get.withArgs( 'wgMediaViewerOnClick' ).returns( false );
		assert.strictEqual( config.isMediaViewerEnabledOnClick(), false, 'Returns false if opted out via preferences' );

		mwUser.isAnon.returns( true );
		mwConfig.get.withArgs( 'wgMediaViewer' ).returns( false );
		mwConfig.get.withArgs( 'wgMediaViewerOnClick' ).returns( true );
		assert.strictEqual( config.isMediaViewerEnabledOnClick(), false, 'Returns false if anon user opted out via user JS flag' );

		mwUser.isAnon.returns( true );
		mwConfig.get.withArgs( 'wgMediaViewer' ).returns( true );
		mwConfig.get.withArgs( 'wgMediaViewerOnClick' ).returns( false );
		assert.strictEqual( config.isMediaViewerEnabledOnClick(), false, 'Returns false if anon user opted out in some weird way' ); // apparently someone created a browser extension to do this

		mwUser.isAnon.returns( true );
		mwConfig.get.withArgs( 'wgMediaViewer' ).returns( true );
		mwConfig.get.withArgs( 'wgMediaViewerOnClick' ).returns( true );
		localStorage.getItem.withArgs( 'wgMediaViewerOnClick' ).returns( null );
		assert.strictEqual( config.isMediaViewerEnabledOnClick(), true, 'Returns true for anon with standard settings' );

		mwUser.isAnon.returns( true );
		mwConfig.get.withArgs( 'wgMediaViewer' ).returns( true );
		mwConfig.get.withArgs( 'wgMediaViewerOnClick' ).returns( true );
		localStorage.getItem.withArgs( 'wgMediaViewerOnClick' ).returns( '0' );
		assert.strictEqual( config.isMediaViewerEnabledOnClick(), false, 'Returns true for anon opted out via localSettings' );
	} );

	QUnit.test( 'setMediaViewerEnabledOnClick sanity check', 3, function ( assert ) {
		var localStorage = { getItem: this.sandbox.stub(), setItem: this.sandbox.stub(), removeItem: this.sandbox.stub() },
			mwUser = { isAnon: this.sandbox.stub() },
			mwConfig = new mw.Map( { wgMediaViewerEnabledByDefault: false } ),
			api = { postWithToken: this.sandbox.stub().returns( $.Deferred().resolve() ) },
			config = new mw.mmv.Config( {}, mwConfig, mwUser, api, localStorage );

		mwUser.isAnon.returns( false );
		api.postWithToken.returns( $.Deferred().resolve() );
		config.setMediaViewerEnabledOnClick( false );
		assert.ok( api.postWithToken.called, 'For logged-in users, pref change is via API' );

		mwUser.isAnon.returns( true );
		config.setMediaViewerEnabledOnClick( false );
		assert.ok( localStorage.setItem.called, 'For anons, opt-out is set in localStorage' );

		mwUser.isAnon.returns( true );
		config.setMediaViewerEnabledOnClick( true );
		assert.ok( localStorage.removeItem.called, 'For anons, opt-in means clearing localStorage' );
	} );

	QUnit.test( 'canSetMediaViewerEnabledOnClick', 4, function ( assert ) {
		var mwUser = { isAnon: this.sandbox.stub() },
			config = new mw.mmv.Config( {}, {}, mwUser, {}, {} );

		mwUser.isAnon.returns( false );
		assert.strictEqual( config.canSetMediaViewerEnabledOnClick(), true, 'Logged-in users can always disable' );

		mwUser.isAnon.returns( true );
		config = new mw.mmv.Config( {}, {}, mwUser, {}, {} );
		assert.strictEqual( config.canSetMediaViewerEnabledOnClick(), true, 'Anons can disable when they have localStorage support' );

		mwUser.isAnon.returns( true );
		config = new mw.mmv.Config( {}, {}, mwUser, {}, null );
		assert.strictEqual( config.canSetMediaViewerEnabledOnClick(), false, 'Anons cannot disable when they have no localStorage support' );

		mwUser.isAnon.returns( true );
		config = new mw.mmv.Config( {}, {}, mwUser, {}, undefined );
		assert.strictEqual( config.canSetMediaViewerEnabledOnClick(), false, 'Anons cannot disable when disabled localStorage' );
	} );

	QUnit.test( 'shouldShowStatusInfo', 12, function ( assert ) {
		var config,
			mwConfig = new mw.Map( {
				wgMediaViewer: true,
				wgMediaViewerOnClick: true,
				wgMediaViewerEnabledByDefault: true
			} ),
			fakeLocalStorage = mw.mmv.testHelpers.getFakeLocalStorage(),
			mwUser = { isAnon: this.sandbox.stub() },
			api = { postWithToken: this.sandbox.stub().returns( $.Deferred().resolve() ) };

		config = new mw.mmv.Config( {}, mwConfig, mwUser, api, fakeLocalStorage );
		mwUser.isAnon.returns( false );

		assert.strictEqual( config.shouldShowStatusInfo(), false, 'Status info is not shown by default' );
		config.setMediaViewerEnabledOnClick( false );
		assert.strictEqual( config.shouldShowStatusInfo(), true, 'Status info is shown after MMV is disabled the first time' );
		config.setMediaViewerEnabledOnClick( true );
		assert.strictEqual( config.shouldShowStatusInfo(), false, 'Status info is not shown when MMV is enabled' );
		config.setMediaViewerEnabledOnClick( false );
		assert.strictEqual( config.shouldShowStatusInfo(), true, 'Status info is shown after MMV is disabled the first time' );
		config.disableStatusInfo();
		assert.strictEqual( config.shouldShowStatusInfo(), false, 'Status info is not shown when already displayed once' );
		config.setMediaViewerEnabledOnClick( true );
		assert.strictEqual( config.shouldShowStatusInfo(), false, 'Further status changes have no effect' );
		config.setMediaViewerEnabledOnClick( false );
		assert.strictEqual( config.shouldShowStatusInfo(), false, 'Further status changes have no effect' );

		// make sure disabling calls maybeEnableStatusInfo() for logged-in as well
		config.localStorage = mw.mmv.testHelpers.getFakeLocalStorage();
		mwUser.isAnon.returns( true );
		assert.strictEqual( config.shouldShowStatusInfo(), false, 'Status info is not shown by default for logged-in users' );
		config.setMediaViewerEnabledOnClick( false );
		assert.strictEqual( config.shouldShowStatusInfo(), true, 'Status info is shown after MMV is disabled the first time for logged-in users' );

		// make sure popup is not shown immediately on disabled-by-default sites, but still works otherwise
		config.localStorage = mw.mmv.testHelpers.getFakeLocalStorage();
		mwConfig.set( 'wgMediaViewerEnabledByDefault', false );
		assert.strictEqual( config.shouldShowStatusInfo(), false, 'Status info is not shown by default' );
		config.setMediaViewerEnabledOnClick( true );
		assert.strictEqual( config.shouldShowStatusInfo(), false, 'Status info is not shown when MMV is enabled' );
		config.setMediaViewerEnabledOnClick( false );
		assert.strictEqual( config.shouldShowStatusInfo(), true, 'Status info is shown after MMV is disabled the first time' );
	} );
} ( mediaWiki, jQuery ) );
