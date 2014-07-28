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

// Included on every page which has images so keep it lightweight.
( function ( mw ) {
	mw.mmv = {
		/**
		 * Feature-detects OOJS support. OOJS uses es5-shim, and from the remaining ES5 additions
		 * (the ones provided by es5-sham) the only one it uses is Object.create.
		 * @member mw.mmv.MultimediaViewer
		 * @return {boolean}
		 */
		isBrowserSupported : function () {
			return !!Object.create;
		}
	};
}( mediaWiki ) );
