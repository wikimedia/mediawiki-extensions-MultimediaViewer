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

	QUnit.test( 'Setting repository information in the UI works as expected', 3, function ( assert ) {
		var $qf = $( '#qunit-fixture' ),
			panel = new mw.mmv.ui.MetadataPanel( $qf, $( '<div>' ).appendTo( $qf ), window.localStorage, new mw.mmv.Config( {}, mw.config, mw.user, new mw.Api(), window.localStorage ) ),
			repoInfo = new mw.mmv.model.Repo( 'Example Wiki' );

		panel.setRepoDisplay( repoInfo );
		assert.strictEqual( panel.$repo.text(), 'More details about this file on Example Wiki', 'Text set to something useful for remote wiki - if this fails it might be because of localisation' );

		repoInfo = new mw.mmv.model.Repo();
		panel.setRepoDisplay( repoInfo );
		assert.strictEqual( panel.$repo.text(), 'More details about this file on ' + mw.config.get( 'wgSiteName' ), 'Text set to something useful for local wiki - if this fails it might be because of localisation' );

		panel.setFilePageLink( 'https://commons.wikimedia.org/wiki/File:Foobar.jpg' );
		assert.strictEqual( panel.$repo.prop( 'href' ), 'https://commons.wikimedia.org/wiki/File:Foobar.jpg', 'The file link was set successfully.' );
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

	QUnit.test( 'Setting image information works as expected', 18, function ( assert ) {
		var gender,
			$qf = $( '#qunit-fixture' ),
			panel = new mw.mmv.ui.MetadataPanel( $qf, $( '<div>' ).appendTo( $qf ), window.localStorage, new mw.mmv.Config( {}, mw.config, mw.user, new mw.Api(), window.localStorage ) ),
			title = 'Foo bar',
			image = {
				filePageTitle : mw.Title.newFromText( 'File:' + title + '.jpg' )
			},
			imageData = {
				title: image.filePageTitle,
				url: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg',
				descriptionUrl: 'https://commons.wikimedia.org/wiki/File:Foobar.jpg',
				hasCoords: function() { return false; }
			},
			repoData = {
				getArticlePath : function() { return 'Foo'; },
				isCommons: function() { return false; }
			},
			oldMoment = window.moment;

		/*window.moment = function( date ) {
			// This has no effect for now, since writing this test revealed that our moment.js
			// doesn't have any language configuration
			return oldMoment( date ).lang( 'fr' );
		};*/

		panel.setImageInfo( image, imageData, repoData, gender );

		assert.strictEqual( panel.$title.text(), title, 'Title is correctly set' );
		assert.ok( panel.$credit.hasClass( 'empty' ), 'Credit is empty' );
		assert.strictEqual( panel.$license.prop( 'href' ), imageData.descriptionUrl,
			'User is directed to file page for license information' );
		assert.ok( !panel.$license.prop( 'target' ), 'License information opens in same window' );
		assert.ok( panel.$usernameLi.hasClass( 'empty' ), 'Username is empty' );
		assert.ok( panel.$datetimeLi.hasClass( 'empty' ), 'Date/Time is empty' );
		assert.ok( panel.$locationLi.hasClass( 'empty' ), 'Location is empty' );

		imageData.creationDateTime = '2013-08-26T14:41:02Z';
		imageData.uploadDateTime = '2013-08-25T14:41:02Z';
		imageData.source = '<b>Lost</b><a href="foo">Bar</a>';
		imageData.author = 'Bob';
		imageData.license = new mw.mmv.model.License( 'CC-BY-2.0', 'cc-by-2.0',
			'Creative Commons Attribution - Share Alike 2.0',
			'http://creativecommons.org/licenses/by-sa/2.0/' );
		gender = 'female';
		imageData.lastUploader = 'Ursula';

		panel.setImageInfo( image, imageData, repoData, gender );

		assert.strictEqual( panel.$title.text(), title, 'Title is correctly set' );
		assert.ok( !panel.$credit.hasClass( 'empty' ), 'Credit is not empty' );
		assert.ok( !panel.$datetimeLi.hasClass( 'empty' ), 'Date/Time is not empty' );
		assert.strictEqual( panel.creditField.$element.find( '.mw-mmv-author' ).text(), imageData.author, 'Author text is correctly set' );
		assert.strictEqual( panel.creditField.$element.find( '.mw-mmv-source' ).html(), 'Lost<a href="foo">Bar</a>', 'Source text is correctly set' );
		assert.strictEqual( panel.creditField.$element.attr( 'original-title' ), 'Author and source information', 'Source tooltip is correctly set' );
		assert.ok( panel.$datetime.text().indexOf( 'August 26, 2013' ) > 0, 'Correct date is displayed' );
		assert.strictEqual( panel.$license.text(), 'CC BY 2.0', 'License is correctly set' );
		assert.ok( panel.$license.prop( 'target' ), 'License information opens in new window' );
		assert.ok( panel.$username.text().indexOf( imageData.lastUploader ) > 0, 'Correct username is displayed' );

		imageData.creationDateTime = undefined;
		panel.setImageInfo( image, imageData, repoData, gender );

		assert.ok( panel.$datetime.text().indexOf( 'August 25, 2013' ) > 0, 'Correct date is displayed' );

		window.moment = oldMoment;
	} );

	QUnit.test( 'Setting permission information works as expected', 1, function ( assert ) {
		var $qf = $( '#qunit-fixture' ),
			panel = new mw.mmv.ui.MetadataPanel( $qf, $( '<div>' ).appendTo( $qf ), window.localStorage, new mw.mmv.Config( {}, mw.config, mw.user, new mw.Api(), window.localStorage ) );

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

	QUnit.test( 'Repo icon', 4, function ( assert ) {
		var $qf = $( '#qunit-fixture' ),
			panel = new mw.mmv.ui.MetadataPanel( $qf, $( '<div>' ).appendTo( $qf ), window.localStorage, new mw.mmv.Config( {}, mw.config, mw.user, new mw.Api(), window.localStorage ) ),
			favIcon = 'http://example.com/foo-fav',
			repoData = {
				favIcon: favIcon,
				getArticlePath : function() { return 'Foo'; },
				isCommons: function() { return false; }
			};

		panel.setRepoDisplay( repoData );

		assert.ok( panel.$repoLi.css( 'background-image' ).indexOf( favIcon ) !== -1, 'Repo favicon is correctly applied' );
		assert.ok( !panel.$repoLi.hasClass( 'commons' ), 'Repo does not have commons class' );

		repoData.isCommons = function() { return true; };

		panel.setRepoDisplay( repoData );

		assert.ok( panel.$repoLi.css( 'background-image' ).indexOf( 'data:image/svg+xml' ) !== -1, 'Repo favicon is correctly replaced by svg for Commons' );
		assert.ok( panel.$repoLi.hasClass( 'commons' ), 'Repo has commons class' );
	} );

	QUnit.test( 'About links', 9, function ( assert ) {
		var panel,
			$qf = $( '#qunit-fixture'),
			oldWgMediaViewerIsInBeta = mw.config.get( 'wgMediaViewerIsInBeta' );

		this.sandbox.stub( mw.user, 'isAnon' );
		mw.config.set( 'wgMediaViewerIsInBeta', false );
		panel = new mw.mmv.ui.MetadataPanel( $qf.empty(), $( '<div>' ).appendTo( $qf ), window.localStorage, new mw.mmv.Config( {}, mw.config, mw.user, new mw.Api(), window.localStorage ) );

		assert.strictEqual( $qf.find( '.mw-mmv-about-link' ).length, 1, 'About link is created.' );
		assert.strictEqual( $qf.find( '.mw-mmv-discuss-link' ).length, 1, 'Discuss link is created.' );
		assert.strictEqual( $qf.find( '.mw-mmv-help-link' ).length, 1, 'Help link is created.' );
		assert.strictEqual( $qf.find( '.mw-mmv-optout-link' ).length, 1, 'Opt-out link is created.' );
		assert.strictEqual( $qf.find( '.mw-mmv-preference-link' ).length, 0, 'Preferences link is not created when not in beta.' );

		mw.config.set( 'wgMediaViewerIsInBeta', true );

		mw.user.isAnon.returns( false );
		panel = new mw.mmv.ui.MetadataPanel( $qf.empty(), $( '<div>' ).appendTo( $qf ), window.localStorage, new mw.mmv.Config( {}, mw.config, mw.user, new mw.Api(), window.localStorage ) );
		assert.strictEqual( $qf.find( '.mw-mmv-optout-link' ).length, 0, 'Opt-out link is not created when in beta.' );
		assert.strictEqual( $qf.find( '.mw-mmv-preference-link' ).length, 1, 'Preferences link is created for logged-in user.' );

		mw.user.isAnon.returns( true );
		panel = new mw.mmv.ui.MetadataPanel( $qf.empty(), $( '<div>' ).appendTo( $qf ), window.localStorage, new mw.mmv.Config( {}, mw.config, mw.user, new mw.Api(), window.localStorage ) );
		assert.strictEqual( $qf.find( '.mw-mmv-optout-link' ).length, 0, 'Opt-out link is not created when in beta.' );
		assert.strictEqual( $qf.find( '.mw-mmv-preference-link' ).length, 0, 'Preferences link is not created for anon user.' );

		mw.config.set( 'wgMediaViewerIsInBeta', oldWgMediaViewerIsInBeta );
	} );

	QUnit.test( 'About links', 12, function ( assert ) {
		var panel,
			deferred,
			$qf = $( '#qunit-fixture' ),
			config = {
				isMediaViewerEnabledOnClick: this.sandbox.stub(),
				setMediaViewerEnabledOnClick: this.sandbox.stub(),
				canSetMediaViewerEnabledOnClick: this.sandbox.stub()
			},
			oldWgMediaViewerIsInBeta = mw.config.get( 'wgMediaViewerIsInBeta' );

		this.sandbox.stub( mw.user, 'isAnon' );
		this.sandbox.stub( mw.mmv.actionLogger, 'log' );
		this.sandbox.stub( $.fn, 'tipsy' ).returnsThis(); // interferes with the fake clock in other tests
		mw.config.set( 'wgMediaViewerIsInBeta', false );
		panel = new mw.mmv.ui.MetadataPanel( $qf, $( '<div>' ).appendTo( $qf ), window.localStorage, new mw.mmv.Config( {}, mw.config, mw.user, new mw.Api(), window.localStorage ) );
		panel.config = config;

		// FIXME should not do work in the constructor
		panel.$mmvOptOutLink.remove();
		panel.$mmvOptOutLink = undefined;
		config.canSetMediaViewerEnabledOnClick.returns( false );
		panel.initializePreferenceLinks();
		assert.strictEqual( $qf.find( '.mw-mmv-optout-link' ).length, 0, 'Optout link is hidden when option cannot be set' );

		config.canSetMediaViewerEnabledOnClick.returns( true );
		config.isMediaViewerEnabledOnClick.returns( true );
		panel.initializePreferenceLinks();
		assert.ok( $qf.find( '.mw-mmv-optout-link' ).text().match( /disable/i ), 'Optout link is visible when MediaViewer can be disabled' );

		deferred = $.Deferred();
		config.setMediaViewerEnabledOnClick.returns( deferred );

		mw.user.isAnon.returns( true );
		$qf.find( '.mw-mmv-optout-link' ).click();
		assert.ok( config.setMediaViewerEnabledOnClick.calledWith( false ), 'When MediaViewer is active, it is disabled on click' );
		assert.ok( $qf.find( '.mw-mmv-optout-link' ).is( '.pending' ), 'Pending class is set while disabling in progress' );

		config.setMediaViewerEnabledOnClick.reset();
		$qf.find( '.mw-mmv-optout-link' ).click();
		assert.ok( !config.setMediaViewerEnabledOnClick.called, 'click has no effect when another request is pending' );
		deferred.resolve();
		assert.ok( !$qf.find( '.mw-mmv-optout-link' ).is( '.pending' ), 'Pending class removed after change has finished' );

		assert.ok( mw.mmv.actionLogger.log.called, 'The optout action is logged' );
		assert.strictEqual( mw.mmv.actionLogger.log.firstCall.args[0], 'optout-anon' , 'The correct event is logged' );

		config.isMediaViewerEnabledOnClick.returns( false );
		mw.user.isAnon.returns( false );
		panel.initializePreferenceLinks();
		assert.ok( $qf.find( '.mw-mmv-optout-link' ).text().match( /enable/i ), 'Optin link is visible when MediaViewer can be enabled' );

		mw.mmv.actionLogger.log.reset();
		config.setMediaViewerEnabledOnClick.reset();
		config.setMediaViewerEnabledOnClick.returns( deferred );
		$qf.find( '.mw-mmv-optout-link' ).click();
		assert.ok( config.setMediaViewerEnabledOnClick.calledWith( true ), 'When MediaViewer is inactive, it is enabled on click' );
		assert.ok( mw.mmv.actionLogger.log.called, 'The optin action is logged' );
		assert.ok( mw.mmv.actionLogger.log.firstCall.args[0], 'optin-loggedin', 'The correct event is logged' );

		mw.config.set( 'wgMediaViewerIsInBeta', oldWgMediaViewerIsInBeta );
	} );
}( mediaWiki, jQuery ) );
