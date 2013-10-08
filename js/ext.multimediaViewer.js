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
			'metadata'
		];

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

			$links.data( 'filePageLink', filePageLink );
			urls.push( new LightboxImage( fileLink ) );
			urls[index].filePageLink = filePageLink;

			$links.click( function ( e ) {
				e.preventDefault();

				viewer.lightbox.currentIndex = index;

				viewer.fetchImageInfo( fileTitle, function ( imageInfo ) {
					var $title, title;

					viewer.lightbox.images[index].src = imageInfo.imageinfo[0].url;
					viewer.lightbox.open();

					$title = $( '.mw-mlb-file-title' );

					title = new mw.Title( imageInfo.title );

					if ( $title.length === 0 ) {
						$( '.mlb-controls' ).append(
							$( '<span>' )
								.addClass( 'mw-mlb-file-title' )
								.text( title.getNameText() )
						);
					} else {
						$title.text( title.getNameText() );
					}
				} );

				return false;
			} );
		} );

		if ( $thumbs.length > 0 ) {
			this.lightbox = new MultiLightbox( urls );
		}

		lightboxHooks.register( 'imageLoaded', function () {
			// Add link wrapper to the image div, put image inside it
			this.$imageLink = $( '<a>' )
				.addClass( 'mw-mlb-image-link' )
				.html( this.$image.detach() );

			this.$imageDiv.append( this.$imageLink );
		} );

		lightboxHooks.register( 'modifyInterface', function () {
			this.$imageDesc = $( '<p>' ).addClass( 'mw-mlb-image-desc' );
			this.$imageDescDiv = $( '<div>' )
				.addClass( 'mw-mlb-image-desc-div' )
				.html( this.$imageLinks );

			this.$imageLinks = $( '<ul>' ).addClass( 'mw-mlb-image-links' );
			this.$imageLinkDiv = $( '<div>' )
				.addClass( 'mw-mlb-image-links-div' )
				.html( this.$imageLinks );

			this.$imageMetadata = $( '<div>' )
				.addClass( 'mw-mlb-image-metadata' )
				.html( this.$imageDescDiv )
				.append( this.$imageLinkDiv );

			this.$wrapper.append( this.$imageMetadata );
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

	MultimediaViewer.prototype.fetchImageInfo = function ( fileTitle, cb ) {
		function apiCallback( sitename ) {
			return function ( data ) {
				var ii, iikeys, i;

				if ( !data || !data.query ) {
					// No information, oh well
					return;
				}

				viewer.setRepoInfo( data.query.repos );

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

				ii = imageInfo.imageinfo[0];
				iikeys = Object.keys( ii );
				for ( i = 0; i < iikeys.length; i++ ) {
					viewer.imageInfo[filename].imageinfo[0][iikeys[i]] = ii[iikeys[i]];
				}

				if ( imageInfo.title ) {
					viewer.imageInfo[filename].title = imageInfo.title;
				}

				if ( imageInfo.pageid ) {
					viewer.imageInfo[filename].pageid = imageInfo.pageid;
				}

				// Give back the information we have
				cb( viewer.imageInfo[filename], viewer.repoInfo );
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

			viewer.api.get( apiArgs ).done( apiCallback( '' ) );
		}

		var imageInfo,
			filename = fileTitle.getPrefixedText(),
			apiArgs = {
				action: 'query',
				format: 'json',
				titles: filename,
				prop: 'imageinfo',
				iiprop: iiprops.join( '|' )
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

	$( function () {
		MultiLightbox = window.MultiLightbox;
		LightboxImage = window.LightboxImage;
		lightboxHooks = window.lightboxHooks;

		var viewer = new MultimediaViewer();
		mw.mediaViewer = viewer;
	} );

	mw.MultimediaViewer = MultimediaViewer;
}( mediaWiki, jQuery ) );
