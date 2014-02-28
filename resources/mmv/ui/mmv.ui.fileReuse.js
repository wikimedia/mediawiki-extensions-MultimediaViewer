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

( function ( mw, $, oo ) {
	// Shortcut for prototype later
	var FRP;

	/**
	 * Represents the file reuse dialog and link to open it.
	 * @class mw.mmv.ui.FileReuse
	 * @extends mw.mmv.ui.Element
	 */
	function FileReuse( $container ) {
		var reuse = this;

		mw.mmv.ui.Element.call( this, $container );

		this.$useFileLi = $( '<li>' )
			.addClass( 'mw-mlb-usefile-li empty' )
			.appendTo( this.$container );

		this.$useFile = $( '<a>' )
			.addClass( 'mw-mlb-usefile' )
			.prop( 'href', '#' )
			.text( mw.message( 'multimediaviewer-use-file' ).text() )
			.click( function () {
				reuse.openDialog();
				return false;
			} )
			.appendTo( this.$useFileLi );
	}

	oo.inheritClass( FileReuse, mw.mmv.ui.Element );

	FRP = FileReuse.prototype;

	/**
	 * @method
	 * Saves some data about the image on the $useFile element for later setup.
	 * @param {mw.Title} title
	 * @param {string} src The URL for the full-size image
	 * @param {boolean} isLocal Whether the file is on this wiki or not
	 */
	FRP.set = function ( title, src, isLocal, author, license ) {
		this.$useFile.data( 'title', title );
		this.$useFile.data( 'src', src );
		this.$useFile.data( 'isLocal', isLocal );
		this.$useFile.data( 'author', author );
		this.$useFile.data( 'license', license );
		this.$useFileLi.removeClass( 'empty' );
	};

	/**
	 * @method
	 * @inheritdoc
	 */
	FRP.empty = function () {
		this.$useFile.data( 'title', null );
		this.$useFile.data( 'link', null );
		this.$useFile.data( 'src', null );
		this.$useFile.data( 'isLocal', null );
		this.$useFile.data( 'author', null );
		this.$useFile.data( 'license', null );
		this.$useFileLi.addClass( 'empty' );
	};

	/**
	 * @method
	 * Opens a dialog with information about file reuse.
	 */
	FRP.openDialog = function () {
		// Only open dialog once
		if ( this.$dialog ) {
			return false;
		}

		function selectAllOnEvent() {
			this.select();
		}

		var fileTitle = this.$useFile.data( 'title' ),

			filename = fileTitle.getPrefixedText(),
			desc = fileTitle.getNameText(),

			linkPrefix = this.$useFile.data( 'isLocal' ) ? mw.config.get( 'wgServer' ) : '',
			src = this.$useFile.data( 'src' ),
			link = this.$useFile.data( 'link' ) || src,
			pattern = /^\/[^\/]/,
			finalLink = pattern.test(link) ? linkPrefix +link: link,

			license = this.$useFile.data( 'license' ) || '',
			author = this.$useFile.data( 'author' ) || '',
			linkTitle = ( license + ( author ? ' (' + author + ')' : '' ) ).trim(),

			owtId = 'mw-mlb-use-file-onwiki-thumb',
			ownId = 'mw-mlb-use-file-onwiki-normal',
			owId = 'mw-mlb-use-file-offwiki',

			reuse = this,

			$owtLabel = $( '<label>' )
				.prop( 'for', owtId )
				.text( mw.message( 'multimediaviewer-use-file-owt' ).text() ),

			$owtField = $( '<input>' )
				.prop( 'type', 'text' )
				.prop( 'id', owtId )
				.prop( 'readonly', true )
				.focus( selectAllOnEvent )
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
				.focus( selectAllOnEvent )
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
				.focus( selectAllOnEvent )
				.val( '<a href="' + finalLink + ( linkTitle ? '" title="' + linkTitle : '' ) + '" ><img src="' + src + '" /></a>' ),


			$offWiki = $( '<div>' )
				.append(
					$owLabel,
					$owField
				);

		this.$dialog = $( '<div>' )
			.addClass( 'mw-mlb-use-file-dialog' )
			.append(
				$onWikiThumb,
				$onWikiNormal,
				$offWiki
			)
			.dialog( {
				width: 750,
				close: function () {
					// Delete the dialog object
					reuse.$dialog = undefined;
				}
			} );

		$owtField.focus();

		return false;
	};

	/**
	 * Closes the dialog forcefully
	 */
	FRP.closeDialog = function () {
		if ( this.$dialog ) {
			this.$dialog.dialog( 'close' );
		}
	};

	mw.mmv.ui.FileReuse = FileReuse;
}( mediaWiki, jQuery, OO ) );
