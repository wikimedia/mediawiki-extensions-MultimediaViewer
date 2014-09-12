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
	var MMVB;

	/**
	 * Bootstrap code listening to thumb clicks checking the initial location.hash
	 * Loads the mmv and opens it if necessary
	 * @class mw.mmv.MultimediaViewerBootstrap
	 */
	function MultimediaViewerBootstrap () {
		this.validExtensions = {
			'jpg' : true,
			'jpeg' : true,
			'gif' : true,
			'svg' : true,
			'png' : true,
			'tiff' : true,
			'tif' : true
		};

		// Exposed for tests
		this.readinessCSSClass = 'mw-mmv-has-been-loaded';
		this.readinessWaitDuration = 100;
		this.hoverWaitDuration = 200;

		// TODO lazy-load config and htmlUtils

		/** @property {mw.mmv.Config} config - */
		this.config = new mw.mmv.Config(
			mw.config.get( 'wgMultimediaViewer', {} ),
			mw.config,
			mw.user,
			new mw.Api(),
			window.localStorage
		);

		/** @property {mw.mmv.HtmlUtils} htmlUtils - */
		this.htmlUtils = new mw.mmv.HtmlUtils();

		/**
		 * This flag is set to true when we were unable to load the viewer.
		 * @property {boolean}
		 */
		this.viewerIsBroken = false;

		this.thumbsReadyDeferred = $.Deferred();
		this.thumbs = [];

		this.$thumbs = $( '.gallery .image img, a.image img, #file a img' );
		this.processThumbs();

		this.browserHistory = window.history;
	}

	MMVB = MultimediaViewerBootstrap.prototype;

	/**
	 * Loads the mmv module asynchronously and passes the thumb data to it
	 * @returns {jQuery.Promise}
	 */
	MMVB.loadViewer = function () {
		var deferred = $.Deferred(),
			bs = this;

		// Don't load if someone has specifically stopped us from doing so
		if ( mw.config.get( 'wgMediaViewer' ) !== true ) {
			return deferred.reject();
		}

		bs.setupOverlay();

		mw.loader.using( 'mmv', function() {
			bs.isCSSReady( deferred );
		}, function ( error ) {
			deferred.reject( error.message );
		} );

		return deferred.done( function ( viewer ) {
			if ( !bs.viewerInitialized ) {
				if ( bs.thumbs.length ) {
					viewer.initWithThumbs( bs.thumbs );
				}

				bs.viewerInitialized = true;
			}
		} ).fail( function( message ) {
			mw.log.warn( message );
			bs.cleanupOverlay();
			bs.viewerIsBroken = true;
			mw.notify( 'Error loading MediaViewer: ' + message );
		} );
	};

	/**
	 * Checks if the mmv CSS has been correctly added to the page
	 * This is a workaround for core bug 61852
	 * @param {jQuery.Promise.<mw.mmv.MultimediaViewer>} deferred
	 */
	MMVB.isCSSReady = function ( deferred ) {
		var $dummy = $( '<div class="' + this.readinessCSSClass + '">' )
			.appendTo( $( document.body ) ),
			bs = this,
			viewer,
			message;

		if ( $dummy.css( 'display' ) === 'inline' ) {
			// Let's be clean and remove the test item before resolving the deferred
			$dummy.remove();
			try {
				viewer = bs.getViewer();
			} catch ( e ) {
				message = e.message;
				if ( e.stack ) {
					message += '\n' + e.stack;
				}
				deferred.reject( message );
				return;
			}
			deferred.resolve( viewer );
		} else {
			$dummy.remove();
			setTimeout( function () { bs.isCSSReady( deferred ); }, this.readinessWaitDuration );
		}
	};

	/**
	 * Processes all thumbs found on the page
	 */
	MMVB.processThumbs = function () {
		var bs = this;

		// if this breaks in IE8, see https://github.com/ebryn/backburner.js/pull/50
		// but it probably won't since there is a catch further up the chain
		try {
			this.$thumbs.each( function ( i, thumb ) {
				bs.processThumb( thumb );
			} );
		} finally {
			this.thumbsReadyDeferred.resolve();
			// now that we have set up our real click handler we can we can remove the temporary
			// handler added in mmv.head.js which just replays clicks to the real handler
			$( document ).off( 'click.mmv-head' );
		}
	};

	/**
	 * Check if this thumbnail should be handled by MediaViewer
	 * @param {jQuery} $thumb the thumbnail (an `<img>` element) in question
	 * @return {boolean}
	 */
	MMVB.isAllowedThumb = function ( $thumb ) {
		// .metadata means this is inside an informational template like {{refimprove}} on enwiki.
		// .noviewer means MediaViewer has been specifically disabled for this image
		// .noarticletext means we are on an error page for a non-existing article, the image is part of some
		//  template // FIXME this should be handled by .metadata
		return $thumb.closest( '.metadata, .noviewer, .noarticletext' ).length === 0;

	};

	/**
	 * Processes a thumb
	 * @param {Object} thumb
	 */
	MMVB.processThumb = function ( thumb ) {
		var bs = this,
			alwaysOpen = false,
			$thumb = $( thumb ),
			$link = $thumb.closest( 'a.image' ),
			$thumbContain = $link.closest( '.thumb' ),
			$enlarge = $thumbContain.find( '.magnify a' ),
			title = mw.Title.newFromImg( $thumb ),
			link = $link.prop( 'href' );

		if ( !bs.validExtensions[ title.getExtension().toLowerCase() ] ) {
			return;
		}

		if ( !bs.isAllowedThumb( $thumb ) ) {
			return;
		}

		if ( $thumbContain.length !== 0 && $thumbContain.is( '.thumb' ) ) {
			// If this is a thumb, we preload JS/CSS when the mouse cursor hovers the thumb container (thumb image + caption + border)
			$thumbContain.mouseenter( function() {
				// There is no point preloading if clicking the thumb won't open Media Viewer
				if ( !bs.config.isMediaViewerEnabledOnClick() ) {
					return;
				}
				bs.preloadOnHoverTimer = setTimeout( function() {
					mw.loader.load( 'mmv' );
				}, bs.hoverWaitDuration );
			} ).mouseleave( function() {
				if ( bs.preloadOnHoverTimer ) {
					clearTimeout( bs.preloadOnHoverTimer );
				}
			} );
		}

		if ( $thumb.closest( '#file' ).length > 0 ) {
			// This is a file page. Make adjustments.
			link = $thumb.closest( 'a' ).prop( 'href' );

			$( '<p>' )
				.append(
					$link = $( '<a>' )
						// It won't matter because we catch the click event anyway, but
						// give the user some URL to see.
						.prop( 'href', $thumb.closest( 'a' ).prop( 'href' ) )
						.addClass( 'mw-mmv-view-expanded' )
						.text( mw.message( 'multimediaviewer-view-expanded' ).text() )
				)
				.appendTo( $( '.fullMedia' ) );

			// Ignore the preference, open anyway
			alwaysOpen = true;
		}

		// This is the data that will be passed onto the mmv
		this.thumbs.push( {
			thumb : thumb,
			$thumb : $thumb,
			title : title,
			link : link,
			caption : this.findCaption( $thumbContain, $link ) } );

		$link.add( $enlarge ).click( function ( e ) {
			return bs.click( this, e, title, alwaysOpen );
		} );
	};

	/**
	 * Finds the caption for an image.
	 * @param {jQuery} $thumbContain The container for the thumbnail.
	 * @param {jQuery} $link The link that encompasses the thumbnail.
	 * @returns {string|undefined} Unsafe HTML may be present - caution
	 */
	MMVB.findCaption = function ( $thumbContain, $link ) {
		var $thumbCaption;

		if ( $thumbContain.length !== 0 && $thumbContain.is( '.thumb' ) ) {
			$thumbCaption = $thumbContain.find( '.thumbcaption' ).clone();
			$thumbCaption.find( '.magnify' ).remove();
			if ( !$thumbCaption.length ) { // gallery, maybe
				$thumbCaption = $thumbContain
					.closest( '.gallerybox' )
					.not( function () {
						// do not treat categories as galleries - the autogenerated caption they have is not helpful
						return $thumbContain.closest( '#mw-category-media' ).length;
					} )
					.find( '.gallerytext' )
					.clone();
			}
			return this.htmlUtils.htmlToTextWithLinks( $thumbCaption.html() || '' );
		} else if ( $link.prop( 'title' ) ) {
			return $link.prop( 'title' );
		}
	};

	/**
	 * Handles a click event on a link
	 * @param {HTMLElement} element Clicked element
	 * @param {jQuery.Event} e jQuery event object
	 * @param {string} title File title
	 * @param {boolean} overridePreference Whether to ignore global preferences and open
	 * the lightbox on this click event.
	 * @returns {boolean}
	 */
	MMVB.click = function ( element, e, title, overridePreference ) {
		var $element = $( element );

		// Do not interfere with non-left clicks or if modifier keys are pressed.
		if ( ( e.button !== 0 && e.which !== 1 ) || e.altKey || e.ctrlKey || e.shiftKey || e.metaKey ) {
			return;
		}

		// Don't load if someone has specifically stopped us from doing so
		if ( !this.config.isMediaViewerEnabledOnClick() && overridePreference !== true ) {
			return;
		}

		// Don't load if we already tried loading and it failed
		if ( this.viewerIsBroken ) {
			return;
		}

		mw.mmv.durationLogger.start( [ 'click-to-first-image', 'click-to-first-metadata' ] );

		if ( $element.is( 'a.image' ) ) {
			mw.mmv.actionLogger.log( 'thumbnail' );
		} else if ( $element.is( '.magnify a' ) ) {
			mw.mmv.actionLogger.log( 'enlarge' );
		}

		this.ensureEventHandlersAreSetUp();

		this.loadViewer().then( function ( viewer ) {
			viewer.loadImageByTitle( title, true );
		} );

		e.preventDefault();

		return false;
	};

	/**
	 * Handles the browser location hash on pageload or hash change
	 * @param {boolean} log Whether this is called for the hash that came with the pageload
	 */
	MMVB.hash = function ( initialHash ) {
		var bootstrap = this;

		// There is no point loading the mmv if it isn't loaded yet for hash changes unrelated to the mmv
		// Such as anchor links on the page
		if ( !this.viewerInitialized && window.location.hash.indexOf( '#mediaviewer/') !== 0 ) {
			return;
		}

		if ( this.skipNextHashHandling ) {
			this.skipNextHashHandling = false;
			return;
		}

		this.loadViewer().then( function ( viewer ) {
			viewer.hash();
			// this is an ugly temporary fix to avoid a black screen of death when
			// the page is loaded with an invalid MMV url
			if ( !viewer.isOpen ) {
				bootstrap.cleanupOverlay();
			} else if ( initialHash ) {
				mw.mmv.actionLogger.log( 'hash-load' );
			} else {
				mw.mmv.actionLogger.log( 'history-navigation' );
			}
		} );
	};

	/**
	 * Handles hash change requests coming from mmv
	 * @param {jQuery.Event} e Custom mmv-hash event
	 */
	MMVB.internalHashChange = function ( e ) {
		var hash = e.hash,
			title = e.title;

		// The advantage of using pushState when it's available is that it has to ability to truly
		// clear the hash, not leaving "#" in the history
		// An entry with "#" in the history has the side-effect of resetting the scroll position when navigating the history
		if ( this.browserHistory && this.browserHistory.pushState ) {
			// In order to truly clear the hash, we need to reconstruct the hash-free URL
			if ( hash === '#' ) {
				hash = window.location.href.replace( /#.*$/, '' );
			}

			this.browserHistory.pushState( null, title, hash );
		} else {
			// Since we voluntarily changed the hash, we don't want MMVB.hash (which will trigger on hashchange event) to treat it
			this.skipNextHashHandling = true;

			window.location.hash = hash;
		}

		document.title = title;
	};

	/**
	 * Instantiates a new viewer if necessary
	 * @returns {mw.mmv.MultimediaViewer}
	 */
	MMVB.getViewer = function () {
		if ( this.viewer === undefined ) {
			this.viewer = new mw.mmv.MultimediaViewer();
			this.viewer.setupEventHandlers();
		}

		return this.viewer;
	};

	/**
	 * Listens to events on the window/document
	 */
	MMVB.setupEventHandlers = function () {
		var self = this;

		/** @property {boolean} eventHandlersHaveBeenSetUp tracks domready event handler state */
		this.eventHandlersHaveBeenSetUp = true;

		$( window ).on( this.browserHistory && this.browserHistory.pushState ? 'popstate.mmvb' : 'hashchange', function () {
			self.hash();
		} );

		// Interpret any hash that might already be in the url
		self.hash( true );

		$( document ).on( 'mmv-hash', function ( e ) {
			self.internalHashChange( e );
		} ).on( 'mmv-cleanup-overlay', function () {
			self.cleanupOverlay();
		} );
	};

	/**
	 * Cleans up event handlers, used for tests
	 */
	MMVB.cleanupEventHandlers = function () {
		$( window ).off( 'hashchange popstate.mmvb' );
		$( document ).off( 'mmv-hash' );
		this.eventHandlersHaveBeenSetUp = false;
	};

	/**
	 * Makes sure event handlers are set up properly via MultimediaViewerBootstrap.setupEventHandlers().
	 * Called before loading the main mmv module. At this point, event handers for MultimediaViewerBootstrap
	 * should have been set up, but due to bug 70756 it cannot be guaranteed.
	 */
	MMVB.ensureEventHandlersAreSetUp = function () {
		if ( !this.eventHandlersHaveBeenSetUp ) {
			this.setupEventHandlers();
			this.eventHandlersHaveBeenSetUp = true;
		}
	};

	/**
	 * Sets up the overlay while the viewer loads
	 */
	MMVB.setupOverlay = function () {
		var $scrollTo = $.scrollTo(),
			$body = $( document.body );

		// There are situations where we can call setupOverlay while the overlay is already there,
		// such as inside this.hash(). In that case, do nothing
		if ( $body.hasClass( 'mw-mmv-lightbox-open' ) ) {
			return;
		}

		if ( !this.$overlay ) {
			this.$overlay = $( '<div>' )
				.addClass( 'mw-mmv-overlay' );
		}

		this.savedScroll = { top : $scrollTo.scrollTop(), left : $scrollTo.scrollLeft() };

		$body.addClass( 'mw-mmv-lightbox-open' )
			.append( this.$overlay );
	};

	/**
	 * Cleans up the overlay
	 */
	MMVB.cleanupOverlay = function () {
		var bootstrap = this;

		$( document.body ).removeClass( 'mw-mmv-lightbox-open' );

		if ( this.$overlay ) {
			this.$overlay.remove();
		}

		if ( this.savedScroll ) {
			// setTimeout because otherwise Chrome will scroll back to top after the popstate event handlers run
			setTimeout( function() { $.scrollTo( bootstrap.savedScroll, 0 ); bootstrap.savedScroll = undefined; }, 0 );
		}
	};

	MMVB.whenThumbsReady = function () {
		return this.thumbsReadyDeferred.promise();
	};

	mw.mmv.MultimediaViewerBootstrap = MultimediaViewerBootstrap;
}( mediaWiki, jQuery ) );
