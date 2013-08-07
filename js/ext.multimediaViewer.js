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
	var MultiLightbox, LightboxImage, lightboxHooks;

	function MultimediaViewer() {
		var $thumbs = $( '.thumbimage' ),
			urls = [],
			viewer = this;

		$thumbs.each( function ( i, thumb ) {
			var $thumb = $( thumb ),
				$link = $thumb.closest( 'a.image' ),
				$thumbContain = $link.closest( '.thumb' ),
				$enlarge = $thumbContain.find( '.magnify a' ),
				$links = $link.add( $enlarge ),
				filePageLink = $link.prop( 'href' ),
				filename = $thumb.prop( 'alt' ),
				articlePath = mw.config.get( 'wgArticlePath' ),
				index = urls.length,
				fileLink = articlePath.replace( '$1', 'Special:Filepath/' + filename );

			$links.data( 'filePageLink', filePageLink );
			urls.push( new LightboxImage( fileLink ) );
			urls[index].filePageLink = filePageLink;

			$links.click( function ( e ) {
				e.preventDefault();
				viewer.lightbox.currentIndex = index;
				viewer.lightbox.open();
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
	}

	$( function () {
		MultiLightbox = window.MultiLightbox;
		LightboxImage = window.LightboxImage;
		lightboxHooks = window.lightboxHooks;

		var viewer = new MultimediaViewer();
		mw.mediaViewer = viewer;
	} );

	mw.MultimediaViewer = MultimediaViewer;
}( mediaWiki, jQuery ) );
