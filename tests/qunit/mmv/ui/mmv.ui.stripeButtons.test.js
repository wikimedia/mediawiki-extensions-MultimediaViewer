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

( function( mw, $ ) {
	var oldShowSurvey;

	QUnit.module( 'mmv.ui.StripeButtons', QUnit.newMwEnvironment( {
		setup: function () {
			// pretend surveys are enabled for this site
			oldShowSurvey = mw.config.get( 'wgMultimediaViewer' ).showSurvey;
			mw.config.get( 'wgMultimediaViewer' ).showSurvey = true;
		},
		teardown: function () {
			mw.config.get( 'wgMultimediaViewer' ).showSurvey = oldShowSurvey;
		}
	} ) );

	function createStripeButtons() {
		var fixture = $( '#qunit-fixture' );
		return new mw.mmv.ui.StripeButtons( fixture );
	}

	QUnit.test( 'Sanity test, object creation and UI construction', 4, function ( assert ) {
		var buttons,
			oldMwUserIsAnon = mw.user.isAnon;

		// first pretend we are anonymous
		mw.user.isAnon = function () { return true; };
		buttons = createStripeButtons();

		assert.ok( buttons, 'UI element is created.' );
		assert.strictEqual( buttons.buttons.$reuse.length, 1, 'Reuse button created.' );
		assert.ok( !buttons.buttons.$descriptionPage, 'File page button not created for anon.' );

		// now pretend we are logged in
		mw.user.isAnon = function () { return false; };
		buttons = createStripeButtons();

		assert.strictEqual( buttons.buttons.$descriptionPage.length, 1, 'File page button created for logged in.' );

		mw.user.isAnon = oldMwUserIsAnon;
	} );

	QUnit.test( 'Survey conditions', 3, function ( assert ) {
		var buttons,
			oldLanguage = mw.config.get( 'wgUserLanguage' );

		// pretend surveys are disabled for this site
		mw.config.get( 'wgMultimediaViewer' ).showSurvey = false;
		mw.config.set( 'wgUserLanguage', 'en' );
		buttons = createStripeButtons();
		assert.ok( !buttons.buttons.$feedback, 'No survey button by default.' );

		// pretend surveys are enabled for this site
		mw.config.get( 'wgMultimediaViewer' ).showSurvey = true;
		buttons = createStripeButtons();
		assert.ok( buttons.buttons.$feedback, 'Survey button shown when enabled.' );

		// now pretend we don't speak English
		mw.config.set( 'wgUserLanguage', 'el' );
		buttons = createStripeButtons();
		assert.ok( !buttons.buttons.$feedback, 'No survey for non-english speakers.' );

		mw.config.set( 'wgUserLanguage', oldLanguage );
	} );

	QUnit.test( 'set()/empty() sanity test:', 1, function ( assert ) {
		var buttons = createStripeButtons(),
			fakeImageInfo = { descriptionUrl: '//commons.wikimedia.org/wiki/File:Foo.jpg' },
			fakeRepoInfo = { displayName: 'Wikimedia Commons' };

		buttons.set( fakeImageInfo, fakeRepoInfo );
		buttons.empty();

		assert.ok( true, 'No error on set()/empty().' );
	} );

	QUnit.test( 'attach()/unattach():', 4, function ( assert ) {
		var buttons = createStripeButtons();

		$( document ).on( 'mmv-reuse-open.test', function ( e ) {
			assert.ok( e, 'Reuse panel opened.' );
		} );

		buttons.attach();
		buttons.buttons.$reuse.trigger( 'click.mmv-stripeButtons' );
		$( document ).trigger( 'mmv-reuse-opened' );
		assert.ok( buttons.buttons.$reuse.hasClass( 'open' ), 'open event is handled when attached' );
		$( document ).trigger( 'mmv-reuse-closed' );
		assert.ok( !buttons.buttons.$reuse.hasClass( 'open' ), 'close event is handled when attached' );

		buttons.unattach();
		buttons.buttons.$reuse.trigger( 'click.mmv-stripeButtons' );
		$( document ).trigger( 'mmv-reuse-opened' );
		assert.ok( !buttons.buttons.$reuse.hasClass( 'open' ), 'open event is not handled when unattached' );

		$( document ).off( 'mmv-reuse-open.test' );
	} );
}( mediaWiki, jQuery ) );
