<?php

namespace MediaWiki\Extension\MultimediaViewer\Tests;

use MediaWiki\Context\RequestContext;
use MediaWiki\Extension\MultimediaViewer\Hooks;
use MediaWiki\Extension\MultimediaViewer\ThumbExtractor;
use MediaWiki\Output\OutputPage;
use MediaWiki\Page\WikiPage;
use MediaWiki\Parser\ParserOutput;
use MediaWiki\Request\FauxRequest;
use MediaWiki\Title\Title;
use MediaWiki\User\User;
use MediaWikiIntegrationTestCase;
use Wikimedia\Parsoid\Core\DOMCompat;
use Wikimedia\Parsoid\DOM\Element;
use Wikimedia\Parsoid\Utils\DOMUtils;

/**
 * @covers \MediaWiki\Extension\MultimediaViewer\Hooks
 */
class HooksTestCase extends MediaWikiIntegrationTestCase {

	public function newHooksInstance(
		array $carouselItems = [],
		bool $useCarousel = true,
		string $currentRequestSkinName = 'minerva'
	): Hooks {
		$hooks = new class(
			$this->getServiceContainer()->getMainConfig(),
			$this->getServiceContainer()->getSpecialPageFactory(),
			$this->getServiceContainer()->getUserOptionsLookup(),
			$this->getServiceContainer()->getPageProps(),
			null
		) extends Hooks {
			public array $stubCarouselItems;
			public bool $useCarousel;
			public string $currentRequestSkinName;

			protected function isMobileFrontendView(): bool {
				return true;
			}

			protected function getCurrentRequestSkinName(): string {
				return $this->currentRequestSkinName;
			}

			protected function shouldUseMobileCarousel( OutputPage $out ): bool {
				return $this->useCarousel;
			}

			protected function extractCarouselImageElements(
				ThumbExtractor $thumbExtractor,
				string $html,
				?ParserOutput $parserOutput = null
			): array {
				return $this->stubCarouselItems;
			}
		};
		$hooks->stubCarouselItems = $carouselItems;
		$hooks->useCarousel = $useCarousel;
		$hooks->currentRequestSkinName = $currentRequestSkinName;
		return $hooks;
	}

	protected function shouldPageGetMobileCarousel( OutputPage $output ): bool {
		$method = new \ReflectionMethod( Hooks::class, 'shouldPageGetMobileCarousel' );
		return $method->invoke( $this->newHooksInstance(), $output );
	}

	protected function extractCarouselImageElements(
		ThumbExtractor $thumbExtractor,
		string $html,
		?ParserOutput $parserOutput = null
	): array {
		$method = new \ReflectionMethod( Hooks::class, 'extractCarouselImageElements' );
		$hooks = new Hooks(
			$this->getServiceContainer()->getMainConfig(),
			$this->getServiceContainer()->getSpecialPageFactory(),
			$this->getServiceContainer()->getUserOptionsLookup(),
			$this->getServiceContainer()->getPageProps(),
			null
		);
		return $method->invoke( $hooks, $thumbExtractor, $html, $parserOutput );
	}

	protected function buildCarouselItemsHtml( array $thumbData ): string {
		$method = new \ReflectionMethod( Hooks::class, 'buildCarouselItemsHtml' );
		return $method->invoke( $this->newHooksInstance(), $thumbData );
	}

	protected function buildCarouselHtml( array $thumbData, string $pageTitle ): string {
		$method = new \ReflectionMethod( Hooks::class, 'buildCarouselHtml' );
		return $method->invoke( $this->newHooksInstance(), $thumbData, $pageTitle );
	}

	protected static function makeFakeThumb( string $filename, ?string $alt = null ): Element {
		$alt = $alt !== null ? "alt=\"$alt\"" : '';
		$src = <<<HTML
			<a
				href="/wiki/File:$filename"
				class="mw-file-description"
			>
				<img
					$alt
					src="//upload.wikimedia.org/wikipedia/commons/thumb/1/10/$filename/120px-$filename"
					decoding="async"
					width="120"
					height="90"
					class="mw-file-element"
					srcset="//upload.wikimedia.org/wikipedia/commons/thumb/1/10/$filename/240px-$filename 2x"
					data-file-width="2400"
					data-file-height="1800"
				>
			</a>
		HTML;

		$doc = DOMCompat::newDocument( true );
		$fragment = DOMUtils::parseHTMLToFragment( $doc, $src );
		return $fragment->firstElementChild->firstElementChild;
	}

	protected static function makeFakeThumbData( string $filename, ?string $alt = null ): array {
		return [
			'thumb' => self::makeFakeThumb( $filename, $alt ),
			'title' => Title::newFromText( "File:$filename" ),
		];
	}

	protected function makeOutputPage(
		?Title $title = null,
		?User $user = null,
		?FauxRequest $request = null,
		string $actionName = 'view',
		bool $isRevisionCurrent = true,
	) {
		$user = $user ?? $this->getServiceContainer()->getUserFactory()->newFromName( 'HooksTestCarouselUser' );

		$title = $title ?? Title::newFromText( 'Test Page' );
		$title->setContentModel( CONTENT_MODEL_WIKITEXT );

		$wikiPage = $this->createMock( WikiPage::class );
		$wikiPage->method( 'getTitle' )->willReturn( $title );

		$context = new RequestContext();
		$context->setTitle( $title );
		$context->setWikiPage( $wikiPage );

		$request = $request ?? new FauxRequest();

		$output = $this->createMock( OutputPage::class );
		$output->method( 'getTitle' )->willReturn( $title );
		$output->method( 'getHtml' )->willReturn( '' );
		$output->method( 'getContext' )->willReturn( $context );
		$output->method( 'getUser' )->willReturn( $user );
		$output->method( 'getRequest' )->willReturn( $request );
		$output->method( 'getActionName' )->willReturn( $actionName );
		$output->method( 'isRevisionCurrent' )->willReturn( $isRevisionCurrent );

		return $output;
	}

}
