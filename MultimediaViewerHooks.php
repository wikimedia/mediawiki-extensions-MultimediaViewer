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

	// Add JavaScript to the page when an image is on it
	// and the user has enabled the feature.
	static function getModules( &$out, &$skin ) {
		if ( BetaFeatures::isFeatureEnabled( $out->getUser(), 'multimedia-viewer' ) &&
				count( $out->getFileSearchOptions() ) > 0 ) {
			$out->addModules( array( 'ext.multimediaViewer' ) );
		}

		return true;
	}

	// Add a beta preference to gate the feature
	static function getBetaPreferences( $user, &$prefs ) {
		global $wgExtensionAssetsPath;

		$prefs['multimedia-viewer'] = array(
			'label-message' => 'multimediaviewer-pref',
			'desc-message' => 'multimediaviewer-pref-desc',
			'info-link' => 'https://mediawiki.org/wiki/Multimedia/Media_Viewer',
			'discussion-link' => 'https://mediawiki.org/wiki/Talk:Multimedia/Media_Viewer',
//			'screenshot' => $wgExtensionAssetsPath . '/MultimediaViewer/images/screenshot.png',
		);

		return true;
	}
}
