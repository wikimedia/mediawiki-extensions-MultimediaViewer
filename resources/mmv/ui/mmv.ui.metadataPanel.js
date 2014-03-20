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

( function ( mw, $, oo, moment ) {
	// Shortcut for prototype later
	var MPP;

	/**
	 * Represents the metadata panel in the viewer
	 * @class mw.mmv.ui.MetadataPanel
	 * @extends mw.mmv.ui.Element
	 * @constructor
	 * @param {jQuery} $container The container for the panel.
	 * @param {jQuery} $controlBar The control bar element.
	 */
	function MetadataPanel( $container, $controlBar ) {
		mw.mmv.ui.Element.call( this, $container );

		this.$controlBar = $controlBar;

		/**
		 * Whether we've fired an animation for the metadata div.
		 * @property {boolean}
		 * @private
		 */
		this.hasAnimatedMetadata = window.localStorage !== undefined &&
			localStorage.getItem( 'mmv.hasOpenedMetadata' );

		this.initializeHeader();
		this.initializeImageMetadata();
		this.initializeAboutLinks();
	}

	oo.inheritClass( MetadataPanel, mw.mmv.ui.Element );

	MPP = MetadataPanel.prototype;

	MPP.attach = function() {
		var panel = this;
		this.handleEvent( 'keydown', function ( e ) {
			panel.keydown( e );
		} );

		$.scrollTo().on( 'scroll.mmvp', $.throttle( 250, function() {
			panel.scroll();
		} ) );

		this.fileReuse.attach();
	};

	MPP.unattach = function() {
		this.fileReuse.unattach();
		this.fileReuse.closeDialog();
		this.clearEvents();

		$.scrollTo().off( 'scroll.mmvp' );
	};

	MPP.empty = function () {
		this.$license.empty().addClass( 'empty' );
		this.$permissionLink.hide();

		this.description.empty();
		this.categories.empty();
		this.fileUsage.empty();
		this.permission.empty();

		this.$title.empty().removeClass( 'error' );
		this.$credit.empty().addClass( 'empty' );

		this.$username.empty();
		this.$usernameLi.addClass( 'empty' );

		this.$repo.empty();
		this.$repoLi.addClass( 'empty' );

		this.$datetime.empty();
		this.$datetimeLi.addClass( 'empty' );

		this.$location.empty();
		this.$locationLi.addClass( 'empty' );

		this.$dragIcon.removeClass( 'pointing-down' );

		this.$progress.addClass( 'empty' );

		// need to remove this to avoid animating again when reopening lightbox on same page
		this.$container.removeClass( 'invite' );

		this.fileReuse.empty();
	};

	// **********************************************
	// *********** Initialization methods ***********
	// **********************************************

	/**
	 * Initializes the header, which contains the title, credit, and license elements.
	 */
	MPP.initializeHeader = function () {
		var panel = this;

		this.initializeProgress();

		this.$dragBar = $( '<div>' )
			.addClass( 'mw-mlb-drag-affordance' )
			.appendTo( this.$controlBar )
			.click( function () {
				panel.toggle();
			} );

		this.$dragIcon = $( '<div>' )
			.addClass( 'mw-mlb-drag-icon' )
			.appendTo( this.$dragBar );

		this.$titleDiv = $( '<div>' )
			.addClass( 'mw-mlb-title-contain' )
			.appendTo( this.$controlBar );

		this.$container.append( this.$controlBar );

		this.initializeTitleAndCredit();
		this.initializeLicense();
	};

	/**
	 * Initializes the title and credit elements.
	 */
	MPP.initializeTitleAndCredit = function () {
		this.$titleAndCredit = $( '<div>' )
			.addClass( 'mw-mlb-title-credit' )
			.appendTo( this.$titleDiv );

		this.initializeTitle();
		this.initializeCredit();
	};

	/**
	 * Initializes the title elements.
	 */
	MPP.initializeTitle = function () {
		this.$titlePara = $( '<p>' )
			.addClass( 'mw-mlb-title-para' )
			.appendTo( this.$titleAndCredit );

		this.$title = $( '<span>' )
			.addClass( 'mw-mlb-title' )
			.appendTo( this.$titlePara );
	};

	/**
	 * Initializes the credit elements.
	 */
	MPP.initializeCredit = function () {
		this.$source = $( '<span>' )
			.addClass( 'mw-mlb-source' );

		this.$author = $( '<span>' )
			.addClass( 'mw-mlb-author' );

		this.$credit = $( '<p>' )
			.addClass( 'mw-mlb-credit empty' )
			.html(
				mw.message(
					'multimediaviewer-credit',
					this.$author.get( 0 ).outerHTML,
					this.$source.get( 0 ).outerHTML
				).plain()
			)
			.appendTo( this.$titleAndCredit );
	};

	/**
	 * Initializes the license elements.
	 */
	MPP.initializeLicense = function () {
		var panel = this;

		this.$license = $( '<a>' )
			.addClass( 'mw-mlb-license empty' )
			.prop( 'href', '#' )
			.appendTo( this.$titlePara );

		this.$permissionLink = $( '<span>' )
			.addClass( 'mw-mlb-permission-link mw-mlb-label' )
			.text( mw.message( 'multimediaviewer-permission-link' ).text() )
			.appendTo( this.$titlePara )
			.hide()
			.on( 'click', function() {
				panel.permission.grow();
				panel.scrollIntoView( panel.permission.$box, 500 );
			} );
	};

	/**
	 * Initializes the main body of metadata elements.
	 */
	MPP.initializeImageMetadata = function () {
		this.$imageMetadata = $( '<div>' )
			.addClass( 'mw-mlb-image-metadata' )
			.appendTo( this.$container );

		this.$imageMetadataLeft = $( '<div>' )
			.addClass( 'mw-mlb-image-metadata-column mw-mlb-image-metadata-desc-column' )
			.appendTo( this.$imageMetadata );

		this.$imageMetadataRight = $( '<div>' )
			.addClass( 'mw-mlb-image-metadata-column mw-mlb-image-metadata-links-column' )
			.appendTo( this.$imageMetadata );

		this.description = new mw.mmv.ui.Description( this.$imageMetadataLeft );
		this.permission = new mw.mmv.ui.Permission( this.$imageMetadataLeft );
		this.initializeImageLinks();
	};

	/**
	 * Initializes the list of image metadata on the right side of the panel.
	 */
	MPP.initializeImageLinks = function () {
		this.$imageLinkDiv = $( '<div>' )
			.addClass( 'mw-mlb-image-links-div' )
			.appendTo( this.$imageMetadataRight );

		this.$imageLinks = $( '<ul>' )
			.addClass( 'mw-mlb-image-links' )
			.appendTo( this.$imageLinkDiv );

		this.initializeRepoLink();
		this.initializeUploader();
		this.initializeDatetime();
		this.initializeLocation();

		this.fileReuse = new mw.mmv.ui.reuse.Dialog( this.$container, this.$titleDiv );
		this.categories = new mw.mmv.ui.Categories( this.$imageLinks );

		this.fileUsage = new mw.mmv.ui.FileUsage(
			$( '<div>' ).appendTo( this.$imageMetadataRight )
		);
		this.fileUsage.init();
	};

	/**
	 * Initializes the link to the file page on the (maybe remote) repository.
	 */
	MPP.initializeRepoLink = function () {
		this.$repoLi = $( '<li>' )
			.addClass( 'mw-mlb-repo-li empty' )
			.appendTo( this.$imageLinks );

		this.$repo = $( '<a>' )
			.addClass( 'mw-mlb-repo' )
			.prop( 'href', '#' )
			.click( function ( e ) {
				var $link = $( this ),
					redirect;

				if ( e.altKey || e.shiftKey || e.ctrlKey || e.metaKey || e.button === 1 ) {
					// They are likely opening the link in a new window or tab
					mw.mmv.logger.log( 'site-link-click' );
					return;
				}

				// If it's a plain click, we need to wait for the logging to
				// be done before navigating to the desired page
				e.preventDefault();

				redirect = function () {
					window.location.href = $link.prop( 'href' );
				};

				// We want to redirect anyway, whether logging worked or not
				mw.mmv.logger.log( 'site-link-click' ).then( redirect, redirect );
			} )
			.appendTo( this.$repoLi );
	};

	/**
	 * Initializes the upload date/time element.
	 */
	MPP.initializeDatetime = function () {
		this.$datetimeLi = $( '<li>' )
			.addClass( 'mw-mlb-datetime-li empty' )
			.appendTo( this.$imageLinks );

		this.$datetime = $( '<span>' )
			.addClass( 'mw-mlb-datetime' )
			.appendTo( this.$datetimeLi );
	};

	/**
	 * Initializes the link to the uploader's file page.
	 */
	MPP.initializeUploader = function () {
		this.$usernameLi = $( '<li>' )
			.addClass( 'mw-mlb-username-li empty' )
			.appendTo( this.$imageLinks );

		this.$username = $( '<a>' )
			.addClass( 'mw-mlb-username' )
			.prop( 'href', '#' )
			.appendTo( this.$usernameLi );
	};

	/**
	 * Initializes the geolocation element.
	 */
	MPP.initializeLocation = function () {
		this.$locationLi = $( '<li>' )
			.addClass( 'mw-mlb-location-li empty' )
			.appendTo( this.$imageLinks );

		this.$location = $( '<a>' )
			.addClass( 'mw-mlb-location' )
			.appendTo( this.$locationLi );
	};

	/**
	 * Initializes two about links at the bottom of the panel.
	 */
	MPP.initializeAboutLinks = function () {
		this.$mmvAboutLink = $( '<a>' )
			.prop( 'href', mw.config.get( 'wgMultimediaViewer' ).infoLink )
			.text( mw.message( 'multimediaviewer-about-mmv' ).text() )
			.addClass( 'mw-mlb-mmv-about-link' );

		this.$mmvDiscussLink = $( '<a>' )
			.prop( 'href', mw.config.get( 'wgMultimediaViewer' ).discussionLink )
			.text( mw.message( 'multimediaviewer-discuss-mmv' ).text() )
			.addClass( 'mw-mlb-mmv-discuss-link' );

		this.$mmvAboutLinks = $( '<div>' )
			.addClass( 'mw-mlb-mmv-about-links' )
			.append(
				this.$mmvAboutLink,
				' | ',
				this.$mmvDiscussLink
			)
			.appendTo( this.$imageMetadata );
	};

	/**
	 * Initializes the progress display at the top of the panel.
	 */
	MPP.initializeProgress = function () {
		this.$progress = $( '<div>' )
			.addClass( 'mw-mlb-progress empty' )
			.appendTo( this.$controlBar );

		this.$percent = $( '<div>' )
			.addClass( 'mw-mlb-progress-percent' )
			.appendTo( this.$progress );
	};

	// *********************************
	// ******** Setting methods ********
	// *********************************

	/**
	 * Sets the URL for the File: page of the image
	 * @param {string} url
	 */
	MPP.setFilePageLink = function ( url ) {
		this.$repo.prop( 'href', url );
		this.$license.prop( 'href', url );
	};

	/**
	 * Sets the display name of the repository
	 * @param {string} displayname
	 * @param {string} favIcon
	 * @param {boolean} isLocal true if this is the local repo ( the file has been uploaded locally)
	 */
	MPP.setRepoDisplay = function ( displayname, favIcon, isLocal ) {
		if ( isLocal ) {
			this.$repo.text(
				mw.message( 'multimediaviewer-repository-local' ).text()
			);
		} else {
			displayname = displayname || mw.config.get( 'wgSiteName' );
			this.$repo.text(
				mw.message( 'multimediaviewer-repository', displayname ).text()
			);
		}

		// This horror exists because the CSS uses a :before pseudo-class to
		// define the repo icon. This is the only way to override it.
		if ( favIcon ) {
			if ( !this.$repoLiInlineStyle ) {
				this.$repoLiInlineStyle = $( '<style type="text/css" />' ).appendTo( 'head' );
			}

			this.$repoLiInlineStyle.html( '.mw-mlb-image-links li.mw-mlb-repo-li:before '
				+ '{ background-image: url("'
				+ favIcon
				+ '"); }'
			);
		} else if ( this.$repoLiInlineStyle ) {
			this.$repoLiInlineStyle.html( '' );
		}

		this.$repoLi.removeClass( 'empty' );
	};

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
		this.$title.text( title );
	};

	/**
	 * Sets up the file reuse data in the DOM
	 * @param {mw.mmv.model.Image} image
	 * @param {string} siteName
	 * @param {string} caption
	 */
	MPP.setFileReuseData = function ( image, siteName, caption ) {
		this.fileReuse.set( image,
			mw.mmv.model.EmbedFileInfo.fromImageInfo( image, siteName, caption ) );
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
	 * Sets the source in the panel
	 * @param {string} source Warning - unsafe HTML sometimes goes here
	 */
	MPP.setSource = function ( source ) {
		this.whitelistHtml( this.$source.empty().append( $.parseHTML( source ) ) );
		this.$credit.removeClass( 'empty' );
	};

	/**
	 * Sets the author in the panel
	 * @param {string} author Warning - unsafe HTML sometimes goes here
	 */
	MPP.setAuthor = function ( author ) {
		this.whitelistHtml( this.$author.empty().append( $.parseHTML( author ) ) );
		this.$credit.removeClass( 'empty' );
	};

	/**
	 * Consolidate the source and author fields into a credit field
	 * @param {boolean} source Do we have the source field?
	 * @param {boolean} author Do we have the author field?
	 */
	MPP.consolidateCredit = function ( source, author ) {
		if ( source && author ) {
			this.$credit.html(
				mw.message(
					'multimediaviewer-credit',
					this.$author.get( 0 ).outerHTML,
					this.$source.get( 0 ).outerHTML
				).plain()
			);
		} else {
			// Clobber the contents and only have one of the fields
			if ( source ) {
				this.$credit.empty().append( this.$source );
			} else if ( author ) {
				this.$credit.empty().append( this.$author );
			}
		}
	};

	/**
	 * Sets the license data in the DOM
	 * @param {string} license The license this file has.
	 */
	MPP.setLicenseData = function ( license ) {
		this.$license.data( 'license', license );
	};

	/**
	 * Sets the license display in the panel
	 * @param {string} license The human-readable name of the license
	 * @param {boolean} isCc Whether this is a CC license
	 */
	MPP.setLicense = function ( license, isCc ) {
		this.$license
			.text( license )
			.toggleClass( 'cc-license', isCc );

		this.$license.removeClass( 'empty' );
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
	 * @param {mw.mmv.model.FileUsage} localUsage
	 * @param {mw.mmv.model.FileUsage} globalUsage
	 * @param {mw.mmv.model.User} user
	 */
	MPP.setImageInfo = function ( image, imageData, repoData, localUsage, globalUsage, user ) {
		var msgname,
			fileTitle = image.filePageTitle;

		this.setFileTitle( fileTitle.getNameText() );
		this.setRepoDisplay( repoData.displayName, repoData.favIcon, repoData.isLocal );
		this.setFilePageLink( imageData.descriptionUrl );

		if ( imageData.creationDateTime ) {
			this.setDateTime( this.formatDate( imageData.creationDateTime ), true );
		} else if ( imageData.uploadDateTime ) {
			this.setDateTime( this.formatDate( imageData.uploadDateTime ) );
		}

		if ( imageData.source ) {
			this.setSource( imageData.source );
		}

		if ( imageData.author ) {
			this.setAuthor( imageData.author );
		}

		this.consolidateCredit( !!imageData.source, !!imageData.author );

		this.description.set( imageData.description, image.caption );
		this.categories.set( repoData.getArticlePath(), imageData.categories );

		msgname = 'multimediaviewer-license-' + ( imageData.license && imageData.license.internalName || '' );

		if ( !mw.messages.exists( msgname ) ) {
			// Cannot display, fallback or fail
			msgname = 'multimediaviewer-license-default';
		} else {
			// License found, store the license data
			this.setLicenseData( mw.message( msgname ).text() );
		}

		if ( imageData.license ) {
			this.setLicense( mw.message( msgname ).text(), imageData.isCcLicensed() );
		}

		if ( imageData.permission ) {
			this.setPermission( imageData.permission );
		}

		this.fileUsage.set( localUsage, globalUsage );

		this.setLocationData( imageData );

		if ( user ) {
			this.setUserPageLink( repoData, imageData.lastUploader, user.gender );
		}

		// File reuse steals a bunch of information from the DOM, so do it last
		this.setFileReuseData( imageData, repoData.displayName, image.caption );
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
	 * @return {string}
	 */
	MPP.formatDate = function ( dateString ) {
		var date = moment( dateString );
		if ( !date.isValid() ) {
			return dateString;
		}
		return date.format( 'LL' );
	};

	/**
	 * Animates the metadata area when the viewer is first opened.
	 */
	MPP.animateMetadataOnce = function () {
		if ( !this.hasAnimatedMetadata ) {
			this.hasAnimatedMetadata = true;
			this.$container.addClass( 'invite' );
		} else {
			this.$container.addClass( 'invited' );
		}
	};

	// ********************************
	// ******** Action methods ********
	// ********************************

	/**
	 * Toggles the metadata div being totally visible.
	 */
	MPP.toggle = function ( forceDirection ) {
		var scrollTopWhenOpen = this.$container.outerHeight() - this.$controlBar.outerHeight(),
			scrollTopTarget = $.scrollTo().scrollTop() > 0 ? 0 : scrollTopWhenOpen;

		if ( forceDirection ) {
			scrollTopTarget = forceDirection === 'down' ? 0 : scrollTopWhenOpen;
		}

		$.scrollTo( scrollTopTarget, 400 );
	};

	/**
	 * Handles keydown events for this element.
	 */
	MPP.keydown = function ( e ) {
		switch ( e.which ) {
			case 40:
				// Down arrow
				this.toggle( 'down' );
				e.preventDefault();
				break;
			case 38:
				// Up arrow
				this.toggle( 'up' );
				e.preventDefault();
				break;
		}
	};

	/**
	 * Makes sure that the given element (which must be a descendant of the metadata panel) is
	 * in view. If it isn't, scrolls the panel smoothly to reveal it.
	 * @param {HTMLElement|jQuery|string} target
	 * @param {number} [duration] animation length
	 * @param {Object} [settings] see jQuery.scrollTo
	 */
	MPP.scrollIntoView = function( target, duration, settings ) {
		var $target = $( target ),
			targetHeight = $target.height(),
			targetTop = $target.offset().top,
			targetBottom = targetTop + targetHeight,
			viewportHeight = $(window).height(),
			viewportTop = $.scrollTo().scrollTop(),
			viewportBottom = viewportTop + viewportHeight;

		// we omit here a bunch of cases which are logically possible but unlikely given the size
		// of the panel, and only care about the one which will actually happen
		if ( targetHeight <= viewportHeight ) { // target fits into screen
			if (targetBottom > viewportBottom ) {
				$.scrollTo( viewportTop + ( targetBottom - viewportBottom ), duration, settings );
			}
		}
	};

	/**
	 * Handles the progress display when a percentage of progress is received
	 * @param {number} percent
	 */
	MPP.percent = function ( percent ) {
		var panel = this;

		if ( percent === 0 ) {
			// When a 0% update comes in, we jump without animation to 0 and we hide the bar
			this.$progress.addClass( 'empty' );
			this.$percent.stop().css( { width : 0 } );
		} else if ( percent === 100 ) {
			// When a 100% update comes in, we make sure that the bar is visible, we animate
			// fast to 100 and we hide the bar when the animation is done
			this.$progress.removeClass( 'empty' );
			this.$percent.stop().animate( { width : percent + '%' }, 50, 'swing',
				function () {
					// Reset the position for good measure
					panel.$percent.stop().css( { width : 0 } );
					panel.$progress.addClass( 'empty' );
				} );
		} else {
			// When any other % update comes in, we make sure the bar is visible
			// and we animate to the right position
			this.$progress.removeClass( 'empty' );
			this.$percent.stop().animate( { width : percent + '%' } );
		}
	};

	/**
	 * Receives the window's scroll events and flips the chevron if necessary.
	 */
	MPP.scroll = function () {
		var scrolled = !!$.scrollTo().scrollTop();

		this.$dragIcon.toggleClass( 'pointing-down', scrolled );

		if (
			!this.savedHasOpenedMetadata &&
			scrolled &&
			window.localStorage !== undefined
		) {
			localStorage.setItem( 'mmv.hasOpenedMetadata', true );
			this.savedHasOpenedMetadata = true;
		}
	};

	mw.mmv.ui.MetadataPanel = MetadataPanel;
}( mediaWiki, jQuery, OO, moment ) );
