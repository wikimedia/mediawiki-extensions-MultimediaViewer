( function ( mw, $ ) {
	var thingsShouldBeEmptied = [
			'$license',
			'$title',
			'$location',
			'$datetime'
		],

		thingsShouldHaveEmptyClass = [
			'$licenseLi',
			'$credit',
			'$locationLi',
			'$datetimeLi'
		];

	QUnit.module( 'mmv.ui.metadataPanel', QUnit.newMwEnvironment() );

	QUnit.test( 'The panel is emptied properly when necessary', thingsShouldBeEmptied.length + thingsShouldHaveEmptyClass.length, function ( assert ) {
		var i,
			$qf = $( '#qunit-fixture' ),
			panel = new mw.mmv.ui.MetadataPanel( $qf, $( '<div>' ).appendTo( $qf ), window.localStorage, new mw.mmv.Config( {}, mw.config, mw.user, new mw.Api(), window.localStorage ) );

		panel.empty();

		for ( i = 0; i < thingsShouldBeEmptied.length; i++ ) {
			assert.strictEqual( panel[thingsShouldBeEmptied[i]].text(), '', 'We successfully emptied the ' + thingsShouldBeEmptied[i] + ' element' );
		}

		for ( i = 0; i < thingsShouldHaveEmptyClass.length; i++ ) {
			assert.strictEqual( panel[thingsShouldHaveEmptyClass[i]].hasClass( 'empty' ), true, 'We successfully applied the empty class to the ' + thingsShouldHaveEmptyClass[i] + ' element' );
		}
	} );

	QUnit.test( 'Setting location information works as expected', 6, function ( assert ) {
		var $qf = $( '#qunit-fixture' ),
			panel = new mw.mmv.ui.MetadataPanel( $qf, $( '<div>' ).appendTo( $qf ), window.localStorage, new mw.mmv.Config( {}, mw.config, mw.user, new mw.Api(), window.localStorage ) ),
			fileName = 'Foobar.jpg',
			latitude = 12.3456789,
			longitude = 98.7654321,
			imageData = {
				latitude: latitude,
				longitude: longitude,
				hasCoords: function () { return true; },
				title: mw.Title.newFromText( 'File:Foobar.jpg' )
			};

		panel.setLocationData( imageData );

		assert.strictEqual(
			panel.$location.text(),
			'Location: 12° 20′ 44.44″ N, 98° 45′ 55.56″ E',
			'Location text is set as expected - if this fails it may be due to i18n issues.'
		);

		assert.strictEqual(
			panel.$location.prop( 'href' ),
			'http://tools.wmflabs.org/geohack/geohack.php?pagename=File:' + fileName + '&params=' + latitude + '_N_' + longitude + '_E_&language=en',
			'Location URL is set as expected'
		);

		latitude = -latitude;
		longitude = -longitude;
		imageData.latitude = latitude;
		imageData.longitude = longitude;
		panel.setLocationData( imageData );

		assert.strictEqual(
			panel.$location.text(),
			'Location: 12° 20′ 44.44″ S, 98° 45′ 55.56″ W',
			'Location text is set as expected - if this fails it may be due to i18n issues.'
		);

		assert.strictEqual(
			panel.$location.prop( 'href' ),
			'http://tools.wmflabs.org/geohack/geohack.php?pagename=File:' + fileName + '&params=' + ( - latitude ) + '_S_' + ( - longitude ) + '_W_&language=en',
			'Location URL is set as expected'
		);

		latitude = 0;
		longitude = 0;
		imageData.latitude = latitude;
		imageData.longitude = longitude;
		panel.setLocationData( imageData );

		assert.strictEqual(
			panel.$location.text(),
			'Location: 0° 0′ 0″ N, 0° 0′ 0″ E',
			'Location text is set as expected - if this fails it may be due to i18n issues.'
		);

		assert.strictEqual(
			panel.$location.prop( 'href' ),
			'http://tools.wmflabs.org/geohack/geohack.php?pagename=File:' + fileName + '&params=' + latitude + '_N_' + longitude + '_E_&language=en',
			'Location URL is set as expected'
		);
	} );

	QUnit.test( 'Setting image information works as expected', 17, function ( assert ) {
		var creditPopupText,
			$qf = $( '#qunit-fixture' ),
			panel = new mw.mmv.ui.MetadataPanel( $qf, $( '<div>' ).appendTo( $qf ), window.localStorage, new mw.mmv.Config( {}, mw.config, mw.user, new mw.Api(), window.localStorage ) ),
			title = 'Foo bar',
			image = {
				filePageTitle: mw.Title.newFromText( 'File:' + title + '.jpg' )
			},
			imageData = {
				title: image.filePageTitle,
				url: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg',
				descriptionUrl: 'https://commons.wikimedia.org/wiki/File:Foobar.jpg',
				hasCoords: function () { return false; }
			},
			repoData = {
				getArticlePath: function () { return 'Foo'; },
				isCommons: function () { return false; }
			},
			oldMoment = window.moment;

		/*window.moment = function ( date ) {
			// This has no effect for now, since writing this test revealed that our moment.js
			// doesn't have any language configuration
			return oldMoment( date ).lang( 'fr' );
		};*/

		panel.setImageInfo( image, imageData, repoData );

		assert.strictEqual( panel.$title.text(), title, 'Title is correctly set' );
		assert.ok( panel.$credit.text(), 'Default credit is shown' );
		assert.strictEqual( panel.$license.prop( 'href' ), imageData.descriptionUrl,
			'User is directed to file page for license information' );
		assert.ok( !panel.$license.prop( 'target' ), 'License information opens in same window' );
		assert.ok( panel.$datetimeLi.hasClass( 'empty' ), 'Date/Time is empty' );
		assert.ok( panel.$locationLi.hasClass( 'empty' ), 'Location is empty' );

		imageData.creationDateTime = '2013-08-26T14:41:02Z';
		imageData.uploadDateTime = '2013-08-25T14:41:02Z';
		imageData.source = '<b>Lost</b><a href="foo">Bar</a>';
		imageData.author = 'Bob';
		imageData.license = new mw.mmv.model.License( 'CC-BY-2.0', 'cc-by-2.0',
			'Creative Commons Attribution - Share Alike 2.0',
			'http://creativecommons.org/licenses/by-sa/2.0/' );
		imageData.restrictions = [ 'trademarked', 'default', 'insignia' ];

		panel.setImageInfo( image, imageData, repoData );
		creditPopupText = panel.creditField.$element.attr( 'original-title' );

		assert.strictEqual( panel.$title.text(), title, 'Title is correctly set' );
		assert.ok( !panel.$credit.hasClass( 'empty' ), 'Credit is not empty' );
		assert.ok( !panel.$datetimeLi.hasClass( 'empty' ), 'Date/Time is not empty' );
		assert.strictEqual( panel.creditField.$element.find( '.mw-mmv-author' ).text(), imageData.author, 'Author text is correctly set' );
		assert.strictEqual( panel.creditField.$element.find( '.mw-mmv-source' ).html(), '<b>Lost</b><a href="foo">Bar</a>', 'Source text is correctly set' );
		// Either multimediaviewer-credit-popup-text or multimediaviewer-credit-popup-text-more.
		assert.ok( creditPopupText === 'Author and source information' || creditPopupText === 'View full author and source', 'Source tooltip is correctly set' );
		assert.ok( panel.$datetime.text().indexOf( '26 August 2013' ) > 0, 'Correct date is displayed' );
		assert.strictEqual( panel.$license.text(), 'CC BY 2.0', 'License is correctly set' );
		assert.ok( panel.$license.prop( 'target' ), 'License information opens in new window' );
		assert.ok( panel.$restrictions.children().last().children().hasClass( 'mw-mmv-restriction-default' ), 'Default restriction is correctly displayed last' );

		imageData.creationDateTime = undefined;
		panel.setImageInfo( image, imageData, repoData );

		assert.ok( panel.$datetime.text().indexOf( '25 August 2013' ) > 0, 'Correct date is displayed' );

		window.moment = oldMoment;
	} );

	QUnit.test( 'Setting permission information works as expected', 1, function ( assert ) {
		var $qf = $( '#qunit-fixture' ),
			panel = new mw.mmv.ui.MetadataPanel( $qf, $( '<div>' ).appendTo( $qf ), window.localStorage, new mw.mmv.Config( {}, mw.config, mw.user, new mw.Api(), window.localStorage ) );

		panel.setLicense( null, 'http://example.com' ); // make sure license is visible as it contains the permission
		panel.setPermission( 'Look at me, I am a permission!' );
		assert.ok( panel.$permissionLink.is( ':visible' ) );
	} );

	QUnit.test( 'Date formatting', 1, function ( assert ) {
		var $qf = $( '#qunit-fixture' ),
			panel = new mw.mmv.ui.MetadataPanel( $qf, $( '<div>' ).appendTo( $qf ), window.localStorage, new mw.mmv.Config( {}, mw.config, mw.user, new mw.Api(), window.localStorage ) ),
			date1 = 'Garbage',
			promise = panel.formatDate( date1 );

		QUnit.stop();

		promise.then( function ( result ) {
			assert.strictEqual( result, date1, 'Invalid date is correctly ignored' );
			QUnit.start();
		} );
	} );

	QUnit.test( 'About links', 3, function ( assert ) {
		var panel,
			$qf = $( '#qunit-fixture' ),
			oldWgMediaViewerIsInBeta = mw.config.get( 'wgMediaViewerIsInBeta' );

		this.sandbox.stub( mw.user, 'isAnon' );
		mw.config.set( 'wgMediaViewerIsInBeta', false );
		panel = new mw.mmv.ui.MetadataPanel( $qf.empty(), $( '<div>' ).appendTo( $qf ), window.localStorage, new mw.mmv.Config( {}, mw.config, mw.user, new mw.Api(), window.localStorage ) );

		assert.strictEqual( $qf.find( '.mw-mmv-about-link' ).length, 1, 'About link is created.' );
		assert.strictEqual( $qf.find( '.mw-mmv-discuss-link' ).length, 1, 'Discuss link is created.' );
		assert.strictEqual( $qf.find( '.mw-mmv-help-link' ).length, 1, 'Help link is created.' );
		mw.config.set( 'wgMediaViewerIsInBeta', oldWgMediaViewerIsInBeta );
	} );
}( mediaWiki, jQuery ) );
