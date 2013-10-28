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
	var MultiLightbox, LightboxImage, lightboxHooks,
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
		var $thumbs = $( '.thumbimage' ),
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
				var $this = $( this );

				if ( $this.is( 'a.image' ) ) {
					viewer.log( 'thumbnail-link-click' );
				} else if ( $this.is( '.magnify a' ) ) {
					viewer.log( 'enlarge-link-click' );
				}

				e.preventDefault();

				viewer.lightbox.currentIndex = index;

				// Open with a basic thumbnail and no information - fill in async
				viewer.lightbox.images[index].src = mw.config.get( 'wgScriptPath', '' ) + '/resources/jquery/images/spinner-large.gif';
				viewer.lightbox.open();

				viewer.fetchImageInfo( fileTitle, function ( imageInfo ) {
					var imageEle = new Image();

					imageEle.onload = function () {
						viewer.lightbox.iface.replaceImageWith( imageEle );

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
				filename = viewer.currentImageFilename,
				ui = this;

			api.get( {
				action: 'query',
				format: 'json',
				titles: filename,
				prop: 'imageinfo',
				iiprop: 'url',
				iiurlwidth: Math.floor( ratio * $( window ).width() * 1.1 ),
				iiurlheight: Math.floor( ratio * $( window ).height() * 1.1 )
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

		lightboxHooks.register( 'imageLoaded', function () {
			// Add link wrapper to the image div, put image inside it
			this.$imageLink = $( '<a>' )
			.addClass( 'mw-mlb-image-link' )
			.html( this.$image.detach() );

		this.$imageDiv.append( this.$imageLink );
		} );

		lightboxHooks.register( 'modifyInterface', function () {
			var ui = this;

			this.$imageDesc = $( '<p>' )
				.addClass( 'mw-mlb-image-desc' );

			this.$imageDescDiv = $( '<div>' )
				.addClass( 'mw-mlb-image-desc-div' )
				.html( this.$imageDesc );

			this.$imageLinks = $( '<ul>' )
				.addClass( 'mw-mlb-image-links' );

			this.$imageLinkDiv = $( '<div>' )
				.addClass( 'mw-mlb-image-links-div' )
				.html( this.$imageLinks );

			this.$imageMetadata = $( '<div>' )
				.addClass( 'mw-mlb-image-metadata' )
				.html( this.$imageDescDiv )
				.append( this.$imageLinkDiv );

			this.$postDiv.append( this.$imageMetadata );

			this.$repo = $( '<a>' )
				.addClass( 'mw-mlb-repo' )
				.prop( 'href', '#' );

			this.$repoLi = $( '<li>' )
				.addClass( 'mw-mlb-repo-li' )
				.addClass( 'empty' )
				.append( this.$repo );

			this.$imageLinks.append( this.$repoLi );

			this.$datetime = $( '<span>' )
				.addClass( 'mw-mlb-datetime' );

			this.$datetimeLi = $( '<li>' )
				.addClass( 'mw-mlb-datetime-li' )
				.addClass( 'empty' )
				.html( this.$datetime );

			this.$imageLinks.append( this.$datetimeLi );

			this.$username = $( '<a>' )
				.addClass( 'mw-mlb-username' )
				.prop( 'href', '#' );

			this.$usernameLi = $( '<li>' )
				.addClass( 'mw-mlb-username-li' )
				.addClass( 'empty' )
				.html( this.$username );

			this.$imageLinks.append( this.$usernameLi );

			this.$title = $( '<p>' )
				.addClass( 'mw-mlb-title' );

			this.$source = $( '<span>' )
				.addClass( 'mw-mlb-source' );

			this.$author = $( '<span>' )
				.addClass( 'mw-mlb-author' );

			this.$credit = $( '<p>' )
				.addClass( 'mw-mlb-credit' )
				.addClass( 'empty' )
				.html(
					mw.message(
						'multimediaviewer-credit',
						this.$author.get( 0 ).outerHTML,
						this.$source.get( 0 ).outerHTML
					).plain()
				);

			this.$titleDiv = $( '<div>' )
				.addClass( 'mw-mlb-title-contain' )
				.append(
					this.$title,
					this.$credit
				);

			this.$controlBar.append( this.$titleDiv );

			this.$closeButton.click( function () {
				viewer.log( 'close-link-click' );
			} );

			this.$fullscreenButton.click( function () {
				if ( ui.isFullScreen ) {
					viewer.log( 'fullscreen-link-click' );
				} else {
					viewer.log( 'defullscreen-link-click' );
				}
			} );
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
			this.$title.empty();

			viewer.currentImageFilename = null;
		} );
	}

	MultimediaViewer.prototype.fetchRepoInfo = function ( cb ) {
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

	MultimediaViewer.prototype.setRepoInfo = function ( repos ) {
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

	MultimediaViewer.prototype.setImageInfo = function ( fileTitle, imageInfo ) {
		function whitelistHtml( $ele ) {
			function test( $ele ) {
				return $ele.jquery && (
					$ele.is( 'a' ) ||
					false
				);
			}

			var $children,
				whitelisted = '';

			if ( $ele && $ele.jquery && $ele.contents ) {
				$children = $ele.contents();
			} else if ( $ele && $ele.textContent ) {
				return $ele.textContent;
			} else if ( $ele ) {
				return $ele;
			}

			if ( !$children || $children.length === 0 ) {
				return $ele.text();
			}

			$children.each( function ( i, ele ) {
				var $ele = $( ele );

				if ( test( $ele ) === true ) {
					whitelisted += $ele.html( whitelistHtml( $ele ) ).get( 0 ).outerHTML;
				} else {
					whitelisted += '<span>' + whitelistHtml( $ele ) + '</span>';
				}
			} );

			return whitelisted;
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
			repoInfo, articlePath,
			desc,
			datetime, dtmsg,
			username,
			source, author,
			ui = this.lightbox.iface,
			innerInfo = imageInfo.imageinfo[0] || {};

		ui.$title.text( fileTitle.getNameText() );

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

			ui.$repo
				.prop( 'href', articlePath.replace( '$1', fileTitle.getPrefixedText() ) );
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

			if ( desc ) {
				desc = desc.value;
				ui.$imageDesc.html(
					whitelistHtml( $( desc ) )
				);
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
				ui.$source.html( source );
			}

			if ( author ) {
				author = author.value;
				ui.$author.html( author );
			}

			ui.$author.html(
				whitelistHtml( ui.$author )
			);

			ui.$source.html(
				whitelistHtml( ui.$source )
			);

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
		}
	};

	MultimediaViewer.prototype.fetchImageInfo = function ( fileTitle, cb ) {
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
			apiArgs = {
				action: 'query',
				format: 'json',
				titles: filename,
				prop: 'imageinfo',
				iiprop: iiprops.join( '|' ),
				iiurlwidth: Math.floor( ratio * $( window ).width() * 1.1 ),
				iiurlheight: Math.floor( ratio * $( window ).height() * 1.1 ),
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

	MultimediaViewer.prototype.log = function ( action ) {
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
}( mediaWiki, jQuery ) );
