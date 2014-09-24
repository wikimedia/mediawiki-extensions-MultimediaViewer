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

if ( !isset( $wgMediaViewerAttributionLoggingSamplingFactor ) ) {
	/**
	 * If set, records whether image attribution data was available. A value of 1000 means there will be an
	 * 1:1000 chance to log the attribution event.
	 * False if unset.
	 * @var int|bool
	 */
	$wgMediaViewerAttributionLoggingSamplingFactor = false;
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

$wgMessagesDirs['MultimediaViewer'] = __DIR__ . '/i18n';
$wgExtensionMessagesFiles['MultimediaViewer'] = __DIR__ . '/MultimediaViewer.i18n.php';

/**
 * @param string $path
 * @return array
 */
$wgMediaViewerResourceTemplate = array(
	'localBasePath' => __DIR__ . '/resources',
	'remoteExtPath' => 'MultimediaViewer/resources',
);

$wgResourceModules += array(
	'mmv.lightboximage' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/mmv.lightboximage.js',
		),

		'dependencies' => array(
			'mmv.base',
		),
	),

	'mmv.lightboxinterface' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/mmv.lightboxinterface.js',
		),

		'styles' => array(
			'mmv/mmv.lightboxinterface.less',
		),

		'dependencies' => array(
			'mmv.base',
			'mmv.logging.ActionLogger',
			'mmv.ui',
			'mmv.ui.canvas',
			'mmv.ui.canvasButtons',
			'mmv.ui.description',
			'mmv.ui.metadataPanel',
			'mmv.ui.reuse.dialog',
		),

		'messages' => array(
			'multimediaviewer-close-popup-text',
			'multimediaviewer-fullscreen-popup-text',
			'multimediaviewer-defullscreen-popup-text',
		),
	),

	'mmv.ThumbnailWidthCalculator' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/mmv.ThumbnailWidthCalculator.js',
		),

		'dependencies' => array(
			'jquery.hidpi',
			'mmv.base',
			'mmv.model.ThumbnailWidth',
		),
	),

	'mmv.HtmlUtils' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/mmv.HtmlUtils.js',
		),

		'dependencies' => array(
			'mmv.base',
		),
	),

	'mmv.model' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/model/mmv.model.js',
		),

		'dependencies' => array(
			'mmv.base',
			'oojs',
		),
	),

	'mmv.model.IwTitle' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/model/mmv.model.IwTitle.js',
		),

		'dependencies' => array(
			'mmv.model',
		),
	),

	'mmv.model.EmbedFileInfo' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/model/mmv.model.EmbedFileInfo.js',
		),

		'dependencies' => array(
			'mmv.model',
		),
	),

	'mmv.model.License' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/model/mmv.model.License.js',
		),

		'dependencies' => array(
			'mmv.model',
			'mmv.HtmlUtils',
		),
	),

	'mmv.model.Image' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/model/mmv.model.Image.js',
		),

		'dependencies' => array(
			'mmv.model',
			'mmv.model.License',
		),
	),

	'mmv.model.Repo' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/model/mmv.model.Repo.js',
		),

		'dependencies' => array(
			'mmv.model',
			'oojs',
		),
	),

	'mmv.model.Thumbnail' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/model/mmv.model.Thumbnail.js',
		),

		'dependencies' => array(
			'mmv.model',
		),
	),

	'mmv.model.ThumbnailWidth' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/model/mmv.model.ThumbnailWidth.js',
		),

		'dependencies' => array(
			'mmv.model',
		),
	),

	'mmv.model.User' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/model/mmv.model.User.js',
		),

		'dependencies' => array(
			'mmv.model',
		),
	),

	'mmv.model.TaskQueue' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/model/mmv.model.TaskQueue.js',
		),

		'dependencies' => array(
			'mmv.model',
		),
	),

	'mmv.provider' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/provider/mmv.provider.Api.js',
			'mmv/provider/mmv.provider.ImageInfo.js',
			'mmv/provider/mmv.provider.FileRepoInfo.js',
			'mmv/provider/mmv.provider.ThumbnailInfo.js',
			'mmv/provider/mmv.provider.GuessedThumbnailInfo.js',
			'mmv/provider/mmv.provider.UserInfo.js',
			'mmv/provider/mmv.provider.Image.js',
		),

		'dependencies' => array(
			'mediawiki.Title',
			'mmv.model',
			'mmv.model.IwTitle',
			'mmv.model.Image',
			'mmv.model.Repo',
			'mmv.model.Thumbnail',
			'mmv.model.User',
			'mmv.logging.Performance',
			'oojs',
		),
	),

	'mmv.routing' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/routing/mmv.routing.js',
			'mmv/routing/mmv.routing.Route.js',
			'mmv/routing/mmv.routing.ThumbnailRoute.js',
			'mmv/routing/mmv.routing.MainFileRoute.js',
			'mmv/routing/mmv.routing.Router.js',
		),

		'dependencies' => array(
			'mediawiki.Title',
			'oojs',
		),
	),

	'mmv.base' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/mmv.base.js',
		),
	),

	'mmv.ui' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/ui/mmv.ui.js',
		),

		'dependencies' => array(
			'mmv.base',
			'mmv.logging.ActionLogger',
		),
	),

	'mmv.ui.canvas' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/ui/mmv.ui.canvas.js',
		),

		'styles' => array(
			'mmv/ui/mmv.ui.canvas.less',
		),

		'messages' => array(
			'multimediaviewer-thumbnail-error',
		),

		'dependencies' => array(
			'mmv.ui',
			'mmv.ThumbnailWidthCalculator',
			'oojs',
		),
	),

	'mmv.ui.stripeButtons' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/ui/mmv.ui.stripeButtons.js',
		),

		'styles' => array(
			'mmv/ui/mmv.ui.stripeButtons.less',
		),

		'dependencies' => array(
			'mediawiki.jqueryMsg',
			'mmv.ui',
			'oojs',
			'jquery.tipsy',
			'jquery.throttle-debounce',
		),

		'messages' => array(
			'multimediaviewer-description-page-button-text',
			'multimediaviewer-description-page-popup-text',
			'multimediaviewer-description-page-popup-text-local',
		),
	),

	'mmv.ui.description' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/ui/mmv.ui.description.js',
		),

		'dependencies' => array(
			'mmv.ui',
			'mmv.HtmlUtils',
			'oojs',
		),
	),

	'mmv.ui.permission' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/ui/mmv.ui.permission.js',
		),

		'styles' => array(
			'mmv/ui/mmv.ui.permission.less',
		),

		'messages' => array(
			'multimediaviewer-permission-title',
			'multimediaviewer-permission-viewmore',
		),

		'dependencies' => array(
			'jquery.color',
			'mediawiki.jqueryMsg',
			'mmv.logging.ActionLogger',
			'mmv.ui',
			'mmv.HtmlUtils',
			'oojs',
		),
	),

	'mmv.ui.truncatableTextField' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/ui/mmv.ui.truncatableTextField.js',
		),

		'styles' => array(
			'mmv/ui/mmv.ui.truncatableTextField.less',
		),

		'dependencies' => array(
			'mmv.HtmlUtils',
			'mmv.ui',
			'oojs',
		),
	),

	'mmv.ui.progressBar' => $wgMediaViewerResourceTemplate + array(
			'scripts' => array(
				'mmv/ui/mmv.ui.progressBar.js',
			),

			'styles' => array(
				'mmv/ui/mmv.ui.progressBar.less',
			),

			'dependencies' => array(
				'mmv.ui',
				'oojs',
			),
	),

	'mmv.ui.metadataPanel' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/ui/mmv.ui.metadataPanel.js',
			'mmv/ui/mmv.ui.metadataPanelScroller.js',
		),

		'styles' => array(
			'mmv/ui/mmv.ui.metadataPanel.less',
			'mmv/ui/mmv.ui.metadataPanelScroller.less',
		),

		'dependencies' => array(
			'mediawiki.user',
			'mmv.HtmlUtils',
			'mmv.logging.ActionLogger',
			'mmv.logging.AttributionLogger',
			'mmv.ui',
			'mmv.ui.progressBar',
			'mmv.ui.stripeButtons',
			'mmv.ui.description',
			'mmv.ui.permission',
			'mmv.ui.truncatableTextField',
			'oojs',
			'jquery.tipsy',
		),

		'messages' => array(
			'multimediaviewer-repository',
			'multimediaviewer-repository-local',
			'multimediaviewer-commons-subtitle',

			'multimediaviewer-credit',

			'multimediaviewer-userpage-link',

			'multimediaviewer-datetime-created',
			'multimediaviewer-datetime-uploaded',

			// for license messages see end of file
			'multimediaviewer-permission-link',

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
			'multimediaviewer-panel-open-popup-text',
			'multimediaviewer-panel-close-popup-text',
		),
	),

	'mmv.embedFileFormatter' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/mmv.EmbedFileFormatter.js',
		),

		'dependencies' => array(
			'mmv.base',
			'mmv.routing',
			'oojs',
			'mmv.HtmlUtils',
		),

		'messages' => array(
			'multimediaviewer-credit',

			'multimediaviewer-text-embed-credit-text-tbls',
			'multimediaviewer-text-embed-credit-text-tls',
			'multimediaviewer-text-embed-credit-text-tbs',
			'multimediaviewer-text-embed-credit-text-tbl',
			'multimediaviewer-text-embed-credit-text-tb',
			'multimediaviewer-text-embed-credit-text-ts',
			'multimediaviewer-text-embed-credit-text-tl',

			'multimediaviewer-html-embed-credit-text-tbls',
			'multimediaviewer-html-embed-credit-text-tls',
			'multimediaviewer-html-embed-credit-text-tbs',
			'multimediaviewer-html-embed-credit-text-tbl',
			'multimediaviewer-html-embed-credit-text-tb',
			'multimediaviewer-html-embed-credit-text-ts',
			'multimediaviewer-html-embed-credit-text-tl',
		),
	),

	'mmv.ui.reuse.dialog' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/ui/mmv.ui.reuse.dialog.js',
		),

		'styles' => array(
			'mmv/ui/mmv.ui.reuse.dialog.less',
		),

		'dependencies' => array(
			'mmv.ui',
			'oojs',
		),
	),

	'mmv.ui.reuse.utils' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/ui/mmv.ui.reuse.utils.js',
		),

		'dependencies' => array(
			'mmv.HtmlUtils',
			'mmv.ui',
			'oojs',
			'oojs-ui',
		),
	),

	'mmv.ui.reuse.tab' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/ui/mmv.ui.reuse.tab.js',
		),

		'dependencies' => array(
			'mmv.ui',
			'oojs',
		),
	),

	'mmv.ui.reuse.share' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/ui/mmv.ui.reuse.share.js',
		),

		'styles' => array(
			'mmv/ui/mmv.ui.reuse.share.less',
			'mmv/ui/mmv.ui.reuse.shareembed.less',
		),

		'dependencies' => array(
			'mmv.ui.reuse.tab',
			'mmv.ui.reuse.utils',
			'mmv.routing',
			'oojs',
			'oojs-ui',
			'mmv.logging.ActionLogger',
		),

		'messages' => array(
			'multimediaviewer-reuse-loading-placeholder',
			'multimediaviewer-share-tab',
			'multimediaviewer-share-explanation',

			'multimediaviewer-link-to-file',
			'multimediaviewer-link-to-page',
		),
	),

	'mmv.ui.reuse.embed' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/ui/mmv.ui.reuse.embed.js',
		),

		'styles' => array(
			'mmv/ui/mmv.ui.reuse.embed.less',
			'mmv/ui/mmv.ui.reuse.shareembed.less',
		),

		'dependencies' => array(
			'mediawiki.user',
			'mmv.ui.reuse.tab',
			'mmv.ui.reuse.utils',
			'oojs',
			'oojs-ui',
			'mmv.model.EmbedFileInfo',
			'mmv.embedFileFormatter',
			'mmv.logging.ActionLogger',
		),

		'messages' => array(
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

	'mmv.ui.reuse.download' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/ui/mmv.ui.reuse.download.js',
		),

		'styles' => array(
			'mmv/ui/mmv.ui.reuse.download.less',
		),

		'dependencies' => array(
			'mediawiki.ui',
			'mediawiki.ui.button',
			'mmv.ui.reuse.tab',
			'mmv.ui.reuse.utils',
			'mmv.embedFileFormatter',
			'mmv.logging.ActionLogger',
		),

		'messages' => array(
			'multimediaviewer-download-tab',
			'multimediaviewer-download-preview-link-title',
			'multimediaviewer-download-original-button-name',
			'multimediaviewer-download-small-button-name',
			'multimediaviewer-download-medium-button-name',
			'multimediaviewer-download-large-button-name',
			'multimediaviewer-embed-dimensions',
			'multimediaviewer-embed-dimensions-with-file-format',
			'multimediaviewer-download-attribution-cta-header',
			'multimediaviewer-download-attribution-cta',
			'multimediaviewer-attr-plain',
			'multimediaviewer-attr-html',
		),
	),

	'mmv.ui.canvasButtons' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/ui/mmv.ui.canvasButtons.js',
		),

		'styles' => array(
			'mmv/ui/mmv.ui.canvasButtons.less',
		),

		'dependencies' => array(
			'mmv.ui',
			'oojs',
		),

		'messages' => array(
			'multimediaviewer-reuse-link',
		),
	),

	'mmv.logging.Logger' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/logging/mmv.logging.Logger.js',
		),

		'dependencies' => array(
			'mmv.base',
		),
	),

	'mmv.logging.Performance' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/logging/mmv.logging.Performance.js',
		),

		'dependencies' => array(
			'mmv.base',
			'mmv.logging.Logger',
			'oojs',
		),
	),

	'mmv.logging.Api' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/logging/mmv.logging.Api.js',
		),

		'dependencies' => array(
			'mediawiki.api',
			'mmv.base',
			'mmv.logging.Logger',
			'oojs',
		),
	),

	'mmv.Config' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/mmv.Config.js',
		),

		'dependencies' => array(
			'mmv.base',
			'mediawiki.user',
		),
	),

	'mmv' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/mmv.js',
		),

		'styles' => array(
			// Always make this one the last of the list (Bug 61852)
			'mmv/mmv.loaded.css',
		),

		'dependencies' => array(
			'mmv.logging.Api',
			'mmv.base',
			'mmv.lightboximage',
			'mmv.logging.ActionLogger',
			'mmv.model.TaskQueue',
			'mmv.lightboxinterface',
			'mmv.provider',
			'mmv.routing',
			'mmv.logging.DurationLogger',
			'jquery.fullscreen',
			'jquery.hidpi',
			'jquery.scrollTo',
			'jquery.throttle-debounce',
			'jquery.hidpi',
		),

		'messages' => array(
			'multimediaviewer-file-page',
			'multimediaviewer-desc-nil',

			// messages that are gender-dependent (we need to check if they really depend on the gender):
			'multimediaviewer-userpage-link',
		),
	),

	'mmv.bootstrap' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/mmv.bootstrap.js',
		),

		'styles' => array(
			'mmv/mmv.bootstrap.less',
		),

		'dependencies' => array(
			'jquery.hashchange',
			'mediawiki.Title',
			'mmv.Config',
			'mmv.logging.ActionLogger',
			'mmv.HtmlUtils',
			'mmv.logging.DurationLogger',
			'jquery.scrollTo',
		),

		'messages' => array(
			'multimediaviewer-view-expanded',
		),
	),

	'mmv.bootstrap.autostart' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/mmv.bootstrap.autostart.js',
		),

		'dependencies' => array(
			'mmv.base',
			'mmv.bootstrap',
		),
	),

	'mmv.logging.ActionLogger' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/logging/mmv.logging.ActionLogger.js',
		),

		'dependencies' => array(
			'mmv.base',
			'mmv.logging.Logger',
			'oojs'
		),
	),

	'mmv.logging.DurationLogger' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/logging/mmv.logging.DurationLogger.js',
		),

		'dependencies' => array(
			'mmv.base',
			'mmv.logging.Logger',
			'oojs',
			'mediawiki.user',
		),
	),

	'mmv.logging.AttributionLogger' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/logging/mmv.logging.AttributionLogger.js',
		),

		'dependencies' => array(
			'mmv.base',
			'mmv.logging.Logger',
			'oojs',
			'mediawiki.user',
		),
	),

	'mmv.head' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/mmv.head.js',
		),

		'dependencies' => array(
			'mmv.base',
			'mediawiki.user',
		),

		'position' => 'top',
	),

	'jquery.scrollTo' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'jquery.scrollTo/jquery.scrollTo.js',
		),
	),

	'jquery.hashchange' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'jquery.hashchange/jquery.hashchange.js',
		),
	),
);

$wgExtensionFunctions[] = function () {
	global $wgResourceModules, $wgEventLoggingSchemas;

	if ( isset( $wgResourceModules['ext.eventLogging'] ) ) {
		$wgEventLoggingSchemas[ 'MediaViewer' ] = 9792855;
		$wgEventLoggingSchemas[ 'MultimediaViewerNetworkPerformance' ] = 7917896;
		$wgEventLoggingSchemas[ 'MultimediaViewerDuration' ] = 8572641;
		$wgEventLoggingSchemas[ 'MultimediaViewerAttribution' ] = 9758179;

		$wgResourceModules['mmv.logging.ActionLogger']['dependencies'][] = 'ext.eventLogging';
		$wgResourceModules['mmv.logging.Performance']['dependencies'][] = 'ext.eventLogging';
		$wgResourceModules['mmv.logging.DurationLogger']['dependencies'][] = 'ext.eventLogging';
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

$wgExtensionFunctions[] = function () {
	global $wgMediaViewerEnableByDefault, $wgDefaultUserOptions;
	if ( $wgMediaViewerEnableByDefault ) {
		$wgDefaultUserOptions['multimediaviewer-enable'] = true;
	}
};

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
);
