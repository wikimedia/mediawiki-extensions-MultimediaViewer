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
			'site-link-click': 'User clicked on the link to the file description page.'
		};

	function MultimediaViewer() {
		var $thumbs = $( '.gallery .image img, a.image img' ),
			urls = [],
			viewer = this;

		this.api = new mw.Api();
		this.imageInfo = {};

		$thumbs.each( function ( i, thumb ) {
			var fileLink, thisImage,
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

			thisImage = new mw.LightboxImage( fileLink );
			thisImage.filePageLink = filePageLink;
			thisImage.filePageTitle = fileTitle;
			thisImage.index = index;

			urls.push( thisImage );

			$links.click( function ( e ) {
				// Do not interfere with non-left clicks or if modifier keys are pressed.
				if ( e.which !== 1 || e.altKey || e.ctrlKey || e.shiftKey || e.metaKey ) {
					return;
				}

				var $this = $( this ),
					initial = $thumbContain.find( 'img' ).prop( 'src' );

				if ( $this.is( 'a.image' ) ) {
					viewer.log( 'thumbnail-link-click' );
				} else if ( $this.is( '.magnify a' ) ) {
					viewer.log( 'enlarge-link-click' );
				}

				e.preventDefault();

				viewer.loadImage( thisImage, initial );

				return false;
			} );
		} );

		if ( $thumbs.length > 0 ) {
			this.lightbox = new MultiLightbox( urls );
		}

		lightboxHooks.register( 'closeInterface', function () {
			this.$mwControls.css( { top: '-999px', left: '-999px' } );
			this.$nextButton.add( this.$prevButton ).css( 'top', '-999px' );
			$( document.body ).removeClass( 'mw-mlb-lightbox-open' );
			if ( comingFromPopstate === false ) {
				history.pushState( {}, '', '#' );
			} else {
				comingFromPopstate = false;
			}
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

		lightboxHooks.register( 'clearInterface', function () {
			this.$license.empty().addClass( 'empty' );

			this.$imageDesc.empty();
			this.$imageDescDiv.addClass( 'empty' );
			this.$title.empty();
			this.$credit.empty().addClass( 'empty' );

			this.$username.empty();
			this.$usernameLi.addClass( 'empty' );

			this.$repo.empty();
			this.$repoLi.addClass( 'empty' );

			this.$datetime.empty();
			this.$datetimeLi.addClass( 'empty' );

			this.$useFile.data( 'title', null );
			this.$useFile.data( 'link', null );
			this.$useFile.data( 'src', null );

			this.$useFileLi.addClass( 'empty' );

			this.$imageDiv.addClass( 'empty' );
		} );
	}

	MMVP = MultimediaViewer.prototype;

	MMVP.resize = function ( ui ) {
		var api = new mw.Api(),
			viewer = this,
			density = $.devicePixelRatio(),
			filename = ui.currentImageFilename;

		api.get( {
			action: 'query',
			format: 'json',
			titles: filename,
			prop: 'imageinfo',
			iiprop: 'url',
			iiurlwidth: Math.floor( density * ui.$imageWrapper.width() ),
			iiurlheight: Math.floor( density * ui.$imageWrapper.height() )
		} ).done( function ( data ) {
			var imageInfo, innerInfo,
				image = new Image();

			$.each( data.query.pages, function ( i, page ) {
				imageInfo = page;
				return false;
			} );

			innerInfo = imageInfo.imageinfo[0];

			image.onload = function () {
				ui.replaceImageWith( image );
				viewer.updateControls();
			};

			image.src = innerInfo.thumburl || innerInfo.url;
		} );
	};

	MMVP.updateControls = function () {
		var isOnButton = false,
			isOnImage = false,
			ui = this.ui,
			pos = ui.$image.offset(),
			prevNextTop = ( ( ui.$imageWrapper.height() / 2 ) - 32 ) + 'px';

		function fadeIn() {
			isOnImage = true;
			ui.$mwControls.fadeIn( 100 );
			ui.$image.one( 'click', fadeOut );
		}

		function fadeOut() {
			ui.$mwControls.fadeOut( 100 );
			ui.$image.one( 'click', fadeIn );
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

		pos.top = ( ui.$imageWrapper.height() - ui.$image.height() ) / 2;
		pos.left += ui.$image.width() - ui.$closeButton.width();

		pos.top += 'px';
		pos.left += 'px';

		ui.$mwControls
			.css( pos )
			.appendTo( ui.$main )
			.fadeIn( 100 )
			.delay( 500 )
			.fadeOut( 100 );

		ui.$postDiv.css( 'top', ui.$imageWrapper.height() );

		ui.$image
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

		function setUserpageLink( username, gender ) {
			var userpage = 'User:' + username,
				userTitle = mw.Title.newFromText( userpage );

			ui.$username
				.text(
					mw.message( 'multimediaviewer-userpage-link', username, gender ).text()
				)
				.prop( 'href', userTitle.getUrl() );

			if ( articlePath ) {
				ui.$username
					.prop( 'href', articlePath.replace( '$1', userTitle.getPrefixedText() ) );
			}

			ui.$usernameLi.toggleClass( 'empty', !username );
		}

		var extmeta,
			repoInfo, articlePath, linkToRepo,
			desc,
			datetime, dtmsg,
			license, msgname,
			username,
			source, author,
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
			if ( repoInfo.displayname ) {
				ui.$repo.text(
					mw.message( 'multimediaviewer-repository', repoInfo.displayname ).text()
				);
			} else {
				ui.$repo.text(
					mw.message( 'multimediaviewer-repository', mw.config.get( 'wgSiteName' ) ).text()
				);
			}

			if ( repoInfo.server && repoInfo.articlepath ) {
				articlePath = repoInfo.server + repoInfo.articlepath;
			} else {
				articlePath = mw.config.get( 'wgArticlePath' );
			}

			linkToRepo = articlePath.replace( '$1', fileTitle.getPrefixedText() );

			if ( repoInfo.local ) {
				linkToRepo = mw.config.get( 'wgServer' ) + linkToRepo;
			}

			ui.$repo.prop( 'href', linkToRepo );
			ui.$useFile.data( 'link', linkToRepo );
		}

		ui.$repoLi.toggleClass( 'empty', !repoInfo );

		username = innerInfo.user;

		if ( username ) {
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
				setUserpageLink( username, gender );
			} ).fail( function () {
				setUserpageLink( username, 'unknown' );
			} );
		}

		extmeta = innerInfo.extmetadata;

		if ( extmeta ) {
			desc = extmeta.ImageDescription;

			ui.$imageDescDiv.toggleClass( 'empty', !desc );

			if ( desc ) {
				desc = desc.value;
				whitelistHtml( ui.$imageDesc.append( $.parseHTML( desc ) ) );
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
		}

		if ( license ) {
			articlePath = articlePath || mw.config.get( 'wgArticlePath', '' );
			ui.$license
				.text( mw.message( msgname ).text() )
				.prop( 'href', articlePath.replace( '$1', fileTitle.getPrefixedText() ) )
				.toggleClass( 'cc-license', license.substr( 0, 2 ) === 'cc' );
		}

		ui.$license.toggleClass( 'empty', !license );
	};

	MMVP.loadImage = function ( image, initialSrc ) {
		var viewer = this;

		this.lightbox.currentIndex = image.index;

		// Open with the already-loaded thumbnail
		// Avoids trying to load /wiki/Undefined and doesn't
		// cost any network time - the library currently needs
		// some src attribute to work. Will fix.
		image.src = initialSrc;
		this.currentImageFilename = image.filePageTitle.getPrefixedText();
		this.lightbox.iface.comingFromPopstate = comingFromPopstate;
		this.lightbox.open();
		$( document.body ).addClass( 'mw-mlb-lightbox-open' );
		this.lightbox.iface.$imageDiv.append( $.createSpinner( {
			id: 'mw-mlb-loading-spinner',
			size: 'large'
		} ) );

		this.fetchImageInfo( image.filePageTitle, function ( imageInfo ) {
			var imageEle = new Image();

			imageEle.onload = function () {
				viewer.lightbox.iface.replaceImageWith( imageEle );
				viewer.lightbox.iface.$imageDiv.removeClass( 'empty' );
				viewer.updateControls();
				$.removeSpinner( 'mw-mlb-loading-spinner' );
				viewer.setImageInfo( image.filePageTitle, imageInfo );
			};

			imageEle.src = imageInfo.imageinfo[0].thumburl || imageInfo.imageinfo[0].url;
		} );

		comingFromPopstate = false;
	};

	MMVP.fetchImageInfo = function ( fileTitle, cb ) {
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
					cb( viewer.imageInfo[filename], viewer.repoInfo );
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
			density = $.devicePixelRatio(),
			apiArgs = {
				action: 'query',
				format: 'json',
				titles: filename,
				prop: 'imageinfo',
				iiprop: iiprops.join( '|' ),
				iiurlwidth: Math.floor( density * this.lightbox.iface.$imageWrapper.width() ),
				iiurlheight: Math.floor( density * this.lightbox.iface.$imageWrapper.height() ),
				// Short-circuit, don't fallback, to save some tiny amount of time
				iiextmetadatalanguage: mw.config.get( 'wgUserLanguage', false ) || mw.config.get( 'wgContentLanguage', 'en' )
			},
			viewer = this;

		if ( this.imageInfo[filename] === undefined ) {
			// Fetch it in the same API query as the image info
			fetchImageInfoCallback();
		} else {
			this.fetchRepoInfo( function ( res ) {
				cb( viewer.imageInfo[filename], res );
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
				version: '1.0',
				action: action,
				userId: mw.user.getId(),
				editCount: mw.config.get( 'wgUserEditCount', 0 )
			} );
		}
	};

	/**
	 * Transforms a date string into localized, human-readable format.
	 * Unrecognized strings are returned unchanged.
	 * @param {string} dateString
	 * @return {string}
	 */
	MultimediaViewer.prototype.formatDate = function ( dateString ) {
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
			mw.mediaViewer.lightbox.iface.unattach();
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
