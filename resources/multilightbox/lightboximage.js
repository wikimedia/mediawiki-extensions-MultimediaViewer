( function ( $ ) {
	/**
	 * @class mlb.LightboxImage
	 * @constructor
	 * @param {string} src The URL (possibly relative) to the image
	 */
	function LightboxImage( src ) {
		this.src = src;
	}

	var LIP = LightboxImage.prototype;

	/**
	 * The URL of the image (in the size we intend use to display the it in the lightbox)
	 * @type {String}
	 * @protected
	 */
	LIP.src = null;

	/**
	 * The URL of a placeholder while the image loads. Typically a smaller version of the image, which is already
	 * loaded in the browser.
	 * @type {String}
	 * @return {jQuery.Promise.<mlb.LightboxImage, HTMLImageElement>}
	 * @protected
	 */
	LIP.initialSrc = null;

	LIP.getImageElement = function () {
		var ele,
			$deferred = $.Deferred(),
			image = this;

		ele = new Image();
		ele.addEventListener( 'error', $deferred.reject );
		ele.addEventListener( 'load', function() { $deferred.resolve( image, ele ); } );

		if ( this.src !== this.initialSrc ) {
			ele.src = this.src;
		} else {
			// Don't display the thumb, pretend that we did load the image
			// This is a workaround until we decide whether we want to display a nicer version of the thumb or not
			$deferred.resolve( image, ele );
		}

		return $deferred;
	};

	// Assumes that the parent element's size is the maximum size.
	LIP.autoResize = function ( ele, $parent ) {
		function updateRatios() {
			if ( imgHeight ) {
				imgHeightRatio = parentHeight / imgHeight;
			}

			if ( imgWidth ) {
				imgWidthRatio = parentWidth / imgWidth;
			}
		}

		var imgWidthRatio, imgHeightRatio, parentWidth, parentHeight,
			$img = $( ele ),
			imgWidth = $img.width(),
			imgHeight = $img.height();

		$parent = $parent || $img.parent();
		parentWidth = $parent.width();
		parentHeight = $parent.height();

		if ( this.globalMaxWidth && parentWidth > this.globalMaxWidth ) {
			parentWidth = this.globalMaxWidth;
		}

		if ( this.globalMaxHeight && parentHeight > this.globalMaxHeight ) {
			parentHeight = this.globalMaxHeight;
		}

		updateRatios();

		if ( imgWidth > parentWidth ) {
			imgHeight *= imgWidthRatio || 1;
			imgWidth = parentWidth;
			updateRatios();
		}

		if ( imgHeight > parentHeight ) {
			imgWidth *= imgHeightRatio || 1;
			imgHeight = parentHeight;
			updateRatios();
		}

		if ( imgWidth < parentWidth && imgHeight < parentHeight ) {
			if ( imgWidth === 0 && imgHeight === 0 ) {
				// Only set one
				imgWidth = parentWidth;
				imgHeight = null;
			} else {
				if ( imgHeightRatio > imgWidthRatio ) {
					imgWidth *= imgHeightRatio;
					imgHeight = parentHeight;
				} else {
					imgHeight *= imgWidthRatio;
					imgWidth = parentWidth;
				}
				updateRatios();
			}
		}

		$img.width( imgWidth ).height( imgHeight );
	};

	window.LightboxImage = LightboxImage;
}( jQuery ) );
