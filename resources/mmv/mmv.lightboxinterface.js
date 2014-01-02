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

( function ( mw, $, oo, MLBInterface ) {
	var LIP;

	/**
	 * @class mw.LightboxInterface
	 * @extends mlb.LightboxInterface
         * Represents the main interface of the lightbox
	 * @constructor
	 */
	function LightboxInterface() {
		MLBInterface.call( this );

		this.eventsRegistered = {};

		this.initializeInterface();
	}

	oo.inheritClass( LightboxInterface, MLBInterface );

	LIP = LightboxInterface.prototype;

	LIP.empty = function () {
		this.clearEvents();

		this.$license.empty().addClass( 'empty' );

		this.description.empty();

		this.$title.empty();
		this.$credit.empty().addClass( 'empty' );

		this.$username.empty();
		this.$usernameLi.addClass( 'empty' );

		this.$repo.empty();
		this.$repoLi.addClass( 'empty' );

		this.$datetime.empty();
		this.$datetimeLi.addClass( 'empty' );

		this.$location.empty();
		this.$locationLi.addClass( 'empty' );

		this.$useFile.data( 'title', null );
		this.$useFile.data( 'link', null );
		this.$useFile.data( 'src', null );
		this.$useFile.data( 'isLocal', null );
		this.$useFileLi.addClass( 'empty' );

		this.$imageDiv.addClass( 'empty' );

		MLBInterface.prototype.empty.call( this );
	};

	/**
	 * Add event handler in a way that will be auto-cleared on lightbox close
	 * @param {string} name Name of event, like 'keydown'
	 * @param {Function} handler Callback for the event
	 */
	LIP.handleEvent = function ( name, handler ) {
		if ( this.eventsRegistered[name] === undefined ) {
			this.eventsRegistered[name] = [];
		}
		this.eventsRegistered[name].push( handler );
		$( document ).on( name, handler );
	};

	/**
	 * Remove all events that have been registered.
	 */
	LIP.clearEvents = function () {
		var i, handlers, thisevent,
			events = Object.keys( this.eventsRegistered );

		for ( i = 0; i < events.length; i++ ) {
			thisevent = events[i];
			handlers = this.eventsRegistered[thisevent];
			while ( handlers.length > 0 ) {
				$( document ).off( thisevent, handlers.pop() );
			}
		}
	};

	LIP.attach = function ( parentId ) {
		// Advanced description needs to be below the fold when the lightbox opens
		// regardless of what the scroll value was prior to opening the lightbox
		var $document = $( document );

		// Only scroll and save the position if it's the first attach
		// Otherwise it could be an attach event happening because of prev/next
		if ( this.scrollTopBeforeAttach === undefined ) {
			// Save the scrollTop value because we want below to be back to where they were
			// before opening the lightbox
			this.scrollTopBeforeAttach = $document.scrollTop();
			$document.scrollTop( 0 );
		}

		MLBInterface.prototype.attach.call( this, parentId );
	};

	LIP.unattach = function () {
		MLBInterface.prototype.unattach.call( this );

		// Restore the scrollTop as it was before opening the lightbox
		if ( this.scrollTopBeforeAttach !== undefined ) {
			$( document ).scrollTop( this.scrollTopBeforeAttach );
			this.scrollTopBeforeAttach = undefined;
		}
	};

	LIP.load = function ( image ) {
		var hashFragment = '#mediaviewer/' + mw.mediaViewer.currentImageFilename + '/' + mw.mediaViewer.lightbox.currentIndex;

		mw.mediaViewer.ui = this;
		mw.mediaViewer.registerLogging();

		if ( !this.comingFromPopstate ) {
			history.pushState( {}, '', hashFragment );
		}

		this.handleEvent( 'keydown', this.handleKeyDown );

		MLBInterface.prototype.load.call( this, image );
	};

	LIP.initializeInterface = function () {
		this.$postDiv.css( 'top', ( $( window ).height() - 83 ) + 'px' );

		this.initializeHeader();
		this.initializeNavigation();
		this.initializeButtons();
		this.initializeImage();
		this.initializeImageMetadata();
		this.initializeAboutLinks();
	};

	LIP.initializeHeader = function () {
		var ui = this;

		this.$dragBar = $( '<div>' )
			.addClass( 'mw-mlb-drag-affordance' )
			.appendTo( this.$controlBar )
			.click( function () {
				ui.toggleMetadata();
			} );

		this.$dragIcon = $( '<div>' )
			.addClass( 'mw-mlb-drag-icon' )
			.appendTo( this.$dragBar );

		this.$titleDiv = $( '<div>' )
			.addClass( 'mw-mlb-title-contain' )
			.appendTo( this.$controlBar );

		this.$postDiv.append( this.$controlBar );

		this.initializeTitleAndCredit();
		this.initializeLicense();
	};

	LIP.initializeTitleAndCredit = function () {
		this.$titleAndCredit = $( '<div>' )
			.addClass( 'mw-mlb-title-credit' )
			.appendTo( this.$titleDiv );

		this.initializeTitle();
		this.initializeCredit();
	};

	LIP.initializeTitle = function () {
		this.$titlePara = $( '<p>' )
			.addClass( 'mw-mlb-title-para' )
			.appendTo( this.$titleAndCredit );

		this.$title = $( '<span>' )
			.addClass( 'mw-mlb-title' )
			.appendTo( this.$titlePara );
	};

	LIP.initializeCredit = function () {
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

	LIP.initializeLicense = function () {
		this.$license = $( '<a>' )
			.addClass( 'mw-mlb-license empty' )
			.prop( 'href', '#' )
			.appendTo( this.$titlePara );
	};

	LIP.initializeButtons = function () {
		// Note we aren't adding the fullscreen button here.
		// Fullscreen causes some funky issues with UI redraws,
		// and we aren't sure why, but it's not really necessary
		// with the new interface anyway - it's basically fullscreen
		// already!
		this.$closeButton
			.add( this.$fullscreenButton )
			.add( this.$nextButton )
			.add( this.$prevButton )
			.appendTo( this.$imageWrapper );
	};

	LIP.initializeImage = function () {
		this.$imageDiv
			.addClass( 'empty' );
	};

	LIP.initializeImageMetadata = function () {
		this.$imageMetadata = $( '<div>' )
			.addClass( 'mw-mlb-image-metadata' )
			.appendTo( this.$postDiv );

		this.initializeImageDesc();
		this.initializeImageLinks();
	};

	LIP.initializeImageDesc = function () {
		this.description = new mw.mmv.ui.Description( this.$imageMetadata );
	};

	LIP.initializeImageLinks = function () {
		this.$imageLinkDiv = $( '<div>' )
			.addClass( 'mw-mlb-image-links-div' )
			.appendTo( this.$imageMetadata );

		this.$imageLinks = $( '<ul>' )
			.addClass( 'mw-mlb-image-links' )
			.appendTo( this.$imageLinkDiv );

		this.initializeRepoLink();
		this.initializeDatetime();
		this.initializeUploader();
		this.initializeLocation();
		this.initializeFileUsage();
	};

	LIP.initializeRepoLink = function () {
		this.$repoLi = $( '<li>' )
			.addClass( 'mw-mlb-repo-li empty' )
			.appendTo( this.$imageLinks );

		this.$repo = $( '<a>' )
			.addClass( 'mw-mlb-repo' )
			.prop( 'href', '#' )
			.click( function ( e ) {
				var $link = $( this );
				mw.mediaViewer.log( 'site-link-click' );
				// If the user is navigating away, we have to add a timeout to fix that.
				if ( e.altKey || e.shiftKey || e.ctrlKey || e.metaKey ) {
					// Just ignore this case - either they're opening in a new
					// window and the logging will work, or they're not trying to
					// navigate away from the page and we should leave them alone.
					return;
				}

				e.preventDefault();
				setTimeout( function () {
					window.location.href = $link.prop( 'href' );
				}, 500 );
			} )
			.appendTo( this.$repoLi );
	};

	LIP.initializeDatetime = function () {
		this.$datetimeLi = $( '<li>' )
			.addClass( 'mw-mlb-datetime-li empty' )
			.appendTo( this.$imageLinks );

		this.$datetime = $( '<span>' )
			.addClass( 'mw-mlb-datetime' )
			.appendTo( this.$datetimeLi );
	};

	LIP.initializeUploader = function () {
		this.$usernameLi = $( '<li>' )
			.addClass( 'mw-mlb-username-li empty' )
			.appendTo( this.$imageLinks );

		this.$username = $( '<a>' )
			.addClass( 'mw-mlb-username' )
			.prop( 'href', '#' )
			.appendTo( this.$usernameLi );
	};

	LIP.initializeLocation = function () {
		this.$locationLi = $( '<li>' )
			.addClass( 'mw-mlb-location-li empty' )
			.appendTo( this.$imageLinks );

		this.$location = $( '<a>' )
			.addClass( 'mw-mlb-location' )
			.appendTo( this.$locationLi );
	};

	LIP.initializeFileUsage = function () {
		var ui = this;

		this.$useFileLi = $( '<li>' )
			.addClass( 'mw-mlb-usefile-li empty' )
			.appendTo( this.$imageLinks );

		this.$useFile = $( '<a>' )
			.addClass( 'mw-mlb-usefile' )
			.prop( 'href', '#' )
			.text( mw.message( 'multimediaviewer-use-file' ).text() )
			.click( function () {
				ui.openFileUsageDialog();
				return false;
			} )
			.appendTo( this.$useFileLi );
	};

	LIP.openFileUsageDialog = function () {
		// Only open dialog once
		if ( this.$dialog ) {
			return false;
		}

		function selectAllOnEvent() {
			this.select();
		}

		var fileTitle = this.$useFile.data( 'title' ),

			filename = fileTitle.getPrefixedText(),
			desc = fileTitle.getNameText(),

			linkPrefix = this.$useFile.data( 'isLocal' ) ? mw.config.get( 'wgServer' ) : '',
			src = this.$useFile.data( 'src' ),
			link = this.$useFile.data( 'link' ) || src,
			pattern = /^\/[^\/]/,
			finalLink = pattern.test(link) ? linkPrefix +link: link,

			license = this.$license.data( 'license' ) || '',
			author = this.$author.text(),
			linkTitle = ( license + ( author ? ' (' + author + ')' : '' ) ).trim(),

			owtId = 'mw-mlb-use-file-onwiki-thumb',
			ownId = 'mw-mlb-use-file-onwiki-normal',
			owId = 'mw-mlb-use-file-offwiki',

			$owtLabel = $( '<label>' )
				.prop( 'for', owtId )
				.text( mw.message( 'multimediaviewer-use-file-owt' ).text() ),

			$owtField = $( '<input>' )
				.prop( 'type', 'text' )
				.prop( 'id', owtId )
				.prop( 'readonly', true )
				.focus( selectAllOnEvent )
				.val( '[[' + filename + '|thumb|' + desc + ']]' ),

			$onWikiThumb = $( '<div>' )
				.append( $owtLabel,
					$owtField
				),

			$ownLabel = $( '<label>' )
				.prop( 'for', ownId )
				.text( mw.message( 'multimediaviewer-use-file-own' ).text() ),

			$ownField = $( '<input>' )
				.prop( 'type', 'text' )
				.prop( 'id', ownId )
				.prop( 'readonly', true )
				.focus( selectAllOnEvent )
				.val( '[[' + filename + '|' + desc + ']]' ),

			$onWikiNormal = $( '<div>' )
				.append(
					$ownLabel,
					$ownField
				),

			$owLabel = $( '<label>' )
				.prop( 'for', owId )
				.text( mw.message( 'multimediaviewer-use-file-offwiki' ).text() ),

			$owField = $( '<input>' )
				.prop( 'type', 'text' )
				.prop( 'id', owId )
				.prop( 'readonly', true )
				.focus( selectAllOnEvent )
				.val( '<a href="' + finalLink + ( linkTitle ? '" title="' + linkTitle : '' ) + '" ><img src="' + src + '" /></a>' ),


			$offWiki = $( '<div>' )
				.append(
					$owLabel,
					$owField
				);

		this.$dialog = $( '<div>' )
			.addClass( 'mw-mlb-use-file-dialog' )
			.append(
				$onWikiThumb,
				$onWikiNormal,
				$offWiki
			)
			.dialog( {
				width: 750,
				close: function () {
					// Delete the dialog object
					mw.mediaViewer.ui.$dialog = undefined;
				}
			} );

		$owtField.focus();

		return false;
	};

	LIP.initializeAboutLinks = function () {
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

	LIP.initializeNavigation = function () {
		this.handleKeyDown = this.handleKeyDown || function ( e ) {
			var isRtl = $( document.body ).hasClass( 'rtl' );

			switch ( e.keyCode ) {
				case 37:
					// Left arrow
					if ( isRtl ) {
						mw.mediaViewer.nextImage();
					} else {
						mw.mediaViewer.prevImage();
					}
					break;
				case 39:
					// Right arrow
					if ( isRtl ) {
						mw.mediaViewer.prevImage();
					} else {
						mw.mediaViewer.nextImage();
					}
					break;
			}
		};

		this.$nextButton = $( '<div>' )
			.addClass( 'mw-mlb-next-image disabled' )
			.html( '&nbsp;' )
			.click( function () {
				mw.mediaViewer.nextImage();
			} );

		this.$prevButton = $( '<div>' )
			.addClass( 'mw-mlb-prev-image disabled' )
			.html( '&nbsp;' )
			.click( function () {
				mw.mediaViewer.prevImage();
			} );
	};

	LIP.toggleMetadata = function () {
		var scrollTopWhenOpen = $( '.mlb-post-image' ).height() - $( '.mlb-controls' ).height(),
			scrollTopTarget = $.scrollTo().scrollTop() > 0 ? 0 : scrollTopWhenOpen;

		$.scrollTo( scrollTopTarget, 400 );
	};

	/**
	 * @method
	 * Sets the display name of the repository
	 * @param {string} displayname
	 * @param {string} favIcon
	 * @param {boolean} isLocal true if this is the local repo ( the file has been uploaded locally)
	 */
	LIP.setRepoDisplay = function ( displayname, favIcon, isLocal ) {
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
	};

	/**
	 * @method
	 * Sets the URL for the File: page of the image
	 * @param {string} url
	 */
	LIP.setFilePageLink = function ( url ) {
		this.$repo.prop( 'href', url );
		this.$license.prop( 'href', url );
	};

	/**
	 * @method
	 * Sets the image location data in the interface.
	 * @param {number} latdeg Number of degrees in latitude
	 * @param {number} latmin Number of minutes in latitude
	 * @param {number} latsec Number of seconds, rounded to two places, in latitude
	 * @param {number} latmsg The message representing the cardinal direction of the latitude
	 * @param {number} longdeg Number of degrees in longitude
	 * @param {number} longmin Number of minutes in longitude
	 * @param {number} longsec Number of seconds, rounded to two places, in longitude
	 * @param {number} longmsg The message representing the cardinal direction of the longitude
	 * @param {number} latitude The initial, decimal latitude
	 * @param {number} longitude The initial, decimal longitude
	 * @param {string} langcode Code for the language being used - like 'en', 'zh', or 'en-gb'
	 * @param {string} titleText Title of the file
	 */
	LIP.setLocationData = function (
		latdeg, latmin, latsec, latmsg,
		longdeg, longmin, longsec, longmsg,
		latitude, longitude, langcode, titleText
	) {
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

		this.$location.prop( 'href', (
			'//tools.wmflabs.org/geohack/geohack.php?pagename=' +
			'File:' + titleText +
			'&params=' +
			latitude + '_N_' +
			longitude + '_E_' +
			'&language=' + langcode
		) );
	};

	/**
	 * @method
	 * Saves some data about the image on the $useFile element for later setup.
	 * @param {mw.Title} title
	 * @param {string} src The URL for the full-size image
	 * @param {boolean} isLocal Whether the file is on this wiki or not
	 */
	LIP.initUseFileData = function ( title, src, isLocal ) {
		this.$useFile.data( 'title', title );
		this.$useFile.data( 'src', src );
		this.$useFile.data( 'isLocal', isLocal );
	};

	/**
	 * @method
	 * Sets the link to the user page where possible
	 * @param {mw.mmv.model.Repo} repoData
	 * @param {string} username
	 * @param {string} gender
	 */
	LIP.setUserPageLink = function ( repoData, username, gender ) {
		var userlink,
			userpage = 'User:' + username;

		if ( repoData instanceof mw.mmv.model.ForeignDbRepo ) {
			// We basically can't do anything about this; fail
			this.$username.addClass( 'empty' );
		} else {
			if ( repoData.absoluteArticlePath ) {
				userlink = repoData.absoluteArticlePath;
			} else {
				userlink = mw.config.get( 'wgArticlePath' );
			}
			userlink = userlink.replace( '$1', userpage );

			this.$username
				.text(
					mw.message( 'multimediaviewer-userpage-link', username, gender ).text()
				)
				.prop( 'href', userlink );

			this.$usernameLi.toggleClass( 'empty', !username );
		}
	};

	LIP.replaceImageWith = function ( imageEle ) {
		var $image = $( imageEle );

		this.currentImage.src = imageEle.src;

		this.$image.replaceWith( $image );
		this.$image = $image;

		this.$image.css( {
			maxHeight: $image.parent().height(),
			maxWidth: $image.parent().width()
		} );
	};

	mw.LightboxInterface = LightboxInterface;
}( mediaWiki, jQuery, OO, window.LightboxInterface ) );
