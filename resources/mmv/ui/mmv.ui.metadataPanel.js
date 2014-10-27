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

( function ( mw, $, oo ) {
	// Shortcut for prototype later
	var MPP;

	/**
	 * Represents the metadata panel in the viewer
	 * @class mw.mmv.ui.MetadataPanel
	 * @extends mw.mmv.ui.Element
	 * @constructor
	 * @param {jQuery} $container The container for the panel (.mw-mmv-post-image).
	 * @param {jQuery} $aboveFold The always-visible  part of the metadata panel (.mw-mmv-above-fold).
	 * @param {Object} localStorage the localStorage object, for dependency injection
	 * @param {mw.mmv.Config} config A configuration object.
	 */
	function MetadataPanel( $container, $aboveFold, localStorage, config ) {
		mw.mmv.ui.Element.call( this, $container );

		this.$aboveFold = $aboveFold;

		/** @property {mw.mmv.Config} config - */
		this.config = config;

		/** @property {mw.mmv.HtmlUtils} htmlUtils - */
		this.htmlUtils = new mw.mmv.HtmlUtils();

		this.initializeHeader( localStorage );
		this.initializeImageMetadata();
		this.initializeAboutLinks();
	}
	oo.inheritClass( MetadataPanel, mw.mmv.ui.Element );
	MPP = MetadataPanel.prototype;

	MPP.attach = function() {
		var panel = this;

		this.scroller.attach();
		this.buttons.attach();

		this.$title.add( this.$authorAndSource ).on( 'click.mmv-mp', function ( e ) {
			if (
				$( e.target ).is( 'a' ) // ignore clicks to external links
				|| !$( e.target ).closest( '.mw-mmv-truncate-toolong' ).length // text is not truncated
			) {
				return;
			}
			panel.toggleTruncatedText();
		} );

		$( this.$container ).on( 'mmv-metadata-open', function () {
			panel.revealTruncatedText( true );
		} ).on( 'mmv-metadata-close', function () {
			panel.hideTruncatedText();
		} );

		this.handleEvent( 'jq-fullscreen-change.lip', function() {
			panel.hideTruncatedText();
		} );
	};

	MPP.unattach = function() {
		this.$title.tipsy( 'hide' );

		this.$authorAndSource.tipsy( 'hide' );

		this.scroller.unattach();
		this.buttons.unattach();

		this.$title.add( this.$authorAndSource ).off( 'click.mmv-mp' );
		this.clearEvents();
	};

	MPP.empty = function () {
		this.scroller.empty();

		this.buttons.empty();

		this.description.empty();
		this.permission.empty();

		this.hideTruncatedText();
		this.$title.empty().removeClass( 'error' );
		this.$authorAndSource.empty();
		this.$credit.addClass( 'empty' );

		this.$license.empty().prop( 'href', '#' );
		this.$licenseLi.addClass( 'empty' );
		this.$permissionLink.hide();

		this.$username.empty();
		this.$usernameLi.addClass( 'empty' );

		this.$datetime.empty();
		this.$datetimeLi.addClass( 'empty' );

		this.$location.empty();
		this.$locationLi.addClass( 'empty' );

		this.progressBar.empty();
	};

	// **********************************************
	// *********** Initialization methods ***********
	// **********************************************

	/**
	 * Initializes the header, which contains the title, credit, and license elements.
	 * @param {Object} localStorage the localStorage object, for dependency injection
	 */
	MPP.initializeHeader = function ( localStorage ) {
		this.progressBar = new mw.mmv.ui.ProgressBar( this.$aboveFold );

		this.scroller = new mw.mmv.ui.MetadataPanelScroller( this.$container, this.$aboveFold,
			localStorage );

		this.$titleDiv = $( '<div>' )
			.addClass( 'mw-mmv-title-contain' )
			.appendTo( this.$aboveFold );

		this.$container.append( this.$aboveFold );

		this.initializeButtons(); // float, needs to be on top
		this.initializeTitle();
	};

	/**
	 * Initializes the title elements.
	 */
	MPP.initializeTitle = function () {
		this.$titlePara = $( '<p>' )
			.addClass( 'mw-mmv-title-para' )
			.appendTo( this.$aboveFold );

		this.$title = $( '<span>' )
			.tipsy( {
				delayIn: mw.config.get( 'wgMultimediaViewer' ).tooltipDelay,
				gravity: this.correctEW( 'sw' )
			} )
			.addClass( 'mw-mmv-title' );

		this.title = new mw.mmv.ui.TruncatableTextField( this.$titlePara, this.$title );
		this.title.setTitle(
			mw.message( 'multimediaviewer-title-popup-text' ),
			mw.message( 'multimediaviewer-title-popup-text-more' )
		);
	};

	MPP.initializeButtons = function () {
		this.buttons = new mw.mmv.ui.StripeButtons( this.$titleDiv );
	};

	/**
	 * Initializes the main body of metadata elements.
	 */
	MPP.initializeImageMetadata = function () {
		this.$imageMetadata = $( '<div>' )
			.addClass( 'mw-mmv-image-metadata' )
			.appendTo( this.$container );

		this.$imageMetadataLeft = $( '<div>' )
			.addClass( 'mw-mmv-image-metadata-column mw-mmv-image-metadata-desc-column' )
			.appendTo( this.$imageMetadata );

		this.$imageMetadataRight = $( '<div>' )
			.addClass( 'mw-mmv-image-metadata-column mw-mmv-image-metadata-links-column' )
			.appendTo( this.$imageMetadata );

		this.initializeCredit();
		this.description = new mw.mmv.ui.Description( this.$imageMetadataLeft );
		this.permission = new mw.mmv.ui.Permission( this.$imageMetadataLeft );
		this.initializeImageLinks();
	};

	/**
	 * Initializes the credit elements.
	 */
	MPP.initializeCredit = function () {
		var panel = this;

		this.$credit = $( '<p>' )
			.addClass( 'mw-mmv-credit empty' )
			.appendTo( this.$imageMetadataLeft );

		// we need an inline container for tipsy, otherwise it would be centered weirdly
		this.$authorAndSource = $( '<span>' )
			.addClass( 'mw-mmv-source-author' )
			.tipsy( {
				delayIn: mw.config.get( 'wgMultimediaViewer' ).tooltipDelay,
				gravity: this.correctEW( 'sw' )
			} )
			.on( 'click', '.mw-mmv-author a', function ( e ) {
				panel.trackLinkClick.call( this, 'author-page', e );
			} )
			.on( 'click', '.mw-mmv-source a', function ( e ) {
				panel.trackLinkClick.call( this, 'source-page', e );
			} );


		this.creditField = new mw.mmv.ui.TruncatableTextField(
			this.$credit,
			this.$authorAndSource,
			{ max: 200, small: 160 }
		);

		this.creditField.setTitle(
			mw.message( 'multimediaviewer-credit-popup-text' ),
			mw.message( 'multimediaviewer-credit-popup-text-more' )
		);
	};

	/**
	 * Initializes the list of image metadata on the right side of the panel.
	 */
	MPP.initializeImageLinks = function () {
		this.$imageLinkDiv = $( '<div>' )
			.addClass( 'mw-mmv-image-links-div' )
			.appendTo( this.$imageMetadataRight );

		this.$imageLinks = $( '<ul>' )
			.addClass( 'mw-mmv-image-links' )
			.appendTo( this.$imageLinkDiv );

		this.initializeLicense();
		this.initializeUploader();
		this.initializeDatetime();
		this.initializeLocation();
	};

	/**
	 * Initializes the license elements.
	 */
	MPP.initializeLicense = function () {
		var panel = this;

		this.$licenseLi = $( '<li>' )
			.addClass( 'mw-mmv-license-li empty')
			.appendTo( this.$imageLinks );

		this.$license = $( '<a>' )
			.addClass( 'mw-mmv-license' )
			.prop( 'href', '#' )
			.appendTo( this.$licenseLi )
			.on( 'click', function( e ) {
				panel.trackLinkClick.call( this, 'license-page', e );
			} );

		this.$permissionLink = $( '<span>' )
			.addClass( 'mw-mmv-permission-link mw-mmv-label' )
			.text( mw.message( 'multimediaviewer-permission-link' ).text() )
			.appendTo( this.$licenseLi )
			.hide()
			.on( 'click', function() {
				panel.permission.grow();
				panel.scroller.scrollIntoView( panel.permission.$box, 500 );
				return false;
			} );
	};

	/**
	 * Initializes the upload date/time element.
	 */
	MPP.initializeDatetime = function () {
		this.$datetimeLi = $( '<li>' )
			.addClass( 'mw-mmv-datetime-li empty' )
			.appendTo( this.$imageLinks );

		this.$datetime = $( '<span>' )
			.addClass( 'mw-mmv-datetime' )
			.appendTo( this.$datetimeLi );
	};

	/**
	 * Initializes the link to the uploader's file page.
	 */
	MPP.initializeUploader = function () {
		var self = this;

		this.$usernameLi = $( '<li>' )
			.addClass( 'mw-mmv-username-li empty' )
			.appendTo( this.$imageLinks );

		this.$username = $( '<a>' )
			.addClass( 'mw-mmv-username' )
			.prop( 'href', '#' )
			.appendTo( this.$usernameLi )
			.click( function( e ) { self.trackLinkClick.call( this, 'uploader-page', e ); } );
	};

	/**
	 * Initializes the geolocation element.
	 */
	MPP.initializeLocation = function () {
		var self = this;

		this.$locationLi = $( '<li>' )
			.addClass( 'mw-mmv-location-li empty' )
			.appendTo( this.$imageLinks );

		this.$location = $( '<a>' )
			.addClass( 'mw-mmv-location' )
			.appendTo( this.$locationLi )
			.click( function( e ) { self.trackLinkClick.call( this, 'location-page', e ); } );
	};

	/**
	 * Initializes two about links at the bottom of the panel.
	 */
	MPP.initializeAboutLinks = function () {
		var separator = ' | ',
			self = this;

		this.$mmvAboutLink = $( '<a>' )
			.prop( 'href', mw.config.get( 'wgMultimediaViewer' ).infoLink )
			.text( mw.message( 'multimediaviewer-about-mmv' ).text() )
			.addClass( 'mw-mmv-about-link' )
			.click( function( e ) { self.trackLinkClick.call( this, 'about-page', e ); } );

		this.$mmvDiscussLink = $( '<a>' )
			.prop( 'href', mw.config.get( 'wgMultimediaViewer' ).discussionLink )
			.text( mw.message( 'multimediaviewer-discuss-mmv' ).text() )
			.addClass( 'mw-mmv-discuss-link' )
			.click( function( e ) { self.trackLinkClick.call( this, 'discuss-page', e ); } );

		this.$mmvHelpLink = $( '<a>' )
			.prop( 'href', mw.config.get( 'wgMultimediaViewer' ).helpLink )
			.text( mw.message( 'multimediaviewer-help-mmv' ).text() )
			.addClass( 'mw-mmv-help-link' )
			.click( function( e ) { self.trackLinkClick.call( this, 'help-page', e ); } );

		this.$mmvAboutLinks = $( '<div>' )
			.addClass( 'mw-mmv-about-links' )
			.append(
				this.$mmvAboutLink,
				separator,
				this.$mmvDiscussLink,
				separator,
				this.$mmvHelpLink
			)
			.appendTo( this.$imageMetadata );
	};

	// *********************************
	// ******** Setting methods ********
	// *********************************

	/**
	 * Sets the link to the user page where possible
	 * @param {mw.mmv.model.Repo} repoData
	 * @param {string} username
	 * @param {string} gender
	 */
	MPP.setUserPageLink = function ( repoData, username, gender ) {
		var userpage = 'User:' + username,
			articlePath = repoData.getArticlePath(),
			userlink = articlePath.replace( '$1', userpage );

		this.$username
			.text(
				mw.message( 'multimediaviewer-userpage-link', username, gender ).text()
			)
			.prop( 'href', userlink );

		this.$usernameLi.toggleClass( 'empty', !username );
	};

	/**
	 * Sets the file title in the panel
	 * @param {string} title
	 */
	MPP.setFileTitle = function ( title ) {
		this.title.set( title );
	};

	/**
	 * Sets the upload or creation date and time in the panel
	 * @param {string} date The formatted date to set.
	 * @param {boolean} created Whether this is the creation date
	 */
	MPP.setDateTime = function ( date, created ) {
		this.$datetime.text(
			mw.message(
				'multimediaviewer-datetime-' + ( created ? 'created' : 'uploaded' ),
				date
			).text()
		);

		this.$datetimeLi.removeClass( 'empty' );
	};

	/**
	 * Bignasty function for setting source and author. Both #setAuthor and
	 * #setSource use this with some shortcuts.
	 * @param {string} source With unsafe HTML
	 * @param {string} author With unsafe HTML
	 */
	MPP.setCredit = function ( source, author ) {
		this.source = source || null;
		this.author = author || null;

		if ( author && source ) {
			this.creditField.set(
				mw.message(
					'multimediaviewer-credit',
					this.author,
					this.source
				).plain()
			);
		} else if ( author ) {
			this.creditField.set( this.author );
		} else if ( source ) {
			this.creditField.set( this.source );
		}

		this.$credit.toggleClass( 'empty', !author && !source );
	};

	/**
	 * Sets the source in the panel
	 * @param {string} source Warning - unsafe HTML sometimes goes here
	 */
	MPP.setSource = function ( source ) {
		if ( source ) {
			source = $( '<span>' )
				.addClass( 'mw-mmv-source' )
				.append( $.parseHTML( source ) )
				.get( 0 ).outerHTML;
		}

		this.setCredit( source, this.author );
	};

	/**
	 * Sets the author in the panel
	 * @param {string} author Warning - unsafe HTML sometimes goes here
	 */
	MPP.setAuthor = function ( author ) {
		if ( author ) {
			author = $( '<span>' )
				.addClass( 'mw-mmv-author' )
				.append( $.parseHTML( author ) )
				.get( 0 ).outerHTML;
		}

		this.setCredit( this.source, author );
	};

	/**
	 * Sets the license display in the panel
	 * @param {mw.mmv.model.License|null} license license data (could be missing)
	 * @param {string} filePageUrl URL of the file description page
	 */
	MPP.setLicense = function ( license, filePageUrl ) {
		var shortName, url, isCc;

		if ( license ) {
			shortName = license.getShortName();
			url = license.deedUrl || filePageUrl;
			isCc = license.isCc();
		} else {
			shortName = mw.message( 'multimediaviewer-license-default' ).text();
			url = filePageUrl;
			isCc = false;
		}

		this.$license
			.text( shortName )
			.prop( 'href', url )
			.prop( 'target', license && license.deedUrl ? '_blank' : '' );

		this.$licenseLi
			.toggleClass( 'cc-license', isCc )
			.removeClass( 'empty' );
	};

	/**
	 * Set an extra permission text which should be displayed.
	 * @param {string} permission
	 */
	MPP.setPermission = function ( permission ) {
		this.$permissionLink.show();
		this.permission.set( permission );
	};

	/**
	 * Sets location data in the interface.
	 * @param {mw.mmv.model.Image} imageData
	 */
	MPP.setLocationData = function ( imageData ) {
		var latsec, latitude, latmsg, latdeg, latremain, latmin,
			longsec, longitude, longmsg, longdeg, longremain, longmin,
			language;

		if ( !imageData.hasCoords() ) {
			return;
		}

		latitude = imageData.latitude >= 0 ? imageData.latitude : imageData.latitude * -1;
		latmsg = 'multimediaviewer-geoloc-' + ( imageData.latitude >= 0 ? 'north' : 'south' );
		latdeg = Math.floor( latitude );
		latremain = latitude - latdeg;
		latmin = Math.floor( ( latremain ) * 60 );

		longitude = imageData.longitude >= 0 ? imageData.longitude : imageData.longitude * -1;
		longmsg = 'multimediaviewer-geoloc-' + ( imageData.longitude >= 0 ? 'east' : 'west' );
		longdeg = Math.floor( longitude );
		longremain = longitude - longdeg;
		longmin = Math.floor( ( longremain ) * 60 );

		longremain -= longmin / 60;
		latremain -= latmin / 60;
		latsec = Math.round( latremain * 100 * 60 * 60 ) / 100;
		longsec = Math.round( longremain * 100 * 60 * 60 ) / 100;

		this.$location.text(
			mw.message( 'multimediaviewer-geolocation',
				mw.message(
					'multimediaviewer-geoloc-coords',

					mw.message(
						'multimediaviewer-geoloc-coord',
						mw.language.convertNumber( latdeg ),
						mw.language.convertNumber( latmin ),
						mw.language.convertNumber( latsec ),
						mw.message( latmsg ).text()
					).text(),

					mw.message(
						'multimediaviewer-geoloc-coord',
						mw.language.convertNumber( longdeg ),
						mw.language.convertNumber( longmin ),
						mw.language.convertNumber( longsec ),
						mw.message( longmsg ).text()
					).text()
				).text()
			).text()
		);

		$.each(  mw.language.data, function( key, value ) {
			value = 'go away jshint';
			language = key;
			return false;
		} );

		this.$location.prop( 'href', (
			'//tools.wmflabs.org/geohack/geohack.php?pagename=' +
			'File:' + imageData.title.getMain() +
			'&params=' +
			Math.abs( imageData.latitude ) + ( imageData.latitude >= 0 ? '_N_' : '_S_' ) +
			Math.abs( imageData.longitude ) + ( imageData.longitude >= 0 ? '_E_' : '_W_' ) +
			'&language=' + language
		) );

		this.$locationLi.removeClass( 'empty' );
	};

	/**
	 * Set all the image information in the panel
	 * @param {mw.mmv.LightboxImage} image
	 * @param {mw.mmv.model.Image} imageData
	 * @param {mw.mmv.model.Repo} repoData
	 * @param {mw.mmv.model.User} user
	 */
	MPP.setImageInfo = function ( image, imageData, repoData, user ) {
		var panel = this,
			fileTitle = image.filePageTitle;

		mw.mmv.attributionLogger.logAttribution( imageData );

		this.setFileTitle( fileTitle.getNameText() );

		if ( imageData.creationDateTime ) {
			// Use the raw date until moment can try to interpret it
			panel.setDateTime( imageData.creationDateTime );

			this.formatDate( imageData.creationDateTime ).then( function ( formattedDate ) {
				panel.setDateTime( formattedDate, true );
			} );
		} else if ( imageData.uploadDateTime ) {
			// Use the raw date until moment can try to interpret it
			panel.setDateTime( imageData.uploadDateTime );

			this.formatDate( imageData.uploadDateTime ).then( function ( formattedDate ) {
				panel.setDateTime( formattedDate );
			} );
		}

		if ( imageData.source ) {
			this.setSource( imageData.source );
		}

		if ( imageData.author ) {
			this.setAuthor( imageData.author );
		}

		this.buttons.set( imageData, repoData );
		this.description.set( imageData.description, image.caption );

		this.setLicense( imageData.license, imageData.descriptionUrl );

		if ( imageData.permission ) {
			this.setPermission( imageData.permission );
		}

		this.setLocationData( imageData );

		if ( user ) {
			this.setUserPageLink( repoData, imageData.lastUploader, user.gender );
		}
	};

	/**
	 * Show an error message, in case the data could not be loaded
	 * @param {string} error
	 */
	MPP.showError = function ( error ) {
		this.$title.addClass( 'error' )
			.text( mw.message( 'multimediaviewer-metadata-error', error ).text() );
	};

	/**
	 * Transforms a date string into localized, human-readable format.
	 * Unrecognized strings are returned unchanged.
	 * @param {string} dateString
	 * @return {jQuery.Deferred}
	 */
	MPP.formatDate = function ( dateString ) {
		var deferred = $.Deferred(),
			date;

		mw.loader.using( 'moment', function () {
			date = moment( dateString );

			if ( date.isValid() ) {
				deferred.resolve( date.format( 'LL' ) );
			} else {
				deferred.resolve( dateString );
			}
		}, function ( error ) {
			deferred.reject( error );
			if ( window.console && window.console.error ) {
				window.console.error( 'mw.loader.using error when trying to load moment', error );
			}
		} );

		return deferred.promise();
	};

	/**
	 * Calls #revealTruncatedText() or #hideTruncatedText() based on the current state.
	 */
	MPP.toggleTruncatedText = function () {
		if ( this.$container.hasClass( 'mw-mmv-untruncated' ) ) {
			this.hideTruncatedText();
		} else {
			this.revealTruncatedText();
		}
	};

	/**
	 * Shows truncated text in the title and credit (this also rearranges the layout a bit).
	 * Opens the panel partially to make sure the revealed text is visible.
	 * @param {boolean} noScroll if set, do not scroll the panel (because the function was triggered from a
	 *  scroll event in the first place)
	 */
	MPP.revealTruncatedText = function ( noScroll ) {
		if ( this.$container.hasClass( 'mw-mmv-untruncated' ) ) {
			// avoid self-triggering via reveal -> scroll -> reveal
			return;
		}
		this.$container.addClass( 'mw-mmv-untruncated' );
		this.title.grow();
		this.creditField.grow();
		if ( this.aboveFoldIsLargerThanNormal() && !noScroll ) {
			this.scroller.scrollIntoView( this.$datetimeLi, 500 );
		}
	};

	/**
	 * Undoes changes made by revealTruncatedText().
	 */
	MPP.hideTruncatedText = function () {
		if ( !this.$container.hasClass( 'mw-mmv-untruncated' ) ) {
			// avoid double-triggering
			return;
		}
		this.title.shrink();
		this.creditField.shrink();
		this.$container.removeClass( 'mw-mmv-untruncated' );
	};

	/**
	 * Returns true if the above-fold part of the metadata panel changed size (due to text overflow) after
	 * calling revealTruncatedText().
	 */
	MPP.aboveFoldIsLargerThanNormal = function () {
		return this.$aboveFold.height() > parseInt( this.$aboveFold.css( 'min-height' ), 10 );
	};

	mw.mmv.ui.MetadataPanel = MetadataPanel;
}( mediaWiki, jQuery, OO ) );
