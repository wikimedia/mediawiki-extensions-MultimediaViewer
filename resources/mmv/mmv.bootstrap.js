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
	var bootstrap, MMVB;

	/**
	 * Bootstrap code listening to thumb clicks and location.hash
	 * Loads the mmv and opens it if necessary
	 * @class mw.mmv.MultimediaViewerBootstrap
	 */
	function MultimediaViewerBootstrap () {
		var bs = this;

		this.validExtensions = {
			'jpg' : true,
			'jpeg' : true,
			'gif' : true,
			'svg' : true,
			'png' : true,
			'tiff' : true,
			'tif' : true
		};

		this.thumbs = [];
		this.$thumbs = $( '.gallery .image img, a.image img' );
		this.processThumbs();
		this.hash();

		$( window ).on( 'popstate.mmv', function() {
			bs.hash();
		} );
	}

	MMVB = MultimediaViewerBootstrap.prototype;

	/**
	 * Stops the boostrap
	 */
	MMVB.shutdown = function () {
		$( window ).off( 'popstate.mmv' );
	};

	/**
	 * Loads the mmv module asynchronously and passes the thumb data to it
	 * @returns {jQuery.Promise}
	 */
	MMVB.loadViewer = function () {
		var deferred = $.Deferred(),
			bs = this;

		mw.loader.using( 'mmv', function () {
			if ( !bs.viewerInitialized ) {
				if ( bs.thumbs.length ) {
					mw.mediaViewer.initWithThumbs( bs.thumbs );
				}

				bs.viewerInitialized = true;
			}

			deferred.resolve();
		} );

		return deferred.promise();
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

		if ( $thumbContain.length !== 0 && $thumbContain.is( '.thumb' ) ) {
			$thumbCaption = $thumbContain.find( '.thumbcaption' ).clone();
			$thumbCaption.find( '.magnify' ).remove();
			mw.mmv.ui.Element.prototype.whitelistHtml( $thumbCaption );
			caption = $thumbCaption.html();
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

		if ( $element.is( 'a.image' ) ) {
			mw.mmv.logger.log( 'thumbnail-link-click' );
		} else if ( $element.is( '.magnify a' ) ) {
			mw.mmv.logger.log( 'enlarge-link-click' );
		}

		this.loadViewer().then( function () {
			mw.mediaViewer.loadImageByTitle( title.getPrefixedText(), true );
		} );

		e.preventDefault();

		return false;
	};

	/**
	 * Handles the browser's location.hash
	 */
	MMVB.hash = function () {
		var hash = decodeURIComponent( document.location.hash ),
			linkState = hash.split( '/' );

		if ( linkState[0] === '#mediaviewer' ) {
			this.loadViewer().then( function () {
				mw.mediaViewer.loadImageByTitle( linkState[ 1 ] );
			} );
		} else {
			// If the hash is invalid (not a mmv hash) we close any open mmv
			if ( mw.mediaViewer ) {
				mw.mediaViewer.shutdown();
			}
		}
	};

	mw.mmv.MultimediaViewerBootstrap = MultimediaViewerBootstrap;

	bootstrap = new MultimediaViewerBootstrap();
}( mediaWiki, jQuery ) );
