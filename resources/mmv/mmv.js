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

		iiprops = [
			'timestamp',
			'user',
			'userid',
			'comment',
			'url',
			'size',
			'sha1',
			'mime',
			'mediatype',
			'metadata',
			'extmetadata'
		],

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
		 * imageInfo object, used for caching - promises will resolve with
		 * an mw.mmv.model.Image object, a repoInfo object, the best width for
		 * the current screen configuration, and the width requested from
		 * the server (if any).
		 * @property {jQuery.Promise[]}
		 * @private
		 */
		this.imageInfo = {};

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
		this.lightbox = new MultiLightbox( urls, 0, mw.LightboxInterface );

		// Register various event hooks. TODO: Make this a function that's only called once.

		lightboxHooks.register( 'closeInterface', function () {
			this.$nextButton.add( this.$prevButton ).css( 'top', '-999px' );
			$( document.body ).removeClass( 'mw-mlb-lightbox-open' );
			if ( comingFromPopstate === false ) {
				history.pushState( {}, '', '#' );
			} else {
				comingFromPopstate = false;
			}

			viewer.hasAnimatedMetadata = false;
		} );

		lightboxHooks.register( 'imageResize', function () {
			var ui = this;
			viewer.resize( ui );
			return false;
		} );

		lightboxHooks.register( 'fullscreen', function () {
			if ( this.$imageMetadata ) {
				this.$imageMetadata.hide();
			}
		} );

		lightboxHooks.register( 'defullscreen', function () {
			if ( this.$imageMetadata ) {
				this.$imageMetadata.show();
			}
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
			requested: requestedWidth,
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

		this.fetchImageInfo( fileTitle, [ 'url' ] ).done( function ( imageData, repoInfo, targetWidth, requestedWidth ) {
			viewer.loadResizedImage( ui, imageData, targetWidth, requestedWidth );
		} );
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
		var rpid, viewer, image, maybeThumb;

		// Replace image only if data was returned.
		if ( imageData ) {
			viewer = this;
			image = new Image();

			image.onload = function () {
				viewer.profileEnd( rpid );
			};

			rpid = this.profileStart( 'image-resize', {
				width: imageData.width,
				height: imageData.height,
				fileSize: imageData.size
			}, imageData.mimeType );

			maybeThumb = imageData.getThumbUrl( requestedWidth );
			image.src = maybeThumb || imageData.url;
			if ( maybeThumb && requestedWidth > targetWidth || !maybeThumb && imageData.width > targetWidth ) {
				image.width = targetWidth;
			}
			ui.replaceImageWith( image );
			this.updateControls();
		}
	};

	MMVP.updateControls = function () {
		var ui = this.ui,
			prevNextTop = ( ( ui.$imageWrapper.height() / 2 ) - 60 ) + 'px';

		ui.$postDiv.css( 'top', ui.$imageWrapper.height() );

		ui.$nextButton.add( ui.$prevButton ).css( {
			top: prevNextTop
		} );

		ui.$nextButton.toggleClass( 'disabled', this.lightbox.currentIndex >= ( this.lightbox.images.length - 1 ) );
		ui.$prevButton.toggleClass( 'disabled', this.lightbox.currentIndex <= 0 );
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
			if ( viewer.ui.isFullScreen ) {
				viewer.log( 'fullscreen-link-click' );
			} else {
				viewer.log( 'defullscreen-link-click' );
			}
		} );
	};

	MMVP.cacheRepoInfo = function ( repos ) {
		var i, repo;

		repos = repos || [];

		if ( this.repoInfo === undefined ) {
			this.repoInfo = {};
		}

		for ( i = 0; i < repos.length; i++ ) {
			repo = repos[i];
			this.repoInfo[repo.name] = repo;
		}
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
	 */
	MMVP.setImageInfo = function ( image, imageData, repoData ) {
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

			// TODO: Reuse the api member, fix everywhere.
			// Fetch the gender from the uploader's home wiki
			// TODO this is ugly as hell, let's fix this in core.
			new mw.Api( {
				ajax: {
					url: repoData.apiUrl || mw.util.wikiScript( 'api' ),
					dataType: 'jsonp'
				}
			} ).get( {
				action: 'query',
				list: 'users',
				ususers: imageData.lastUploader,
				usprop: 'gender'
			} ).done( function ( data ) {
				var gender = 'unknown';

				viewer.profileEnd( gfpid );

				if ( data && data.query && data.query.users &&
						data.query.users[0] && data.query.users[0].gender ) {
					gender = data.query.users[0].gender;
				}

				ui.setUserPageLink( repoData, imageData.lastUploader, gender );
			} ).fail( function () {
				mw.log( 'Gender fetch with ID ' + gfpid + ' failed, probably due to cross-domain API request.' );
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
		this.lightbox.open();
		$( document.body ).addClass( 'mw-mlb-lightbox-open' );

		mdpid = this.profileStart( 'metadata-fetch' );

		this.fetchImageInfo( image.filePageTitle ).done( function ( imageData, repoInfo, size, requestedWidth ) {
			var pid,
				repoData = mw.mmv.model.Repo.newFromRepoInfo( repoInfo[imageData.repo] ),
				imageEle = new Image(),
				targetWidth = size;

			viewer.animateMetadataDivOnce();

			imageEle.onload = function () {
				if ( imageEle.width > targetWidth ) {
					imageEle.width = targetWidth;
				}

				viewer.profileEnd( pid );
				viewer.updateControls();
			};

			viewer.profileEnd( mdpid );

			pid = viewer.profileStart( 'image-load', {
				width: imageData.width,
				height: imageData.height,
				fileSize: imageData.size
			}, imageData.mimeType );

			imageEle.src = imageData.getThumbUrl( requestedWidth ) || imageData.url;

			viewer.lightbox.iface.$imageDiv.removeClass( 'empty' );
			viewer.lightbox.iface.replaceImageWith( imageEle );
			viewer.setImageInfo( image, imageData, repoData );
		} );

		comingFromPopstate = false;
	};

	MMVP.animateMetadataDivOnce = function () {
		if ( !this.hasAnimatedMetadata ) {
			$.scrollTo( 40, 400, { onAfter: function() { $.scrollTo( 0, 400 ); } } );

			this.hasAnimatedMetadata = true;
		}
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
	 * @param {string[]} [props] List of properties to get from imageinfo
	 * @returns {jQuery.Promise}
	 */
	MMVP.fetchImageInfo = function ( fileTitle, props ) {
		var filename = fileTitle.getPrefixedText(),
			apiArgs = {
				action: 'query',
				format: 'json',
				titles: filename,
				prop: 'imageinfo',
				// Short-circuit, don't fallback, to save some tiny amount of time
				iiextmetadatalanguage: mw.config.get( 'wgUserLanguage', false ) || mw.config.get( 'wgContentLanguage', 'en' )
			},
			viewer = this,

			widths = this.getImageSizeApiArgs( this.ui ),
			targetWidth = widths.target,
			requestedWidth = widths.requested;

		function handleApiData( data ) {
			var imageInfo, imageData;

			if ( !data || !data.query ) {
				// No information, oh well
				return $.Deferred().reject();
			}

			viewer.cacheRepoInfo( data.query.repos );
			imageInfo = viewer.getFirst( data.query.pages );

			if ( imageInfo ) {
				imageData = mw.mmv.model.Image.newFromImageInfo( fileTitle, imageInfo );

				// Give back the information we have
				return $.Deferred().resolve( imageData, viewer.repoInfo, targetWidth, requestedWidth );
			} else {
				return $.Deferred().reject();
			}
		}

		function makeImageInfoRequest( args ) {
			if ( viewer.repoInfo === undefined ) {
				args.meta = 'filerepoinfo';
			}

			return viewer.api.get( args ).then( handleApiData );
		}

		props = props || iiprops;
		apiArgs.iiprop = props.join( '|' );
		apiArgs.iiurlwidth = requestedWidth;

		if ( this.imageInfo[filename] === undefined ) {
			// Fetch all image info in the same API query, save a request later
			apiArgs.iiprop = iiprops.join( '|' );
			this.imageInfo[filename] = makeImageInfoRequest( apiArgs );
			return this.imageInfo[filename];
		} else if ( props.indexOf( 'url' ) === -1 ) {
			// Just return the cached promise, because we don't need to
			// fetch this information again.
			return this.imageInfo[filename];
		} else {
			// Fetch the new thumb url but nothing else, because it's
			// the only non-cacheable thing
			apiArgs.iiprop = 'url';
			return this.imageInfo[filename].then( function ( imageData, repoInfo ) {
				var maybeThumb = imageData.getThumbUrl( requestedWidth );

				// Thumbnail caching! Woo!
				if ( maybeThumb ) {
					return $.Deferred().resolve( imageData, repoInfo, targetWidth, requestedWidth );
				}

				return viewer.api.get( apiArgs ).then( function ( data ) {
					var imageInfo, innerInfo;

					imageInfo = viewer.getFirst( data.query.pages );
					innerInfo = viewer.getFirst( imageInfo.imageinfo );

					if ( innerInfo.thumburl ) {
						imageData.addThumbUrl( innerInfo.thumbwidth, innerInfo.thumburl );
					}

					return $.Deferred().resolve( imageData, repoInfo, targetWidth, requestedWidth );
				} );
			} );
		}
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

	function handleHash( hash ) {
		var statedIndex, $foundElement, linkState = hash.split( '/' );
		comingFromPopstate = true;
		if ( linkState[0] === '#mediaviewer' ) {
			statedIndex = mw.mediaViewer.lightbox.images[linkState[2]];
			if ( statedIndex.filePageTitle.getPrefixedText() === linkState[1] ) {
				$foundElement = $( imgsSelector ).eq( linkState[2] );
				mw.mediaViewer.loadImage( statedIndex, $foundElement.prop( 'src' ) );
			}
		} else {
			if ( mw.mediaViewer.lightbox ) {
				mw.mediaViewer.lightbox.iface.unattach();
			}
		}
	}

	$( function () {
		MultiLightbox = window.MultiLightbox;
		lightboxHooks = window.lightboxHooks;

		var viewer = new MultimediaViewer();

		mw.mediaViewer = viewer;

		handleHash( document.location.hash );
		window.addEventListener( 'popstate', function () { handleHash( document.location.hash ); } );
	} );

	mw.MultimediaViewer = MultimediaViewer;
}( mediaWiki, jQuery, moment ) );
