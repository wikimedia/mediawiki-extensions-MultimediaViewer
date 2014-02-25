( function ( mw, $ ) {
	QUnit.module( 'mmv.ui', QUnit.newMwEnvironment() );

	QUnit.test( 'HTML whitelisting works', 2, function ( assert ) {
		var okhtml = '<a href="/wiki/Blah">Blah</a> blah blah',
			needswhitelisting = '<div>Blah<br />blah</div>',
			whitelisted = 'Blahblah',
			okjq = $.parseHTML( okhtml ),
			nwljq = $.parseHTML( needswhitelisting ),
			$sandbox = $( '<div>' );

		mw.mmv.ui.Element.prototype.whitelistHtml( $sandbox.empty().append( okjq ) );
		assert.strictEqual( $sandbox.html(), okhtml, 'Whitelisted elements are let through.' );

		mw.mmv.ui.Element.prototype.whitelistHtml( $sandbox.empty().append( nwljq ) );
		assert.strictEqual( $sandbox.html(), whitelisted, 'Not-whitelisted elements are removed.' );
	} );
}( mediaWiki, jQuery ) );
