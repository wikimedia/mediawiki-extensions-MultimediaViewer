( function () {
	var MLBP;

	/**
	 * @class mlb.MultiLightbox
	 * @constructor
	 * @param {number} [start=0]
	 * @param {Function} [InterfaceClass] type of interface to use
	 */
	function MultiLightbox( start, InterfaceClass ) {
		this.currentIndex = start || 0;
		this.onInterfaceReady = [];
		this.initializeInterface( InterfaceClass );
		this.interfaceReady();
	}

	MLBP = MultiLightbox.prototype;

	/**
	 * Instantiates and initializes the interface object
	 * @param {Function} [InterfaceClass] type of interface to use
	 */
	MLBP.initializeInterface = function ( InterfaceClass ) {
		InterfaceClass = InterfaceClass || window.LightboxInterface;
		this.iface = new InterfaceClass();
	};

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

	MLBP.open = function () {
		this.iface.empty();
		this.iface.attach();
	};

	window.MultiLightbox = MultiLightbox;
}() );
