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

// do not pollute global namespace
call_user_func( function() {
	global $wgExtensionMessagesFiles, $wgResourceModules, $wgExtensionFunctions, $wgMediaViewerIsInBeta,
		$wgAutoloadClasses, $wgHooks, $wgExtensionCredits, $wgNetworkPerformanceSamplingFactor,
		$wgEnableMediaViewerForLoggedInUsersOnly;

	/** @var int|bool: If set, records image load network performance once per this many requests. False if unset. **/
	$wgNetworkPerformanceSamplingFactor = false;

	/** @var bool: If set, Media Viewer will try to use BetaFeatures. False if unset. **/
	$wgMediaViewerIsInBeta = false;

	/**
	 * @var bool: If set, and $wgMediaViewerIsInBeta is unset, Media Viewer will be turned on for all
	 * logged-in users. False if unset.
	 */
	$wgEnableMediaViewerForLoggedInUsersOnly = false;

	$wgExtensionMessagesFiles['MultimediaViewer'] = __DIR__ . '/MultimediaViewer.i18n.php';

	/**
	 * @param string $path
	 * @return array
	 */
	$moduleInfo = function( $path ) {
		return array(
			'localBasePath' => __DIR__ . "/resources/$path",
			'remoteExtPath' => "MultimediaViewer/resources/$path",
		);
	};

	$wgResourceModules['mmv.lightboximage'] = array_merge( array(
		'scripts' => array(
			'mmv.lightboximage.js',
		),

		'dependencies' => array(
			'mmv.base',
		),
	), $moduleInfo( 'mmv' ) );

	$wgResourceModules['mmv.lightboxinterface'] = array_merge( array(
		'scripts' => array(
			'mmv.lightboxinterface.js',
		),

		'styles' => array(
			'mmv.lightboxinterface.less',
		),

		'dependencies' => array(
			'mmv.base',
			'mmv.ui',
			'mmv.ui.buttons',
			'mmv.ui.canvas',
			'mmv.ui.categories',
			'mmv.ui.description',
			'mmv.ui.fileUsage',
			'mmv.ui.metadataPanel',
		),
	), $moduleInfo( 'mmv' ) );

	$wgResourceModules['mmv.ThumbnailWidthCalculator'] = array_merge( array(
		'scripts' => array(
			'mmv.ThumbnailWidthCalculator.js',
		),

		'dependencies' => array(
			'jquery.hidpi',
			'mmv.base',
			'mmv.model.ThumbnailWidth',
		),
	), $moduleInfo( 'mmv' ) );

	$wgResourceModules['mmv.model'] = array_merge( array(
		'scripts' => array(
			'mmv.model.js',
		),

		'dependencies' => array(
			'mmv.base',
			'oojs',
		),
	), $moduleInfo( 'mmv/model' ) );

	$wgResourceModules['mmv.model.EmbedFileInfo'] = array_merge( array(
		'scripts' => array(
			'mmv.model.EmbedFileInfo.js',
		),

		'dependencies' => array(
			'mmv.model',
		),
	), $moduleInfo( 'mmv/model' ) );

	$wgResourceModules['mmv.model.License'] = array_merge( array(
		'scripts' => array(
			'mmv.model.License.js',
		),

		'dependencies' => array(
			'mmv.model',
		),
	), $moduleInfo( 'mmv/model' ) );

	$wgResourceModules['mmv.model.FileUsage'] = array_merge( array(
		'scripts' => array(
			'mmv.model.FileUsage.js',
		),

		'dependencies' => array(
			'mmv.model',
		),
	), $moduleInfo( 'mmv/model' ) );

	$wgResourceModules['mmv.model.Image'] = array_merge( array(
		'scripts' => array(
			'mmv.model.Image.js',
		),

		'dependencies' => array(
			'mmv.model',
			'mmv.model.License',
		),
	), $moduleInfo( 'mmv/model' ) );

	$wgResourceModules['mmv.model.Repo'] = array_merge( array(
		'scripts' => array(
			'mmv.model.Repo.js',
		),

		'dependencies' => array(
			'mmv.model',
			'oojs',
		),
	), $moduleInfo( 'mmv/model' ) );

	$wgResourceModules['mmv.model.Thumbnail'] = array_merge( array(
		'scripts' => array(
			'mmv.model.Thumbnail.js',
		),

		'dependencies' => array(
			'mmv.model',
		),
	), $moduleInfo( 'mmv/model' ) );

	$wgResourceModules['mmv.model.ThumbnailWidth'] = array_merge( array(
		'scripts' => array(
			'mmv.model.ThumbnailWidth.js',
		),

		'dependencies' => array(
			'mmv.model',
		),
	), $moduleInfo( 'mmv/model' ) );

	$wgResourceModules['mmv.model.User'] = array_merge( array(
		'scripts' => array(
			'mmv.model.User.js',
		),

		'dependencies' => array(
			'mmv.model',
		),
	), $moduleInfo( 'mmv/model' ) );

	$wgResourceModules['mmv.model.TaskQueue'] = array_merge( array(
		'scripts' => array(
			'mmv.model.TaskQueue.js',
		),

		'dependencies' => array(
			'mmv.model',
		),
	), $moduleInfo( 'mmv/model' ) );

	$wgResourceModules['mmv.provider'] = array_merge( array(
		'scripts' => array(
			'mmv.provider.Api.js',
			'mmv.provider.ImageUsage.js',
			'mmv.provider.GlobalUsage.js',
			'mmv.provider.ImageInfo.js',
			'mmv.provider.FileRepoInfo.js',
			'mmv.provider.ThumbnailInfo.js',
			'mmv.provider.UserInfo.js',
			'mmv.provider.Image.js',
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
	), $moduleInfo( 'mmv/provider' ) );

	$wgResourceModules['mmv.base'] = array_merge( array(
		'scripts' => array(
			'mmv.base.js',
		),
	), $moduleInfo( 'mmv' ) );

	$wgResourceModules['mmv.ui'] = array_merge( array(
		'scripts' => array(
			'mmv.ui.js',
		),

		'styles' => array(
			'mmv.ui.less',
		),

		'dependencies' => array(
			'mmv.base',
		),
	), $moduleInfo( 'mmv/ui' ) );

	$wgResourceModules['mmv.ui.canvas'] = array_merge( array(
		'scripts' => array(
			'mmv.ui.canvas.js',
		),

		'styles' => array(
			'mmv.ui.canvas.less',
		),

		'messages' => array(
			'multimediaviewer-thumbnail-error',
		),

		'dependencies' => array(
			'mmv.ui',
			'mmv.ThumbnailWidthCalculator',
			'oojs',
		),
	), $moduleInfo( 'mmv/ui' ) );

	$wgResourceModules['mmv.ui.categories'] = array_merge( array(
		'scripts' => array(
			'mmv.ui.categories.js',
		),

		'styles' => array(
			'mmv.ui.categories.less',
		),

		'dependencies' => array(
			'mmv.ui',
			'oojs',
		),

		'messages' => array(
			'comma-separator',
		),
	), $moduleInfo( 'mmv/ui' ) );

	$wgResourceModules['mmv.ui.description'] = array_merge( array(
		'scripts' => array(
			'mmv.ui.description.js',
		),

		'dependencies' => array(
			'mmv.ui',
			'oojs',
		),
	), $moduleInfo( 'mmv/ui' ) );

	$wgResourceModules['mmv.ui.fileUsage'] = array_merge( array(
		'scripts' => array(
			'mmv.ui.fileUsage.js',
		),

		'styles' => array(
			'mmv.ui.fileUsage.less',
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
	), $moduleInfo( 'mmv/ui' ) );

	$wgResourceModules['mmv.ui.permission'] = array_merge( array(
		'scripts' => array(
			'mmv.ui.permission.js',
		),

		'styles' => array(
			'mmv.ui.permission.less',
		),

		'messages' => array(
			'multimediaviewer-permission-title',
			'multimediaviewer-permission-viewmore',
		),

		'dependencies' => array(
			'jquery.color',
			'mediawiki.jqueryMsg',
			'mmv.ui',
			'oojs',
		),
	), $moduleInfo( 'mmv/ui' ) );

	$wgResourceModules['mmv.ui.metadataPanel'] = array_merge( array(
		'scripts' => array(
			'mmv.ui.metadataPanel.js',
		),

		'styles' => array(
			'mmv.ui.metadataPanel.less',
		),

		'dependencies' => array(
			'mmv.ui',
			'mmv.ui.categories',
			'mmv.ui.description',
			'mmv.ui.fileUsage',
			'mmv.ui.permission',
			'mmv.ui.reuse.dialog',
			'moment',
			'oojs',
		),

		'messages' => array(
			'multimediaviewer-repository',
			'multimediaviewer-repository-local',

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

			'multimediaviewer-metadata-error',
		),
	), $moduleInfo( 'mmv/ui' ) );

	$wgResourceModules['mmv.embedFileFormatter'] = array_merge( array(
		'scripts' => array(
			'mmv.EmbedFileFormatter.js',
		),

		'dependencies' => array(
			'mmv.base',
			'oojs',
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
	), $moduleInfo( 'mmv' ) );

	$wgResourceModules['mmv.ui.reuse.dialog'] = array_merge( array(
		'scripts' => array(
			'mmv.ui.reuse.dialog.js',
		),

		'styles' => array(
			'mmv.ui.reuse.dialog.less',
		),

		'dependencies' => array(
			'mmv.ui',
			'oojs',
			'oojs-ui',
			'mmv.ui.reuse.share',
			'mmv.ui.reuse.embed',
		),

		'messages' => array(
			'multimediaviewer-reuse-link',
		),
	), $moduleInfo( 'mmv/ui' ) );

	$wgResourceModules['mmv.ui.reuse.tab'] = array_merge( array(
		'scripts' => array(
			'mmv.ui.reuse.tab.js',
		),

		'dependencies' => array(
			'mmv.ui',
			'oojs',
		),
	), $moduleInfo( 'mmv/ui' ) );

	$wgResourceModules['mmv.ui.reuse.share'] = array_merge( array(
		'scripts' => array(
			'mmv.ui.reuse.share.js',
		),

		'styles' => array(
			'mmv.ui.reuse.share.less',
		),

		'dependencies' => array(
			'mmv.ui.reuse.tab',
			'oojs',
			'oojs-ui',
		),

		'messages' => array(
			'multimediaviewer-reuse-loading-placeholder',
			'multimediaviewer-share-tab',

			'multimediaviewer-link-to-file',
			'multimediaviewer-link-to-page',
		),
	), $moduleInfo( 'mmv/ui' ) );

	$wgResourceModules['mmv.ui.reuse.embed'] = array_merge( array(
		'scripts' => array(
			'mmv.ui.reuse.embed.js',
		),

		'styles' => array(
			'mmv.ui.reuse.embed.less',
		),

		'dependencies' => array(
			'mmv.ui.reuse.tab',
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

			'multimediaviewer-embed-byline',
			'multimediaviewer-embed-license',
			'multimediaviewer-embed-via',

			'multimediaviewer-default-embed-dimensions',
			'multimediaviewer-original-embed-dimensions',
			'multimediaviewer-large-embed-dimensions',
			'multimediaviewer-medium-embed-dimensions',
			'multimediaviewer-small-embed-dimensions',
			'multimediaviewer-embed-dimensions',
		),
	), $moduleInfo( 'mmv/ui' ) );

	$wgResourceModules['mmv.ui.buttons'] = array_merge( array(
		'scripts' => array(
			'mmv.ui.buttons.js',
		),

		'styles' => array(
			'mmv.ui.buttons.less',
		),

		'dependencies' => array(
			'mmv.ui',
			'oojs',
		),
	), $moduleInfo( 'mmv/ui' ) );

	$wgResourceModules['mmv.logger'] = array_merge( array(
		'scripts' => array(
			'mmv.logger.js',
		),

		'dependencies' => array(
			'mmv.base',
		),
	), $moduleInfo( 'mmv' ) );

	$wgResourceModules['mmv.performance'] = array_merge( array(
		'scripts' => array(
			'mmv.performance.js',
		),

		'dependencies' => array(
			'mmv.base',
		),
	), $moduleInfo( 'mmv' ) );

	$wgResourceModules['mmv.api'] = array_merge( array(
		'scripts' => array(
			'mmv.api.js',
		),

		'dependencies' => array(
			'mediawiki.api',
			'mmv.base',
			'oojs',
		),
	), $moduleInfo( 'mmv' ) );

	$wgResourceModules['mmv'] = array_merge( array(
		'scripts' => array(
			'mmv.js',
		),

		'styles' => array(
			'mmv.less',
			// Always make this one the last of the list (Bug 61852)
			'mmv.loaded.css',
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
	), $moduleInfo( 'mmv' ) );

	$wgResourceModules['mmv.bootstrap'] = array_merge( array(
		'scripts' => array(
			'mmv.bootstrap.js',
		),

		'dependencies' => array(
			'jquery.hashchange',
			'mediawiki.Title',
			'mmv.logger',
			'mmv.ui',
		),
	), $moduleInfo( 'mmv' ) );

	$wgResourceModules['mmv.bootstrap.autostart'] = array_merge( array(
		'scripts' => array(
			'mmv.bootstrap.autostart.js',
		),

		'dependencies' => array(
			'mmv.base',
			'mmv.bootstrap',
		),
	), $moduleInfo( 'mmv' ) );

	$wgResourceModules['jquery.scrollTo'] = array_merge( array(
		'scripts' => array(
			'jquery.scrollTo.js',
		),
	), $moduleInfo( 'jquery.scrollTo' ) );

	$wgResourceModules['jquery.hashchange'] = array_merge( array(
		'scripts' => array(
			'jquery.hashchange.js',
		),
	), $moduleInfo( 'jquery.hashchange' ) );

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

	$licenses = array(
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
	);

	foreach ( $licenses as $license ) {
		$wgResourceModules['mmv']['messages'][] = 'multimediaviewer-license-' . $license;
	}

	$wgAutoloadClasses['MultimediaViewerHooks'] = __DIR__ . '/MultimediaViewerHooks.php';

	if ( $wgMediaViewerIsInBeta ) {
		$wgHooks['GetBetaFeaturePreferences'][] = 'MultimediaViewerHooks::getBetaPreferences';
	}

	$wgHooks['BeforePageDisplay'][] = 'MultimediaViewerHooks::getModulesForArticle';
	$wgHooks['CategoryPageView'][] = 'MultimediaViewerHooks::getModulesForCategory';
	$wgHooks['ResourceLoaderGetConfigVars'][] = 'MultimediaViewerHooks::resourceLoaderGetConfigVars';
	$wgHooks['ResourceLoaderTestModules'][] = 'MultimediaViewerHooks::getTestModules';

	$section = 'other';

	if ( $wgMediaViewerIsInBeta ) {
		$section = 'betafeatures';
	}

	$wgExtensionCredits[$section][] = array(
		'path' => __FILE__,
		'name' => 'MultimediaViewer',
		'descriptionmsg' => 'multimediaviewer-desc',
		'version' => '0.2.0',
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

} );
