( function ( $ ) {
	var LIP, lightboxHooks;

	/**
	 * @class
	 * @constructor
	 */
	function LightboxInterface() {
		lightboxHooks = window.lightboxHooks;

		function handleFullscreenChange() {
			// If we're no longer in fullscreen mode, make sure
			if ( !lbinterface.fullscreenButtonJustPressed &&
					!document.fullscreenElement &&
					!document.mozFullScreenElement &&
					!document.webkitFullScreenElement ) {
				lbinterface.fullscreen();
			} else if ( lbinterface.fullscreenButtonJustPressed ) {
				lbinterface.fullscreenButtonJustPressed = false;
			}
		}

		var result,
			addToPre = [],
			addToPost = [],
			lbinterface = this;

		this.$overlay = $( '<div>' )
			.addClass( 'mlb-overlay' );

		this.$wrapper = $( '<div>' )
			.addClass( 'mlb-wrapper' );

		this.$main = $( '<div>' )
			.addClass( 'mlb-main' );

		this.$imageDiv = $( '<div>' )
			.addClass( 'mlb-image' );

		this.$preDiv = $( '<div>' )
			.addClass( 'mlb-pre-image' );
		result = lightboxHooks.callAll( 'addToPreDiv', this, addToPre );
		this.setupPreDiv( result, addToPre );

		this.$postDiv = $( '<div>' )
			.addClass( 'mlb-post-image' );
		result = lightboxHooks.callAll( 'addToPostDiv', this, addToPost );
		this.setupPostDiv( result, addToPost );

		this.$main.append(
			this.$preDiv,
			this.$imageDiv,
			this.$postDiv
		);

		this.$wrapper.append(
			this.$main
		);

		lightboxHooks.callAll( 'modifyInterface', this );

		window.addEventListener( 'keyup', function ( e ) {
			if ( e.keyCode === 27 ) {
				// Escape button pressed
				lbinterface.unattach();
				if ( lbinterface.isFullScreen ) {
					lbinterface.fullscreen();
				}
			}
		} );

		window.addEventListener( 'fullscreenchange', handleFullscreenChange );
		window.addEventListener( 'mozfullscreenchange', handleFullscreenChange );
		window.addEventListener( 'webkitfullscreenchange', handleFullscreenChange );
	}

	LIP = LightboxInterface.prototype;

	LIP.empty = function () {
		this.$imageDiv.empty();

		lightboxHooks.callAll( 'clearInterface', this );
	};

	LIP.attach = function () {
		$( document.body )
			.append(
				this.$wrapper,
				this.$overlay
			);
	};

	LIP.unattach = function () {
		this.$wrapper.detach();
		this.$overlay.detach();
	};

	LIP.fullscreen = function () {
		var fullscreen;

		if ( this.isFullScreen ) {
			if ( !document.fullscreenElement &&
					!document.mozFullScreenElement &&
					!document.webkitFullScreenElement ) {
				if ( document.cancelFullScreen ) {
					document.cancelFullScreen();
				} else if ( document.mozCancelFullScreen ) {
					document.mozCancelFullScreen();
				} else if ( document.webkitCancelFullScreen ) {
					document.webkitCancelFullScreen();
				}
			}

			this.$wrapper.html( this.$main.detach() );
			this.$fullscreen = this.$fullscreen.detach();

			lightboxHooks.callAll( 'defullscreen', this );
		} else {
			this.$fullscreen = this.$fullscreen || $( '<div>' )
				.addClass( 'mlb-fullscreen-div' );

			this.$fullscreen.html( this.$main.detach() );

			this.$wrapper.append( this.$fullscreen );

			fullscreen = this.$fullscreen[0];
			if ( fullscreen.requestFullScreen ) {
				fullscreen.requestFullScreen();
			} else if ( fullscreen.mozRequestFullScreen ) {
				fullscreen.mozRequestFullScreen();
			} else if ( fullscreen.webkitRequestFullScreen ) {
				fullscreen.webkitRequestFullScreen();
			}

			lightboxHooks.callAll( 'fullscreen', this );
		}

		this.isFullScreen = !this.isFullScreen;
	};

	LIP.load = function ( image ) {
		var ele = image.getImageElement( function () {
				iface.$image = $( ele );
				iface.$imageDiv.append( iface.$image );
				image.globalMaxWidth = iface.$image.width();
				image.globalMaxHeight = iface.$image.height();
				image.autoResize( ele, iface.isFullScreen ? 0.9 : 0.5 );

				window.addEventListener( 'resize', function () {
					var result = lightboxHooks.callAll( 'imageResize', iface );

					if ( result !== false ) {
						image.autoResize( iface.$image.get( 0 ), iface.isFullScreen ? 0.9 : 0.5 );
					}
				} );

				lightboxHooks.callAll( 'imageLoaded', iface );
			} ),
			iface = this;

		this.currentImage = image;
	};

	LIP.replaceImageWith = function ( imageEle ) {
		var $image = $( imageEle );

		this.currentImage.src = imageEle.src;

		this.$image.replaceWith( $image );
		this.$image = $image;

		this.currentImage.globalMaxWidth = this.$image.width();
		this.currentImage.globalMaxHeight = this.$image.height();
		this.currentImage.autoResize( imageEle, this.isFullScreen ? 0.9 : 0.5 );
	};

	LIP.setupPreDiv = function ( buildDefaults, toAdd ) {
		var lbinterface = this;

		if ( buildDefaults ) {
			this.$controlBar = $( '<div>' )
				.addClass( 'mlb-controls' );

			this.$closeButton = $( '<div>' )
				.text( ' ' )
				.addClass( 'mlb-close' )
				.click( function () {
					lbinterface.unattach();
				} );

			this.$fullscreenButton = $( '<div>' )
				.text( ' ' )
				.addClass( 'mlb-fullscreen' )
				.click( function () {
					lbinterface.fullscreenButtonJustPressed = true;
					lbinterface.fullscreen();
				} );

			this.$controlBar.append(
				this.$closeButton,
				this.$fullscreenButton
			);

			this.$preDiv.append( this.$controlBar );

			lightboxHooks.callAll( 'modifyDefaultPreDiv', this );
		}

		this.addElementsToDiv( this.$preDiv, toAdd );
	};

	LIP.setupPostDiv = function ( buildDefaults, toAdd ) {
		if ( buildDefaults ) {
			lightboxHooks.callAll( 'modifyDefaultPostDiv', this );
		}

		this.addElementsToDiv( this.$postDiv, toAdd );
	};

	LIP.addElementsToDiv = function ( $div, toAdd ) {
		var i;

		for ( i = 0; i < toAdd.length; i++ ) {
			$div.append( toAdd[i] );
		}
	};

	window.LightboxInterface = LightboxInterface;
}( jQuery ) );
