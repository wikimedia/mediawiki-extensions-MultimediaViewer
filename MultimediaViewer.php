<?php
/*
 * This file is part of the MediaWiki extension MultimediaViewer.
 *
 * MultimediaViewer is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * MultimediaViewer is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with MultimediaViewer.  If not, see <http://www.gnu.org/licenses/>.
 *
 * @file
 * @ingroup extensions
 * @author Mark Holmquist <mtraceur@member.fsf.org>
 * @copyright Copyright © 2013, Mark Holmquist
 */
if ( !isset( $wgNetworkPerformanceSamplingFactor ) ) {
	/** @var int|bool: If set, records image load network performance via EventLogging once per this many requests. False if unset. **/
	$wgNetworkPerformanceSamplingFactor = false;
}

if ( !isset( $wgMediaViewerDurationLoggingSamplingFactor ) ) {
	/**
	 * If set, records loading times via EventLogging. A value of 1000 means there will be an
	 * 1:1000 chance to log the duration event.
	 * False if unset.
	 * @var int|bool
	 */
	$wgMediaViewerDurationLoggingSamplingFactor = false;
}

if ( !isset( $wgMediaViewerDurationLoggingLoggedinSamplingFactor ) ) {
	/**
	 * If set, records loading times via EventLogging with factor specific to loggedin users.
	 * A value of 1000 means there will be an 1:1000 chance to log the duration event.
	 * False if unset.
	 * @var int|bool
	 */
	$wgMediaViewerDurationLoggingLoggedinSamplingFactor = false;
}

if ( !isset( $wgMediaViewerAttributionLoggingSamplingFactor ) ) {
	/**
	 * If set, records whether image attribution data was available. A value of 1000 means there will be an
	 * 1:1000 chance to log the attribution event.
	 * False if unset.
	 * @var int|bool
	 */
	$wgMediaViewerAttributionLoggingSamplingFactor = false;
}

if ( !isset( $wgMediaViewerDimensionLoggingSamplingFactor ) ) {
	/**
	 * If set, records whether image dimension data was available. A value of 1000 means there will be an
	 * 1:1000 chance to log the dimension event.
	 * False if unset.
	 * @var int|bool
	 */
	$wgMediaViewerDimensionLoggingSamplingFactor = false;
}

if ( !isset( $wgMediaViewerActionLoggingSamplingFactorMap ) ) {
	/**
	 * If set, records user actions via EventLogging and applies a sampling factor according to the map. A "default" key in the map must be set.
	 * False if unset.
	 * @var array|bool
	 */
	$wgMediaViewerActionLoggingSamplingFactorMap = false;
}

if ( !isset( $wgMediaViewerIsInBeta ) ) {
	/** @var bool: If set, Media Viewer will try to use BetaFeatures. False if unset. **/
	$wgMediaViewerIsInBeta = false;
}

if ( !isset( $wgMediaViewerUseThumbnailGuessing ) ) {
	/**
	 * When this is enabled, MediaViewer will try to guess image URLs instead of making an
	 * imageinfo API to get them from the server. This speeds up image loading, but will result in 404s
	 * when $wgGenerateThumbnailOnParse (so the thumbnails are only generated as a result of the API request).
	 * MediaViewer will catch such 404 errors and fall back to the API request, but depending on how the site
	 * is set up, the 404 might get cached, or redirected, causing the image load to fail. The safe way to
	 * use URL guessing is with a 404 handler: https://www.mediawiki.org/wiki/Manual:Thumb.php#404_Handler
	 *
	 * @var bool
	 */
	$wgMediaViewerUseThumbnailGuessing = false;
}

if ( !isset( $wgMediaViewerEnableByDefault ) ) {
	/**
	 * If trueish, and $wgMediaViewerIsInBeta is unset, Media Viewer will be turned on by default.
	 * @var bool
	 */
	$wgMediaViewerEnableByDefault = true;
}

if ( !isset( $wgMediaViewerEnableByDefaultForAnonymous ) ) {
	/**
	 * If set, overrides $wgMediaViewerEnableByDefault for anonymous users.
	 * @var bool
	 */
	$wgMediaViewerEnableByDefaultForAnonymous = $wgMediaViewerEnableByDefault;
}

if ( !isset( $wgMediaViewerImageQueryParameter ) ) {
	/**
	 * If set, adds a query parameter to image requests made by Media Viewer
	 * @var string|bool
	 */
	$wgMediaViewerImageQueryParameter = false;
}

if ( !isset( $wgMediaViewerRecordVirtualViewBeaconURI ) ) {
	/**
	 * If set, records a virtual view via the provided beacon URI.
	 * @var string|bool
	 */
	$wgMediaViewerRecordVirtualViewBeaconURI = false;
}

$wgMessagesDirs['MultimediaViewer'] = __DIR__ . '/i18n';

/**
 * @param string $path
 * @return array
 */
$wgMediaViewerResourceTemplate = array(
	'localBasePath' => __DIR__ . '/resources',
	'remoteExtPath' => 'MultimediaViewer/resources',
);

$wgResourceModules += array(
	// Loaded on demand by mmv.bootstrap.js
	'mmv' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/logging/mmv.logging.Api.js',
			'mmv/logging/mmv.logging.AttributionLogger.js',
			'mmv/logging/mmv.logging.DimensionLogger.js',
			'mmv/logging/mmv.logging.ViewLogger.js',
			'mmv/logging/mmv.logging.PerformanceLogger.js',
			'mmv/routing/mmv.routing.js',
			'mmv/routing/mmv.routing.Route.js',
			'mmv/routing/mmv.routing.ThumbnailRoute.js',
			'mmv/routing/mmv.routing.MainFileRoute.js',
			'mmv/routing/mmv.routing.Router.js',
			'mmv/model/mmv.model.js',
			'mmv/model/mmv.model.IwTitle.js',
			'mmv/model/mmv.model.License.js',
			'mmv/model/mmv.model.Image.js',
			'mmv/model/mmv.model.Repo.js',
			'mmv/model/mmv.model.Thumbnail.js',
			'mmv/model/mmv.model.User.js',
			'mmv/model/mmv.model.TaskQueue.js',
			'mmv/model/mmv.model.ThumbnailWidth.js',
			'mmv/mmv.lightboximage.js',
			'mmv/provider/mmv.provider.Api.js',
			'mmv/provider/mmv.provider.ImageInfo.js',
			'mmv/provider/mmv.provider.FileRepoInfo.js',
			'mmv/provider/mmv.provider.ThumbnailInfo.js',
			'mmv/provider/mmv.provider.GuessedThumbnailInfo.js',
			'mmv/provider/mmv.provider.UserInfo.js',
			'mmv/provider/mmv.provider.Image.js',
			'mmv/mmv.ThumbnailWidthCalculator.js',
			'mmv/ui/mmv.ui.js',
			'mmv/ui/mmv.ui.dialog.js',
			'mmv/ui/mmv.ui.reuse.dialog.js',
			'mmv/ui/mmv.ui.download.js',
			'mmv/ui/mmv.ui.download.dialog.js',
			'mmv/ui/mmv.ui.description.js',
			'mmv/ui/mmv.ui.viewingOptions.js',
			'mmv/ui/mmv.ui.canvas.js',
			'mmv/ui/mmv.ui.canvasButtons.js',
			'mmv/ui/mmv.ui.permission.js',
			'mmv/ui/mmv.ui.progressBar.js',
			'mmv/ui/mmv.ui.stripeButtons.js',
			'mmv/ui/mmv.ui.truncatableTextField.js',
			'mmv/ui/mmv.ui.metadataPanel.js',
			'mmv/ui/mmv.ui.metadataPanelScroller.js',
			'mmv/mmv.lightboxinterface.js',
			'mmv/mmv.js',
		),

		'styles' => array(
			'mmv/ui/mmv.ui.dialog.less',
			'mmv/ui/mmv.ui.reuse.dialog.less',
			'mmv/ui/mmv.ui.download.dialog.less',
			'mmv/ui/mmv.ui.viewingOptions.less',
			'mmv/ui/mmv.ui.canvas.less',
			'mmv/ui/mmv.ui.canvasButtons.less',
			'mmv/ui/mmv.ui.permission.less',
			'mmv/ui/mmv.ui.progressBar.less',
			'mmv/ui/mmv.ui.stripeButtons.less',
			'mmv/ui/mmv.ui.truncatableTextField.less',
			'mmv/ui/mmv.ui.metadataPanel.less',
			'mmv/ui/mmv.ui.metadataPanelScroller.less',
			'mmv/mmv.lightboxinterface.less',
		),

		'dependencies' => array(
			'mediawiki.api',
			'mediawiki.Title',
			'mediawiki.Uri',
			'mediawiki.jqueryMsg',
			'mediawiki.user',
			'oojs',
			'jquery.fullscreen',
			'jquery.hidpi',
			'jquery.throttle-debounce',
			'jquery.color',
			'jquery.tipsy',
			'mmv.bootstrap', // mmv.logging.Logger.js
			'mmv.head', // mmv.base.js
		),

		'messages' => array(
			'multimediaviewer-file-page',

			// messages that are gender-dependent (we need to check if they really depend on the gender):
			'multimediaviewer-userpage-link',

			// mmv.ui.viewingOptions.js
			'multimediaviewer-options-learn-more',
			'multimediaviewer-options-dialog-header',
			'multimediaviewer-option-header-viewer',
			'multimediaviewer-option-header-filepage',
			'multimediaviewer-option-desc-viewer',
			'multimediaviewer-option-desc-filepage',
			'multimediaviewer-option-submit-button',
			'multimediaviewer-option-cancel-button',
			'multimediaviewer-options-text-header',
			'multimediaviewer-enable-alert',
			'multimediaviewer-options-text-body',
			'multimediaviewer-disable-confirmation-header',
			'multimediaviewer-disable-confirmation-text',
			'multimediaviewer-enable-dialog-header',
			'multimediaviewer-enable-text-header',
			'multimediaviewer-enable-submit-button',
			'multimediaviewer-enable-confirmation-header',
			'multimediaviewer-enable-confirmation-text',
			// mmv.ui.canvas.js
			'multimediaviewer-thumbnail-error',
			'multimediaviewer-thumbnail-error-description',
			'multimediaviewer-thumbnail-error-retry',
			'multimediaviewer-report-issue-url',
			// mmv.ui.canvasButtons.js
			'multimediaviewer-download-link',
			'multimediaviewer-reuse-link',
			'multimediaviewer-options-tooltip',
			// mmv.lightboxinterface.js
			'multimediaviewer-close-popup-text',
			'multimediaviewer-fullscreen-popup-text',
			'multimediaviewer-defullscreen-popup-text',
			// mmv.ui.metadataPanel.js
			'multimediaviewer-commons-subtitle',
			'multimediaviewer-credit',
			'multimediaviewer-credit-fallback',
			'multimediaviewer-multiple-authors',
			'multimediaviewer-multiple-authors-combine',
			'multimediaviewer-userpage-link',
			'multimediaviewer-datetime-created',
			'multimediaviewer-datetime-uploaded',
			// for license messages see end of file
			'multimediaviewer-permission-link',
			'multimediaviewer-permission-link-hide',

			'multimediaviewer-restriction-2257',
			'multimediaviewer-restriction-aus-reserve',
			'multimediaviewer-restriction-communist',
			'multimediaviewer-restriction-costume',
			'multimediaviewer-restriction-currency',
			'multimediaviewer-restriction-design',
			'multimediaviewer-restriction-fan-art',
			'multimediaviewer-restriction-ihl',
			'multimediaviewer-restriction-insignia',
			'multimediaviewer-restriction-ita-mibac',
			'multimediaviewer-restriction-nazi',
			'multimediaviewer-restriction-personality',
			'multimediaviewer-restriction-trademarked',
			'multimediaviewer-restriction-default',
			'multimediaviewer-restriction-default-and-others',

			'multimediaviewer-geoloc-north',
			'multimediaviewer-geoloc-east',
			'multimediaviewer-geoloc-south',
			'multimediaviewer-geoloc-west',
			'multimediaviewer-geoloc-coord',
			'multimediaviewer-geoloc-coords',
			'multimediaviewer-geolocation',
			'multimediaviewer-about-mmv',
			'multimediaviewer-discuss-mmv',
			'multimediaviewer-help-mmv',
			'multimediaviewer-optout-mmv',
			'multimediaviewer-optin-mmv',
			'multimediaviewer-optout-pending-mmv',
			'multimediaviewer-optin-pending-mmv',
			'multimediaviewer-optout-help',
			'multimediaviewer-optin-help',
			// Reuse the preferences message in the top-right menu.
			'mypreferences',
			'multimediaviewer-metadata-error',
			'multimediaviewer-title-popup-text',
			'multimediaviewer-credit-popup-text',
			'multimediaviewer-title-popup-text-more',
			'multimediaviewer-credit-popup-text-more',
			// mmv.ui.permission.js
			'multimediaviewer-permission-title',
			'multimediaviewer-permission-viewmore',
			// mmv.ui.stripeButtons.js
			'multimediaviewer-description-page-button-text',
			'multimediaviewer-description-page-popup-text',
			'multimediaviewer-description-page-popup-text-local',
			'multimediaviewer-repository-local',
		),
	),

	// Dependencies shared by mmv.ui.reuse.shareembed and mmv.ui.download.pane
	// Both of which are loaded on demand
	'mmv.ui.ondemandshareddependencies' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/model/mmv.model.EmbedFileInfo.js',
			'mmv/mmv.EmbedFileFormatter.js',
			'mmv/ui/mmv.ui.utils.js',
		),

		'dependencies' => array(
			'mmv.head', // mmv/mmv.base.js
			'mmv', // mmv/ui/mmv.ui.js
			'oojs',
			'oojs-ui',
		),

		'messages' => array(
			'multimediaviewer-credit',

			'multimediaviewer-text-embed-credit-text-tbls',
			'multimediaviewer-text-embed-credit-text-tbls-nonfree',
			'multimediaviewer-text-embed-credit-text-tls',
			'multimediaviewer-text-embed-credit-text-tls-nonfree',
			'multimediaviewer-text-embed-credit-text-tbs',
			'multimediaviewer-text-embed-credit-text-tbl',
			'multimediaviewer-text-embed-credit-text-tbl-nonfree',
			'multimediaviewer-text-embed-credit-text-tb',
			'multimediaviewer-text-embed-credit-text-ts',
			'multimediaviewer-text-embed-credit-text-tl',
			'multimediaviewer-text-embed-credit-text-tl-nonfree',

			'multimediaviewer-html-embed-credit-text-tbls',
			'multimediaviewer-html-embed-credit-text-tbls-nonfree',
			'multimediaviewer-html-embed-credit-text-tls',
			'multimediaviewer-html-embed-credit-text-tls-nonfree',
			'multimediaviewer-html-embed-credit-text-tbs',
			'multimediaviewer-html-embed-credit-text-tbl',
			'multimediaviewer-html-embed-credit-text-tbl-nonfree',
			'multimediaviewer-html-embed-credit-text-tb',
			'multimediaviewer-html-embed-credit-text-ts',
			'multimediaviewer-html-embed-credit-text-tl',
			'multimediaviewer-html-embed-credit-text-tl-nonfree',
		),
	),

	// Loaded on demand by mmv.ui.download.dialog.js
	'mmv.ui.download.pane' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/ui/mmv.ui.download.pane.js',
		),

		'styles' => array(
			'mmv/ui/mmv.ui.download.pane.less',
		),

		'dependencies' => array(
			'mediawiki.ui',
			'mediawiki.ui.button',
			'mmv', // mmv/ui/mmv.ui.download.js
			'mmv.ui.ondemandshareddependencies',
			'oojs',
			'oojs-ui',
		),

		'messages' => array(
			'multimediaviewer-download-preview-link-title',
			'multimediaviewer-download-original-button-name',
			'multimediaviewer-download-small-button-name',
			'multimediaviewer-download-medium-button-name',
			'multimediaviewer-download-large-button-name',
			'multimediaviewer-embed-dimensions',
			'multimediaviewer-embed-dimensions-with-file-format',
			'multimediaviewer-download-attribution-cta-header',
			'multimediaviewer-download-optional-attribution-cta-header',
			'multimediaviewer-download-attribution-cta',
			'multimediaviewer-attr-plain',
			'multimediaviewer-attr-html',
		),
	),

	// Preloaded by mmv.js and loaded on demand by mmv.ui.reuse.dialog.js
	'mmv.ui.reuse.shareembed' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/ui/mmv.ui.reuse.tab.js',
			'mmv/ui/mmv.ui.reuse.share.js',
			'mmv/ui/mmv.ui.reuse.embed.js',
		),

		'styles' => array(
			'mmv/ui/mmv.ui.reuse.share.less',
			'mmv/ui/mmv.ui.reuse.embed.less',
			'mmv/ui/mmv.ui.reuse.shareembed.less',
		),

		'dependencies' => array(
			'oojs',
			'oojs-ui',
			'mediawiki.user',
			'mmv.ui.ondemandshareddependencies',
		),

		'messages' => array(
			'multimediaviewer-reuse-loading-placeholder',
			'multimediaviewer-share-tab',
			'multimediaviewer-share-explanation',

			'multimediaviewer-link-to-file',
			'multimediaviewer-link-to-page',

			'multimediaviewer-reuse-loading-placeholder',
			'multimediaviewer-embed-tab',
			'multimediaviewer-embed-html',
			'multimediaviewer-embed-wt',
			'multimediaviewer-embed-explanation',

			'multimediaviewer-embed-byline',
			'multimediaviewer-embed-license',
			'multimediaviewer-embed-via',

			'multimediaviewer-default-embed-dimensions',
			'multimediaviewer-original-embed-dimensions',
			'multimediaviewer-large-embed-dimensions',
			'multimediaviewer-medium-embed-dimensions',
			'multimediaviewer-small-embed-dimensions',
			'multimediaviewer-embed-dimensions',
			'multimediaviewer-embed-dimensions-separated',
		),
	),

	// Loaded on demand in mmv.bootstrap.js
	'mmv.ui.tipsyDialog' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/ui/mmv.ui.tipsyDialog.js',
		),

		'styles' => array(
			'mmv/ui/mmv.ui.tipsyDialog.less',
		),

		'dependencies' => array(
			'mmv', // mmv/ui/mmv.ui.js
			'oojs',
			'jquery.tipsy',
		),
	),

	// Isolated from mmv.bootstrap.autostart to allow tests running without an MMV instance
	// being autostarted in the background
	'mmv.bootstrap' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/mmv.Config.js',
			'mmv/mmv.HtmlUtils.js',
			'mmv/mmv.bootstrap.js',
			'mmv/logging/mmv.logging.Logger.js',
			'mmv/logging/mmv.logging.ActionLogger.js',
			'mmv/logging/mmv.logging.DurationLogger.js',
			'jquery.hashchange/jquery.hashchange.js',
			'jquery.scrollTo/jquery.scrollTo.js',
		),

		'styles' => array(
			'mmv/mmv.bootstrap.less',
		),

		'dependencies' => array(
			'mediawiki.ui.button',
			'mediawiki.ui.icon',
			'mediawiki.Title',
			'mediawiki.user',
			'mmv.head', // mmv/mmv.base.js
			'oojs',
		),

		'messages' => array(
			'multimediaviewer-view-expanded',
			'multimediaviewer-view-config',
			'multimediaviewer-disable-info-title',
			'multimediaviewer-disable-info',
		),
	),

	// Loaded on demand by mmv.head.js on DOM readiness
	'mmv.bootstrap.autostart' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/mmv.bootstrap.autostart.js',
		),

		'dependencies' => array(
			'mmv.head', // mmv/mmv.base.js
			'mmv.bootstrap',
		),
	),

	// Loaded in the head
	'mmv.head' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/mmv.base.js',
			'mmv/mmv.head.js',
		),

		'dependencies' => array(
			'mediawiki.user',
		),

		'position' => 'top',
	),
);

$wgHooks['EventLoggingRegisterSchemas'][] = function( array &$schemas ) {
	$schemas += array(
		'MediaViewer' => 10867062,
		'MultimediaViewerNetworkPerformance' => 12458951,
		'MultimediaViewerDuration' => 10427980,
		'MultimediaViewerAttribution' => 9758179,
		'MultimediaViewerDimensions' => 10014238,
	);
};

$wgExtensionFunctions[] = function () {
	global $wgResourceModules, $wgDefaultUserOptions,
		$wgMediaViewerEnableByDefault;

	if ( isset( $wgResourceModules['ext.eventLogging'] ) ) {
		$wgResourceModules['mmv.lightboxinterface']['dependencies'][] = 'ext.eventLogging';
		$wgResourceModules['mmv']['dependencies'][] = 'ext.eventLogging';
		$wgResourceModules['mmv.bootstrap.autostart']['dependencies'][] = 'ext.eventLogging';
	}

	if ( $wgMediaViewerEnableByDefault ) {
		$wgDefaultUserOptions['multimediaviewer-enable'] = true;
	}

};

foreach ( array(
	'cc-by-1.0',
	'cc-sa-1.0',
	'cc-by-sa-1.0',
	'cc-by-2.0',
	'cc-by-sa-2.0',
	'cc-by-2.1',
	'cc-by-sa-2.1',
	'cc-by-2.5',
	'cc-by-sa-2.5',
	'cc-by-3.0',
	'cc-by-sa-3.0',
	'cc-by-sa-3.0-migrated',
	'cc-by-4.0',
	'cc-by-sa-4.0',
	'cc-pd',
	'cc-zero',
	'pd',
	'default',
) as $license ) {
	$wgResourceModules['mmv']['messages'][] = 'multimediaviewer-license-' . $license;
}

$wgAutoloadClasses['MultimediaViewerHooks'] = __DIR__ . '/MultimediaViewerHooks.php';

$wgHooks['GetPreferences'][] = 'MultimediaViewerHooks::getPreferences';
$wgHooks['GetBetaFeaturePreferences'][] = 'MultimediaViewerHooks::getBetaPreferences';
$wgHooks['BeforePageDisplay'][] = 'MultimediaViewerHooks::getModulesForArticle';
$wgHooks['CategoryPageView'][] = 'MultimediaViewerHooks::getModulesForCategory';
$wgHooks['ResourceLoaderGetConfigVars'][] = 'MultimediaViewerHooks::resourceLoaderGetConfigVars';
$wgHooks['MakeGlobalVariablesScript'][] = 'MultimediaViewerHooks::makeGlobalVariablesScript';
$wgHooks['ResourceLoaderTestModules'][] = 'MultimediaViewerHooks::getTestModules';
$wgHooks['ThumbnailBeforeProduceHTML'][] = 'MultimediaViewerHooks::thumbnailBeforeProduceHTML';

$wgExtensionCredits['other'][] = array(
	'path' => __FILE__,
	'name' => 'MultimediaViewer',
	'descriptionmsg' => 'multimediaviewer-desc',
	'version' => '0.3.0',
	'author' => array(
		'MarkTraceur (Mark Holmquist)',
		'Gilles Dubuc',
		'Gergő Tisza',
		'Aaron Arcos',
		'Zeljko Filipin',
		'Pau Giner',
		'theopolisme',
		'MatmaRex',
		'apsdehal',
		'vldandrew',
		'Ebrahim Byagowi',
		'Dereckson',
		'Brion VIBBER',
		'Yuki Shira',
		'Yaroslav Melnychuk',
		'tonythomas01',
		'Raimond Spekking',
		'Kunal Mehta',
		'Jeff Hall',
		'Christian Aistleitner',
		'Amir E. Aharoni',
	),
	'url' => 'https://mediawiki.org/wiki/Extension:MultimediaViewer',
	'license-name' => 'GPL-2.0+',
);
