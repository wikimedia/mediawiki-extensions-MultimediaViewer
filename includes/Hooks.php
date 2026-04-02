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
use MediaWiki\Html\Html;
use MediaWiki\MainConfigNames;
use MediaWiki\Media\Hook\ThumbnailBeforeProduceHTMLHook;
use MediaWiki\Media\ThumbnailImage;
use MediaWiki\MediaWikiServices;
use MediaWiki\Output\Hook\BeforePageDisplayHook;
use MediaWiki\Output\Hook\MakeGlobalVariablesScriptHook;
use MediaWiki\Output\OutputPage;
use MediaWiki\Page\CategoryPage;
use MediaWiki\Page\Hook\CategoryPageViewHook;
use MediaWiki\Parser\ParserOptions;
use MediaWiki\Parser\ParserOutputLinkTypes;
use MediaWiki\Preferences\Hook\GetPreferencesHook;
use MediaWiki\Registration\ExtensionRegistry;
use MediaWiki\ResourceLoader\Context;
use MediaWiki\ResourceLoader\Hook\ResourceLoaderGetConfigVarsHook;
use MediaWiki\Skin\Skin;
use MediaWiki\SpecialPage\SpecialPageFactory;
use MediaWiki\User\Hook\UserGetDefaultOptionsHook;
use MediaWiki\User\Options\UserOptionsLookup;
use MediaWiki\User\User;
use MobileContext;

class Hooks implements
	MakeGlobalVariablesScriptHook,
	UserGetDefaultOptionsHook,
	GetPreferencesHook,
	BeforePageDisplayHook,
	CategoryPageViewHook,
	ResourceLoaderGetConfigVarsHook,
	ThumbnailBeforeProduceHTMLHook
{

	// Minimum amount of images in a wiki page to enable the carousel.
	private const MIN_CAROUSEL_IMAGES = 3;

	public function __construct(
		private readonly Config $config,
		private readonly SpecialPageFactory $specialPageFactory,
		private readonly UserOptionsLookup $userOptionsLookup,
		private readonly ?MobileContext $mobileContext,
	) {
	}

	public const MIN_CAROUSEL_ITEMS = 3;

	/**
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/UserGetDefaultOptions
	 * @param array &$defaultOptions
	 */
	public function onUserGetDefaultOptions( &$defaultOptions ) {
		if ( $this->config->get( 'MediaViewerEnableByDefault' ) ) {
			$defaultOptions['multimediaviewer-enable'] = 1;
		}
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
		// The MobileFrontend extension provides its own implementation of MultimediaViewer.
		// See https://phabricator.wikimedia.org/T65504 and subtasks for more details.
		// To avoid loading MMV twice, we check the environment we are running in.
		$isMobileFrontendView = $this->isMobileFrontendView();
		$modules = [];
		if ( $this->shouldUseMobileCarousel() ) {
			// mmv.carousel depends on mmv.bootstrap, so loading the carousel also loads bootstrap.
			$modules[] = 'mmv.carousel';
			$out->addModuleStyles( 'mmv.carousel.styles' );
		} elseif ( $isMobileFrontendView ) {
			// On mobile without the carousel, only load the bootstrap when the beta
			// flag is set to replace MobileFrontend's viewer.
			if ( $out->getRequest()->getFuzzyBool( 'mmvBeta' ) ) {
				$modules[] = 'mmv.bootstrap';
			}
		} else {
			$modules[] = 'mmv.bootstrap';
		}

		if ( $modules ) {
			$out->addModules( $modules );
		}
	}

	/**
	 * Whether the mobile carousel entrypoint should be used for this request.
	 *
	 * @return bool
	 */
	protected function shouldUseMobileCarousel(): bool {
		return $this->isMobileFrontendView() &&
			$this->config->get( 'MediaViewerMobileCarousel' );
	}

	/**
	 * Extract thumbnail image data from the parser output of a wiki page.
	 * The parser cache is used if possible.
	 *
	 * @param OutputPage $out An output page
	 * @return array The extracted image data as per {@link ThumbExtractor::extract()}
	 */
	protected function extractImages( OutputPage $out ): array {
		// Get the parser output
		$mwServices = MediaWikiServices::getInstance();
		$context = $out->getContext();
		$wikiPage = $context->getWikiPage();
		$parserOptions = ParserOptions::newFromContext( $context );
		// NOTE This doesn't work if a page is loaded by MobileFrontendContentProvider
		// `getParserOutput` automatically uses the parser cache if possible
		$parserOutput = $wikiPage->getParserOutput( $parserOptions );

		// TODO remove when the carousel experiment is over,
		// https://gerrit.wikimedia.org/r/c/mediawiki/extensions/MultimediaViewer/+/1267037/comment/74720bca_62a9b6dc/
		if ( $parserOutput === false ) {
			return [];
		}

		// Get media files
		$fileNames = [];
		foreach ( $parserOutput->getLinkList( ParserOutputLinkTypes::MEDIA ) as $medium ) {
			$fileNames[] = $medium['link']->getText();
		}
		$repoGroup = $mwServices->getRepoGroup();
		$files = $repoGroup->findFiles( $fileNames );

		// Instantiate a ThumbExtractor with a file extension allowlist and a CSS selector filter
		// as provided by the config.
		$thumbExtractor = new ThumbExtractor(
			$files,
			$this->config->get( 'MediaViewerExtensions' ),
			$this->config->get( 'MediaViewerExcludedImageSelectors' )
		);

		// Get the DOM body fragment
		$body = $parserOutput->getContentHolder()->getAsDom();

		return $thumbExtractor->extract( $body );
	}

	/**
	 * Build the HTML for carousel thumbnail items.
	 *
	 * @param array[] $thumbData Each thumb has keys: title, href, src, width, height, alt
	 * @return string
	 */
	private function buildCarouselItems( array $thumbData ): string {
		$html = '';
		foreach ( $thumbData as $i => $data ) {
			$html .= Html::rawElement(
				'li',
				[
					'class' => 'mmv-carousel__item',
					'data-mmv-title' => $data['title'],
					'data-mmv-position' => (string)( $i + 1 ),
				],
				Html::rawElement(
					'a',
					[
						'href' => $data['href'],
						'class' => 'mmv-carousel__item-link mw-file-description',
					],
					Html::element(
						'img',
						[
							'src' => $data['src'],
							'width' => $data['width'],
							'height' => $data['height'],
							'alt' => $data['alt'],
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
	 * @param array[] $thumbData carousel thumbnails
	 * @return string
	 */
	private function buildCarouselHtml( array $thumbData ): string {
		$itemsHtml = $this->buildCarouselItems( $thumbData );

		return Html::rawElement(
			'div',
			[
				'id' => 'mmv-carousel-root',
				'class' => 'mw-mmv-wrapper mmv-carousel',
				'data-mmv-carousel' => ' ',
			],
			Html::rawElement(
				'div',
				[ 'class' => 'mmv-carousel__viewport' ],
				Html::rawElement(
					'ul',
					[
						'class' => 'mmv-carousel__items'
					],
					$itemsHtml
				)
			)
		);
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
		$pageIsFileRelatedSpecialPage = $out->getTitle()->inNamespace( NS_SPECIAL )
			&& in_array( $this->specialPageFactory->resolveAlias( $out->getTitle()->getDBkey() )[0],
				$fileRelatedSpecialPages );

		if ( !$pageIsSpecialPage || $pageIsFileRelatedSpecialPage ) {
			$this->getModules( $out );
			if ( $this->shouldUseMobileCarousel() ) {
				$images = $this->extractImages( $out );
				// Enable the carousel if the amount of images meets the minimum threhshold
				if ( count( $images ) >= self::MIN_CAROUSEL_IMAGES ) {
					$out->prependHTML( $this->buildCarouselHtml( $images ) );
				}
			}
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
		return [
			'thumbnailBucketSizes' => $steps ?: $config->get( 'MediaViewerThumbnailBucketSizes' ),
			'imageQueryParameter' => $config->get( 'MediaViewerImageQueryParameter' ),
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
