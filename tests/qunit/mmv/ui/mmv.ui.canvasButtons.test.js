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
	QUnit.module( 'mmv.ui.CanvasButtons', QUnit.newMwEnvironment() );

	QUnit.test( 'Prev/Next', 2, function( assert ) {
		var i = 0,
			$qf = $( '#qunit-fixture' ),
			buttons = new mw.mmv.ui.CanvasButtons( $qf, $( '<div>' ), $( '<div>' ) ),
			viewer = new mw.mmv.MultimediaViewer();

		viewer.ui = {};

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

	QUnit.test( 'View original tooltip', 5, function( assert ) {
		var clock = this.sandbox.useFakeTimers(),
			$qf = $( '#qunit-fixture' ),
			buttons = new mw.mmv.ui.CanvasButtons( $qf, $( '<div>' ), $( '<div>' ) );

		function isViewOriginalTooltipVisible( buttons ) {
			var tipsy = buttons.$viewFile.tipsy( true ); // returns the tipsy object
			return tipsy.$tip && tipsy.$tip[0] && $.contains( document, tipsy.$tip[0] );
		}

		assert.ok( !isViewOriginalTooltipVisible( buttons ), 'The help tooltip is not visible initially' );
		buttons.showImageClickedHelp();
		clock.tick( 100 );
		assert.ok( isViewOriginalTooltipVisible( buttons ), 'The tooltip is visible after the image was clicked' );
		clock.tick( 5000 );
		assert.ok( !isViewOriginalTooltipVisible( buttons ), 'The tooltip disappears eventually' );

		buttons.showImageClickedHelp();
		clock.tick( 2000 );
		buttons.showImageClickedHelp();
		clock.tick( 2000 );
		assert.ok( isViewOriginalTooltipVisible( buttons ), 'The tooltip stays visible for longer when the image is clicked while it is visible' );
		clock.tick( 2000 );
		assert.ok( !isViewOriginalTooltipVisible( buttons ), 'The tooltip still disappears eventually' );

	} );
}( mediaWiki, jQuery ) );
