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
	var MultiLightbox, LightboxImage, lightboxHooks, MMVP,
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
			'close-link-click': 'User clicked on the lightbox close button.'
		};

	function MultimediaViewer() {
		var $thumbs = $( '.gallery .image img, a.image img' ),
			urls = [],
			viewer = this;

		this.api = new mw.Api();
		this.imageInfo = {};

		$thumbs.each( function ( i, thumb ) {
			var fileLink,
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

			$links.data( 'filePageLink', filePageLink );
			urls.push( new LightboxImage( fileLink ) );
			urls[index].filePageLink = filePageLink;

			$links.click( function ( e ) {
				// Do not interfere with non-left clicks or if modifier keys are pressed.
				if ( e.which !== 1 || e.altKey || e.ctrlKey || e.shiftKey || e.metaKey ) {
					return;
				}

				var $this = $( this );

				if ( $this.is( 'a.image' ) ) {
					viewer.log( 'thumbnail-link-click' );
				} else if ( $this.is( '.magnify a' ) ) {
					viewer.log( 'enlarge-link-click' );
				}

				e.preventDefault();

				viewer.lightbox.currentIndex = index;

				if ( $thumbContain.length === 0 ) {
					// This isn't a thumbnail! Just use the link.
					$thumbContain = $link;
				} else if ( $thumbContain.is( '.thumb' ) ) {
					$thumbContain = $thumbContain.find( '.image' );
				}

				// Open with the already-loaded thumbnail
				// Avoids trying to load /wiki/Undefined and doesn't
				// cost any network time - the library currently needs
				// some src attribute to work. Will fix.
				viewer.lightbox.images[index].src = $thumbContain.find( 'img' ).prop( 'src' );
				viewer.lightbox.open();
				viewer.lightbox.iface.$imageDiv.append( $.createSpinner( {
					id: 'mw-mlb-loading-spinner',
					size: 'large'
				} ) );

				viewer.fetchImageInfo( fileTitle, function ( imageInfo ) {
					var imageEle = new Image();

					imageEle.onload = function () {
						viewer.lightbox.iface.replaceImageWith( imageEle );
						viewer.lightbox.iface.$imageDiv.removeClass( 'empty' );
						$.removeSpinner( 'mw-mlb-loading-spinner' );
						viewer.setImageInfo( fileTitle, imageInfo );
					};

					imageEle.src = imageInfo.imageinfo[0].thumburl || imageInfo.imageinfo[0].url;
				} );

				return false;
			} );
		} );

		if ( $thumbs.length > 0 ) {
			this.lightbox = new MultiLightbox( urls );
		}

		lightboxHooks.register( 'imageResize', function () {
			var api = new mw.Api(),
				ratio = this.isFullScreen ? 0.9 : 0.5,
				density = $.devicePixelRatio(),
				filename = viewer.currentImageFilename,
				ui = this;

			api.get( {
				action: 'query',
				format: 'json',
				titles: filename,
				prop: 'imageinfo',
				iiprop: 'url',
				iiurlwidth: Math.floor( density * ratio * $( window ).width() * 1.1 ),
				iiurlheight: Math.floor( density * ratio * $( window ).height() * 1.1 )
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
				};

				image.src = innerInfo.thumburl || innerInfo.url;
			} );

			return false;
		} );

		lightboxHooks.register( 'modifyInterface', function () {
			var ui = this;
			viewer.initializeInterface( ui );
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

			this.$license.empty().addClass( 'empty' );

			viewer.currentImageFilename = null;

			this.$useFile.data( 'title', null );
			this.$useFile.data( 'link', null );
			this.$useFile.data( 'src', null );

			this.$useFileLi.addClass( 'empty' );

			this.$imageDiv.addClass( 'empty' );
		} );
	}

	MMVP = MultimediaViewer.prototype;

	MMVP.initializeInterface = function ( ui ) {
		this.ui = ui;

		this.initializeHeader();
		this.initializeImage();
		this.initializeImageMetadata();
		this.initializeAboutLinks();

		this.registerLogging();
	};

	MMVP.initializeImage = function () {
		this.ui.$imageDiv
			.addClass( 'empty' );
	};

	MMVP.initializeImageDesc = function () {
		this.ui.$imageDesc = $( '<p>' )
			.addClass( 'mw-mlb-image-desc' );

		this.ui.$imageDescDiv = $( '<div>' )
			.addClass( 'mw-mlb-image-desc-div' )
			.addClass( 'empty' )
			.append( this.ui.$imageDesc );

		this.ui.$imageMetadata.append( this.ui.$imageDescDiv );
	};

	MMVP.initializeImageLinks = function () {
		this.ui.$imageLinks = $( '<ul>' )
			.addClass( 'mw-mlb-image-links' );

		this.ui.$imageLinkDiv = $( '<div>' )
			.addClass( 'mw-mlb-image-links-div' )
			.append( this.ui.$imageLinks );

		this.ui.$imageMetadata.append( this.ui.$imageLinkDiv );

		this.initializeRepoLink();
		this.initializeDatetime();
		this.initializeUploader();
		this.initializeFileUsage();
	};

	MMVP.initializeImageMetadata = function () {
		this.ui.$imageMetadata = $( '<div>' )
			.addClass( 'mw-mlb-image-metadata' );

		this.ui.$postDiv.append( this.ui.$imageMetadata );

		this.initializeImageDesc();
		this.initializeImageLinks();
	};

	MMVP.initializeAboutLinks = function () {
		this.ui.$mmvAboutLink = $( '<a>' )
			.prop( 'href', mw.config.get( 'wgMultimediaViewer' ).infoLink )
			.text( mw.message( 'multimediaviewer-about-mmv' ).text() )
			.addClass( 'mw-mlb-mmv-about-link' );

		this.ui.$mmvDiscussLink = $( '<a>' )
			.prop( 'href', mw.config.get( 'wgMultimediaViewer' ).discussionLink )
			.text( mw.message( 'multimediaviewer-discuss-mmv' ).text() )
			.addClass( 'mw-mlb-mmv-discuss-link' );

		this.ui.$mmvAboutLinks = $( '<div>' )
			.addClass( 'mw-mlb-mmv-about-links' )
			.append(
				this.ui.$mmvAboutLink,
				' | ',
				this.ui.$mmvDiscussLink
			);

		this.ui.$imageMetadata.append( this.ui.$mmvAboutLinks );
	};

	MMVP.initializeRepoLink = function () {
		this.ui.$repo = $( '<a>' )
			.addClass( 'mw-mlb-repo' )
			.prop( 'href', '#' );

		this.ui.$repoLi = $( '<li>' )
			.addClass( 'mw-mlb-repo-li' )
			.addClass( 'empty' )
			.append( this.ui.$repo );

		this.ui.$imageLinks.append( this.ui.$repoLi );
	};

	MMVP.initializeDatetime = function () {
		this.ui.$datetime = $( '<span>' )
			.addClass( 'mw-mlb-datetime' );

		this.ui.$datetimeLi = $( '<li>' )
			.addClass( 'mw-mlb-datetime-li' )
			.addClass( 'empty' )
			.append( this.ui.$datetime );

		this.ui.$imageLinks.append( this.ui.$datetimeLi );
	};

	MMVP.initializeUploader = function () {
		this.ui.$username = $( '<a>' )
			.addClass( 'mw-mlb-username' )
			.prop( 'href', '#' );

		this.ui.$usernameLi = $( '<li>' )
			.addClass( 'mw-mlb-username-li' )
			.addClass( 'empty' )
			.append( this.ui.$username );

		this.ui.$imageLinks.append( this.ui.$usernameLi );
	};

	MMVP.initializeFileUsage = function () {
		var viewer = this;

		this.ui.$useFile = $( '<a>' )
			.addClass( 'mw-mlb-usefile' )
			.prop( 'href', '#' )
			.text( mw.message( 'multimediaviewer-use-file' ).text() )
			.click( function () {
				function selectAllOnEvent() {
					var $this = $( this );

					if ( $this.is( 'label' ) ) {
						$this = $this.parent().find( '#' + $this.prop( 'for' ) );
					}

					$this.selectAll();

					return false;
				}

				var $this = $( this ),

					fileTitle = $this.data( 'title' ),

					filename = fileTitle.getPrefixedText(),
					desc = fileTitle.getNameText(),

					src = $this.data( 'src' ),
					link = $this.data( 'link' ) || src,

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
						.click( selectAllOnEvent )
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
						.click( selectAllOnEvent )
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
						.click( selectAllOnEvent )
						.val( '<a href="' + link + '"><img src="' + src + '" /></a>' ),

					$offWiki = $( '<div>' )
						.append(
							$owLabel,
							$owField
						);

				viewer.ui.$dialog = $( '<div>' )
					.addClass( 'mw-mlb-use-file-dialog' )
					.append(
						$onWikiThumb,
						$onWikiNormal,
						$offWiki
					)
					.dialog( {
						width: 750
					} );

				$owtField.click();

				return false;
			} );

		this.ui.$useFileLi = $( '<li>' )
			.addClass( 'mw-mlb-usefile-li' )
			.addClass( 'empty' )
			.append( this.ui.$useFile );

		this.ui.$imageLinks.append( this.ui.$useFileLi );
	};

	MMVP.initializeHeader = function () {
		this.ui.$titleDiv = $( '<div>' )
			.addClass( 'mw-mlb-title-contain' );

		this.ui.$controlBar.append( this.ui.$titleDiv );

		this.initializeTitleAndCredit();
		this.initializeLicense();
	};

	MMVP.initializeTitleAndCredit = function () {
		this.ui.$titleAndCredit = $( '<div>' )
			.addClass( 'mw-mlb-title-credit' );

		this.ui.$titleDiv.append( this.ui.$titleAndCredit );

		this.initializeTitle();
		this.initializeCredit();
	};

	MMVP.initializeTitle = function () {
		this.ui.$title = $( '<p>' )
			.addClass( 'mw-mlb-title' );

		this.ui.$titleAndCredit.append( this.ui.$title );
	};

	MMVP.initializeCredit = function () {
		this.ui.$source = $( '<span>' )
			.addClass( 'mw-mlb-source' );

		this.ui.$author = $( '<span>' )
			.addClass( 'mw-mlb-author' );

		this.ui.$credit = $( '<p>' )
			.addClass( 'mw-mlb-credit' )
			.addClass( 'empty' )
			.html(
				mw.message(
					'multimediaviewer-credit',
					this.ui.$author.get( 0 ).outerHTML,
					this.ui.$source.get( 0 ).outerHTML
				).plain()
			);

		this.ui.$titleAndCredit.append( this.ui.$credit );
	};

	MMVP.initializeLicense = function () {
		this.ui.$license = $( '<a>' )
			.addClass( 'mw-mlb-license' )
			.addClass( 'empty' )
			.prop( 'href', '#' );

		this.ui.$licensePara = $( '<p>' )
			.addClass( 'mw-mlb-license-contain' )
			.append( this.ui.$license );

		this.ui.$titleDiv.append( this.ui.$licensePara );
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

			ui.$usernameLi.toggleClass( 'empty', !Boolean( username ) );
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

		ui.$repoLi.toggleClass( 'empty', !Boolean( repoInfo ) );

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
				// try to use built in date formatting
				if ( new Date( datetime ) ) {
					datetime = ( new Date( datetime ) ).toLocaleDateString();
				}

				dtmsg = (
					'multimediaviewer-datetime-' +
					( extmeta.DateTimeOriginal ? 'created' : 'uploaded' )
				);

				ui.$datetime.text(
					mw.message( dtmsg, datetime ).text()
				);
			}

			ui.$datetimeLi.toggleClass( 'empty', !Boolean( datetime ) );

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

			ui.$credit.toggleClass( 'empty', !Boolean( source ) && !Boolean( author ) );

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

					viewer.currentImageFilename = filename;

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
			ratio = this.lightbox.iface.isFullScreen ? 0.9 : 0.5,
			density = $.devicePixelRatio(),
			apiArgs = {
				action: 'query',
				format: 'json',
				titles: filename,
				prop: 'imageinfo',
				iiprop: iiprops.join( '|' ),
				iiurlwidth: Math.floor( density * ratio * $( window ).width() * 1.1 ),
				iiurlheight: Math.floor( density * ratio * $( window ).height() * 1.1 ),
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

	$( function () {
		MultiLightbox = window.MultiLightbox;
		LightboxImage = window.LightboxImage;
		lightboxHooks = window.lightboxHooks;

		var viewer = new MultimediaViewer();
		mw.mediaViewer = viewer;
	} );

	mw.MultimediaViewer = MultimediaViewer;

	// Quick hack to select all text in a text box
	$.fn.selectAll = function () {
		return this.each( function () {
			var range,
				start = 0,
				end = this.value.length;

			if ( this.setSelectionRange ) {
				this.setSelectionRange( start, end );
			} else if ( this.createTextRange ) {
				range = this.createTextRange();
				range.collapse( true );
				range.moveEnd( 'character', end );
				range.moveStart( 'character', start );
				range.select();
			}
		} );
	};
}( mediaWiki, jQuery ) );
