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
	global $wgExtensionMessagesFiles, $wgResourceModules, $wgExtensionFunctions,
		$wgAutoloadClasses, $wgHooks, $wgExtensionCredits, $wgNetworkPerformanceSamplingFactor;

	/** @var int|bool: If set, records image load network performance once per this many requests. False if unset. **/
	$wgNetworkPerformanceSamplingFactor = false;

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

	$wgResourceModules['multilightbox.interface'] = array_merge( array(
		'scripts' => array(
			'lightboxinterface.js',
		),

		'styles' => array(
			'multilightbox.css',
		),
	), $moduleInfo( 'multilightbox' ) );

	$wgResourceModules['multilightbox.image'] = array_merge( array(
		'scripts' => array(
			'lightboximage.js',
		),
	), $moduleInfo( 'multilightbox' ) );

	$wgResourceModules['multilightbox'] = array_merge( array(
		'scripts' => array(
			'multilightbox.js',
		),

		'dependencies' => array(
			'mmv.lightboxinterface',
		),
	), $moduleInfo( 'multilightbox' ) );

	$wgResourceModules['mmv.lightboximage'] = array_merge( array(
		'scripts' => array(
			'mmv.lightboximage.js',
		),

		'dependencies' => array(
			'oojs',
			'multilightbox.image',
		),
	), $moduleInfo( 'mmv' ) );

	$wgResourceModules['mmv.lightboxinterface'] = array_merge( array(
		'scripts' => array(
			'mmv.lightboxinterface.js',
		),

		'dependencies' => array(
			'oojs',
			'multilightbox.interface',
			'mmv.ui.categories',
			'mmv.ui.description',
			'mmv.ui.fileUsage',
			'mmv.ui.metadataPanel',
			'mmv.ThumbnailWidthCalculator',
		),
	), $moduleInfo( 'mmv' ) );

	$wgResourceModules['mmv.ThumbnailWidthCalculator'] = array_merge( array(
		'scripts' => array(
			'mmv.ThumbnailWidthCalculator.js',
		),

		'dependencies' => array(
			'mediawiki',
			'jquery',
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

	$wgResourceModules['mmv.multilightbox'] = array_merge( array(
		'scripts' => array(
			'mmv.multilightbox.js',
		),

		'dependencies' => array(
			'oojs',
			'multilightbox',
		),
	), $moduleInfo( 'mmv' ) );

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

		'dependencies' => array(
			'mmv.base',
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
			'mediawiki.Uri',
			'mediawiki.jqueryMsg',
			'mmv.ui',
			'oojs',
		),
	), $moduleInfo( 'mmv/ui' ) );

	$wgResourceModules['mmv.ui.metadataPanel'] = array_merge( array(
		'scripts' => array(
			'mmv.ui.metadataPanel.js',
		),
		// Note: We should pull these styles out, but the LESS patch should get merged first.
//		'styles' => array(
//			'mmv.ui.metadataPanel.less',
//		),

		'dependencies' => array(
			'mmv.ui',
			'mmv.ui.fileReuse',
			'oojs',
			'momentjs',
		),

		'messages' => array(
			'multimediaviewer-repository',
			'multimediaviewer-repository-local',

			'multimediaviewer-credit',

			'multimediaviewer-userpage-link',

			'multimediaviewer-datetime-created',
			'multimediaviewer-datetime-uploaded',

			'multimediaviewer-geoloc-north',
			'multimediaviewer-geoloc-east',
			'multimediaviewer-geoloc-south',
			'multimediaviewer-geoloc-west',
			'multimediaviewer-geoloc-coord',
			'multimediaviewer-geoloc-coords',
			'multimediaviewer-geolocation',

			'multimediaviewer-about-mmv',
			'multimediaviewer-discuss-mmv',
		),
	), $moduleInfo( 'mmv/ui' ) );

	$wgResourceModules['mmv.ui.fileReuse'] = array_merge( array(
		'scripts' => array(
			'mmv.ui.fileReuse.js',
		),

		'styles' => array(
			'mmv.ui.fileReuse.less',
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
			'oojs',
		),
	), $moduleInfo( 'mmv' ) );

	$wgResourceModules['mmv.performance'] = array_merge( array(
		'scripts' => array(
			'mmv.performance.js',
		),

		'dependencies' => array(
			'jquery',
			'mediawiki',
		),
	), $moduleInfo( 'mmv' ) );

	$wgResourceModules['mmv'] = array_merge( array(
		'scripts' => array(
			'mmv.js',
		),

		'styles' => array(
			'mmv.less',
		),

		'dependencies' => array(
			'mmv.logger',
			'multilightbox',
			'jquery.scrollTo',
			'mmv.lightboximage',
			'jquery.fullscreen',
			'jquery.throttle.debounce',
			'mediawiki.api',
			'mediawiki.Uri',
			'mediawiki.Title',
			'jquery.ui.dialog',
			'jquery.hidpi',
			'mmv.model',
			'mmv.model.FileUsage',
			'mmv.model.Image',
			'mmv.model.Repo',
			'mmv.model.Thumbnail',
			'mmv.provider',
			'mediawiki.language',
			'mmv.multilightbox',
			'mmv.performance',
			'mmv.ThumbnailWidthCalculator',
		),

		'messages' => array(
			'comma-separator',

			'multimediaviewer-file-page',
			'multimediaviewer-use-file',
			'multimediaviewer-use-file-owt',
			'multimediaviewer-use-file-own',
			'multimediaviewer-use-file-offwiki',
			'multimediaviewer-desc-nil',

			'multimediaviewer-fileusage-count',
			'multimediaviewer-fileusage-count-more',
			'multimediaviewer-fileusage-link',
			'multimediaviewer-fileusage-local-section',
			'multimediaviewer-fileusage-global-section',
		),
	), $moduleInfo( 'mmv' ) );

	$wgResourceModules['momentjs'] = array_merge( array(
		'scripts' => array(
			'moment.js',
		),
		'languageScripts' => array(
			'ar' => 'lang/ar.js',
			'ar-ma' => 'lang/ar-ma.js',
			'bg' => 'lang/bg.js',
			'br' => 'lang/br.js',
			'bs' => 'lang/bs.js',
			'ca' => 'lang/ca.js',
			'cv' => 'lang/cv.js',
			'cy' => 'lang/cy.js',
			'cs' => 'lang/cs.js',
			'da' => 'lang/da.js',
			'de' => 'lang/de.js',
			'el' => 'lang/el.js',
			'en-au' => 'lang/en-au.js',
			'en-ca' => 'lang/en-ca.js',
			'en-gb' => 'lang/en-gb.js',
			'eo' => 'lang/eo.js',
			'es' => 'lang/es.js',
			'et' => 'lang/et.js',
			'eu' => 'lang/eu.js',
			'fa' => 'lang/fa.js',
			'fi' => 'lang/fi.js',
			'fo' => 'lang/fo.js',
			'fr' => 'lang/fr.js',
			'fr-ca' => 'lang/fr-ca.js',
			'gl' => 'lang/gl.js',
			'he' => 'lang/he.js',
			'hi' => 'lang/hi.js',
			'hr' => 'lang/hr.js',
			'hu' => 'lang/hu.js',
			'id' => 'lang/id.js',
			'is' => 'lang/is.js',
			'it' => 'lang/it.js',
			'ja' => 'lang/ja.js',
			'ka' => 'lang/ka.js',
			'ko' => 'lang/ko.js',
			'lt' => 'lang/lt.js',
			'lv' => 'lang/lv.js',
			'ml' => 'lang/ml.js',
			'mr' => 'lang/mr.js',
			'ms-my' => 'lang/ms-my.js',
			'nb' => 'lang/nb.js',
			'ne' => 'lang/ne.js',
			'nl' => 'lang/nl.js',
			'nn' => 'lang/nn.js',
			'pl' => 'lang/pl.js',
			'pt' => 'lang/pt.js',
			'pt-br' => 'lang/pt-br.js',
			'ro' => 'lang/ro.js',
			'ru' => 'lang/ru.js',
			'sk' => 'lang/sk.js',
			'sl' => 'lang/sl.js',
			'sq' => 'lang/sq.js',
			'sv' => 'lang/sv.js',
			'th' => 'lang/th.js',
			'tl-ph' => 'lang/tl-ph.js',
			'tr' => 'lang/tr.js',
			'tzm' => 'lang/tzm.js',
			'tzm-la' => 'lang/tzm-la.js',
			'uk' => 'lang/uk.js',
			'uz' => 'lang/uz.js',
			'vn' => 'lang/vn.js',
			'zh-cn' => 'lang/zh-cn.js',
			'zh-tw' => 'lang/zh-tw.js',
		),
	), $moduleInfo( 'momentjs' ) );

	$wgResourceModules['jquery.scrollTo'] = array_merge( array(
		'scripts' => array(
			'jquery.scrollTo.js',
		),
	), $moduleInfo( 'jquery.scrollTo' ) );

	$wgResourceModules['jquery.throttle.debounce'] = array_merge( array(
		'scripts' => array(
			'jquery.ba-throttle-debounce.js',
		),
	), $moduleInfo( 'jquery.throttle.debounce' ) );

	$wgExtensionFunctions[] = function () {
		global $wgResourceModules;

		if ( isset( $wgResourceModules['ext.eventLogging'] ) ) {
			$wgResourceModules['schema.MediaViewer'] = array(
				'class' => 'ResourceLoaderSchemaModule',
				'schema' => 'MediaViewer',
				'revision' => 6636420,
			);

			$wgResourceModules['schema.MultimediaViewerNetworkPerformance'] = array(
				'class' => 'ResourceLoaderSchemaModule',
				'schema' => 'MultimediaViewerNetworkPerformance',
				'revision' => 7393226,
			);

			$wgResourceModules['mmv']['dependencies'][] = 'ext.eventLogging';
			$wgResourceModules['mmv']['dependencies'][] = 'schema.MediaViewer';
			$wgResourceModules['mmv']['dependencies'][] = 'schema.MultimediaViewerNetworkPerformance';
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
	$wgHooks['GetBetaFeaturePreferences'][] = 'MultimediaViewerHooks::getBetaPreferences';
	$wgHooks['BeforePageDisplay'][] = 'MultimediaViewerHooks::getModulesForArticle';
	$wgHooks['CategoryPageView'][] = 'MultimediaViewerHooks::getModulesForCategory';
	$wgHooks['ResourceLoaderGetConfigVars'][] = 'MultimediaViewerHooks::resourceLoaderGetConfigVars';
	$wgHooks['ResourceLoaderTestModules'][] = 'MultimediaViewerHooks::getTestModules';

	$wgExtensionCredits['other'][] = array(
		'path' => __FILE__,
		'name' => 'MultimediaViewer',
		'descriptionmsg' => 'multimediaviewer-desc',
		'version' => '0.2.0',
		'author' => array(
			'MarkTraceur (Mark Holmquist)',
		),
		'url' => 'https://mediawiki.org/wiki/Extension:MultimediaViewer',
	);

} );
