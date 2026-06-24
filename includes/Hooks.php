<?php
/**
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

namespace MediaWiki\Extension\MultimediaViewer;

use MediaWiki\Category\Category;
use MediaWiki\Config\Config;
use MediaWiki\Config\ConfigException;
use MediaWiki\Context\RequestContext;
use MediaWiki\Extension\BetaFeatures\BetaFeatures;
use MediaWiki\FileRepo\RepoGroup;
use MediaWiki\Hook\GetDoubleUnderscoreIDsHook;
use MediaWiki\Html\Html;
use MediaWiki\MainConfigNames;
use MediaWiki\Media\Hook\ThumbnailBeforeProduceHTMLHook;
use MediaWiki\Media\ThumbnailImage;
use MediaWiki\Output\Hook\BeforePageDisplayHook;
use MediaWiki\Output\Hook\MakeGlobalVariablesScriptHook;
use MediaWiki\Output\OutputPage;
use MediaWiki\Page\CategoryPage;
use MediaWiki\Page\Hook\CategoryPageViewHook;
use MediaWiki\Page\PageProps;
use MediaWiki\Parser\ParserOptions;
use MediaWiki\Parser\ParserOutput;
use MediaWiki\Parser\ParserOutputLinkTypes;
use MediaWiki\Preferences\Hook\GetPreferencesHook;
use MediaWiki\Registration\ExtensionRegistry;
use MediaWiki\ResourceLoader\Context;
use MediaWiki\ResourceLoader\Hook\ResourceLoaderGetConfigVarsHook;
use MediaWiki\Skin\Skin;
use MediaWiki\SpecialPage\SpecialPageFactory;
use MediaWiki\Title\Title;
use MediaWiki\User\Hook\UserGetDefaultOptionsHook;
use MediaWiki\User\Options\UserOptionsLookup;
use MediaWiki\User\User;
use MobileContext;
use Wikimedia\Parsoid\Core\DOMCompat;
use Wikimedia\Parsoid\Utils\DOMUtils;

class Hooks implements
	MakeGlobalVariablesScriptHook,
	UserGetDefaultOptionsHook,
	GetPreferencesHook,
	BeforePageDisplayHook,
	CategoryPageViewHook,
	ResourceLoaderGetConfigVarsHook,
	GetDoubleUnderscoreIDsHook,
	ThumbnailBeforeProduceHTMLHook
{
	// Minimum number of images in a wiki page to enable the carousel.
	private const MIN_CAROUSEL_IMAGES = 3;
	// Page property that represents the __NOMEDIAVIEWERCAROUSEL__ magic word / behavior switch.
	// When `__NOMEDIAVIEWERCAROUSEL__` is in the page content,
	// the `nomediaviewercarousel` page property is set during parse.
	// Checking page props lets request-time carousel decisions reuse the
	// parser output metadata without reparsing the page content.
	private const DISABLE_MOBILE_CAROUSEL_PAGE_PROPERTY = 'nomediaviewercarousel';
	// User preference key for the per-reader opt-out of the mobile image carousel.
	private const ENABLE_IMAGE_CAROUSEL_PREFERENCE = 'enable_image_carousel';
	// Beta features key, used to populate a checkbox in the user's beta preferences.
	// Must be registered in the production allowlist (defined in mediawiki-config repo
	// in wmf-config/InitialiseSettings.php as `wgBetaFeaturesAllowList` ).
	public const BETA_FEATURES_KEY = 'multimediaviewer-beta';

	public function __construct(
		private readonly Config $config,
		private readonly RepoGroup $repoGroup,
		private readonly SpecialPageFactory $specialPageFactory,
		private readonly UserOptionsLookup $userOptionsLookup,
		private readonly PageProps $pageProps,
		private readonly ?MobileContext $mobileContext,
	) {
	}

	/**
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/UserGetDefaultOptions
	 * @param array &$defaultOptions
	 */
	public function onUserGetDefaultOptions( &$defaultOptions ) {
		if ( $this->config->get( 'MediaViewerEnableByDefault' ) ) {
			$defaultOptions['multimediaviewer-enable'] = 1;
		}

		// The carousel is shown unless the reader explicitly opts out.
		$defaultOptions[self::ENABLE_IMAGE_CAROUSEL_PREFERENCE] = 1;
	}

	/**
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/GetPreferences
	 * Adds a default-enabled preference to gate the feature
	 * @param User $user
	 * @param array &$prefs
	 */
	public function onGetPreferences( $user, &$prefs ) {
		$prefs['multimediaviewer-enable'] = [
			'type' => 'toggle',
			'label-message' => 'multimediaviewer-optin-pref',
			'section' => 'rendering/files',
		];

		// Only offer the carousel opt-out where the carousel can actually appear.
		if ( !$this->config->get( 'MediaViewerMobileCarousel' ) ) {
			return;
		}

		// The carousel is a mobile feature, so the visible toggle is only shown
		// on Minerva; on other skins the value is preserved but hidden.
		$prefs[self::ENABLE_IMAGE_CAROUSEL_PREFERENCE] = [
			'type' => $this->getCurrentRequestSkinName() === 'minerva' ? 'toggle' : 'hidden',
			'label-message' => 'multimediaviewer-enable-image-carousel-pref',
			'section' => 'rendering/files',
		];
	}

	/**
	 * Checks the context for whether to load the viewer.
	 * @param User $performer
	 * @return bool
	 */
	protected function shouldHandleClicks( User $performer ): bool {
		if ( $performer->isNamed() ) {
			return (bool)$this->userOptionsLookup->getOption( $performer, 'multimediaviewer-enable' );
		}

		return (bool)(
			$this->config->get( 'MediaViewerEnableByDefaultForAnonymous' ) ??
			$this->config->get( 'MediaViewerEnableByDefault' )
		);
	}

	/**
	 * Whether the current request is being served through MobileFrontend's mobile view.
	 *
	 * @return bool
	 */
	protected function isMobileFrontendView(): bool {
		return ExtensionRegistry::getInstance()->isLoaded( 'MobileFrontend' ) &&
			$this->mobileContext &&
			$this->mobileContext->shouldDisplayMobileView();
	}

	/**
	 * Handler for all places where we add the modules
	 * Could be on article pages or on Category pages
	 * @param OutputPage $out
	 */
	protected function getModules( OutputPage $out ) {
		// Desktop view: always load the viewer.
		if ( !$this->isMobileFrontendView() ) {
			$out->addModules( 'mmv.bootstrap' );
			return;
		}

		// Mobile view: the carousel module is handled by
		// maybeAddMobileCarousel(). Beta mobile viewer: loading mmv.bootstrap
		// registers the "#/media/" route on the shared router ahead of the
		// MobileFrontend lightbox, which stands down whenever the bootstrap is
		// loaded (T169622). It is enabled sitewide via $wgMediaViewerMobileBeta
		// (T428774) or per-request via ?mmvBeta=1; both are independent of the
		// mobile carousel rollout gate.
		if (
			$this->shouldUseMobileBetaViewer( $out ) ||
			$out->getRequest()->getFuzzyBool( 'mmvBeta' )
		) {
			$out->addModules( 'mmv.bootstrap' );
		}
	}

	/**
	 * Whether the beta mobile viewer should replace the MobileFrontend
	 * image viewer for this request (T428774).
	 *
	 * Conditions:
	 *  - request is served through MobileFrontend's mobile view
	 *  - MediaViewerMobileBeta config flag is enabled
	 *  - the user has not disabled MediaViewer in their preferences
	 *
	 * @param OutputPage $out
	 * @return bool
	 */
	protected function shouldUseMobileBetaViewer( OutputPage $out ): bool {
		return (
			$this->isMobileFrontendView() &&
			$this->config->get( 'MediaViewerMobileBeta' ) &&
			$this->shouldHandleClicks( $out->getUser() )
		);
	}

	/**
	 * Render the mobile carousel server-side and load its JS module.
	 *
	 * The module is added only when carousel markup is actually rendered
	 * (a qualifying request and enough thumbnails), so the client module
	 * can assume carousel items exist in the DOM.
	 *
	 * @param OutputPage $out
	 */
	private function maybeAddMobileCarousel( OutputPage $out ): void {
		if ( !$this->shouldUseMobileCarousel( $out ) ) {
			return;
		}

		$thumbExtractor = new ThumbExtractor(
			array_keys( $this->config->get( 'MediaViewerExtensions' ) ),
			$this->config->get( 'MediaViewerExcludedImageSelectors' ),
			100,
			100,
			$this->config->get( MainConfigNames::ArticlePath )
		);
		$context = $out->getContext();
		$carouselItems = $this->extractCarouselImageElements(
			$thumbExtractor,
			$out->getHTML(),
			$context->getWikiPage()->getParserOutput(
				ParserOptions::newFromContext( $context )
			) ?: null
		);
		if ( count( $carouselItems ) < self::MIN_CAROUSEL_IMAGES ) {
			return;
		}

		$out->addModules( 'mmv.carousel' );
		$out->addModuleStyles( 'mmv.carousel.styles' );
		$out->prependHTML( $this->buildCarouselHtml( $carouselItems, $out->getTitle()->getText() ) );
	}

	/**
	 * Whether the request should use the mobile carousel entrypoint.
	 *
	 * Conditions:
	 *  - request is served through MobileFrontend's mobile view
	 *  - the carousel is enabled for this request, either sitewide via the
	 *    MediaViewerMobileCarousel config flag (production rollout) or per-user
	 *    via the beta feature opt-in. The sitewide flag takes precedence: where
	 *    it is on, the carousel is shown to everyone and the beta opt-in is not
	 *    offered as a separate control.
	 *  - the reader has not opted out via the enable_image_carousel preference
	 *  - page is a suitable candidate
	 *
	 * @param OutputPage $out
	 * @return bool
	 */
	protected function shouldUseMobileCarousel( OutputPage $out ): bool {
		return (
			// Mobile view
			$this->isMobileFrontendView() &&
			// Enabled sitewide (production) or opted in via beta feature
			(
				$this->config->get( 'MediaViewerMobileCarousel' ) ||
				$this->isBetaFeatureEnabled( $out->getUser() )
			) &&
			// Reader has not opted out via preferences
			$this->userOptionsLookup->getBoolOption(
				$out->getUser(), self::ENABLE_IMAGE_CAROUSEL_PREFERENCE
			) &&
			// Candidate page
			$this->shouldPageGetMobileCarousel( $out )
		);
	}

	/**
	 * Whether the page should get the mobile carousel.
	 *
	 * Conditions:
	 * - plain view action: not a diff (which is still action=view), not an
	 *   old revision, and not history/edit/etc. (T428701). Old revisions are
	 *   excluded because thumbnails are extracted from the current revision's
	 *   parser output and would not match the displayed content.
	 * - article page
	 * - not the main page
	 * - real page, e.g., not special
	 * - content does not have the __NOMEDIAVIEWERCAROUSEL__ magic word
	 *
	 * @param OutputPage $out
	 * @return bool
	 */
	protected function shouldPageGetMobileCarousel( OutputPage $out ): bool {
		$title = $out->getTitle();

		return (
			// Plain view: not history, edit, etc.
			$out->getActionName() === 'view' &&
			// Not a diff, which is served as part of the view action
			!$out->getRequest()->getCheck( 'diff' ) &&
			// Not an old revision (?oldid=) view
			$out->isRevisionCurrent() &&
			// Article
			$title->getNamespace() === NS_MAIN &&
			// Not the main page
			!$title->isMainPage() &&
			// Real page
			$title->canExist() &&
			// No __NOMEDIAVIEWERCAROUSEL__
			$this->pageProps->getProperties(
				$title, self::DISABLE_MOBILE_CAROUSEL_PAGE_PROPERTY
			) === []
		);
	}

	/**
	 * Whether the beta feature opt-in applies to this user.
	 *
	 * Conditions:
	 * - the carousel is not already enabled sitewide: the
	 *   MediaViewerMobileCarousel flag takes precedence, so the opt-in is moot
	 *   once the carousel is rolled out for everyone
	 * - MediaViewerBetaFeature config flag is enabled
	 * - BetaFeatures extension is loaded
	 * - user has opted in
	 *
	 * The sitewide check is first so this short-circuits before reaching the
	 * BetaFeatures extension when the carousel is already enabled sitewide.
	 *
	 * @param User $user
	 * @return bool
	 */
	protected function isBetaFeatureEnabled( User $user ): bool {
		return !$this->config->get( 'MediaViewerMobileCarousel' ) &&
			$this->config->get( 'MediaViewerBetaFeature' ) &&
			ExtensionRegistry::getInstance()->isLoaded( 'BetaFeatures' ) &&
			BetaFeatures::isFeatureEnabled( $user, self::BETA_FEATURES_KEY );
	}

	/**
	 * The current request skin name, including temporary `?useskin=` overrides.
	 *
	 * @return string
	 */
	protected function getCurrentRequestSkinName(): string {
		return RequestContext::getMain()->getSkin()->getSkinName();
	}

	/**
	 * Extract thumbnail image data from the parser output of a wiki page.
	 * The parser cache is used if possible.
	 *
	 * @param ThumbExtractor $thumbExtractor
	 * @param string $html
	 * @param ?ParserOutput $parserOutput
	 * @return array{title: Title, thumb: \Wikimedia\Parsoid\DOM\Element}[]
	 */
	protected function extractCarouselImageElements(
		ThumbExtractor $thumbExtractor,
		string $html,
		?ParserOutput $parserOutput = null
	): array {
		$doc = DOMCompat::newDocument( true );
		$body = DOMUtils::parseHTMLToFragment( $doc, $html );

		$thumbs = $thumbExtractor->findThumbs( $body );
		$carouselItems = [];
		foreach ( $thumbs as $thumb ) {
			$anchor = DOMCompat::getParentElement( $thumb );
			$title = $thumbExtractor->extractTitleFromAnchorElement( $anchor );
			if ( !$title ) {
				continue;
			}

			// Guard against duplicates/overwrites
			$prefixedText = $title->getPrefixedText();
			if ( isset( $carouselItems[$prefixedText] ) ) {
				continue;
			}

			$carouselItems[$prefixedText] = [
				'title' => $title,
				'thumb' => $thumb,
			];
		}
		$carouselItems = array_values( $carouselItems );

		if ( $parserOutput ) {
			// Doublecheck thumbs against media known in ParserOutput.
			// Note: this code path with not be run for external content
			// served through MobileFrontendContentProvider, for which
			// we don't have parser output.
			$fileNames = [];
			foreach ( $parserOutput->getLinkList( ParserOutputLinkTypes::MEDIA ) as $medium ) {
				$fileNames[] = $medium['link']->getText();
			}
			$files = $this->repoGroup->findFiles( $fileNames );

			$carouselItems = array_values( array_filter(
				$carouselItems,
				static function ( $item ) use ( $files ) {
					$filename = $item['title']->getDBkey();
					return isset( $files[$filename] ) && $files[$filename]->exists();
				}
			) );
		}

		return $carouselItems;
	}

	/**
	 * Build the HTML for carousel thumbnail items.
	 *
	 * @param array{title: Title, thumb: \Wikimedia\Parsoid\DOM\Element}[] $carouselItems
	 * @return string
	 */
	private function buildCarouselItemsHtml( array $carouselItems ): string {
		$html = '';
		foreach ( $carouselItems as $i => $item ) {
			$html .= Html::rawElement(
				'li',
				[
					'class' => 'mmv-carousel__item',
				],
				Html::rawElement(
					'a',
					[
						'href' => $item['title']->getLocalURL(),
						'class' => 'mmv-carousel__item-link mw-file-description',
						// Give each link an explicit accessible name. Reuse the
						// image alt text when present, otherwise fall back to the
						// cleaned-up filename.
						'aria-label' => DOMCompat::getAttribute( $item['thumb'], 'alt' ) ?:
							preg_replace( '/\.[^.]+$/', '', $item['title']->getText() ),
					],
					Html::element(
						'img',
						[
							'src' => DOMCompat::getAttribute( $item['thumb'], 'src' ) ?:
								DOMCompat::getAttribute( $item['thumb'], 'data-mw-src' ),
							'srcset' => DOMCompat::getAttribute( $item['thumb'], 'srcset' ) ??
								DOMCompat::getAttribute( $item['thumb'], 'data-mw-srcset' ) ??
								false,
							'width' => DOMCompat::getAttribute( $item['thumb'], 'width' ),
							'height' => DOMCompat::getAttribute( $item['thumb'], 'height' ),
							'alt' => DOMCompat::getAttribute( $item['thumb'], 'alt' ),
							'class' => 'mmv-carousel__item-image',
							'loading' => 'lazy',
						]
					)
				)
			);
		}
		return $html;
	}

	/**
	 * Build the server-rendered carousel shell so the client module can
	 * progressively enhance it.
	 * @param array{title: Title, thumb: \Wikimedia\Parsoid\DOM\Element}[] $carouselItems carousel thumbnails
	 * @param string $pageTitle display title of the page, used in the carousel's accessible label
	 * @return string
	 */
	private function buildCarouselHtml( array $carouselItems, string $pageTitle ): string {
		return Html::rawElement(
			'div',
			[
				'id' => 'mmv-carousel-root',
				'class' => 'mw-mmv-wrapper mmv-carousel'
			],
			Html::rawElement(
				'ul',
				[
					'class' => 'mmv-carousel__items',
					'aria-label' => $this->getCarouselLabel( $pageTitle, count( $carouselItems ) ),
					// Explicit role preserves list semantics when list-style:none
					// causes some browsers to strip them.
					'role' => 'list',
				],
				$this->buildCarouselItemsHtml( $carouselItems )
			)
		);
	}

	/**
	 * Build the accessible label for the carousel's list container.
	 *
	 * Keep the article title when available, and only fall back to a generic
	 * noun when the title is empty. The item count is already known and cheap
	 * to include, so always expose it.
	 *
	 * @param string $pageTitle
	 * @param int $itemCount
	 * @return string
	 */
	private function getCarouselLabel( string $pageTitle, int $itemCount ): string {
		$labelTitle = trim( $pageTitle ) !== ''
			? $pageTitle
			: wfMessage( 'multimediaviewer-carousel-label-article' )->text();

		return wfMessage( 'multimediaviewer-carousel-label', $labelTitle )
			->numParams( $itemCount )
			->text();
	}

	/**
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/BeforePageDisplay
	 * Add JavaScript to the page when an image is on it
	 * and the user has enabled the feature
	 * @param OutputPage $out
	 * @param Skin $skin
	 */
	public function onBeforePageDisplay( $out, $skin ): void {
		$pageIsSpecialPage = $out->getTitle()->inNamespace( NS_SPECIAL );
		$fileRelatedSpecialPages = [ 'Newimages', 'Listfiles', 'Mostimages',
			'MostGloballyLinkedFiles', 'Uncategorizedimages', 'Unusedimages', 'Search' ];
		$pageIsFileRelatedSpecialPage = $out->getTitle()->inNamespace( NS_SPECIAL ) &&
			in_array(
				$this->specialPageFactory->resolveAlias( $out->getTitle()->getDBkey() )[0],
				$fileRelatedSpecialPages
			);

		if ( !$pageIsSpecialPage || $pageIsFileRelatedSpecialPage ) {
			$this->getModules( $out );
			$this->maybeAddMobileCarousel( $out );
		}
	}

	/**
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/CategoryPageView
	 * Add JavaScript to the page if there are images in the category
	 * @param CategoryPage $catPage
	 */
	public function onCategoryPageView( $catPage ) {
		$title = $catPage->getTitle();
		$cat = Category::newFromTitle( $title );
		if ( $cat->getFileCount() > 0 ) {
			$out = $catPage->getContext()->getOutput();
			$this->getModules( $out );
		}
	}

	/**
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ResourceLoaderGetConfigVars
	 * Export variables used in both PHP and JS to keep DRY
	 * @param array &$vars
	 * @param string $skin
	 * @param Config $config
	 */
	public function onResourceLoaderGetConfigVars( array &$vars, $skin, Config $config ): void {
		$vars['wgMediaViewer'] = true;
	}

	/**
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/GetDoubleUnderscoreIDs
	 * @see https://www.mediawiki.org/wiki/Help:Magic_words#Behavior_switches
	 *
	 * Registers the __NOMEDIAVIEWERCAROUSEL__ behavior switch so MediaWiki
	 * recognizes it during parse and records its presence as a page property.
	 * That page property is later used to suppress the mobile carousel for
	 * specific pages.
	 *
	 * @param string[] &$doubleUnderscoreIDs
	 * @return void
	 */
	public function onGetDoubleUnderscoreIDs( &$doubleUnderscoreIDs ) {
		$doubleUnderscoreIDs[] = self::DISABLE_MOBILE_CAROUSEL_PAGE_PROPERTY;
	}

	/**
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/MakeGlobalVariablesScript
	 * Export variables which depend on the current user
	 * @param array &$vars
	 * @param OutputPage $out
	 * @return void
	 */
	public function onMakeGlobalVariablesScript( &$vars, $out ): void {
		$user = $out->getUser();
		$isMultimediaViewerEnable = $this->userOptionsLookup->getDefaultOption(
			'multimediaviewer-enable',
			$user
		);

		$vars['wgMediaViewerOnClick'] = $this->shouldHandleClicks( $user );
		// needed because of T71942; could be different for anon and logged-in
		$vars['wgMediaViewerEnabledByDefault'] = (bool)$isMultimediaViewerEnable;
		// Tells the bootstrap to use the beta mobile viewer instead of the
		// legacy desktop viewer (T428774). Exported here rather than via
		// ResourceLoaderGetConfigVars because it varies per request.
		$vars['wgMediaViewerMobileBeta'] = $this->shouldUseMobileBetaViewer( $out );
	}

	/**
	 * ResourceLoader callback to resolve thumbnail width buckets.
	 * Uses $wgThumbnailSteps if configured, otherwise falls back to
	 * $wgMediaViewerThumbnailBucketSizes.
	 *
	 * @param Context|null $context
	 * @param Config $config
	 * @return array
	 */
	public static function getCommonConfig( ?Context $context, Config $config ): array {
		$steps = $config->get( MainConfigNames::ThumbnailSteps );
		$downloadSizes = $config->get( 'MediaViewerDownloadSizes' );
		if ( $steps && $downloadSizes ) {
			foreach ( $downloadSizes as $k => $v ) {
				if ( !in_array( $v, $steps ) ) {
					throw new ConfigException( "MediaViewerThumbnailBucketSizes $k=$v not in ThumbnailSteps" );
				}
			}
		}
		return [
			'downloadSizes' => $downloadSizes,
			'thumbnailBucketSizes' => $steps ?: $config->get( 'MediaViewerThumbnailBucketSizes' ),
		];
	}

	/**
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ThumbnailBeforeProduceHTML
	 * Modify thumbnail DOM
	 * @param ThumbnailImage $thumbnail
	 * @param array &$attribs Attributes of the <img> element
	 * @param array|bool &$linkAttribs Attributes of the wrapping <a> element
	 */
	public function onThumbnailBeforeProduceHTML(
		$thumbnail,
		&$attribs,
		&$linkAttribs
	) {
		$file = $thumbnail->getFile();

		if ( $file ) {
			$attribs['data-file-width'] = $file->getWidth();
			$attribs['data-file-height'] = $file->getHeight();
		}
	}
}
