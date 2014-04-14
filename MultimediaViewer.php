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
	/** @var int|bool: If set, records image load network performance once per this many requests. False if unset. **/
	$wgNetworkPerformanceSamplingFactor = false;
}

if ( !isset( $wgMediaViewerIsInBeta ) ) {
	/** @var bool: If set, Media Viewer will try to use BetaFeatures. False if unset. **/
	$wgMediaViewerIsInBeta = false;
}

if ( !isset( $wgMediaViewerShowSurvey ) ) {
	/** @var bool: If set, MediaViewer might direct the user to a survey. **/
	$wgMediaViewerShowSurvey = false;
}

if ( !isset( $wgEnableMediaViewerForLoggedInUsersOnly ) ) {
	/**
	 * @var bool: If set, and $wgMediaViewerIsInBeta is unset, Media Viewer will be turned on for
	 * all logged-in users. False if unset.
	 */
	$wgEnableMediaViewerForLoggedInUsersOnly = false;
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
			'mmv.ui',
			'mmv.ui.canvas',
			'mmv.ui.canvasButtons',
			'mmv.ui.categories',
			'mmv.ui.description',
			'mmv.ui.fileUsage',
			'mmv.ui.metadataPanel',
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

	'mmv.model.FileUsage' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/model/mmv.model.FileUsage.js',
		),

		'dependencies' => array(
			'mmv.model',
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
			'mmv/provider/mmv.provider.ImageUsage.js',
			'mmv/provider/mmv.provider.GlobalUsage.js',
			'mmv/provider/mmv.provider.ImageInfo.js',
			'mmv/provider/mmv.provider.FileRepoInfo.js',
			'mmv/provider/mmv.provider.ThumbnailInfo.js',
			'mmv/provider/mmv.provider.UserInfo.js',
			'mmv/provider/mmv.provider.Image.js',
		),

		'dependencies' => array(
			'mediawiki.Title',
			'mmv.model',
			'mmv.model.FileUsage',
			'mmv.model.Image',
			'mmv.model.Repo',
			'mmv.model.Thumbnail',
			'mmv.model.User',
			'mmv.performance',
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

	'mmv.ui.categories' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/ui/mmv.ui.categories.js',
		),

		'styles' => array(
			'mmv/ui/mmv.ui.categories.less',
		),

		'dependencies' => array(
			'mmv.ui',
			'oojs',
		),

		'messages' => array(
			'comma-separator',
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
			'mmv.ui',
			'oojs',
			'jquery.tipsy',
		),

		'messages' => array(
			'multimediaviewer-feedback-button-text',
			'multimediaviewer-feedback-popup-text',
			'multimediaviewer-description-page-button-text',
			'multimediaviewer-description-page-popup-text',
			'multimediaviewer-description-page-popup-text-local',
			'multimediaviewer-reuse-link',
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

	'mmv.ui.fileUsage' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/ui/mmv.ui.fileUsage.js',
		),

		'styles' => array(
			'mmv/ui/mmv.ui.fileUsage.less',
		),

		'dependencies' => array(
			'mediawiki.language',
			'mediawiki.Uri',
			'mediawiki.jqueryMsg',
			'mmv.ui',
			'oojs',
		),

		'messages' => array(
			'multimediaviewer-fileusage-count',
			'multimediaviewer-fileusage-count-more',
			'multimediaviewer-fileusage-link',
			'multimediaviewer-fileusage-local-section',
			'multimediaviewer-fileusage-global-section',
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

	'mmv.ui.metadataPanel' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/ui/mmv.ui.metadataPanel.js',
		),

		'styles' => array(
			'mmv/ui/mmv.ui.metadataPanel.less',
		),

		'dependencies' => array(
			'mmv.HtmlUtils',
			'mmv.ui',
			'mmv.ui.stripeButtons',
			'mmv.ui.categories',
			'mmv.ui.description',
			'mmv.ui.fileUsage',
			'mmv.ui.permission',
			'mmv.ui.reuse.dialog',
			'mmv.ui.truncatableTextField',
			'moment',
			'oojs',
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

			'multimediaviewer-metadata-error',
		),
	),

	'mmv.embedFileFormatter' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/mmv.EmbedFileFormatter.js',
		),

		'dependencies' => array(
			'mmv.base',
			'oojs',
			'mmv.HtmlUtils',
		),

		'messages' => array(
			'multimediaviewer-credit',

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
			'oojs',
			'oojs-ui',
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
			'mmv.ui.reuse.tab',
			'mmv.ui.reuse.utils',
			'oojs',
			'oojs-ui',
			'mmv.model.EmbedFileInfo',
			'mmv.embedFileFormatter',
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
	),

	'mmv.logger' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/mmv.logger.js',
		),

		'dependencies' => array(
			'mmv.base',
		),
	),

	'mmv.performance' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/mmv.performance.js',
		),

		'dependencies' => array(
			'mmv.base',
		),
	),

	'mmv.api' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/mmv.api.js',
		),

		'dependencies' => array(
			'mediawiki.api',
			'mmv.base',
			'oojs',
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
			'mmv.api',
			'mmv.base',
			'mmv.lightboximage',
			'mmv.model.TaskQueue',
			'mmv.lightboxinterface',
			'mmv.provider',
			'jquery.fullscreen',
			'jquery.hidpi',
			'jquery.scrollTo',
			'jquery.throttle-debounce',
			'jquery.hidpi',
		),

		'messages' => array(
			'multimediaviewer-file-page',
			'multimediaviewer-desc-nil',
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
			'mmv.logger',
			'mmv.HtmlUtils',
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

	'mmv.head' => $wgMediaViewerResourceTemplate + array(
		'scripts' => array(
			'mmv/mmv.head.js',
		),

		'dependencies' => array(
			'mmv.base',
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
	global $wgResourceModules;

	if ( isset( $wgResourceModules['ext.eventLogging'] ) ) {
		$wgResourceModules['schema.MediaViewer'] = array(
			'class' => 'ResourceLoaderSchemaModule',
			'schema' => 'MediaViewer',
			'revision' => 7670440,
		);

		$wgResourceModules['schema.MultimediaViewerNetworkPerformance'] = array(
			'class' => 'ResourceLoaderSchemaModule',
			'schema' => 'MultimediaViewerNetworkPerformance',
			'revision' => 7917896,
		);

		$wgResourceModules['mmv.logger']['dependencies'][] = 'ext.eventLogging';
		$wgResourceModules['mmv.logger']['dependencies'][] = 'schema.MediaViewer';

		$wgResourceModules['mmv.performance']['dependencies'][] = 'ext.eventLogging';
		$wgResourceModules['mmv.performance']['dependencies'][] = 'schema.MultimediaViewerNetworkPerformance';
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

$wgDefaultUserOptions['multimediaviewer-enable'] = true;

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
