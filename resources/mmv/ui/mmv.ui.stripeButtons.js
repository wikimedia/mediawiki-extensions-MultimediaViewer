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
	 * @param {jQuery} $container the title block (.mw-mmv-title-contain) which wraps the buttons and all
	 *  other title elements
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

		this.initDescriptionPageButton();
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
		var $button,
			$label,
			tooltipDelay = mw.config.get( 'wgMultimediaViewer' ).tooltipDelay;

		$button = $( '<a>' )
			.addClass( 'mw-mmv-stripe-button empty ' + cssClass )
			// elements are right-floated so we use prepend instead of append to keep the order
			.prependTo( this.$buttonContainer );

		if ( text ) {
			$label = $( '<span>' ).addClass( 'mw-mmv-stripe-button-text' ).text( text );
			$button.append( $label ).addClass( 'has-label' );
		}
		if ( popupText ) {
			$button.prop( 'title', popupText ).tipsy( {
				gravity: $( document.body ).hasClass( 'rtl' ) ? 'sw' : 'se',
				delayIn: tooltipDelay
			} );
		}

		return $button;
	};

	/**
	 * @protected
	 * Creates a button linking to the file description page.
	 */
	SBP.initDescriptionPageButton = function() {
		this.buttons.$descriptionPage = this.createButton(
			'empty',
			null,
			mw.message( 'multimediaviewer-description-page-button-text' ).plain()
		).click( function () {
			mw.mmv.actionLogger.log( 'file-description-page-abovefold' );
		} );
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
	 * @param {mw.mmv.model.Image} imageInfo
	 * @param {mw.mmv.model.Repo} repoInfo
	 */
	SBP.set = function ( imageInfo, repoInfo ) {
		this.eachButton( function ( $button ) {
			$button.removeClass( 'empty' );
		} );

		this.setDescriptionPageButton( imageInfo, repoInfo );
	};

	/**
	 * @protected
	 * Updates the button linking to the file page.
	 * @param {mw.mmv.model.Image} imageInfo
	 * @param {mw.mmv.model.Repo} repoInfo
	 */
	SBP.setDescriptionPageButton = function ( imageInfo, repoInfo ) {
		var descPagePopupMessage;

		descPagePopupMessage = repoInfo.isLocal
			? mw.message( 'multimediaviewer-description-page-button-text' ).plain()
			: mw.message( 'multimediaviewer-description-page-popup-text', repoInfo.displayName ).text();

		this.buttons.$descriptionPage.attr( {
			href: imageInfo.descriptionUrl,
			title: descPagePopupMessage,
			'original-title': descPagePopupMessage // needed by jquery.tipsy
		} );

		if ( repoInfo.isCommons() ) {
			this.buttons.$descriptionPage.addClass( 'mw-mmv-repo-button-commons' );
		} else {
			this.buttons.$descriptionPage.addClass( 'mw-mmv-repo-button-dynamic' );
			if ( repoInfo.favIcon ) {
				this.setInlineStyle( 'repo-button-description-page',
					// needs to be more specific then the fallback rule in stripeButtons.less
					'html .mw-mmv-repo-button-dynamic:before {' +
						'background-image: url("' + repoInfo.favIcon + '");' +
					'}'
				);
			}
		}
	};

	/**
	 * @inheritdoc
	 */
	SBP.empty = function () {
		this.eachButton( function ( $button ) {
			$button.addClass( 'empty' );
		} );

		this.buttons.$descriptionPage.attr( { href: null, title: null, 'original-title': null } )
			.removeClass( 'mw-mmv-repo-button-dynamic mw-mmv-repo-button-commons' );
		this.setInlineStyle( 'repo-button-description-page', null );
	};

	/**
	 * Clears listeners.
	 */
	SBP.unattach = function () {
		this.constructor['super'].prototype.unattach.call( this );

		this.clearTimer( 'feedbackTooltip.show' );

		$.each( this.buttons, function ( name, $button ) {
			// Tipsy's not enabled on every button
			if ( $button.data( 'tipsy' ) ) {
				$button.tipsy( 'hide' );
			}
		} );
	};

	mw.mmv.ui.StripeButtons = StripeButtons;
}( mediaWiki, jQuery, OO ) );
