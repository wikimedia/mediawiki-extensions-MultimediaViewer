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
	var MMVP,
		comingFromHashChange = false;

	/**
	 * Analyses the page, looks for image content and sets up the hooks
	 * to manage the viewing experience of such content.
	 * @class mw.mmv.MultimediaViewer
	 * @constructor
	 */
	function MultimediaViewer() {
		/**
		 * @property {mw.mmv.provider.Image}
		 * @private
		 */
		this.imageProvider = new mw.mmv.provider.Image();

		/**
		 * @property {mw.mmv.provider.ImageInfo}
		 * @private
		 */
		this.imageInfoProvider = new mw.mmv.provider.ImageInfo( new mw.mmv.Api( 'imageinfo' ),
			// Short-circuit, don't fallback, to save some tiny amount of time
			{ language: mw.config.get( 'wgUserLanguage', false ) || mw.config.get( 'wgContentLanguage', 'en' ) }
		);

		/**
		 * @property {mw.mmv.provider.FileRepoInfo}
		 * @private
		 */
		this.fileRepoInfoProvider = new mw.mmv.provider.FileRepoInfo( new mw.mmv.Api( 'filerepoinfo' ) );

		/**
		 * @property {mw.mmv.provider.ThumbnailInfo}
		 * @private
		 */
		this.thumbnailInfoProvider = new mw.mmv.provider.ThumbnailInfo( new mw.mmv.Api( 'thumbnailinfo' ) );

		/**
		 * @property {mw.mmv.provider.UserInfo}
		 * @private
		 */
		this.userInfoProvider = new mw.mmv.provider.UserInfo( new mw.mmv.Api( 'userinfo' ) );

		/**
		 * @property {mw.mmv.provider.ImageUsage}
		 * @private
		 */
		this.imageUsageProvider = new mw.mmv.provider.ImageUsage( new mw.mmv.Api( 'imageusage' ) );

		/**
		 * @property {mw.mmv.provider.GlobalUsage}
		 * @private
		 */
		this.globalUsageProvider = new mw.mmv.provider.GlobalUsage( new mw.mmv.Api( 'globalusage' ),
			{ doNotUseApi: !mw.config.get( 'wgMultimediaViewer' ).globalUsageAvailable }
		);
		// replace with this one to test global usage on a local wiki without going through all the
		// hassle required for installing the extension:
		//this.globalUsageProvider = new mw.mmv.provider.GlobalUsage(
		//	new mw.mmv.Api( {ajax: { url: 'http://commons.wikimedia.org/w/api.php', dataType: 'jsonp' } } )
		//);

		/**
		 * Image index on page.
		 * @type {number}
		 */
		this.currentIndex = 0;

		/**
		 * UI object used to display the pictures in the page.
		 * @property {mw.mmv.LightboxInterface}
		 * @private
		 */
		this.ui = new mw.mmv.LightboxInterface();
	}

	MMVP = MultimediaViewer.prototype;

	/**
	 * Initialize the lightbox interface given an array of thumbnail
	 * objects.
	 * @param {Object[]} thumbs Complex structure...TODO, document this better.
	 */
	MMVP.initWithThumbs = function ( thumbs ) {
		var i, thumb;

		this.thumbs = thumbs;

		for ( i = 0; i < this.thumbs.length; i++ ) {
			thumb = this.thumbs[ i ];
			// Create a LightboxImage object for each legit image
			thumb.image = this.createNewImage(
				thumb.$thumb.prop( 'src' ),
				thumb.link,
				thumb.title,
				i,
				thumb.thumb,
				thumb.caption
			);
		}
	};

	/**
	 * Create an image object for the lightbox to use.
	 * @protected
	 * @param {string} fileLink Link to the file - generally a thumb URL
	 * @param {string} filePageLink Link to the File: page
	 * @param {mw.Title} fileTitle Represents the File: page
	 * @param {number} index Which number file this is
	 * @param {HTMLImageElement} thumb The thumbnail that represents this image on the page
	 * @param {string} [caption] The caption, if any.
	 * @returns {mw.mmv.LightboxImage}
	 */
	MMVP.createNewImage = function ( fileLink, filePageLink, fileTitle, index, thumb, caption ) {
		var thisImage = new mw.mmv.LightboxImage( fileLink, filePageLink, fileTitle, index, thumb, caption );
		thisImage.filePageLink = filePageLink;
		thisImage.filePageTitle = fileTitle;
		thisImage.index = index;
		thisImage.thumbnail = thumb;

		return thisImage;
	};

	/**
	 * Handles resize events in viewer.
	 * @protected
	 * @param {mw.mmv.LightboxInterface} ui lightbox that got resized
	 */
	MMVP.resize = function ( ui ) {
		var viewer = this,
			fileTitle = this.currentImageFileTitle,
			imageWidths;

		this.preloadThumbnails();

		if ( fileTitle ) {
			imageWidths = ui.canvas.getCurrentImageWidths();
			this.fetchThumbnail(
				fileTitle, imageWidths.real
			).then( function( thumbnail, image ) {
				viewer.setImage( ui, thumbnail, image, imageWidths );
			}, function ( error ) {
				viewer.ui.canvas.showError( error );
			} );
		}

		this.updateControls();
	};

	/**
	 * Updates positioning of controls, usually after a resize event.
	 */
	MMVP.updateControls = function () {
		var numImages = this.thumbs ? this.thumbs.length : 0,
			showNextButton = this.currentIndex < (numImages - 1),
			showPreviousButton = this.currentIndex > 0;

		this.ui.updateControls( showNextButton, showPreviousButton );
	};

	/**
	 * Loads and sets the specified image. It also updates the controls.
	 * @param {mw.mmv.LightboxInterface} ui image container
	 * @param {mw.mmv.model.Thumbnail} thumbnail thumbnail information
	 * @param {HTMLImageElement} image
	 * @param {mw.mmv.model.ThumbnailWidth} imageWidths
	 */
	MMVP.setImage = function ( ui, thumbnail, image, imageWidths ) {
		ui.canvas.setImageAndMaxDimensions( thumbnail, image, imageWidths );
		this.updateControls();
	};

	/**
	 * Loads a specified image.
	 * @param {mw.mmv.LightboxImage} image
	 * @param {HTMLImageElement} initialImage A thumbnail to use as placeholder while the image loads
	 */
	MMVP.loadImage = function ( image, initialImage ) {
		var imageWidths,
			viewer = this,
			imagePromise,
			metadataPromise,
			start,
			$initialImage = $( initialImage );

		this.currentIndex = image.index;

		this.currentImageFilename = image.filePageTitle.getPrefixedText();
		this.currentImageFileTitle = image.filePageTitle;

		if ( !this.isOpen ) {
			this.ui.open();
			this.isOpen = true;
		} else {
			this.ui.empty();
		}
		this.setHash();

		// At this point we can't show the thumbnail because we don't
		// know what size it should be. We still assign it to allow for
		// size calculations in getCurrentImageWidths, which needs to know
		// the aspect ratio
		$initialImage.hide();
		this.ui.canvas.set( image, $initialImage );

		this.preloadImagesMetadata();
		this.preloadThumbnails();
		this.preloadFullscreenThumbnail( image );

		$( document.body ).addClass( 'mw-mlb-lightbox-open' );

		imageWidths = this.ui.canvas.getCurrentImageWidths();

		this.resetBlurredThumbnailStates();

		start = $.now();

		// Reset the progress bar, it could be at any state if we're calling loadImage
		// while another image is already loading
		viewer.ui.panel.percent( 0 );

		imagePromise = this.fetchThumbnail( image.filePageTitle, imageWidths.real );

		// Check that the image hasn't already been loaded
		if ( imagePromise.state() === 'pending' ) {
			// Animate it to 5 to give a sense to something is happening, even if we're stuck
			// waiting for server-side processing, such as thumbnail (re)generation
			viewer.ui.panel.percent( 5 );
		}

		imagePromise.progress( function ( thumbnailInfoResponse, imageResponse ) {
			if ( viewer.currentIndex !== image.index ) {
				return;
			}

			if ( viewer.ui
				&& viewer.ui.panel
				&& imageResponse.length === 2
				&& imageResponse[ 1 ] > 5 ) {
				viewer.ui.panel.percent( imageResponse[ 1 ] );
			}
		} ).done( function ( thumbnail, imageElement ) {
			if ( viewer.currentIndex !== image.index ) {
				return;
			}

			viewer.displayRealThumbnail( thumbnail, imageElement, imageWidths, $.now() - start );
		} ).fail( function ( error ) {
			viewer.ui.canvas.showError( error );
		} );

		this.imageInfoProvider.get( image.filePageTitle ).done( function ( imageInfo ) {
			if ( viewer.currentIndex !== image.index ) {
				return;
			}

			viewer.displayPlaceholderThumbnail( imageInfo, $initialImage, imageWidths );
		} );

		metadataPromise = this.fetchSizeIndependentLightboxInfo(
			image.filePageTitle
		).done( function ( imageInfo, repoInfo, localUsage, globalUsage, userInfo ) {
			if ( viewer.currentIndex !== image.index ) {
				return;
			}

			viewer.ui.panel.setImageInfo( image, imageInfo, repoInfo, localUsage, globalUsage, userInfo );
		} ).fail( function ( error ) {
			if ( viewer.currentIndex !== image.index ) {
				return;
			}

			viewer.ui.panel.showError( error );
		} );

		$.when( imagePromise, metadataPromise ).then( function() {
			if ( viewer.currentIndex !== image.index ) {
				return;
			}

			viewer.ui.panel.animateMetadataOnce();
		} );

		this.comingFromHashChange = false;
	};

	/**
	 * Loads an image by its title
	 * @param {string} title
	 * @param {boolean} updateHash Viewer should update the location hash when true
	 */
	MMVP.loadImageByTitle = function ( title, updateHash ) {
		var viewer = this;

		if ( !this.thumbs || !this.thumbs.length ) {
			return;
		}

		this.comingFromHashChange = !updateHash;

		$.each( this.thumbs, function ( idx, thumb ) {
			if ( thumb.title.getPrefixedText() === title ) {
				viewer.loadImage( thumb.image, thumb.$thumb.clone()[ 0 ], true );
				return false;
			}
		} );
	};

	/**
	 * Resets the cross-request states needed to handle the blurred thumbnail logic
	 */
	MMVP.resetBlurredThumbnailStates = function () {
		this.realThumbnailShown = false;
		this.blurredThumbnailShown = false;
	};

	/**
	 * Display the real, full-resolution, thumbnail that was fetched with fetchThumbnail
	 * @param {mw.mmv.model.Thumbnail} thumbnail
	 * @param {HTMLImageElement} image
	 * @param {mw.mmv.model.ThumbnailWidth} imageWidths
	 * @param {number} loadTime Time it took to load the thumbnail
	 */
	MMVP.displayRealThumbnail = function ( thumbnail, image, imageWidths, loadTime ) {
		this.realThumbnailShown = true;

		this.setImage( this.ui, thumbnail, image, imageWidths );

		// We only animate unblur if the image wasn't loaded from the cache
		// A load in < 10ms is considered to be a browser cache hit
		// And of course we only unblur if there was a blur to begin with
		if ( this.blurredThumbnailShown && loadTime > 10 ) {
			this.ui.canvas.unblur();
		}

		mw.mmv.logger.log( 'image-view' );
	};

	/**
	 * Display the blurred thumbnail from the page
	 * @param {mw.mmv.model.Image} imageInfo
	 * @param {jQuery} $initialImage The thumbnail from the page
	 * @param {mw.mmv.model.ThumbnailWidth} imageWidths
	 */
	MMVP.displayPlaceholderThumbnail = function ( imageInfo, $initialImage, imageWidths ) {
		// If the actual image has already been displayed, there's no point showing the blurry one
		if ( this.realThumbnailShown ) {
			return;
		}

		this.blurredThumbnailShown = this.ui.canvas.maybeDisplayPlaceholder(
			imageInfo, $initialImage, imageWidths );
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
	 * @property {mw.mmv.model.TaskQueue}
	 */
	MMVP.metadataPreloadQueue = null;

	/**
	 * Stores image thumbnail preloads, so they can be cancelled.
	 * @property {mw.mmv.model.TaskQueue}
	 */
	MMVP.thumbnailPreloadQueue = null;

	/**
	 * Orders lightboximage indexes for preloading. Works similar to $.each, except it only takes
	 * the callback argument. Calls the callback with each lightboximage index in some sequence
	 * that is ideal for preloading.
	 * @private
	 * @param {function(number, mw.mmv.LightboxImage)} callback
	 */
	MMVP.eachPrealoadableLightboxIndex = function( callback ) {
		for ( var i = 0; i <= this.preloadDistance; i++ ) {
			if ( this.currentIndex + i < this.thumbs.length ) {
				callback(
					this.currentIndex + i,
					this.thumbs[ this.currentIndex + i ].image
				);
			}
			if ( i && this.currentIndex - i >= 0 ) { // skip duplicate for i==0
				callback(
					this.currentIndex - i,
					this.thumbs[ this.currentIndex - i ].image
				);
			}
		}
	};

	/**
	 * A helper function to fill up the preload queues.
	 * taskFactory(lightboxImage) should return a preload task for the given lightboximage.
	 * @private
	 * @param {function(mw.mmv.LightboxImage): function()} taskFactory
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
		var viewer = this;

		this.cancelThumbnailsPreloading();

		this.thumbnailPreloadQueue = this.pushLightboxImagesIntoQueue( function( lightboxImage ) {
			return function() {
				return viewer.fetchThumbnail(
					lightboxImage.filePageTitle,
					viewer.ui.canvas.getLightboxImageWidths( lightboxImage ).real
				);
			};
		} );

		this.thumbnailPreloadQueue.execute();
	};

	/**
	 * Preload the fullscreen size of the current image.
	 */
	MMVP.preloadFullscreenThumbnail = function( image ) {
		this.fetchThumbnail(
			image.filePageTitle,
			this.ui.canvas.getLightboxImageWidthsForFullscreen( image ).real
		);
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

	/**
	 * Loads an image at a specified index in the viewer's thumbnail array.
	 * @param {number} index
	 */
	MMVP.loadIndex = function ( index ) {
		var thumb;

		if ( index < this.thumbs.length && index >= 0 ) {
			thumb = this.thumbs[ index ];
			this.loadImage( thumb.image, thumb.$thumb.clone()[0] );
		}
	};

	/**
	 * Opens the next image
	 */
	MMVP.nextImage = function () {
		this.loadIndex( this.currentIndex + 1 );
	};

	/**
	 * Opens the previous image
	 */
	MMVP.prevImage = function () {
		this.loadIndex( this.currentIndex - 1 );
	};

	/**
	 * Handles close event coming from the lightbox
	 */
	MMVP.close = function () {
		$( document.body ).removeClass( 'mw-mlb-lightbox-open' );
		if ( comingFromHashChange === false ) {
			$( document ).trigger( $.Event( 'mmv.hash', { hash : '#' } ) );
		} else {
			comingFromHashChange = false;
		}

		this.isOpen = false;
	};

	/**
	 * Handles a hash change coming from the browser
	 */
	MMVP.hash = function () {
		var hash = decodeURIComponent( window.location.hash ),
			linkState = hash.split( '/' );

		if ( linkState[0] === '#mediaviewer' ) {
			this.loadImageByTitle( linkState[ 1 ] );
		} else if ( this.isOpen ) {
			// This allows us to avoid the mmv.hash event that normally happens on close
			comingFromHashChange = true;

			if ( this.ui ) {
				// FIXME triggers mmv-close event, which calls viewer.close()
				this.ui.unattach();
			} else {
				this.close();
			}
		}
	};

	MMVP.setHash = function() {
		if ( !this.comingFromHashChange ) {
			var hashFragment = '#mediaviewer/' + this.currentImageFilename;
			$( document ).trigger( $.Event( 'mmv.hash', { hash : hashFragment } ) );
		}
	};

	/**
	 * Registers all event handlers
	 */
	MMVP.setupEventHandlers = function () {
		var viewer = this;

		$( document ).on( 'mmv-close.mmvp', function () {
			viewer.close();
		} ).on( 'mmv-next.mmvp', function () {
			viewer.nextImage();
		} ).on( 'mmv-prev.mmvp', function () {
			viewer.prevImage();
		} ).on( 'mmv-resize.mmvp', function () {
			viewer.resize( viewer.ui );
		} ).on( 'mmv-request-thumbnail.mmvp', function ( e, size ) {
			if ( viewer.currentImageFileTitle ) {
				return viewer.thumbnailInfoProvider.get( viewer.currentImageFileTitle, size );
			} else {
				return $.Deferred().reject();
			}
		} );
	};

	/**
	* Unregisters all event handlers. Currently only used in tests.
	*/
	 MMVP.cleanupEventHandlers = function () {
		$( document ).off( 'mmv-close.mmvp mmv-next.mmvp mmv-prev.mmvp mmv-resize.mmvp' );
	};

	mw.mmv.MultimediaViewer = MultimediaViewer;
}( mediaWiki, jQuery ) );
