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

const { StripeButtons } = require( 'mmv' );

QUnit.module( 'mmv.ui.StripeButtons', QUnit.newMwEnvironment() );

function createStripeButtons() {
	const $fixture = $( '#qunit-fixture' );
	return new StripeButtons( $fixture );
}

QUnit.test( 'Sense test, object creation and UI construction', ( assert ) => {
	const oldMwUserIsAnon = mw.user.isAnon;

	// first pretend we are anonymous
	mw.user.isAnon = () => true;
	let buttons = createStripeButtons();

	assert.true( buttons instanceof StripeButtons, 'UI element is created.' );
	assert.strictEqual( buttons.$descriptionPage.length, 1, 'File page button created for anon.' );

	// now pretend we are logged in
	mw.user.isAnon = () => false;
	buttons = createStripeButtons();

	assert.strictEqual( buttons.$descriptionPage.length, 1, 'File page button created for logged in.' );

	mw.user.isAnon = oldMwUserIsAnon;
} );

QUnit.test( 'set()/empty() sense test:', ( assert ) => {
	const buttons = createStripeButtons();
	const fakeImageInfo = { descriptionUrl: '//commons.wikimedia.org/wiki/File:Foo.jpg' };

	buttons.set( null, fakeImageInfo );
	buttons.empty();

	assert.true( true, 'No error on set()/empty().' );
} );

QUnit.test( 'Description page button', ( assert ) => {
	const $qf = $( '#qunit-fixture' );
	const buttons = new StripeButtons( $qf );
	const $button = buttons.$descriptionPage;
	const descriptionUrl = 'http://example.com/desc';
	const descriptionUrlCommons = 'https://commons.wikimedia.org/desc';
	const descriptionUrl2 = 'http://example.com/different-desc';

	buttons.set( null, { descriptionUrl } );

	assert.strictEqual( $button.hasClass( 'mw-mmv-repo-button-commons' ), false, 'Button does not have commons class non-Commons files' );
	assert.strictEqual( $button.find( 'a' ).addBack().filter( 'a' ).attr( 'href' ), descriptionUrl, 'Description page link is correct' );

	buttons.set( null, { descriptionUrl: descriptionUrlCommons } );

	assert.strictEqual( $button.hasClass( 'mw-mmv-repo-button-commons' ), true, 'Button commons class for Commons files' );

	buttons.set( null, {
		descriptionUrl,
		pageID: 1,
		title: { getUrl: () => descriptionUrl2 }
	} );

	assert.strictEqual(
		$button.hasClass( 'mw-mmv-repo-button-commons' ), false,
		'Button does not have commons class for Commons files with local description page'
	);
	assert.strictEqual(
		$button.find( 'a' ).addBack().filter( 'a' ).attr( 'href' ), descriptionUrl2,
		'Description page link for Commons files with local description page is correct'
	);
} );
