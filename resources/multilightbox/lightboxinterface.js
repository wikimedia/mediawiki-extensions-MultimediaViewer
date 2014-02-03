( function ( $ ) {
	var LIP, lightboxHooks;

	/**
	 * @class mlb.LightboxInterface
	 * @constructor
	 */
	function LightboxInterface() {
		lightboxHooks = window.lightboxHooks;

		var result,
			addToPre = [],
			addToPost = [],
			lbinterface = this;

		// Staging area for image resizes
		this.$staging = $( '<div>' )
			.addClass( 'mlb-staging-area' );
		$( document.body ).append( this.$staging );

		this.$overlay = $( '<div>' )
			.addClass( 'mlb-overlay' );

		this.$wrapper = $( '<div>' )
			.addClass( 'mlb-wrapper' );

		this.$main = $( '<div>' )
			.addClass( 'mlb-main' );

		this.$imageDiv = $( '<div>' )
			.addClass( 'mlb-image' );

		// I blame CSS for this
		this.$innerWrapper = $( '<div>' )
			.addClass( 'mlb-image-inner-wrapper' )
			.append( this.$imageDiv );

		this.$imageWrapper = $( '<div>' )
			.addClass( 'mlb-image-wrapper' )
			.append( this.$innerWrapper );

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
			this.$imageWrapper,
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
			}
		} );
	}

	LIP = LightboxInterface.prototype;

	/**
	 * The currently selected LightboxImage.
	 * @type {mlb.LightboxImage}
	 * @protected
	 */
	LIP.currentImage = null;

	LIP.empty = function () {
		this.$imageDiv.empty();

		lightboxHooks.callAll( 'clearInterface', this );

		if ( this.resizeListener ) {
			window.removeEventListener( 'resize', this.resizeListener );
		}
	};

	/**
	 * Attaches interface to document or given parent id.
	 *
	 * @param {string} [parentId] parent id where we want to attach the UI. Mainly for testing.
	 */
	LIP.attach = function ( parentId ) {
		var lbinterface = this,
			$parent;

		// Re-appending the same content can have nasty side-effects
		// Such as the browser leaving fullscreen mode if the fullscreened element is part of it
		if ( this.currentlyAttached ) {
			return;
		}

		$( document ).on( 'jq-fullscreen-change.lip', function( e ) {
			lbinterface.fullscreenChange( e );
		} );

		$parent = $( parentId || document.body );

		// Clean up fullscreen data because hard-existing fullscreen might have left
		// jquery.fullscreen unable to remove the class and attribute, since $main wasn't
		// attached to the DOM anymore at the time the jq-fullscreen-change event triggered
		this.$main.data( 'isFullscreened', false ).removeClass( 'jq-fullscreened' );
		this.isFullscreen = false;

		$parent
			.append(
				this.$wrapper,
				this.$overlay
			);
		this.currentlyAttached = true;
	};

	/**
	 * Unattaches interface from parent element. Calls global lightboxHooks.
	 */
	LIP.unattach = function () {
		// TODO(aarcos): This is global and it breaks tests.
		lightboxHooks.callAll( 'closeInterface', this );

		$( document ).off( 'jq-fullscreen-change.lip' );

		this.$wrapper.detach();
		this.$overlay.detach();

		this.currentlyAttached = false;
	};

	/**
	 * Resize callback
	 * @protected
	 */
	LIP.resizeCallback = function() {
		if ( this.currentlyAttached ) {
			var result = lightboxHooks.callAll( 'imageResize', this );

			if ( result !== false ) {
				this.autoResizeImage();
			}
		}
	};

	/**
	 * Load callback
	 * @protected
	 */
	LIP.loadCallback = function ( image, ele ) {
		var iface = this;

		image.globalMaxWidth = ele.width;
		image.globalMaxHeight = ele.height;
		this.$image = $( ele );

		this.autoResizeImage();

		// Capture listener so we can remove it later, otherwise
		// we are going to leak listeners !
		this.resizeListener = function () { iface.resizeCallback(); };

		window.addEventListener( 'resize', this.resizeListener );

		lightboxHooks.callAll( 'imageLoaded', this );
	};

	/**
	 * Loads the image, then calls the load callback of the interface.
	 * @param {mlb.LightboxImage} image
	 */
	LIP.load = function ( image ) {
		var iface = this;

		this.currentImage = image;

		image.getImageElement().done( function( image, ele ) {
			iface.loadCallback.call( iface, image, ele );
		} );
	};

	LIP.autoResizeImage = function () {
		this.$staging.append( this.$image );
		this.currentImage.autoResize( this.$image.get( 0 ), this.$imageDiv );
		this.$imageDiv.append( this.$image );
	};

	/**
	 * Changes what image is being displayed.
	 * @param {HTMLImageElement} imageEle
	 */
	LIP.replaceImageWith = function ( imageEle ) {
		var $image = $( imageEle );

		this.currentImage.src = imageEle.src;

		this.$image.replaceWith( $image );
		this.$image = $image;

		this.currentImage.globalMaxWidth = this.$image.width();
		this.currentImage.globalMaxHeight = this.$image.height();
		this.currentImage.autoResize( imageEle );
	};

	LIP.exitFullscreen = function () {
		this.fullscreenButtonJustPressed = true;
		this.$main.exitFullscreen();
	};

	LIP.enterFullscreen = function () {
		this.$main.enterFullscreen();
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
					if ( lbinterface.isFullscreen ) {
						lbinterface.exitFullscreen();
					} else {
						lbinterface.enterFullscreen();
					}
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

	LIP.fullscreenChange = function ( e ) {
		this.isFullscreen = e.fullscreen;

		lightboxHooks.callAll( 'fullscreen', e.element, e.fullscreen );

		if ( !this.fullscreenButtonJustPressed && !e.fullscreen ) {
			// Close the interface all the way if the user pressed 'esc'
			this.unattach();
		} else if ( this.fullscreenButtonJustPressed ) {
			this.fullscreenButtonJustPressed = false;
		}
	};

	window.LightboxInterface = LightboxInterface;
}( jQuery ) );
