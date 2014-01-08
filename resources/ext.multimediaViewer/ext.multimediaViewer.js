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
	 * Class that analyses the page, looks for image content and sets up the hooks
	 * to manage the viewing experience of such content.
	 *
	 * @constructor
	 */
	function MultimediaViewer() {
		/**
		 * MultiLightbox object used to display the pictures in the page.
		 * @property {mw.MultiLightbox}
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
		 * imageInfo object. TODO: Describe structure and valid states.
		 * @property {Object}
		 * @private
		 */
		this.imageInfo = {};

		// Traverse DOM, looking for potential thumbnails
		$thumbs.each( function ( i, thumb ) {
			var thisImage,
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
				$thumbContain = $thumbContain.find( '.image' );
			}

			$links.data( 'filePageLink', filePageLink );

			// Create a LightboxImage object for each legit image
			thisImage = viewer.createNewImage( $thumb.prop( 'src' ), filePageLink, fileTitle, index, thumb );

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

	/**
	 * Create an image object for the lightbox to use.
	 * @protected
	 * @param {string} fileLink Link to the file - generally a thumb URL
	 * @param {string} filePageLink Link to the File: page
	 * @param {mw.Title} fileTitle Represents the File: page
	 * @param {number} index Which number file this is
	 * @param {HTMLImageElement} thumb The thumbnail that represents this image on the page
	 * @returns {mw.LightboxImage}
	 */
	MMVP.createNewImage = function ( fileLink, filePageLink, fileTitle, index, thumb ) {
		var thisImage = new mw.LightboxImage( fileLink );
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
			density = $.devicePixelRatio(),
			targetWidth = density * ui.$imageWrapper.width(),
			targetHeight = density * ui.$imageWrapper.height();

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
	 * @VisibleForTesting
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

		this.fetchImageInfo( fileTitle, function ( imageInfo, repoInfo, targetWidth ) {
			viewer.loadResizedImage( ui, imageInfo, targetWidth );
		}, [ 'url' ] );
	};

	/**
	 * Replaces the resized image in the viewer providing we actually got some data.
	 *
	 * @protected
	 *
	 * @param {mw.LightboxInterface} ui lightbox that got resized
	 * @param {Object} data information regarding the new resized image
	 * @param {number} targetWidth
	 */
	MMVP.loadResizedImage = function ( ui, data, targetWidth ) {
		var imageInfo, innerInfo, rpid, viewer, image;

		// Replace image only if data was returned.
		if ( data && data.query && data.query.pages ) {
			viewer = this;
			image = new Image();

			$.each( data.query.pages, function ( i, page ) {
				imageInfo = page;
				return false;
			} );

			innerInfo = imageInfo.imageinfo[0];

			image.onload = function () {
				if ( image.width > targetWidth ) {
					image.width = targetWidth;
				}
				viewer.profileEnd( rpid );
				ui.replaceImageWith( image );
				this.updateControls();
			};

			rpid = this.profileStart( 'image-resize', {
				width: innerInfo.width,
				height: innerInfo.height,
				fileSize: innerInfo.size
			}, innerInfo.mime );

			image.src = innerInfo.thumburl || innerInfo.url;
		}
	};

	MMVP.updateControls = function () {
		var isOnButton = false,
			isOnImage = false,
			ui = this.ui,
			prevNextTop = ( ( ui.$imageWrapper.height() / 2 ) - 60 ) + 'px';

		function fadeIn() {
			isOnImage = true;
			ui.$closeButton.fadeIn( 100 );
			ui.$imageDiv.one( 'click', fadeOut );
		}

		function fadeOut() {
			ui.$closeButton.fadeOut( 100 );
			ui.$imageDiv.one( 'click', fadeIn );
		}

		function fadeOutDelayed() {
			isOnImage = false;
			setTimeout( function () {
				if ( !isOnImage && !isOnButton ) {
					fadeOut();
				}
			}, 500 );
		}

		function detectButton() {
			isOnButton = true;
		}

		function detectLeaveButton() {
			isOnButton = false;
			setTimeout( function () {
				if ( !isOnImage && !isOnButton ) {
					fadeOut();
				}
			}, 500 );
		}

		ui.$closeButton
			.fadeIn( 100 )
			.delay( 500 )
			.fadeOut( 100 );

		ui.$postDiv.css( 'top', ui.$imageWrapper.height() );

		ui.$imageDiv
			.off( 'mouseenter', fadeIn )
			.off( 'mouseleave', fadeOutDelayed )
			.one( 'click', fadeIn )
			.on( 'mouseenter', fadeIn )
			.on( 'mouseleave', fadeOutDelayed );

		ui.$closeButton.add( ui.$fullscreenButton )
			.off( 'mouseenter', detectButton )
			.off( 'mouseleave', detectLeaveButton )
			.on( 'mouseenter', detectButton )
			.on( 'mouseleave', detectLeaveButton );

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

	MMVP.fetchRepoInfo = function ( cb ) {
		var viewer = this;

		if ( this.repoInfo !== undefined ) {
			cb( this.repoInfo );
		} else {
			this.api.get( {
				action: 'query',
				format: 'json',
				meta: 'filerepoinfo'
			}, function ( data ) {
				if ( !data || !data.query ) {
					// Damn, failure. Do it gracefully-ish.
					cb( {} );
					return;
				}

				viewer.setRepoInfo( data.query.repos );
				cb( viewer.repoInfo );
			} );
		}
	};

	MMVP.setRepoInfo = function ( repos ) {
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

	MMVP.setImageInfo = function ( fileTitle, imageInfo ) {
		function whitelistHtml( $el ) {
			var child, $prev, $child = $el.children().first();

			while ( $child && $child.length ) {
				child = $child.get( 0 );

				if ( child.nodeType !== child.ELEMENT_NODE ) {
					return;
				}

				whitelistHtml( $child );

				if ( !$child.is( 'a' ) ) {
					$prev = $child.prev();
					$child.replaceWith( $child.contents() );
				} else {
					$prev = $child;
				}

				if ( $prev && $prev.length === 1 ) {
					$child = $prev.next();
				} else {
					$child = $el.children().first();
				}
			}
		}

		var extmeta, gfpid,
			repoInfo,
			desc,
			datetime, dtmsg,
			license, msgname,
			username,
			source, author,
			viewer = this,
			ui = this.lightbox.iface,
			innerInfo = imageInfo.imageinfo[0] || {};

		ui.$title.text( fileTitle.getNameText() );

		ui.$useFile.data( 'title', fileTitle );
		ui.$useFile.data( 'src', innerInfo.url );
		ui.$useFileLi.removeClass( 'empty' );

		if ( this.repoInfo ) {
			repoInfo = this.repoInfo[imageInfo.imagerepository];
		}

		if ( repoInfo ) {
			ui.setRepoDisplayName( repoInfo.displayname, repoInfo.local );
			ui.setFilePageLink( repoInfo, fileTitle );
		}

		ui.$repoLi.toggleClass( 'empty', !repoInfo );

		username = innerInfo.user;

		if ( username ) {
			gfpid = this.profileStart( 'gender-fetch' );

			// TODO: Reuse the api member, fix everywhere.
			// Fetch the gender from the uploader's home wiki
			// TODO this is ugly as hell, let's fix this in core.
			new mw.Api( {
				ajax: {
					url: repoInfo.apiurl || mw.util.wikiScript( 'api' )
				}
			} ).get( {
				action: 'query',
				list: 'users',
				ususers: username,
				usprop: 'gender'
			} ).done( function ( data ) {
				var gender = data.query.users[0].gender;

				viewer.profileEnd( gfpid );

				ui.setUserPageLink( repoInfo, username, gender );
			} ).fail( function () {
				mw.log( 'Gender fetch with ID ' + gfpid + ' failed, probably due to cross-domain API request.' );
				ui.setUserPageLink( repoInfo, username, 'unknown' );
			} );
		}

		extmeta = innerInfo.extmetadata;

		if ( extmeta ) {
			desc = extmeta.ImageDescription;

			ui.$imageDescDiv.toggleClass( 'empty', !desc );

			if ( desc ) {
				desc = desc.value;
				whitelistHtml( ui.$imageDesc.append( $.parseHTML( desc ) ) );
			} else {
				ui.$imageDesc.append( mw.message( 'multimediaviewer-desc-nil' ).text() );
			}

			datetime = extmeta.DateTimeOriginal || extmeta.DateTime;

			if ( datetime ) {
				// get rid of HTML tags
				datetime = datetime.value.replace( /<.*?>/g, '' );
				datetime = this.formatDate( datetime );

				dtmsg = (
					'multimediaviewer-datetime-' +
					( extmeta.DateTimeOriginal ? 'created' : 'uploaded' )
				);

				ui.$datetime.text(
					mw.message( dtmsg, datetime ).text()
				);
			}

			ui.$datetimeLi.toggleClass( 'empty', !datetime );

			source = extmeta.Credit;
			author = extmeta.Artist;

			if ( source ) {
				source = source.value;
				whitelistHtml( ui.$source.empty().append( $.parseHTML( source ) ) );
			}

			if ( author ) {
				author = author.value;
				whitelistHtml( ui.$author.empty().append( $.parseHTML( author ) ) );
			}

			if ( source && author ) {
				ui.$credit.html(
					mw.message(
						'multimediaviewer-credit',
						ui.$author.get( 0 ).outerHTML,
						ui.$source.get( 0 ).outerHTML
					).plain()
				);
			} else {
				// Clobber the contents and only have one of the fields
				if ( source ) {
					ui.$credit.html( ui.$source );
				} else if ( author ) {
					ui.$credit.html( ui.$author );
				}
			}

			ui.$credit.toggleClass( 'empty', !source && !author );

			license = extmeta.License;
		}

		if ( license ) {
			license = license.value;
		}

		msgname = 'multimediaviewer-license-' + ( license || '' );

		if ( !license || !mw.messages.exists( msgname ) ) {
			// Cannot display, fallback or fail
			license = 'default';
			msgname = 'multimediaviewer-license-default';
		} else {
			// License found, store the license data
			ui.$license.data( 'license', mw.message( msgname ).text() );
		}

		if ( license ) {
			ui.$license
				.text( mw.message( msgname ).text() )
				.toggleClass( 'cc-license', license.substr( 0, 2 ) === 'cc' );
		}

		ui.$license.toggleClass( 'empty', !license );
	};

	MMVP.loadImage = function ( image, initialSrc ) {
		var mdpid,
			viewer = this;

		this.lightbox.currentIndex = image.index;

		// Open with the already-loaded thumbnail
		// Avoids trying to load /wiki/Undefined and doesn't
		// cost any network time - the library currently needs
		// some src attribute to work. Will fix.
		image.src = initialSrc;
		this.currentImageFilename = image.filePageTitle.getPrefixedText();
		this.currentImageFileTitle = image.filePageTitle;
		this.lightbox.iface.comingFromPopstate = comingFromPopstate;
		this.lightbox.open();
		$( document.body ).addClass( 'mw-mlb-lightbox-open' );
		this.lightbox.iface.$imageDiv.append( $.createSpinner( {
			id: 'mw-mlb-loading-spinner',
			size: 'large'
		} ) );

		mdpid = this.profileStart( 'metadata-fetch' );

		this.fetchImageInfo( image.filePageTitle, function ( imageInfo, res, size ) {
			var pid,
				innerInfo = imageInfo.imageinfo[0],
				imageEle = new Image(),
				targetWidth = size;

			viewer.profileEnd( mdpid );
			viewer.setImageInfo( image.filePageTitle, imageInfo );

			if ( !viewer.hasAnimatedMetadata ) {
				viewer.animateMetadataDiv();
			}

			imageEle.onload = function () {
				if ( imageEle.width > targetWidth ) {
					imageEle.width = targetWidth;
				}

				viewer.profileEnd( pid );

				viewer.lightbox.iface.replaceImageWith( imageEle );
				viewer.lightbox.iface.$imageDiv.removeClass( 'empty' );
				viewer.updateControls();
				$.removeSpinner( 'mw-mlb-loading-spinner' );
			};

			imageEle.src = imageInfo.imageinfo[0].thumburl || imageInfo.imageinfo[0].url;

			pid = viewer.profileStart( 'image-load', {
				width: innerInfo.width,
				height: innerInfo.height,
				fileSize: innerInfo.size
			}, innerInfo.mime );
		} );

		comingFromPopstate = false;
	};

	MMVP.animateMetadataDiv = function () {
		$( document.body )
			.animate( {
				scrollTop: 40
			}, 400 )
			.animate( {
				scrollTop: 0
			}, 400 );

		this.hasAnimatedMetadata = true;
	};

	/**
	 * @method
	 * Fetches image information from the API.
	 * @param {mw.Title} fileTitle Title of the file page for the image.
	 * @param {Function} cb
	 * @param {Object} cb.imageInfo
	 * @param {Object} cb.repoInfo
	 * @param {number} cb.targetWidth Basically the screen size - what the image size should be
	 * @param {string[]} [props] List of properties to get from imageinfo
	 */
	MMVP.fetchImageInfo = function ( fileTitle, cb, props ) {
		function apiCallback( sitename ) {
			return function ( data ) {
				if ( !data || !data.query ) {
					// No information, oh well
					return;
				}

				viewer.setRepoInfo( data.query.repos );

				if ( data.query.pages ) {
					$.each( data.query.pages, function ( i, page ) {
						imageInfo = page;
						return false;
					} );

					if ( viewer.imageInfo[filename] === undefined ) {
						if ( sitename === null ) {
							viewer.imageInfo[filename] = imageInfo;
						} else {
							viewer.imageInfo[filename] = {};
						}

						viewer.imageInfo[filename].sites = {};

						if ( !viewer.imageInfo[filename].imageinfo ||
								viewer.imageInfo[filename].imageinfo.length === 0 ) {
							viewer.imageInfo[filename].imageinfo = [{}];
						}
					}

					viewer.imageInfo[filename].sites[sitename] = imageInfo;
				}

				if ( viewer.imageInfo[filename] ) {
					// Give back the information we have
					cb( viewer.imageInfo[filename], viewer.repoInfo, targetWidth );
				}
			};
		}

		function fetchImageInfoCallback() {
			var repoInfo;

			if ( viewer.repoInfo !== undefined ) {
				repoInfo = viewer.repoInfo;
			}

			if ( repoInfo === undefined ) {
				apiArgs.meta = 'filerepoinfo';
			}

			viewer.api.get( apiArgs ).done( apiCallback( null ) );
		}

		var imageInfo,
			filename = fileTitle.getPrefixedText(),
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

		props = props || iiprops;
		apiArgs.iiprop = props.join( '|' );
		apiArgs.iiurlwidth = requestedWidth;

		if ( this.imageInfo[filename] === undefined ) {
			// Fetch it in the same API query as the image info
			fetchImageInfoCallback();
		} else {
			this.fetchRepoInfo( function ( res ) {
				cb( viewer.imageInfo[filename], res, targetWidth );
			} );
		}
	};

	MMVP.loadIndex = function ( index ) {
		if ( index < this.lightbox.images.length && index >= 0 ) {
			this.loadImage( this.lightbox.images[index], $( imgsSelector ).eq( index ).prop( 'src' ) );
			this.resize( this.lightbox.iface );
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
		 * @param {object} [imgSize] Size of image (for image related events)
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
				version: '1.0',
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
		var statedIndex, linkState = hash.split( '/' );
		comingFromPopstate = true;
		if ( linkState[0] === '#mediaviewer' ) {
			statedIndex = mw.mediaViewer.lightbox.images[linkState[2]];
			if ( statedIndex.filePageTitle.getPrefixedText() === linkState[1] ) {
				mw.mediaViewer.loadImage( statedIndex, $( imgsSelector ).eq( linkState[2] ).prop( 'src' ) );
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
