( function ( $ ) {
	/**
	 * @class
	 * @constructor
	 * @param {string} src The URL (possibly relative) to the image
	 */
	function LightboxImage( src ) {
		this.src = src;

		lightboxHooks.callAll( 'modifyImageObject', this );
	}

	var LIP = LightboxImage.prototype;

	LIP.getImageElement = function ( loadcb ) {
		var ele;

		lightboxHooks.callAll( 'beforeFetchImage', this );

		ele = new Image();
		ele.addEventListener( 'load', loadcb );
		ele.src = this.src;

		lightboxHooks.callAll( 'modifyImageElement', ele );

		return ele;
	};

	LIP.autoResize = function ( ele ) {
		function updateRatios() {
			if ( imgHeight ) {
				imgHeightRatio = imgMaxHeight / imgHeight;
			}

			if ( imgWidth ) {
				imgWidthRatio = imgMaxWidth / imgWidth;
			}
		}

		var imgWidthRatio, imgHeightRatio,
			$window = $( window ),
			winWidth = $window.width(),
			winHeight = $window.height(),
			$img = $( ele ),
			imgMaxWidth = winWidth * 0.5,
			imgMaxHeight = winHeight * 0.5,
			imgWidth = $img.width(),
			imgHeight = $img.height();

		if ( this.globalMaxWidth && imgMaxWidth > this.globalMaxWidth ) {
			imgMaxWidth = this.globalMaxWidth;
		}

		if ( this.globalMaxHeight && imgMaxHeight > this.globalMaxHeight ) {
			imgMaxHeight = this.globalMaxHeight;
		}

		updateRatios();

		if ( imgWidth > imgMaxWidth ) {
			imgHeight *= imgWidthRatio || 1;
			imgWidth = imgMaxWidth;
			updateRatios();
		}

		if ( imgHeight > imgMaxHeight ) {
			imgWidth *= imgHeightRatio || 1;
			imgHeight = imgMaxHeight;
			updateRatios();
		}

		if ( imgWidth < imgMaxWidth && imgHeight < imgMaxHeight ) {
			if ( imgWidth === 0 && imgHeight === 0 ) {
				// Only set one
				imgWidth = imgMaxWidth;
				imgHeight = null;
			} else {
				if ( imgHeightRatio > imgWidthRatio ) {
					imgWidth *= imgHeightRatio;
					imgHeight = imgMaxHeight;
				} else {
					imgHeight *= imgWidthRatio;
					imgWidth = imgMaxWidth;
				}
				updateRatios();
			}
		}

		$img.width( imgWidth ).height( imgHeight );
	};

	window.LightboxImage = LightboxImage;
}( jQuery ) );
