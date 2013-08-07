( function ( $ ) {
	var lightboxHooks, MLBP, HRP;

	/**
	 * @class
	 * @constructor
	 * @param {LightboxImage[]} images
	 * @param {number} [start=0]
	 */
	function MultiLightbox( images, start ) {
		var lightbox = this;

		this.images = images;
		this.currentIndex = start || 0;
		this.onInterfaceReady = [];

		$( function () {
			lightbox.iface = new LightboxInterface();
			lightbox.interfaceReady();
		} );
	}

	MLBP = MultiLightbox.prototype;

	MLBP.onInterface = function ( func ) {
		if ( this.onInterfaceReady !== undefined ) {
			this.onInterfaceReady.push( func );
		} else {
			func();
		}
	};

	MLBP.interfaceReady = function () {
		var i;

		for ( i = 0; i < this.onInterfaceReady.length; i++ ) {
			this.onInterfaceReady[i]();
		}

		this.onInterfaceReady = undefined;
	};

	MLBP.next = function () {
		var result;

		if ( this.currentIndex >= this.images.length - 1 ) {
			result = lightboxHooks.callAll( 'noNextImage', this );

			if ( result === true ) {
				return;
			}
		}

		result = lightboxHooks.callAll( 'nextImage', this );

		if ( result === true ) {
			this.iface.load( this.images[++this.currentIndex] );
		}
	};

	MLBP.prev = function () {
		var result;

		if ( this.currentIndex <= 0 ) {
			result = lightboxHooks.callAll( 'noPrevImage', this );

			if ( result === true ) {
				return;
			}
		}

		result = lightboxHooks.callAll( 'prevImage', this );

		if ( result === true ) {
			this.iface.load( this.images[--this.currentIndex] );
		}
	};

	MLBP.open = function () {
		this.iface.attach();
		this.iface.load( this.images[this.currentIndex] );
	};

	/**
	 * @class
	 * Simple hook registry
	 * @constructor
	 */
	function LightboxHookRegistry() {
		this.hooks = {};
	}

	HRP = LightboxHookRegistry.prototype;

	/**
	 * Call all hooks of a type, with the provided arguments.
	 * @param {string} type
	 * @param {Mixed} thisArg
	 * @return {boolean} true if all hooks ran, false if one of them is overriding the default behaviour
	 */
	HRP.callAll = function ( type, thisArg ) {
		var result, i,
			hooks = this.hooks[type],
			otherArgs = Array.prototype.slice.call( arguments, 2 );

		if ( hooks !== undefined ) {
			for ( i = 0; i < hooks.length; i++ ) {
				result = hooks[i].apply( thisArg, otherArgs );
				if ( result === false ) {
					return false;
				}
			}
		}

		return true;
	};

	/**
	 * Register a hook of a type.
	 * @param {string} type
	 * @param {Function} hook
	 */
	HRP.register = function ( type, hook ) {
		if ( this.hooks[type] === undefined ) {
			this.hooks[type] = [];
		}

		this.hooks[type].push( hook );
	};

	lightboxHooks = new LightboxHookRegistry();

	window.lightboxHooks = lightboxHooks;
	window.MultiLightbox = MultiLightbox;
}( jQuery ) );
