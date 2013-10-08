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

$moduleInfo = array(
	'localBasePath' => __DIR__,
	'remoteExtPath' => 'MultimediaViewer',
);

$wgExtensionMessagesFiles['MultimediaViewer'] = __DIR__ . '/MultimediaViewer.i18n.php';

$wgResourceModules['multilightbox.interface'] = array_merge( array(
	'scripts' => array(
		'js/multilightbox/lightboxinterface.js',
	),

	'styles' => array(
		'css/multilightbox.css',
	),
), $moduleInfo );

$wgResourceModules['multilightbox.image'] = array_merge( array(
	'scripts' => array(
		'js/multilightbox/lightboximage.js',
	),
), $moduleInfo );

$wgResourceModules['multilightbox'] = array_merge( array(
	'scripts' => array(
		'js/multilightbox/multilightbox.js',
	),

	'dependencies' => array(
		'multilightbox.interface',
	),
), $moduleInfo );

$wgResourceModules['ext.multimediaViewer'] = array_merge( array(
	'scripts' => array(
		'js/ext.multimediaViewer.js',
	),

	'styles' => array(
		'css/ext.multimediaViewer.css',
	),

	'dependencies' => array(
		'multilightbox',
		'multilightbox.image',
		'mediawiki.Title',
	),

	'messages' => array(
		'multimediaviewer-file-page',
	),
), $moduleInfo );


$wgAutoloadClasses['MultimediaViewerHooks'] = __DIR__ . '/MultimediaViewerHooks.php';
$wgHooks['GetBetaFeaturePreferences'][] = 'MultimediaViewerHooks::getBetaPreferences';
$wgHooks['BeforePageDisplay'][] = 'MultimediaViewerHooks::getModules';

$wgExtensionCredits['other'][] = array(
	'path' => __FILE__,
	'name' => 'MultimediaViewer',
	'descriptionmsg' => 'multimediaviewer-desc',
	'version' => '0.1',
	'author' => array(
		'MarkTraceur (Mark Holmquist)',
	),
	'url' => 'https://mediawiki.org/wiki/Extension:MultimediaViewer',
);
