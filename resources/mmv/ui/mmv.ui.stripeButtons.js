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

( function( mw, $, oo ) {
	var SBP;

	/**
	 * @class mw.mmv.ui.StripeButtons
	 * @extends mw.mmv.ui.Element
	 * Class for buttons which are placed on the metadata stripe (the always visible part of the
	 * metadata panel).
	 * @constructor
	 * @param {jQuery} $container
	 */
	function StripeButtons( $container ) {
		mw.mmv.ui.Element.call( this, $container );

		this.$buttonContainer = $( '<div>' )
			.addClass( 'mw-mmv-stripe-button-container' )
			.appendTo( $container );

		/**
		 * This holds the actual buttons.
		 * @property {Object.<string, jQuery>}
		 */
		this.buttons = {};

		this.initFeedbackButton();
		this.initReuseButton();
	}
	oo.inheritClass( StripeButtons, mw.mmv.ui.Element );
	SBP = StripeButtons.prototype;

	/**
	 * @protected
	 * Creates a new button on the metadata stripe.
	 * @param {string} cssClass CSS class name for the button
	 * @param {string} text HTML code for the button text
	 * @param {string} popupText HTML code for the popup text
	 */
	SBP.createButton = function ( cssClass, text, popupText ) {
		return $( '<a>' )
			.addClass( 'mw-mmv-stripe-button empty ' + cssClass )
			.text( text )
			.prop( 'title', popupText )
			// elements are right-floated so we use prepend instead of append to keep the order
			.prependTo( this.$buttonContainer );
	};

	/**
	 * @protected
	 * Creates the reuse button.
	 */
	SBP.initReuseButton = function() {
		this.buttons.$reuse = this.createButton(
			'mw-mmv-stripe-button-reuse',
			mw.message( 'multimediaviewer-reuse-link' ).text()
		);
	};

	/**
	 * @protected
	 * Creates the feedback button.
	 */
	SBP.initFeedbackButton = function() {
		var buttons = this;

		this.buttons.$feedback = this.createButton(
			'mw-mmv-stripe-button-feedback',
			mw.message( 'multimediaviewer-feedback-button-text' ).plain(),
			mw.message( 'multimediaviewer-feedback-popup-text' ).plain()
		).prop( {
			target: '_blank',
			href: this.getFeedbackSurveyUrl()
		} ).click( function ( e ) {
			buttons.openSurveyInNewWindow();
			e.preventDefault();
		} );
	};

	SBP.getFeedbackSurveyUrl = function () {
		return 'https://www.surveymonkey.com/s/media-viewer-1?c=mediaviewer';
	};

	/**
	 * Opens the survey in a new window, or brings it up if it is already opened.
	 */
	SBP.openSurveyInNewWindow = function () {
		var surveyWindowWidth = screen.width * 0.85,
			surveyWindowHeight = screen.height * 0.85,
			feedbackSurveyWindowProperties = {
				left: ( screen.width - surveyWindowWidth ) / 2,
				top: ( screen.height - surveyWindowHeight ) / 2,
				width: surveyWindowWidth,
				height: surveyWindowHeight,
				menubar: 0,
				toolbar: 0,
				location: 0,
				personalbar: 0,
				status: 0
			};

		if ( !this.surveyWindow || this.surveyWindow.closed ) {
			this.surveyWindow = window.open( this.getFeedbackSurveyUrl(), 'mmv-survey',
				this.createWindowOpenPropertyString( feedbackSurveyWindowProperties ) );
		} else {
			this.surveyWindow.focus();
		}
	};

	/**
	 * @protected
	 * Takes a property object and turns it into a string suitable for the last parameter
	 * of window.open.
	 * @param {Object} properties
	 * @return {string}
	 */
	SBP.createWindowOpenPropertyString = function ( properties ) {
		var propertyArray = [];
		$.each( properties, function ( key, value ) {
			propertyArray.push( key + '=' + value );
		} );
		return propertyArray.join( ',' );
	};

	/**
	 * @protected
	 * Runs code for each button, similarly to $.each.
	 * @param {function(jQuery, string)} callback a function that will be called with each button
	 */
	SBP.eachButton = function ( callback )  {
		var buttonName;
		for ( buttonName in this.buttons ) {
			callback( this.buttons[buttonName], buttonName );
		}
	};

	/**
	 * @inheritdoc
	 */
	SBP.set = function () {
		this.eachButton( function ( $button ) {
			$button.removeClass( 'empty' );
		} );
	};

	/**
	 * @inheritdoc
	 */
	SBP.empty = function () {
		this.eachButton( function ( $button ) {
			$button.addClass( 'empty' ).removeClass( 'open' );
		} );
	};

	/**
	 * Registers listeners.
	 */
	SBP.attach = function () {
		var buttons = this.buttons;

		buttons.$reuse.on( 'click.mmv-stripeButtons', function ( e ) {
			$( document ).trigger( 'mmv-reuse-open' );
			e.stopPropagation(); // the dialog would take it as an outside click and close
		} );
		this.handleEvent( 'mmv-reuse-opened', function () {
			buttons.$reuse.addClass( 'open' );
		} );
		this.handleEvent( 'mmv-reuse-closed', function () {
			buttons.$reuse.removeClass( 'open' );
		} );
	};

	/**
	 * Clears listeners.
	 */
	SBP.unattach = function () {
		this.constructor.super.prototype.unattach.call( this );
		this.buttons.$reuse.off( 'click.mmv-stripeButtons' );
	};

	mw.mmv.ui.StripeButtons = StripeButtons;
}( mediaWiki, jQuery, OO ) );
