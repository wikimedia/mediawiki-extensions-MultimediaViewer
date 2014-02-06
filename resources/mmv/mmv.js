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

( function ( mw, $, moment ) {
	var MultiLightbox, lightboxHooks, MMVP,

		comingFromPopstate = false,

		imgsSelector = '.gallery .image img, a.image img',

		validExtensions = {
			'jpg': true,
			'jpeg': true,
			'gif': true,
			'svg': true,
			'png': true,
			'tiff': true,
			'tif': true
		},

		mmvLogActions = {
			'thumbnail-link-click': 'User clicked on thumbnail to open lightbox.',
			'enlarge-link-click': 'User clicked on enlarge link to open lightbox.',
			'fullscreen-link-click': 'User clicked on fullscreen button in lightbox.',
			'defullscreen-link-click': 'User clicked on button to return to normal lightbox view.',
			'close-link-click': 'User clicked on the lightbox close button.',
			'site-link-click': 'User clicked on the link to the file description page.',

			// Profiling events start messages, $1 replaced with profile ID
			'profile-image-load-start': 'Profiling image load with ID $1',
			'profile-image-resize-start': 'Profiling image resize with ID $1',
			'profile-metadata-fetch-start': 'Profiling image metadata fetch with ID $1',
			'profile-gender-fetch-start': 'Profiling uploader gender fetch with ID $1',

			// Profiling events end messages, $1 replaced with profile ID, $2 replaced with time it took in ms
			'profile-image-load-end': 'Finished image load with ID $1 in $2 milliseconds',
			'profile-image-resize-end': 'Finished image resize with ID $1 in $2 milliseconds',
			'profile-metadata-fetch-end': 'Finished image metadata fetch with ID $1 in $2 milliseconds',
			'profile-gender-fetch-end': 'Finished uploader gender fetch with ID $1 in $2 milliseconds'
		};

	/**
	 * @class mw.MultimediaViewer
	 * Analyses the page, looks for image content and sets up the hooks
	 * to manage the viewing experience of such content.
	 * @constructor
	 */
	function MultimediaViewer() {
		/**
		 * MultiLightbox object used to display the pictures in the page.
		 * @property {mlb.MultiLightbox}
		 * @private
		 */
		this.lightbox = null;

		/**
		 * Whether we've fired an animation for the metadata div.
		 * @property {boolean}
		 * @private
		 */
		this.hasAnimatedMetadata = false;

		var $thumbs = $( imgsSelector ),
			urls = [],
			viewer = this;

		/**
		 * @property {number[]}
		 * @private
		 * List of acceptable image sizes...used to bucket
		 */
		this.imageWidthBuckets = [
			320,
			640,
			800,
			1024,
			1280,
			1920,
			2560,
			2880
		];

		/**
		 * @property {mw.Api}
		 * @private
		 */
		this.api = new mw.Api();

		/**
		 * @property {mw.mmv.provider.ImageInfo}
		 * @private
		 */
		this.imageInfoProvider = new mw.mmv.provider.ImageInfo( this.api, {
			// Short-circuit, don't fallback, to save some tiny amount of time
			language: mw.config.get( 'wgUserLanguage', false ) || mw.config.get( 'wgContentLanguage', 'en' )
		} );

		/**
		 * @property {mw.mmv.provider.FileRepoInfo}
		 * @private
		 */
		this.fileRepoInfoProvider = new mw.mmv.provider.FileRepoInfo( this.api );

		/**
		 * @property {mw.mmv.provider.ThumbnailInfo}
		 * @private
		 */
		this.thumbnailInfoProvider = new mw.mmv.provider.ThumbnailInfo( this.api );

		/**
		 * @property {mw.mmv.provider.UserInfo}
		 * @private
		 */
		this.userInfoProvider = new mw.mmv.provider.UserInfo( this.api );

		/**
		 * @property {mw.mmv.provider.ImageUsage}
		 * @private
		 */
		this.imageUsageProvider = new mw.mmv.provider.ImageUsage( this.api );

		/**
		 * @property {mw.mmv.provider.GlobalUsage}
		 * @private
		 */
		this.globalUsageProvider = new mw.mmv.provider.GlobalUsage( this.api, {
			doNotUseApi: !mw.config.get( 'wgMultimediaViewer' ).globalUsageAvailable
		} );
		// replace with this one to test global usage on a local wiki without going through all the
		// hassle required for installing the extension:
		//this.globalUsageProvider = new mw.mmv.provider.GlobalUsage(
		//	new mw.Api( {ajax: { url: 'http://commons.wikimedia.org/w/api.php', dataType: 'jsonp' } } )
		//);

		// Traverse DOM, looking for potential thumbnails
		$thumbs.each( function ( i, thumb ) {
			var thisImage, $thumbCaption, caption,
				$thumb = $( thumb ),
				$link = $thumb.closest( 'a.image' ),
				$thumbContain = $link.closest( '.thumb' ),
				$enlarge = $thumbContain.find( '.magnify a' ),
				$links = $link.add( $enlarge ),
				filePageLink = $link.prop( 'href' ),
				fileTitle = mw.Title.newFromImg( $thumb ),
				index = urls.length;

			if ( !validExtensions[fileTitle.getExtension().toLowerCase()] ) {
				// Not a valid extension, skip this one
				return;
			}

			if ( $thumbContain.length === 0 ) {
				// This isn't a thumbnail! Just use the link.
				$thumbContain = $link;
			} else if ( $thumbContain.is( '.thumb' ) ) {
				$thumbCaption = $thumbContain.find( '.thumbcaption' ).clone();
				$thumbCaption.find( '.magnify' ).remove();
				viewer.whitelistHtml( $thumbCaption );
				caption = $thumbCaption.html();
				$thumbContain = $thumbContain.find( '.image' );
			}

			$links.data( 'filePageLink', filePageLink );

			// Create a LightboxImage object for each legit image
			thisImage = viewer.createNewImage( $thumb.prop( 'src' ), filePageLink, fileTitle, index, thumb, caption );

			urls.push( thisImage );

			// Register callback that launches modal image viewer if valid click
			$links.click( function ( e ) {
				return viewer.clickLinkCallback( e, this, $thumbContain, thisImage );
			} );
		} );

		if ( urls.length === 0 ) {
			// No legit images found, no need to continue
			return;
		}

		// Only if we find legit images, create a MultiLightbox object
		this.lightbox = new mw.MultiLightbox( urls, 0, mw.LightboxInterface, this );

		// Register various event hooks. TODO: Make this a function that's only called once.

		lightboxHooks.register( 'closeInterface', function () {
			if ( this.$nextButton ) {
				this.$nextButton.add( this.$prevButton ).css( 'top', '-999px' );
			}
			
			$( document.body ).removeClass( 'mw-mlb-lightbox-open' );
			if ( comingFromPopstate === false ) {
				history.pushState( {}, '', '#' );
			} else {
				comingFromPopstate = false;
			}

			viewer.hasAnimatedMetadata = false;
			viewer.isOpen = false;
		} );

		lightboxHooks.register( 'imageResize', function () {
			var ui = this;
			viewer.resize( ui );
			return false;
		} );
	}

	MMVP = MultimediaViewer.prototype;

	// TODO FIXME HACK delete this when other UI elements have been shifted away.
	MMVP.whitelistHtml = mw.mmv.ui.Element.prototype.whitelistHtml;

	/**
	 * Create an image object for the lightbox to use.
	 * @protected
	 * @param {string} fileLink Link to the file - generally a thumb URL
	 * @param {string} filePageLink Link to the File: page
	 * @param {mw.Title} fileTitle Represents the File: page
	 * @param {number} index Which number file this is
	 * @param {HTMLImageElement} thumb The thumbnail that represents this image on the page
	 * @param {string} [caption] The caption, if any.
	 * @returns {mw.LightboxImage}
	 */
	MMVP.createNewImage = function ( fileLink, filePageLink, fileTitle, index, thumb, caption ) {
		var thisImage = new mw.LightboxImage( fileLink, filePageLink, fileTitle, index, thumb, caption );
		thisImage.filePageLink = filePageLink;
		thisImage.filePageTitle = fileTitle;
		thisImage.index = index;
		thisImage.thumbnail = thumb;

		return thisImage;
	};

	/**
	 * Finds the next highest image size given a target size.
	 * Searches the bucketed sizes configured in the class.
	 * @param {number} target
	 * @return {number}
	 */
	MMVP.findNextHighestImageSize = function ( target ) {
		var i, bucket,
			buckets = this.imageWidthBuckets,
			len = buckets.length;

		for ( i = 0; i < len; i++ ) {
			bucket = buckets[i];

			if ( bucket >= target ) {
				return bucket;
			}
		}

		// If we failed to find a high enough size...good luck
		return bucket;
	};

	/**
	 * Gets the API arguments for various calls to the API to find sized thumbnails.
	 * @param {mw.LightboxInterface} ui
	 * @returns {Object}
	 * @returns {number} return.requested The width that should be requested from the API
	 * @returns {number} return.target The ideal width we would like to have - should be the width of the image element later.
	 */
	MMVP.getImageSizeApiArgs = function ( ui ) {
		var requestedWidth, calculatedMaxWidth,
			thumb = ui.currentImage.thumbnail,
			targetWidth = ui.$imageWrapper.width(),
			targetHeight = ui.$imageWrapper.height();

		if ( ( targetWidth / targetHeight ) > ( thumb.width / thumb.height ) ) {
			// Need to find width corresponding to highest height we can have.
			calculatedMaxWidth = ( thumb.width / thumb.height ) * targetHeight;
			requestedWidth = this.findNextHighestImageSize( calculatedMaxWidth );
		} else {
			// Simple case, ratio tells us we're limited by width
			requestedWidth = this.findNextHighestImageSize( targetWidth );
		}

		return {
			// Factor in pixel ratio so we get as many pixels as the device supports, see b/60388
			requested: requestedWidth * $.devicePixelRatio(),
			target: calculatedMaxWidth || targetWidth
		};
	};

	/**
	 * Handles clicks on legit image links.
	 *
	 * @protected
	 *
	 * @param {jQuery.Event} e click event
	 * @param {HTMLElement|jQuery} clickedEle clicked element
	 * @param {jQuery} $thumbContain thumbnail container element
	 * @param {mw.LightboxImage} thisImage lightboximage object
	 */
	MMVP.clickLinkCallback = function ( e, clickedEle, $thumbContain, thisImage ) {
		// Do not interfere with non-left clicks or if modifier keys are pressed.
		if ( e.which !== 1 || e.altKey || e.ctrlKey || e.shiftKey || e.metaKey ) {
			return;
		}

		var $clickedEle = $( clickedEle ),
				initial = $thumbContain.find( 'img' ).prop( 'src' );

		if ( $clickedEle.is( 'a.image' ) ) {
			this.log( 'thumbnail-link-click' );
		} else if ( $clickedEle.is( '.magnify a' ) ) {
			this.log( 'enlarge-link-click' );
		}

		e.preventDefault();

		this.loadImage( thisImage, initial );

		return false;
	};

	/**
	 * Handles resize events in viewer.
	 *
	 * @protected
	 *
	 * @param {mw.LightboxInterface} ui lightbox that got resized
	 */
	MMVP.resize = function ( ui ) {
		var viewer = this,
			fileTitle = this.currentImageFileTitle;

		if ( fileTitle ) {
			this.fetchImageInfo( fileTitle ).done( function ( imageData, repoInfo, targetWidth, requestedWidth ) {
				viewer.loadResizedImage( ui, imageData, targetWidth, requestedWidth );
			} );
		}

		this.updateControls();
	};

	/**
	 * Replaces the resized image in the viewer providing we actually got some data.
	 *
	 * @protected
	 *
	 * @param {mw.LightboxInterface} ui lightbox that got resized
	 * @param {mw.mmv.model.Image} imageData information regarding the new resized image
	 * @param {number} targetWidth
	 * @param {number} requestedWidth
	 */
	MMVP.loadResizedImage = function ( ui, imageData, targetWidth, requestedWidth ) {
		// Replace image only if data was returned.
		if ( imageData ) {
			this.loadAndSetImage( ui, imageData, targetWidth, requestedWidth, 'image-resize' );
		}
	};

	MMVP.updateControls = function () {
		var numImages = this.lightbox.images ? this.lightbox.images.length : 0,
			showNextButton = this.lightbox.currentIndex < (numImages - 1),
			showPreviousButton = this.lightbox.currentIndex > 0;

		this.ui.updateControls( showNextButton, showPreviousButton );
	};

	MMVP.registerLogging = function () {
		var viewer = this;

		this.ui.$closeButton.click( function () {
			if ( viewer.ui.$dialog ) {
				viewer.ui.$dialog.dialog( 'close' );
			}

			viewer.log( 'close-link-click' );
		} );

		this.ui.$fullscreenButton.click( function () {
			if ( viewer.ui.isFullscreen ) {
				viewer.log( 'fullscreen-link-click' );
			} else {
				viewer.log( 'defullscreen-link-click' );
			}
		} );
	};

	/**
	 * @method
	 * Get first (hopefully only) member of an object.
	 * @param {Array|Object} things
	 * @returns {Mixed}
	 */
	MMVP.getFirst = function ( things ) {
		var thing;

		if ( things ) {
			$.each( things, function ( i, thisone ) {
				thing = thisone;
				return false;
			} );
		}

		return thing;
	};

	/**
	 * @method
	 * Set the image information in the UI.
	 * @param {mw.LightboxImage} image
	 * @param {mw.mmv.model.Image} imageData
	 * @param {mw.mmv.model.Repo} repoData
	 * @param {mw.mmv.model.FileUsage} localUsage
	 * @param {mw.mmv.model.FileUsage} globalUsage
	 */
	MMVP.setImageInfo = function ( image, imageData, repoData, localUsage, globalUsage ) {
		var gfpid,
			msgname,
			fileTitle = image.filePageTitle,
			caption = image.caption,
			viewer = this,
			ui = this.lightbox.iface;

		ui.$title.text( fileTitle.getNameText() );

		ui.initUseFileData( fileTitle, imageData.url, repoData.isLocal );
		ui.$useFileLi.removeClass( 'empty' );

		ui.setRepoDisplay( repoData.displayName, repoData.favIcon, repoData.isLocal );
		ui.setFilePageLink( imageData.descriptionUrl );

		ui.$repoLi.removeClass( 'empty' );

		if ( imageData.lastUploader ) {
			gfpid = this.profileStart( 'gender-fetch' );

			this.userInfoProvider.get( imageData.lastUploader, repoData ).done( function ( gender ) {
				viewer.profileEnd( gfpid );
				ui.setUserPageLink( repoData, imageData.lastUploader, gender );
			} ).fail( function () {
				mw.log( 'Gender fetch with ID ' + gfpid + ' failed' );
				ui.setUserPageLink( repoData, imageData.lastUploader, 'unknown' );
			} );
		}

		if ( imageData.creationDateTime ) {
			ui.$datetime.text(
				mw.message(
					'multimediaviewer-datetime-created',
					this.formatDate( imageData.creationDateTime )
				).text()
			);
		} else if ( imageData.uploadDateTime ) {
			ui.$datetime.text(
				mw.message(
					'multimediaviewer-datetime-uploaded',
					this.formatDate( imageData.uploadDateTime )
				).text()
			);
		}

		ui.$datetimeLi.toggleClass( 'empty', !imageData.uploadDateTime && !imageData.creationDateTime );

		if ( imageData.source ) {
			this.whitelistHtml( ui.$source.empty().append( $.parseHTML( imageData.source ) ) );
		}

		if ( imageData.author ) {
			this.whitelistHtml( ui.$author.empty().append( $.parseHTML( imageData.author ) ) );
		}

		if ( imageData.source && imageData.author ) {
			ui.$credit.html(
				mw.message(
					'multimediaviewer-credit',
					ui.$author.get( 0 ).outerHTML,
					ui.$source.get( 0 ).outerHTML
				).plain()
			);
		} else {
			// Clobber the contents and only have one of the fields
			if ( imageData.source ) {
				ui.$credit.empty().append( ui.$source );
			} else if ( imageData.author ) {
				ui.$credit.empty().append( ui.$author );
			}
		}

		ui.$credit.toggleClass( 'empty', !imageData.source && !imageData.author );

		ui.description.set( imageData.description, caption );
		ui.categories.set( repoData.getArticlePath(), imageData.categories );

		msgname = 'multimediaviewer-license-' + ( imageData.license || '' );

		if ( !imageData.license || !mw.messages.exists( msgname ) ) {
			// Cannot display, fallback or fail
			msgname = 'multimediaviewer-license-default';
		} else {
			// License found, store the license data
			ui.$license.data( 'license', mw.message( msgname ).text() );
		}

		ui.$license
			.text( mw.message( msgname ).text() )
			.toggleClass( 'cc-license', imageData.isCcLicensed() );

		ui.$license.toggleClass( 'empty', !imageData.license );

		this.setLocationData( imageData );
		ui.$locationLi.toggleClass( 'empty', !imageData.hasCoords() );

		ui.fileUsage.set( localUsage, globalUsage );
	};

	/**
	 * @method
	 * Sets location data in the interface.
	 * @param {mw.mmv.model.Image} imageData
	 */
	MMVP.setLocationData = function ( imageData ) {
		var latsec, latitude, latmsg, latdeg, latremain, latmin,
			longsec, longitude, longmsg, longdeg, longremain, longmin;

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

		this.lightbox.iface.setLocationData(
			latdeg, latmin, latsec, latmsg,
			longdeg, longmin, longsec, longmsg,
			imageData.latitude, imageData.longitude,
			this.getFirst( Object.keys( mw.language.data ) ),
			imageData.title.getMain()
		);
	};

	/**
	 * @method
	 * Loads and sets the image specified in the imageData. It also updates the controls
	 * and collects profiling information.
	 *
	 * @param {mw.LightboxInterface} ui image container
	 * @param {mw.mmv.model.Image} imageData image information
	 * @param {number} targetWidth
	 * @param {number} requestedWidth
	 * @param {string} profileEvent profile event key
	 */
	MMVP.loadAndSetImage = function ( ui, imageData, targetWidth, requestedWidth, profileEvent ) {
		var rpid,
			maybeThumb,
			viewer = this,
			image = new Image();

		image.onload = function () {
			viewer.profileEnd( rpid );
		};

		rpid = this.profileStart( profileEvent, {
			width: imageData.width,
			height: imageData.height,
			fileSize: imageData.size
		}, imageData.mimeType );

		// Use cached image if we have it.
		maybeThumb = imageData.getThumbUrl( requestedWidth );
		image.src = maybeThumb || imageData.url;

		if ( maybeThumb && requestedWidth > targetWidth ||
			!maybeThumb && imageData.width > targetWidth ) {
			// Image bigger than the current area, resize before loading
			image.width = targetWidth;
		}

		ui.replaceImageWith( image );
		this.updateControls();
	};

	/**
	 * @method
	 * Loads a specified image.
	 * @param {mw.LightboxImage} image
	 * @param {string} initialSrc The string to set the src attribute to at first.
	 */
	MMVP.loadImage = function ( image, initialSrc ) {
		var mdpid,
			viewer = this;

		this.lightbox.currentIndex = image.index;

		// Open with the already-loaded thumbnail
		// Avoids trying to load /wiki/Undefined and doesn't
		// cost any network time - the library currently needs
		// some src attribute to work. Will fix.
		image.initialSrc = initialSrc;
		this.currentImageFilename = image.filePageTitle.getPrefixedText();
		this.currentImageFileTitle = image.filePageTitle;
		this.lightbox.iface.comingFromPopstate = comingFromPopstate;

		if ( !this.isOpen ) {
			this.lightbox.open();
			this.isOpen = true;
		} else {
			this.lightbox.iface.empty();
			this.lightbox.iface.load( image );
		}

		$( document.body ).addClass( 'mw-mlb-lightbox-open' );

		mdpid = this.profileStart( 'metadata-fetch' );

		this.fetchImageInfoAndFileUsageInfo( image.filePageTitle ).then( function ( imageData, repoInfo, targetWidth, requestedWidth, localUsage, globalUsage ) {
			var repoData = mw.mmv.model.Repo.newFromRepoInfo( repoInfo[imageData.repo] );

			viewer.profileEnd( mdpid );

			viewer.stopListeningToScroll();
			viewer.animateMetadataDivOnce()
				// We need to wait until the animation is finished before we listen to scroll
				.then( function() { viewer.startListeningToScroll(); } );

			viewer.loadAndSetImage( viewer.lightbox.iface, imageData, targetWidth, requestedWidth, 'image-load' );

			viewer.lightbox.iface.$imageDiv.removeClass( 'empty' );
			viewer.setImageInfo( image, imageData, repoData, localUsage, globalUsage );
		} );

		comingFromPopstate = false;
	};

	/**
	 * @method
	 * Animates the metadata area when the viewer is first opened.
	 * @return {jQuery.Promise} an empty promise which resolves when the animation is finished
	 */
	MMVP.animateMetadataDivOnce = function () {
		if ( !this.hasAnimatedMetadata ) {
			this.hasAnimatedMetadata = true;
			$.scrollTo( 40, 400 )
				.scrollTo( 0, 400 );
		}
		return $.scrollTo.window().promise();
	};

	/**
	 * @method
	 * Stop listening to the page's scroll events
	 */
	MMVP.stopListeningToScroll = function () {
		$.scrollTo().off( 'scroll.mmvp' );
	};

	/**
	 * @method
	 * Start listening to the page's scroll events
	 * Will call MMVP.scroll(), throttled so it is not triggered on every pixel.
	 */
	MMVP.startListeningToScroll = function () {
		var viewer = this;

		$.scrollTo().on( 'scroll.mmvp', $.throttle( 250, function() { viewer.scroll(); } ) );

		// Trigger a check in case the user scrolled manually during the animation
		viewer.scroll();
	};

	/**
	 * @method
	 * Receives the window's scroll events and flips the chevron if necessary.
	 */
	MMVP.scroll = function () {
		this.ui.$dragIcon.toggleClass( 'pointing-down', !!$.scrollTo().scrollTop() );
	};

	/**
	 * @method
	 * Fetches image information from the API.
	 *
	 * Will resolve the promise with two objects (imageData and repoData), the
	 * target width - basically the screen size - that the caller should resize
	 * the image to eventually, and the requested width - that is, what we asked
	 * for from the API - that should be used to fetch the thumbnail URL from
	 * the imageData object.
	 *
	 * The target
	 * @param {mw.Title} fileTitle Title of the file page for the image.
	 * @returns {jQuery.Promise}
	 */
	MMVP.fetchImageInfo = function ( fileTitle ) {
		var widths = this.getImageSizeApiArgs( this.ui ),
			targetWidth = widths.target,
			requestedWidth = widths.requested;

		return $.when(
			this.fileRepoInfoProvider.get(),
			this.imageInfoProvider.get( fileTitle ),
			this.thumbnailInfoProvider.get( fileTitle, requestedWidth )
		).then( function( fileRepoInfoHash, imageInfo, thumbnailData ) {
			var thumbnailUrl = thumbnailData[0],
				thumbnailWidth = thumbnailData[1];
			imageInfo.addThumbUrl( thumbnailWidth, thumbnailUrl );
			return $.Deferred().resolve( imageInfo, fileRepoInfoHash, targetWidth, requestedWidth );
		} );
	};

	/**
	 * Gets file usage info.
	 * @param {mw.Title} fileTitle Title of the file page for the image.
	 * @returns {jQuery.Promise.<mw.mmv.model.FileUsage, mw.mmv.model.FileUsage>} a promise
	 *     resolving to a local and a global file usage object
	 * FIXME should be parallel with the other fetches, or even better if it can be integrated
	 *     into the same API calls. Lets get it out first though.
	 */
	MMVP.fetchFileUsageInfo = function ( fileTitle ) {
		return $.when(
			this.imageUsageProvider.get( fileTitle ),
			this.globalUsageProvider.get( fileTitle )
		);
	};

	/**
	 * Gets all file-related info.
	 * @param {mw.Title} fileTitle Title of the file page for the image.
	 * @returns {jQuery.Promise.<mw.mmv.model.Image, mw.mmv.model.Repo, Number, Number,
	 *     mw.mmv.model.FileUsage, mw.mmv.model.FileUsage>}
	 */
	MMVP.fetchImageInfoAndFileUsageInfo = function ( fileTitle ) {
		return $.when(
			this.fetchImageInfo( fileTitle ),
			this.fetchFileUsageInfo( fileTitle )
		).then( function( first, second ) {
			var d = $.Deferred();
			return d.resolve.apply( d, first.concat( second ) );
		} );
	};

	MMVP.loadIndex = function ( index ) {
		var $clicked = $( imgsSelector ).eq( index );
		if ( index < this.lightbox.images.length && index >= 0 ) {
			this.loadImage( this.lightbox.images[index], $clicked.prop( 'src' ) );
		}
	};

	MMVP.nextImage = function () {
		this.loadIndex( this.lightbox.currentIndex + 1 );
	};

	MMVP.prevImage = function () {
		this.loadIndex( this.lightbox.currentIndex - 1 );
	};

	MMVP.log = function ( action ) {
		mw.log( mmvLogActions[action] || action );

		if ( mw.eventLog ) {
			mw.eventLog.logEvent( 'MediaViewer', {
				version: '1.1',
				action: action
			} );
		}
	};

	( function () {
		var profiling = {},
			nonce = 0;

		/**
		 * Start profiling an event
		 * @param {string} type Can be image-load, image-resize, metadata-fetch, gender-fetch
		 * @param {Object} [imgSize] Size of image (for image related events)
		 * @param {number} [imgSize.width] In pixels
		 * @param {number} [imgSize.height] In pixels
		 * @param {number} [imgSize.filesize] In bytes
		 * @param {string} [fileType] File type (for image related events)
		 * @param {number} [timeout] Optional timeout for the event.
		 * @returns {number} The id used to finish the profiling
		 */
		MMVP.profileStart = function ( type, imgSize, fileType, timeout ) {
			var thisid = nonce++;

			imgSize = imgSize || {};

			profiling[thisid] = {
				/* Changelog:
				 * 1.1 fixed the issue with zeros in every message
				 * 1.0 first release
				 */
				version: '1.1',
				action: type,
				imageWidth: imgSize.width,
				imageHeight: imgSize.height,
				fileSize: imgSize.filesize,
				fileType: fileType,
				userAgent: navigator.userAgent,
				start: Date.now()
			};

			mw.log( mmvLogActions['profile-' + type + '-start'].replace( /\$1/g, thisid ) );

			if ( timeout ) {
				window.setTimeout( function () {
					profiling[thisid] = undefined;
				}, timeout );
			}

			return thisid;
		};

		/**
		 * Signal the end of an event being profiled and send the
		 * eventlogging message.
		 * @param {number} id Should be the value returned from profileStart
		 * @param {boolean} [fakeTime] For testing, whether to fake the time in the message. Time is zero if so.
		 */
		MMVP.profileEnd = function ( id, fakeTime ) {
			var msg;

			if ( profiling[id] ) {
				msg = profiling[id];
				msg.milliseconds = Date.now() - msg.start;
				delete msg.start;

				mw.log(
					mmvLogActions['profile-' + msg.action + '-end']
						.replace( /\$1/g, id )
						.replace( /\$2/g, fakeTime ? 0 : msg.milliseconds )
				);

				if ( mw.eventLog ) {
					mw.eventLog.logEvent( 'MediaViewerPerf', msg );
				}
			}
		};
	}() );

	/**
	 * Transforms a date string into localized, human-readable format.
	 * Unrecognized strings are returned unchanged.
	 * @param {string} dateString
	 * @return {string}
	 */
	MMVP.formatDate = function ( dateString ) {
		var date = moment( dateString );
		if ( !date.isValid() ) {
			return dateString;
		}
		return date.format( 'LL' );
	};

	function handleHash() {
		var statedIndex,
			$foundElement,
			hash = decodeURIComponent( document.location.hash ),
			linkState = hash.split( '/' );

		comingFromPopstate = true;
		if ( linkState[0] === '#mediaviewer' ) {
			statedIndex = mw.mediaViewer.lightbox.images[linkState[2]];

			if ( statedIndex.filePageTitle.getPrefixedText() === linkState[1] ) {
				$foundElement = $( imgsSelector ).eq( linkState[2] );
				mw.mediaViewer.loadImage( statedIndex, $foundElement.prop( 'src' ) );
			}
		} else {
			// If the hash is invalid (not a mmv hash) we check if there's any mmv lightbox open and we close it
			if ( mw.mediaViewer && mw.mediaViewer.lightbox && mw.mediaViewer.lightbox.iface ) {
				mw.mediaViewer.lightbox.iface.unattach();
			}
		}
	}

	$( function () {
		MultiLightbox = window.MultiLightbox;
		lightboxHooks = window.lightboxHooks;

		mw.mediaViewer = new MultimediaViewer();

		handleHash();
		window.addEventListener( 'popstate', handleHash );
	} );

	mw.MultimediaViewer = MultimediaViewer;
}( mediaWiki, jQuery, moment ) );
