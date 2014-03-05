/*
 * This file is part of the MediaWiki extension MediaViewer.
 *
 * MediaViewer is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * MediaViewer is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with MediaViewer.  If not, see <http://www.gnu.org/licenses/>.
 */

( function( mw, $ ) {
	QUnit.module( 'mmv.ui.Buttons', QUnit.newMwEnvironment() );

	QUnit.test( 'Prev/Next', 2, function( assert ) {
		var i = 0,
			$qf = $( '#qunit-fixture' ),
			buttons = new mw.mmv.ui.Buttons( $qf, $( '<div>' ), $( '<div>' ) ),
			viewer = new mw.mmv.MultimediaViewer();

		viewer.lightbox = {};

		viewer.loadIndex = function () {
			assert.ok( true, 'Switched to next/prev image' );
			i++;

			if ( i === 2 ) {
				QUnit.start();
				viewer.cleanupEventHandlers();
			}
		};

		viewer.setupEventHandlers();

		QUnit.stop();

		buttons.$next.click();
		buttons.$prev.click();
	} );
}( mediaWiki, jQuery ) );
