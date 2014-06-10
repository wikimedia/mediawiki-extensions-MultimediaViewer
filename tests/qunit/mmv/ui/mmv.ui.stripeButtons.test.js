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
			this.clock = this.sandbox.useFakeTimers();
		},
		teardown: function () {
			mw.config.get( 'wgMultimediaViewer' ).showSurvey = oldShowSurvey;
		}
	} ) );

	function createStripeButtons() {
		var fixture = $( '#qunit-fixture' );
		return new mw.mmv.ui.StripeButtons( fixture, {
			getItem: function () { return mw.mmv.ui.StripeButtons.feedbackSettings.tooltipMaxDisplayCount; },
			setItem: $.noop
		} );
	}

	QUnit.test( 'Sanity test, object creation and UI construction', 4, function ( assert ) {
		var buttons,
			oldMwUserIsAnon = mw.user.isAnon;

		// first pretend we are anonymous
		mw.user.isAnon = function () { return true; };
		buttons = createStripeButtons();

		assert.ok( buttons, 'UI element is created.' );
		assert.strictEqual( buttons.buttons.$reuse.length, 1, 'Reuse button created.' );
		assert.ok( buttons.buttons.$descriptionPage, 'File page button created for anon.' );

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

	QUnit.test( 'getFeedbackSurveyBaseUrlForLanguage()', 7, function ( assert ) {
		var buttons = createStripeButtons();

		assert.strictEqual( buttons.getFeedbackSurveyBaseUrlForLanguage( 'en' ),
			'https://www.surveymonkey.com/s/media-viewer-1', 'Base survey URL for english' );
		assert.strictEqual( buttons.getFeedbackSurveyBaseUrlForLanguage( 'hu' ),
			'https://www.surveymonkey.com/s/media-viewer-1-hu', 'Language code appended for supported languages' );
		assert.strictEqual( buttons.getFeedbackSurveyBaseUrlForLanguage( 'el' ),
			null, 'Null for non-supported languages' );
		assert.strictEqual( buttons.getFeedbackSurveyBaseUrlForLanguage( 'en-gb' ),
			'https://www.surveymonkey.com/s/media-viewer-1', 'Base survey URL for english variants' );
		assert.strictEqual( buttons.getFeedbackSurveyBaseUrlForLanguage( 'fr-xx' ),
			'https://www.surveymonkey.com/s/media-viewer-1-fr', 'Base code appended for other variants' );
		assert.strictEqual( buttons.getFeedbackSurveyBaseUrlForLanguage( 'pt-br' ),
			'https://www.surveymonkey.com/s/media-viewer-1-pt-br', 'Full code appended if the variant itself is supported' );
		assert.strictEqual( buttons.getFeedbackSurveyBaseUrlForLanguage( 'pt' ),
			'https://www.surveymonkey.com/s/media-viewer-1-pt-br', 'Temporary special case for pt' );
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

	QUnit.test( 'Feedback tooltip', 8, function ( assert ) {
		var buttons = createStripeButtons(),
			displayCount,
			hasTooltip = function () { return !!$( '.tipsy' ).length; };

		this.sandbox.stub( buttons.localStorage, 'getItem', function () { return displayCount; } );
		this.sandbox.stub( buttons.localStorage, 'setItem', function ( _, val ) { displayCount = val; } );

		displayCount = 0;
		buttons.attach();

		assert.ok( !hasTooltip(), 'No tooltip initially' );

		this.clock.tick( 1000 );
		assert.ok( !hasTooltip(), 'No tooltip after 1s' );

		this.clock.tick( 5000 );
		assert.ok( hasTooltip(), 'Tooltip visible after 6s' );
		assert.strictEqual( displayCount, 1, 'displayCount was increased' );

		this.clock.tick( 5000 );
		assert.ok( !hasTooltip(), 'Tooltip hidden again after 11s' );

		buttons.unattach();
		delete buttons.tooltipDisplayCount;

		displayCount = 3;
		buttons.attach();

		this.clock.tick( 6000 );
		assert.ok( !hasTooltip(), 'No tooltip after 6s when display count limit reached' );

		buttons.unattach();
		delete buttons.tooltipDisplayCount;

		displayCount = 0;
		buttons.openSurveyInNewWindow = this.sandbox.stub();
		buttons.attach();
		buttons.buttons.$feedback.triggerHandler( 'click' );

		this.clock.tick( 6000 );
		assert.ok( !hasTooltip(), 'No tooltip if button was clicked' );

		buttons.unattach();
		delete buttons.tooltipDisplayCount;

		displayCount = 0;
		buttons.attach();
		buttons.unattach();
		this.clock.tick( 6000 );
		assert.ok( !hasTooltip(), 'No tooltip when unattached' );
	} );

	QUnit.test( 'No localStorage', 3, function( assert ) {
		var fixture = $( '#qunit-fixture' ),
			buttons = new mw.mmv.ui.StripeButtons( fixture, undefined );

		assert.strictEqual( buttons.getTooltipDisplayCount(), buttons.feedbackSettings.tooltipMaxDisplayCount, 'Initial tooltip count is tooltipMaxDisplayCount' );

		buttons.increaseTooltipDisplayCount();

		assert.strictEqual( buttons.getTooltipDisplayCount(), buttons.feedbackSettings.tooltipMaxDisplayCount, 'Tooltip count is still tooltipMaxDisplayCount' );

		buttons.maxOutTooltipDisplayCount();

		assert.strictEqual( buttons.getTooltipDisplayCount(), buttons.feedbackSettings.tooltipMaxDisplayCount, 'Tooltip count is still tooltipMaxDisplayCount' );
	} );

	QUnit.test( 'Full localStorage', 3, function( assert ) {
		var buttons = createStripeButtons();

		this.sandbox.stub( buttons.localStorage, 'getItem', function () { return null; } );
		this.sandbox.stub( buttons.localStorage, 'setItem', function () { throw 'I am full'; } );

		assert.strictEqual( buttons.getTooltipDisplayCount(), buttons.feedbackSettings.tooltipMaxDisplayCount, 'Initial tooltip count is tooltipMaxDisplayCount' );

		buttons.increaseTooltipDisplayCount();

		assert.strictEqual( buttons.getTooltipDisplayCount(), buttons.feedbackSettings.tooltipMaxDisplayCount, 'Tooltip count is still tooltipMaxDisplayCount' );

		buttons.maxOutTooltipDisplayCount();

		assert.strictEqual( buttons.getTooltipDisplayCount(), buttons.feedbackSettings.tooltipMaxDisplayCount, 'Tooltip count is still tooltipMaxDisplayCount' );
	} );
}( mediaWiki, jQuery ) );
