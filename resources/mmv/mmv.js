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

( function ( mw, $ ) {
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
		 * @property {mw.Api}
		 * @private
		 */
		this.api = new mw.Api();

		/**
		 * @property {mw.mmv.provider.Image}
		 * @private
		 */
		this.imageProvider = new mw.mmv.provider.Image();

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

		/**
		 * @property {mw.mmv.performance}
		 * @private
		 */
		this.performance = new mw.mmv.performance();

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

		this.setupEventHandlers();
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
				initial = $thumbContain.find( 'img' ).clone()[0];

		if ( $clickedEle.is( 'a.image' ) ) {
			mw.mmv.logger.log( 'thumbnail-link-click' );
		} else if ( $clickedEle.is( '.magnify a' ) ) {
			mw.mmv.logger.log( 'enlarge-link-click' );
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
			fileTitle = this.currentImageFileTitle,
			imageWidths;

		this.preloadThumbnails();

		if ( fileTitle ) {
			imageWidths = ui.getCurrentImageWidths();
			this.fetchThumbnail(
				fileTitle, imageWidths.real
			).then( function( thumbnail, image ) {
				viewer.setImage( ui, thumbnail, image, imageWidths );
			} );
		}

		this.updateControls();
	};

	MMVP.updateControls = function () {
		var numImages = this.lightbox.images ? this.lightbox.images.length : 0,
			showNextButton = this.lightbox.currentIndex < (numImages - 1),
			showPreviousButton = this.lightbox.currentIndex > 0;

		this.ui.updateControls( showNextButton, showPreviousButton );
	};

	/**
	 * @method
	 * Loads and sets the specified image. It also updates the controls.
	 *
	 * @param {mw.LightboxInterface} ui image container
	 * @param {mw.mmv.model.Thumbnail} thumbnail thumbnail information
	 * @param {HTMLImageElement} image
	 * @param {mw.mmv.model.ThumbnailWidth} imageWidths
	 */
	MMVP.setImage = function ( ui, thumbnail, image, imageWidths ) {
		// we downscale larger images but do not scale up smaller ones, that would look ugly
		if ( thumbnail.width > imageWidths.screen ) {
			image.width = imageWidths.css;
		}

		ui.replaceImageWith( image );
		this.updateControls();
	};

	/**
	 * @method
	 * Loads a specified image.
	 * @param {mw.LightboxImage} image
	 * @param {HTMLImageElement} initialImage A thumbnail to use as placeholder while the image loads
	 */
	MMVP.loadImage = function ( image, initialImage ) {
		var imageWidths,
			viewer = this,
			imagePromise,
			metadataPromise;

		// FIXME dependency injection happens in completely random order and location, needs cleanup
		this.ui = this.lightbox.iface;

		this.lightbox.currentIndex = image.index;

		this.currentImageFilename = image.filePageTitle.getPrefixedText();
		this.currentImageFileTitle = image.filePageTitle;
		this.lightbox.iface.comingFromPopstate = comingFromPopstate;

		if ( !this.isOpen ) {
			this.lightbox.open();
			this.isOpen = true;
		} else {
			this.lightbox.iface.empty();
		}
		this.lightbox.iface.setupForLoad();
		this.lightbox.iface.showImage( image, initialImage );

		this.preloadImagesMetadata();
		this.preloadThumbnails();

		$( document.body ).addClass( 'mw-mlb-lightbox-open' );

		imageWidths = this.ui.getCurrentImageWidths();
		imagePromise = this.fetchThumbnail(
			image.filePageTitle, imageWidths.real
		).done( function( thumbnail, image ) {
			viewer.setImage( viewer.lightbox.iface, thumbnail, image, imageWidths );
			viewer.lightbox.iface.$imageDiv.removeClass( 'empty' );
		} );

		metadataPromise = this.fetchSizeIndependentLightboxInfo(
			image.filePageTitle
		).done( function ( imageInfo, repoInfo, localUsage, globalUsage, userInfo ) {
			viewer.lightbox.iface.panel.setImageInfo(image, imageInfo, repoInfo,
				localUsage, globalUsage, userInfo );
		} );

		$.when( imagePromise, metadataPromise ).then( function() {
			viewer.stopListeningToScroll();
			viewer.animateMetadataDivOnce()
				// We need to wait until the animation is finished before we listen to scroll
				.then( function() { viewer.startListeningToScroll(); } );
		} );

		comingFromPopstate = false;
	};

	/**
	 * Preload this many prev/next images to speed up navigation.
	 * (E.g. preloadDistance = 3 means that the previous 3 and the next 3 images will be loaded.)
	 * Preloading only happens when the viewer is open.
	 * @property {number}
	 */
	MMVP.preloadDistance = 1;

	/**
	 * Stores image metadata preloads, so they can be cancelled.
	 * @type {mw.mmv.model.TaskQueue}
	 */
	MMVP.metadataPreloadQueue = null;

	/**
	 * Stores image thumbnail preloads, so they can be cancelled.
	 * @type {mw.mmv.model.TaskQueue}
	 */
	MMVP.thumbnailPreloadQueue = null;

	/**
	 * Orders lightboximage indexes for preloading. Works similar to $.each, except it only takes
	 * the callback argument. Calls the callback with each lightboximage index in some sequence
	 * that is ideal for preloading.
	 * @private
	 * @param {function(number, mw.LightboxImage)} callback
	 */
	MMVP.eachPrealoadableLightboxIndex = function( callback ) {
		for ( var i = 0; i <= this.preloadDistance; i++ ) {
			if ( this.lightbox.currentIndex + i < this.lightbox.images.length ) {
				callback(
					this.lightbox.currentIndex + i,
					this.lightbox.images[this.lightbox.currentIndex + i]
				);
			}
			if ( i && this.lightbox.currentIndex - i >= 0 ) { // skip duplicate for i==0
				callback(
					this.lightbox.currentIndex - i,
					this.lightbox.images[this.lightbox.currentIndex - i]
				);
			}
		}
	};

	/**
	 * A helper function to fill up the preload queues.
	 * taskFactory(lightboxImage) should return a preload task for the given lightboximage.
	 * @private
	 * @param {function(mw.LightboxImage): function()} taskFactory
	 * @return {mw.mmv.model.TaskQueue}
	 */
	MMVP.pushLightboxImagesIntoQueue = function( taskFactory ) {
		var queue = new mw.mmv.model.TaskQueue();

		this.eachPrealoadableLightboxIndex( function( i, lightboxImage ) {
			queue.push( taskFactory( lightboxImage ) );
		} );

		return queue;
	};

	/**
	 * Cancels in-progress image metadata preloading.
	 */
	MMVP.cancelImageMetadataPreloading = function() {
		if ( this.metadataPreloadQueue ) {
			this.metadataPreloadQueue.cancel();
		}
	};

	/**
	 * Cancels in-progress image thumbnail preloading.
	 */
	MMVP.cancelThumbnailsPreloading = function() {
		if ( this.thumbnailPreloadQueue ) {
			this.thumbnailPreloadQueue.cancel();
		}
	};

	/**
	 * Preload metadata for next and prev N image (N = MMVP.preloadDistance).
	 * Two images will be loaded at a time (one forward, one backward), with closer images
	 * being loaded sooner.
	 */
	MMVP.preloadImagesMetadata = function() {
		var viewer = this;

		this.cancelImageMetadataPreloading();

		this.metadataPreloadQueue = this.pushLightboxImagesIntoQueue( function( lightboxImage ) {
			return function() {
				return viewer.fetchSizeIndependentLightboxInfo( lightboxImage.filePageTitle );
			};
		} );

		this.metadataPreloadQueue.execute();
	};

	/**
	 * Preload thumbnails for next and prev N image (N = MMVP.preloadDistance).
	 * Two images will be loaded at a time (one forward, one backward), with closer images
	 * being loaded sooner.
	 */
	MMVP.preloadThumbnails = function() {
		var viewer = this,
			ui = this.lightbox.iface;

		this.cancelThumbnailsPreloading();

		this.thumbnailPreloadQueue = this.pushLightboxImagesIntoQueue( function( lightboxImage ) {
			return function() {
				return viewer.fetchThumbnail(
					lightboxImage.filePageTitle,
					ui.getLightboxImageWidths( lightboxImage ).real
				);
			};
		} );

		this.thumbnailPreloadQueue.execute();
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
		this.ui.panel.$dragIcon.toggleClass( 'pointing-down', !!$.scrollTo().scrollTop() );
	};

	/**
	 * Loads all the size-independent information needed by the lightbox (image metadata, repo
	 * information, file usage, uploader data).
	 * @param {mw.Title} fileTitle Title of the file page for the image.
	 * @returns {jQuery.Promise.<mw.mmv.model.Image, mw.mmv.model.Repo, mw.mmv.model.FileUsage,
	 *     mw.mmv.model.FileUsage, mw.mmv.model.User>}
	 */
	MMVP.fetchSizeIndependentLightboxInfo = function ( fileTitle ) {
		var viewer = this,
			imageInfoPromise = this.imageInfoProvider.get( fileTitle ),
			repoInfoPromise = this.fileRepoInfoProvider.get( fileTitle ),
			imageUsagePromise = this.imageUsageProvider.get( fileTitle ),
			globalUsagePromise = this.globalUsageProvider.get( fileTitle ),
			userInfoPromise;

		userInfoPromise = $.when(
			imageInfoPromise, repoInfoPromise
		).then( function( imageInfo, repoInfoHash ) {
			if ( imageInfo.lastUploader ) {
				return viewer.userInfoProvider.get( imageInfo.lastUploader, repoInfoHash[imageInfo.repo] );
			} else {
				return null;
			}
		} );

		return $.when(
			imageInfoPromise, repoInfoPromise, imageUsagePromise, globalUsagePromise, userInfoPromise
		).then( function( imageInfo, repoInfoHash, imageUsage, globalUsage, userInfo ) {
			return $.Deferred().resolve( imageInfo, repoInfoHash[imageInfo.repo], imageUsage, globalUsage, userInfo );
		} );
	};

	/**
	 * Loads size-dependent components of a lightbox - the thumbnail model and the image itself.
	 * @param {mw.Title} fileTitle
	 * @param {number} width
	 * @returns {jQuery.Promise.<mw.mmv.model.Thumbnail, HTMLImageElement>}
	 */
	MMVP.fetchThumbnail = function ( fileTitle, width ) {
		var viewer = this,
			thumbnailPromise,
			imagePromise;

		thumbnailPromise = this.thumbnailInfoProvider.get( fileTitle, width );
		imagePromise = thumbnailPromise.then( function( thumbnail ) {
			return viewer.imageProvider.get( thumbnail.url );
		} );

		return $.when( thumbnailPromise, imagePromise );
	};

	MMVP.loadIndex = function ( index ) {
		var $thumbnails = $( imgsSelector ).eq( index );
		if ( index < this.lightbox.images.length && index >= 0 ) {
			this.loadImage( this.lightbox.images[index], $thumbnails.clone()[0] );
		}
	};

	MMVP.nextImage = function () {
		this.loadIndex( this.lightbox.currentIndex + 1 );
	};

	MMVP.prevImage = function () {
		this.loadIndex( this.lightbox.currentIndex - 1 );
	};

	MMVP.setupEventHandlers = function() {
		var viewer = this;

		this.lightbox.iface.$imageWrapper.on( 'mmv-next', function () {
			viewer.nextImage();
		} );

		this.lightbox.iface.$imageWrapper.on( 'mmv-prev', function () {
			viewer.prevImage();
		} );
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
				mw.mediaViewer.loadImage( statedIndex, $foundElement.clone()[0] );
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
}( mediaWiki, jQuery ) );
