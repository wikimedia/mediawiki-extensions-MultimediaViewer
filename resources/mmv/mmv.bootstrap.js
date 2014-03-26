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

		/** @property {mw.mmv.HtmlUtils} htmlUtils - */
		this.htmlUtils = new mw.mmv.HtmlUtils();

		this.thumbs = [];
		this.$thumbs = $( '.gallery .image img, a.image img' );
		this.processThumbs();
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

		mw.loader.using( 'mmv', function() {
			bs.isCSSReady( deferred );
		}, function ( error ) {
			mw.log( error.message );
			deferred.reject( error.message );
		} );

		return deferred.done( function ( viewer ) {
			if ( !bs.viewerInitialized ) {
				if ( bs.thumbs.length ) {
					viewer.initWithThumbs( bs.thumbs );
				}

				bs.viewerInitialized = true;
			}
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
			bs = this;

		if ( $dummy.css( 'display' ) === 'inline' ) {
			// Let's be clean and remove the test item before resolving the deferred
			$dummy.remove();
			deferred.resolve( bs.getViewer() );
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

		this.$thumbs.each( function ( i, thumb ) {
			bs.processThumb( thumb );
		} );
	};

	/**
	 * Processes a thumb
	 * @param {Object} thumb
	 */
	MMVB.processThumb = function ( thumb ) {
		var $thumbCaption,
			caption,
			bs = this,
			$thumb = $( thumb ),
			$link = $thumb.closest( 'a.image' ),
			$thumbContain = $link.closest( '.thumb' ),
			$enlarge = $thumbContain.find( '.magnify a' ),
			title = mw.Title.newFromImg( $thumb ),
			link = $link.prop( 'href' );

		if ( !bs.validExtensions[ title.getExtension().toLowerCase() ] ) {
			return;
		}

		if (
			// This is almost certainly an icon for an informational template like
			// {{refimprove}} on enwiki.
			$thumb.closest( '.metadata' ).length > 0 ||

			// This is an article with no text.
			$thumb.closest( '.noarticletext' ).length > 0
		) {
			return;
		}

		if ( $thumbContain.length !== 0 && $thumbContain.is( '.thumb' ) ) {
			$thumbCaption = $thumbContain.find( '.thumbcaption' ).clone();
			$thumbCaption.find( '.magnify' ).remove();
			caption = this.htmlUtils.htmlToTextWithLinks( $thumbCaption.html() || '' );
		}

		// This is the data that will be passed onto the mmv
		this.thumbs.push( {
			thumb : thumb,
			$thumb : $thumb,
			title : title,
			link : link,
			caption : caption } );

		if ( $thumbContain.length === 0 ) {
			// This isn't a thumbnail! Just use the link.
			$thumbContain = $link;
		} else if ( $thumbContain.is( '.thumb' ) ) {
			$thumbContain = $thumbContain.find( '.image' );
		}

		$link.add( $enlarge ).click( function ( e ) {
			return bs.click( this, e, title );
		} );
	};

	/**
	 * Handles a click event on a link
	 * @param {Object} element Clicked element
	 * @param {jQuery.Event} e jQuery event object
	 * @param {string} title File title
	 * @returns {boolean}
	 */
	MMVB.click = function ( element, e, title ) {
		var $element = $( element );

		// Do not interfere with non-left clicks or if modifier keys are pressed.
		if ( e.which !== 1 || e.altKey || e.ctrlKey || e.shiftKey || e.metaKey ) {
			return;
		}

		// Don't load if someone has specifically stopped us from doing so
		if ( mw.config.get( 'wgMediaViewerOnClick' ) !== true ) {
			return;
		}

		if ( $element.is( 'a.image' ) ) {
			mw.mmv.logger.log( 'thumbnail-link-click' );
		} else if ( $element.is( '.magnify a' ) ) {
			mw.mmv.logger.log( 'enlarge-link-click' );
		}

		this.loadViewer().then( function ( viewer ) {
			viewer.loadImageByTitle( title.getPrefixedText(), true );
		} );

		e.preventDefault();

		return false;
	};

	/**
	 * Handles the browser location hash on pageload or hash change
	 */
	MMVB.hash = function () {
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
		} );
	};

	/**
	 * Handles hash change requests coming from mmv
	 * @param {jQuery.Event} e Custom mmv.hash event
	 */
	MMVB.internalHashChange = function ( e ) {
		// Since we voluntarily changed the hash, we don't want MMVB.hash to treat it
		this.skipNextHashHandling = true;

		window.location.hash = e.hash;
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

		$( window ).hashchange( function () {
			self.hash();
		} ).hashchange();

		$( document ).on( 'mmv.hash', function ( e ) {
			self.internalHashChange( e );
		} );
	};

	/**
	 * Cleans up event handlers, used for tests
	 */
	MMVB.cleanupEventHandlers = function () {
		$( window ).off( 'hashchange' );
		$( document ).off( 'mmv.hash' );
	};

	mw.mmv.MultimediaViewerBootstrap = MultimediaViewerBootstrap;
}( mediaWiki, jQuery ) );
