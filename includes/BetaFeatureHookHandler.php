<?php

namespace MediaWiki\Extension\MultimediaViewer;

use MediaWiki\Config\Config;
use MediaWiki\Context\RequestContext;
use MediaWiki\Extension\BetaFeatures\Hooks\GetBetaFeaturePreferencesHook;
use MediaWiki\MainConfigNames;
use MediaWiki\User\User;

/**
 * This handler is separated from the main HookHandler to allow use of type
 * validation via the hook interface, without a hard dependency on BetaFeatures.
 * It is important that this class only be referenced/loaded by code
 * controlled by the BetaFeatures extension, to keep it a soft dependency.
 */
class BetaFeatureHookHandler implements GetBetaFeaturePreferencesHook {
	public function __construct(
		private readonly Config $config,
	) {
	}

	/**
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/GetBetaFeaturePreferences
	 *
	 * @param User $user
	 * @param array[] &$prefs
	 */
	public function onGetBetaFeaturePreferences( User $user, array &$prefs ) {
		if ( RequestContext::getMain()->getSkinName() !== 'minerva' ) {
			return;
		}

		if ( $this->config->get( 'MediaViewerBetaFeature' ) ) {
			$path = $this->config->get( MainConfigNames::ExtensionAssetsPath );
			$prefs[Hooks::BETA_FEATURES_KEY] = [
				'label-message' => 'multimediaviewer-beta-feature-name',
				'desc-message' => 'multimediaviewer-beta-feature-description',
				'screenshot' => [
					'ltr' => "$path/MultimediaViewer/resources/assets/beta-feature-ltr.png",
					'rtl' => "$path/MultimediaViewer/resources/assets/beta-feature-rtl.png",
				],
				'info-link'
				=> 'https://www.mediawiki.org/wiki/Readers/Reader_Growth/Image_Browsing',
				'discussion-link'
				=> 'https://www.mediawiki.org/wiki/Talk:Readers/Reader_Growth/Image_Browsing',
			];
		}
	}
}
