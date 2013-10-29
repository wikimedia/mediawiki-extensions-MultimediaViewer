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

class MultimediaViewerHooks {
	/** Link to more information about this module */
	protected static $infoLink = '//mediawiki.org/wiki/Special:MyLanguage/Multimedia/About_Media_Viewer';

	/** Link to a page where this module can be discussed */
	protected static $discussionLink = '//mediawiki.org/wiki/Special:MyLanguage/Talk:Multimedia/About_Media_Viewer';

	/*
	 * Handler for BeforePageDisplay hook
	 * Add JavaScript to the page when an image is on it
	 * and the user has enabled the feature if BetaFeatures is installed
	 * @param OutputPage $out
	 * @param Skin $skin
	 * @return bool
	 */
	public static function getModules( &$out, &$skin ) {
		if ( class_exists( 'BetaFeatures')
			&& !BetaFeatures::isFeatureEnabled( $out->getUser(), 'multimedia-viewer' ) ) {
			return true;
		}
		if ( count( $out->getFileSearchOptions() ) > 0 ) {
			$out->addModules( array( 'ext.multimediaViewer' ) );
		}

		return true;
	}

	// Add a beta preference to gate the feature
	public static function getBetaPreferences( $user, &$prefs ) {
		global $wgExtensionAssetsPath;

		$prefs['multimedia-viewer'] = array(
			'label-message' => 'multimediaviewer-pref',
			'desc-message' => 'multimediaviewer-pref-desc',
			'info-link' => self::$infoLink,
			'discussion-link' => self::$discussionLink,
			'screenshot' => $wgExtensionAssetsPath . '/MultimediaViewer/img/viewer.svg',
		);

		return true;
	}

	/**
	 * Export variables used in both PHP and JS to keep DRY
	 * @param array $vars
	 * @return bool
	 */
	public static function resourceLoaderGetConfigVars( &$vars ) {
		$vars['wgMultimediaViewer'] = array(
			'infoLink' => self::$infoLink,
			'discussionLink' => self::$discussionLink,
		);
		return true;
	}
}
