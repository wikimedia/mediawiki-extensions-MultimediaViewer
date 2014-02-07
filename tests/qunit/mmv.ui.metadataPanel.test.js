( function ( mw, $ ) {
	var thingsShouldBeEmptied = [
			'$license',
			'$title',
			'$credit',
			'$username',
			'$location',
			'$repo',
			'$datetime'
		],

		thingsShouldHaveEmptyClass = [
			'$license',
			'$credit',
			'$usernameLi',
			'$locationLi',
			'$repoLi',
			'$datetimeLi'
		];

	QUnit.module( 'mmv.ui.metadataPanel', QUnit.newMwEnvironment() );

	QUnit.test( 'The panel is emptied properly when necessary', thingsShouldBeEmptied.length + thingsShouldHaveEmptyClass.length + 1, function ( assert ) {
		var i,
			$qf = $( '#qunit-fixture' ),
			panel = new mw.mmv.ui.MetadataPanel( $qf, $( '<div>' ).appendTo( $qf ) );

		panel.empty();

		for ( i = 0; i < thingsShouldBeEmptied.length; i++ ) {
			assert.strictEqual( panel[thingsShouldBeEmptied[i]].text(), '', 'We successfully emptied the ' + thingsShouldBeEmptied[i] + ' element' );
		}

		for ( i = 0; i < thingsShouldHaveEmptyClass.length; i++ ) {
			assert.strictEqual( panel[thingsShouldHaveEmptyClass[i]].hasClass( 'empty' ), true, 'We successfully applied the empty class to the ' + thingsShouldHaveEmptyClass[i] + ' element' );
		}

		assert.strictEqual( panel.$dragIcon.hasClass( 'pointing-down' ), false, 'We successfully reset the chevron' );
	} );

	QUnit.test( 'Setting repository information in the UI works as expected', 3, function ( assert ) {
		var $qf = $( '#qunit-fixture' ),
			panel = new mw.mmv.ui.MetadataPanel( $qf, $( '<div>' ).appendTo( $qf ) );

		panel.setRepoDisplay( 'Example Wiki' );
		assert.strictEqual( panel.$repo.text(), 'Learn more on Example Wiki', 'Text set to something useful for remote wiki - if this fails it might be because of localisation' );

		panel.setRepoDisplay();
		assert.strictEqual( panel.$repo.text(), 'Learn more on ' + mw.config.get( 'wgSiteName' ), 'Text set to something useful for local wiki - if this fails it might be because of localisation' );

		panel.setFilePageLink( 'https://commons.wikimedia.org/wiki/File:Foobar.jpg' );
		assert.strictEqual( panel.$repo.prop( 'href' ), 'https://commons.wikimedia.org/wiki/File:Foobar.jpg', 'The file link was set successfully.' );
	} );

	QUnit.test( 'Setting location information works as expected', 6, function ( assert ) {
		var $qf = $( '#qunit-fixture' ),
			panel = new mw.mmv.ui.MetadataPanel( $qf, $( '<div>' ).appendTo( $qf ) ),
			fileName = 'Foobar.jpg',
			latitude = 12.3456789,
			longitude = 98.7654321,
			imageData = {
				latitude: latitude,
				longitude: longitude,
				hasCoords: function() { return true; },
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
			'http://tools.wmflabs.org/geohack/geohack.php?pagename=File:' + fileName + '&params=' + ( - latitude) + '_S_' + ( - longitude ) + '_W_&language=en',
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

	QUnit.test( 'Setting image information works as expected', 15, function ( assert ) {
		var gender,
			$qf = $( '#qunit-fixture' ),
			panel = new mw.mmv.ui.MetadataPanel( $qf, $( '<div>' ).appendTo( $qf ) ),
			title = 'Foo bar',
			image = {
				filePageTitle : mw.Title.newFromText( 'File:' + title + '.jpg' )
			},
			imageData = {
				hasCoords: function() { return false; },
			},
			repoData = {
				getArticlePath : function() { return 'Foo'; }
			},
			localUsage = {},
			globalUsage = {},
			oldMoment = window.moment;

		/*window.moment = function( date ) {
			// This has no effect for now, since writing this test revealed that our moment.js
			// doesn't have any language configuration
			return oldMoment( date ).lang( 'fr' );
		};*/

		panel.setImageInfo( image, imageData, repoData, localUsage, globalUsage, gender );

		assert.strictEqual( panel.$title.text(), title, 'Title is correctly set' );
		assert.ok( panel.$credit.hasClass( 'empty' ), 'Credit is empty' );
		assert.ok( panel.$license.hasClass( 'empty' ), 'License is empty' );
		assert.ok( panel.$usernameLi.hasClass( 'empty' ), 'Username is empty' );
		assert.ok( panel.$datetimeLi.hasClass( 'empty' ), 'Date/Time is empty' );
		assert.ok( panel.$locationLi.hasClass( 'empty' ), 'Location is empty' );

		imageData.creationDateTime = '2013-08-26T14:41:02Z';
		imageData.uploadDateTime = '2013-08-25T14:41:02Z';
		imageData.source = '<b>Lost</b><a href="foo">Bar</a>';
		imageData.author = 'Bob';
		imageData.isCcLicensed = function() { return true; };
		imageData.license = 'cc-by-2.0';
		gender = 'female';
		imageData.lastUploader = 'Ursula';

		panel.setImageInfo( image, imageData, repoData, localUsage, globalUsage, gender );

		assert.strictEqual( panel.$title.text(), title, 'Title is correctly set' );
		assert.ok( !panel.$credit.hasClass( 'empty' ), 'Credit is not empty' );
		assert.ok( !panel.$datetimeLi.hasClass( 'empty' ), 'Date/Time is not empty' );
		assert.strictEqual( panel.$source.html(), 'Lost<a href=\"foo\">Bar</a>', 'Source is correctly set' );
		assert.ok( panel.$datetime.text().indexOf( 'August 26 2013' ) > 0, 'Correct date is displayed' );
		assert.strictEqual( panel.$author.text(), imageData.author, 'Author is correctly set' );
		assert.strictEqual( panel.$license.text(), 'CC BY 2.0', 'License is correctly set' );
		assert.ok( panel.$username.text().indexOf( imageData.lastUploader ) > 0, 'Correct username is displayed' );

		imageData.creationDateTime = undefined;
		panel.setImageInfo( image, imageData, repoData, localUsage, globalUsage, gender );

		assert.ok( panel.$datetime.text().indexOf( 'August 25 2013' ) > 0, 'Correct date is displayed' );

		window.moment = oldMoment;
	} );

	QUnit.test( 'Date formatting', 1, function ( assert ) {
		var $qf = $( '#qunit-fixture' ),
			panel = new mw.mmv.ui.MetadataPanel( $qf, $( '<div>' ).appendTo( $qf ) ),
			date1 = 'Garbage',
			result = panel.formatDate( date1 );

		assert.strictEqual( result, date1, 'Invalid date is correctly ignored' );
	} );
}( mediaWiki, jQuery ) );
