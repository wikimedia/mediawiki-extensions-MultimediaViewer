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

	/** Link to help about this module */
	protected static $helpLink = '//mediawiki.org/wiki/Special:MyLanguage/Multimedia/Media_Viewer/Help';

	/**
	 * Checks the context for whether to load the viewer.
	 * @param User $user
	 * @return bool
	 */
	protected static function shouldHandleClicks( $user ) {
		global $wgMediaViewerIsInBeta, $wgEnableMediaViewerForLoggedInUsersOnly;

		if ( $wgMediaViewerIsInBeta && class_exists( 'BetaFeatures' ) ) {
			return BetaFeatures::isFeatureEnabled( $user, 'multimedia-viewer' );
		}

		if ( $user->getOption( 'multimediaviewer-enable' ) ) {
			if ( $wgEnableMediaViewerForLoggedInUsersOnly ) {
				return $user->isLoggedIn();
			} else {
				// Default to enabling for everyone.
				return true;
			}
		}

		return false;
	}

	/**
	 * Handler for all places where we add the modules
	 * Could be on article pages or on Category pages
	 * @param OutputPage $out
	 * @return bool
	 */
	protected static function getModules( &$out ) {
		$out->addModules( array( 'mmv.bootstrap.autostart' ) );

		return true;
	}

	/**
	 * Handler for BeforePageDisplay hook
	 * Add JavaScript to the page when an image is on it
	 * and the user has enabled the feature if BetaFeatures is installed
	 * @param OutputPage $out
	 * @param Skin $skin
	 * @return bool
	 */
	public static function getModulesForArticle( &$out, &$skin ) {
		if ( count( $out->getFileSearchOptions() ) > 0 ) {
			return self::getModules( $out );
		}

		return true;
	}

	/**
	 * Handler for CategoryPageView hook
	 * Add JavaScript to the page if there are images in the category
	 * @param CategoryPage $catPage
	 * @return bool
	 */
	public static function getModulesForCategory( &$catPage ) {
		$title = $catPage->getTitle();
		$cat = Category::newFromTitle( $title );
		if ( $cat->getFileCount() > 0 ) {
			$out = $catPage->getContext()->getOutput();
			return self::getModules( $out );
		}

		return true;
	}

	// Add a beta preference to gate the feature
	public static function getBetaPreferences( $user, &$prefs ) {
		global $wgExtensionAssetsPath, $wgMediaViewerIsInBeta;

		if ( !$wgMediaViewerIsInBeta ) {
			return true;
		}

		$prefs['multimedia-viewer'] = array(
			'label-message' => 'multimediaviewer-pref',
			'desc-message' => 'multimediaviewer-pref-desc',
			'info-link' => self::$infoLink,
			'discussion-link' => self::$discussionLink,
			'help-link' => self::$helpLink,
			'screenshot' => array(
				'ltr' => "$wgExtensionAssetsPath/MultimediaViewer/viewer-ltr.svg",
				'rtl' => "$wgExtensionAssetsPath/MultimediaViewer/viewer-rtl.svg",
			),
		);

		return true;
	}

	// Adds a default-enabled preference to gate the feature on non-beta sites
	public static function getPreferences( $user, &$prefs ) {
		global $wgMediaViewerIsInBeta;

		if ( !$wgMediaViewerIsInBeta ) {
			$prefs['multimediaviewer-enable'] = array(
				'type' => 'toggle',
				'label-message' => 'multimediaviewer-optin-pref',
				'section' => 'rendering/files',
			);
		}

		return true;
	}

	/**
	 * Export variables used in both PHP and JS to keep DRY
	 * @param array $vars
	 * @return bool
	 */
	public static function resourceLoaderGetConfigVars( &$vars ) {
		global $wgAPIPropModules, $wgNetworkPerformanceSamplingFactor;
		$vars['wgMultimediaViewer'] = array(
			'infoLink' => self::$infoLink,
			'discussionLink' => self::$discussionLink,
			'helpLink' => self::$helpLink,
			'globalUsageAvailable' => isset( $wgAPIPropModules['globalusage'] ),
		);
		$vars['wgNetworkPerformanceSamplingFactor'] = $wgNetworkPerformanceSamplingFactor;
		$vars['wgMediaViewer'] = true;

		return true;
	}

	/**
	 * Export variables which depend on the current user
	 * @param $vars
	 * @param OutputPage $out
	 */
	public static function makeGlobalVariablesScript( &$vars, OutputPage $out ) {
		$user = $out->getUser();
		$vars['wgMediaViewerOnClick'] = self::shouldHandleClicks( $user );
	}

	/**
	 * Get modules for testing our JavaScript
	 * @param array $testModules
	 * @param ResourceLoader resourceLoader
	 * @return bool
	 */
	public static function getTestModules( array &$testModules, ResourceLoader &$resourceLoader ) {
		$testModules['qunit']['mmv.tests'] = array(
			'scripts' => array(
				'tests/qunit/mmv/mmv.bootstrap.test.js',
				'tests/qunit/mmv/mmv.test.js',
				'tests/qunit/mmv/mmv.lightboxinterface.test.js',
				'tests/qunit/mmv/mmv.lightboximage.test.js',
				'tests/qunit/mmv/mmv.ThumbnailWidthCalculator.test.js',
				'tests/qunit/mmv/mmv.EmbedFileFormatter.test.js',
				'tests/qunit/mmv/mmv.performance.test.js',
				'tests/qunit/mmv/mmv.logger.test.js',
				'tests/qunit/mmv/model/mmv.model.test.js',
				'tests/qunit/mmv/model/mmv.model.TaskQueue.test.js',
				'tests/qunit/mmv/model/mmv.model.License.test.js',
				'tests/qunit/mmv/model/mmv.model.Repo.test.js',
				'tests/qunit/mmv/provider/mmv.provider.Api.test.js',
				'tests/qunit/mmv/provider/mmv.provider.ImageUsage.test.js',
				'tests/qunit/mmv/provider/mmv.provider.GlobalUsage.test.js',
				'tests/qunit/mmv/provider/mmv.provider.ImageInfo.test.js',
				'tests/qunit/mmv/provider/mmv.provider.FileRepoInfo.test.js',
				'tests/qunit/mmv/provider/mmv.provider.ThumbnailInfo.test.js',
				'tests/qunit/mmv/provider/mmv.provider.UserInfo.test.js',
				'tests/qunit/mmv/provider/mmv.provider.Image.test.js',
				'tests/qunit/mmv/ui/mmv.ui.test.js',
				'tests/qunit/mmv/ui/mmv.ui.canvas.test.js',
				'tests/qunit/mmv/ui/mmv.ui.canvasButtons.test.js',
				'tests/qunit/mmv/ui/mmv.ui.categories.test.js',
				'tests/qunit/mmv/ui/mmv.ui.description.test.js',
				'tests/qunit/mmv/ui/mmv.ui.fileUsage.test.js',
				'tests/qunit/mmv/ui/mmv.ui.metadataPanel.test.js',
				'tests/qunit/mmv/ui/mmv.ui.permission.test.js',
				'tests/qunit/mmv/ui/mmv.ui.reuse.dialog.test.js',
				'tests/qunit/mmv/ui/mmv.ui.reuse.embed.test.js',
				'tests/qunit/mmv/ui/mmv.ui.reuse.share.test.js',
				'tests/qunit/mmv/ui/mmv.ui.reuse.tab.test.js',
				'tests/qunit/mmv/mmv.testhelpers.js',
			),
			'dependencies' => array(
				'mmv',
				'mmv.bootstrap',
			),
			'localBasePath' => __DIR__,
			'remoteExtPath' => 'MultimediaViewer',
		);

		return true;
	}
}
