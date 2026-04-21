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
 * along with MultimediaViewer.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * Display a mw.notify message when a URL hash file title is not found on
 * the current page.  Logic is shared between the desktop viewer (mmv.js) and
 * the beta viewer (BetaViewer.js); each caller is responsible for closing the
 * viewer before calling this function.
 *
 * @memberof module:mmv.common
 * @param {mw.Title} title
 */
function notifyTitleNotFound( title ) {
	const text = mw.msg( 'multimediaviewer-file-not-found-error', title.getMainText() );
	const $link = $( '<a>' ).text( mw.msg( 'multimediaviewer-file-page' ) ).prop( 'href', title.getUrl() );
	const $message = $( '<div>' ).text( text ).append( $( '<br>' ) ).append( $link );
	mw.notify( $message );
}

module.exports = notifyTitleNotFound;
