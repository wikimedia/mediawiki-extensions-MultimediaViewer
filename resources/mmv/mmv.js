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
		 * @type {mw.mmv.ThumbnailWidthCalculator}
		 * @private
		 */
		this.thumbnailWidthCalculator = new mw.mmv.ThumbnailWidthCalculator();

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
				initial = $thumbContain.find( 'img' ).prop( 'src' );

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

		if ( fileTitle ) {
			imageWidths = ui.getImageSizeApiArgs();
			this.fetchImageInfoWithThumbnail( fileTitle, imageWidths.real ).then( function( imageInfo ) {
				viewer.loadAndSetImage( ui, imageInfo, imageWidths );
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
	 * Loads and sets the image specified in the imageData. It also updates the controls
	 * and collects profiling information.
	 *
	 * @param {mw.LightboxInterface} ui image container
	 * @param {mw.mmv.model.Image} imageInfo image information
	 * @param {mw.mmv.model.ThumbnailWidth} imageWidths
	 */
	MMVP.loadAndSetImage = function ( ui, imageInfo, imageWidths ) {
		var maybeThumb,
			viewer = this,
			image = new Image(),
			imageWidth,
			src;

		// Use cached image if we have it.
		maybeThumb = imageInfo.getThumbUrl( imageWidths.real );
		if ( maybeThumb ) {
			src = maybeThumb;
			imageWidth = imageWidths.real;
		} else {
			src = imageInfo.url;
			imageWidth = imageInfo.width;
		}

		this.performance.record( 'image', src ).then( function() {
			image.src = src;

			// we downscale larger images but do not scale up smaller ones, that would look ugly
			if ( imageWidth > imageWidths.screen ) {
				image.width = imageWidths.css;
			}

			ui.replaceImageWith( image );
			viewer.updateControls();
		} );
	};

	/**
	 * @method
	 * Loads a specified image.
	 * @param {mw.LightboxImage} image
	 * @param {string} initialSrc The string to set the src attribute to at first.
	 */
	MMVP.loadImage = function ( image, initialSrc ) {
		var imageWidths,
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

		imageWidths = this.ui.getImageSizeApiArgs();
		this.fetchImageInfoRepoInfoAndFileUsageInfo(
			image.filePageTitle, imageWidths.real
		).then( function ( imageInfo, repoInfoHash, thumbnail, localUsage, globalUsage ) {
			var repoInfo = repoInfoHash[imageInfo.repo];

			viewer.stopListeningToScroll();
			viewer.animateMetadataDivOnce()
				// We need to wait until the animation is finished before we listen to scroll
				.then( function() { viewer.startListeningToScroll(); } );

			viewer.loadAndSetImage( viewer.lightbox.iface, imageInfo, imageWidths );

			viewer.lightbox.iface.$imageDiv.removeClass( 'empty' );

			if ( imageInfo.lastUploader ) {
				viewer.userInfoProvider.get( imageInfo.lastUploader, repoInfo ).done( function ( gender ) {
					viewer.lightbox.iface.panel.setImageInfo(
						image, imageInfo, repoInfo, localUsage, globalUsage, gender );
				} ).fail( function () {
					viewer.lightbox.iface.panel.setImageInfo(
						image, imageInfo, repoInfo, localUsage, globalUsage, 'unknown' );
				} );
			} else {
				viewer.lightbox.iface.panel.setImageInfo(
					image, imageInfo, repoInfo, localUsage, globalUsage );
			}
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
		this.ui.panel.$dragIcon.toggleClass( 'pointing-down', !!$.scrollTo().scrollTop() );
	};

	/**
	 * @method
	 * Fetches image and thumbnail information from the API.
	 *
	 * @param {mw.Title} fileTitle
	 * @param {number} width width of the thumbnail in pixels
	 * @return {jQuery.Promise.<mw.mmv.model.Image, mw.mmv.model.Thumbnail>}
	 */
	MMVP.fetchImageInfoWithThumbnail = function ( fileTitle, width ) {
		return $.when(
			this.imageInfoProvider.get( fileTitle ),
			this.thumbnailInfoProvider.get( fileTitle, width )
		).then( function( imageInfo, thumbnail ) {
			imageInfo.addThumbUrl( thumbnail.width, thumbnail.url );
			return $.Deferred().resolve( imageInfo, thumbnail );
		} );
	};

	/**
	 * Gets all file-related info.
	 * @param {mw.Title} fileTitle Title of the file page for the image.
	 * @param {number} width width of the thumbnail in pixels
	 * @returns {jQuery.Promise.<mw.mmv.model.Image, mw.mmv.model.Repo, mw.mmv.model.Thumbnail,
	 *     mw.mmv.model.FileUsage, mw.mmv.model.FileUsage>}
	 */
	MMVP.fetchImageInfoRepoInfoAndFileUsageInfo = function ( fileTitle, width ) {
		return $.when(
			this.imageInfoProvider.get( fileTitle ),
			this.fileRepoInfoProvider.get( fileTitle ),
			this.thumbnailInfoProvider.get( fileTitle, width ),
			this.imageUsageProvider.get( fileTitle ),
			this.globalUsageProvider.get( fileTitle )
		).then( function( imageInfo, repoInfoHash, thumbnail, imageUsage, globalUsage ) {
			imageInfo.addThumbUrl( thumbnail.width, thumbnail.url );
			return $.Deferred().resolve( imageInfo, repoInfoHash, thumbnail, imageUsage, globalUsage );
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
}( mediaWiki, jQuery ) );
