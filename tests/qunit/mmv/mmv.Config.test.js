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

const { Config } = require( 'mmv.bootstrap' );
const { createLocalStorage } = require( './mmv.testhelpers.js' );
const config0 = mw.config;
const storage = mw.storage;
const user = mw.user;
const saveOption = mw.Api.prototype.saveOption;

QUnit.module( 'mmv.Config', QUnit.newMwEnvironment( {
	afterEach: function () {
		mw.config = config0;
		mw.storage = storage;
		mw.user = user;
		mw.Api.prototype.saveOption = saveOption;
	}
} ) );

QUnit.test( 'constructor', ( assert ) => {
	const config = new Config();
	assert.true( config instanceof Config );
} );

QUnit.test( 'isMediaViewerEnabledOnClick', function ( assert ) {
	mw.storage = createLocalStorage( { getItem: this.sandbox.stub() } );
	mw.config = { get: this.sandbox.stub() };
	mw.user = { isNamed: this.sandbox.stub() };

	mw.user.isNamed.returns( true );
	mw.config.get.withArgs( 'wgMediaViewer' ).returns( true );
	mw.config.get.withArgs( 'wgMediaViewerOnClick' ).returns( true );
	assert.strictEqual( Config.isMediaViewerEnabledOnClick(), true, 'Returns true for logged-in with standard settings' );

	mw.user.isNamed.returns( true );
	mw.config.get.withArgs( 'wgMediaViewer' ).returns( false );
	mw.config.get.withArgs( 'wgMediaViewerOnClick' ).returns( true );
	assert.strictEqual( Config.isMediaViewerEnabledOnClick(), false, 'Returns false if opted out via user JS flag' );

	mw.user.isNamed.returns( true );
	mw.config.get.withArgs( 'wgMediaViewer' ).returns( true );
	mw.config.get.withArgs( 'wgMediaViewerOnClick' ).returns( false );
	assert.strictEqual( Config.isMediaViewerEnabledOnClick(), false, 'Returns false if opted out via preferences' );

	mw.user.isNamed.returns( false );
	mw.config.get.withArgs( 'wgMediaViewer' ).returns( false );
	mw.config.get.withArgs( 'wgMediaViewerOnClick' ).returns( true );
	assert.strictEqual( Config.isMediaViewerEnabledOnClick(), false, 'Returns false if anon user opted out via user JS flag' );

	mw.user.isNamed.returns( false );
	mw.config.get.withArgs( 'wgMediaViewer' ).returns( true );
	mw.config.get.withArgs( 'wgMediaViewerOnClick' ).returns( false );
	assert.strictEqual( Config.isMediaViewerEnabledOnClick(), false, 'Returns false if anon user opted out in some weird way' ); // apparently someone created a browser extension to do this

	mw.user.isNamed.returns( false );
	mw.config.get.withArgs( 'wgMediaViewer' ).returns( true );
	mw.config.get.withArgs( 'wgMediaViewerOnClick' ).returns( true );
	mw.storage.store.getItem.withArgs( 'wgMediaViewerOnClick' ).returns( null );
	assert.strictEqual( Config.isMediaViewerEnabledOnClick(), true, 'Returns true for anon with standard settings' );

	mw.user.isNamed.returns( false );
	mw.config.get.withArgs( 'wgMediaViewer' ).returns( true );
	mw.config.get.withArgs( 'wgMediaViewerOnClick' ).returns( true );
	mw.storage.store.getItem.withArgs( 'wgMediaViewerOnClick' ).returns( '0' );
	assert.strictEqual( Config.isMediaViewerEnabledOnClick(), false, 'Returns true for anon opted out via localSettings' );
} );
