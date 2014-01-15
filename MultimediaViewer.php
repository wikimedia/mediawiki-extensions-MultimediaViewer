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

$moduleInfoML = array(
	'localBasePath' => __DIR__ . '/resources/multilightbox',
	'remoteExtPath' => 'MultimediaViewer/resources/multilightbox',
);

$moduleInfoMMV = array(
	'localBasePath' => __DIR__ . '/resources/ext.multimediaViewer',
	'remoteExtPath' => 'MultimediaViewer/resources/ext.multimediaViewer',
);

$moduleInfoMoment = array(
	'localBasePath' => __DIR__ . '/resources/momentjs',
	'remoteExtPath' => 'MultimediaViewer/resources/momentjs',
);

$moduleInfoJQScrollTo = array(
	'localBasePath' => __DIR__ . '/resources/jquery.scrollTo',
	'remoteExtPath' => 'MultimediaViewer/resources/jquery.scrollTo',
);

$wgExtensionMessagesFiles['MultimediaViewer'] = __DIR__ . '/MultimediaViewer.i18n.php';

$wgResourceModules['multilightbox.interface'] = array_merge( array(
	'scripts' => array(
		'lightboxinterface.js',
	),

	'styles' => array(
		'multilightbox.css',
	),
), $moduleInfoML );

$wgResourceModules['multilightbox.image'] = array_merge( array(
	'scripts' => array(
		'lightboximage.js',
	),
), $moduleInfoML );

$wgResourceModules['multilightbox'] = array_merge( array(
	'scripts' => array(
		'multilightbox.js',
	),

	'dependencies' => array(
		'ext.multimediaViewer.lightboxinterface',
	),
), $moduleInfoML );

$wgResourceModules['ext.multimediaViewer.lightboximage'] = array_merge( array(
	'scripts' => array(
		'ext.multimediaViewer.lightboximage.js',
	),

	'dependencies' => array(
		'oojs',
		'multilightbox.image',
	),
), $moduleInfoMMV );

$wgResourceModules['ext.multimediaViewer.lightboxinterface'] = array_merge( array(
	'scripts' => array(
		'ext.multimediaViewer.lightboxinterface.js',
	),

	'dependencies' => array(
		'oojs',
		'multilightbox.interface',
	),
), $moduleInfoMMV );

$wgResourceModules['ext.multimediaViewer.dataModel'] = array_merge( array(
	'scripts' => array(
		'ext.multimediaViewer.dataModel.js',
	),

	'dependencies' => array(
		'ext.multimediaViewer.base',
		'oojs',
	),
), $moduleInfoMMV );

$wgResourceModules['ext.multimediaViewer.dataProvider'] = array_merge( array(
	'scripts' => array(
		'ext.multimediaViewer.dataProvider.js',
	),

	'dependencies' => array(
		'ext.multimediaViewer.dataModel',
		'oojs',
	),
), $moduleInfoMMV );

$wgResourceModules['ext.multimediaViewer.base'] = array_merge( array(
	'scripts' => array(
		'mmv.js',
	),
), $moduleInfoMMV );

$wgResourceModules['ext.multimediaViewer'] = array_merge( array(
	'scripts' => array(
		'ext.multimediaViewer.js',
	),

	'styles' => array(
		'ext.multimediaViewer.css',
	),

	'dependencies' => array(
		'multilightbox',
		'momentjs',
		'jquery.scrollTo',
		'ext.multimediaViewer.lightboximage',
		'mediawiki.Title',
		'jquery.ui.dialog',
		'jquery.hidpi',
		'ext.multimediaViewer.dataModel',
		'ext.multimediaViewer.dataProvider',
		'mediawiki.language',
	),

	'messages' => array(
		'multimediaviewer-file-page',
		'multimediaviewer-repository',
		'multimediaviewer-repository-local',
		'multimediaviewer-datetime-created',
		'multimediaviewer-datetime-uploaded',
		'multimediaviewer-userpage-link',
		'multimediaviewer-credit',
		'multimediaviewer-use-file',
		'multimediaviewer-use-file-owt',
		'multimediaviewer-use-file-own',
		'multimediaviewer-use-file-offwiki',
		'multimediaviewer-about-mmv',
		'multimediaviewer-discuss-mmv',
		'multimediaviewer-desc-nil',

		'multimediaviewer-geoloc-north',
		'multimediaviewer-geoloc-east',
		'multimediaviewer-geoloc-south',
		'multimediaviewer-geoloc-west',
		'multimediaviewer-geoloc-coord',
		'multimediaviewer-geoloc-coords',
	),
), $moduleInfoMMV );

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
), $moduleInfoMoment );

$wgResourceModules['jquery.scrollTo'] = array_merge( array(
	'scripts' => array(
		'jquery.scrollTo.js',
	),
), $moduleInfoJQScrollTo );

$wgExtensionFunctions[] = function () {
	global $wgResourceModules;

	if ( isset( $wgResourceModules['ext.eventLogging'] ) ) {
		$wgResourceModules['schema.MediaViewer'] = array(
			'class' => 'ResourceLoaderSchemaModule',
			'schema' => 'MediaViewer',
			'revision' => 6636420,
		);

		$wgResourceModules['schema.MediaViewerPerf'] = array(
			'class' => 'ResourceLoaderSchemaModule',
			'schema' => 'MediaViewerPerf',
			'revision' => 6636500,
		);

		$wgResourceModules['ext.multimediaViewer']['dependencies'][] = 'ext.eventLogging';
		$wgResourceModules['ext.multimediaViewer']['dependencies'][] = 'schema.MediaViewer';
		$wgResourceModules['ext.multimediaViewer']['dependencies'][] = 'schema.MediaViewerPerf';
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
	'cc-pd',
	'cc-zero',
	'default',
);

foreach ( $licenses as $license ) {
	$wgResourceModules['ext.multimediaViewer']['messages'][] = 'multimediaviewer-license-' . $license;
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
