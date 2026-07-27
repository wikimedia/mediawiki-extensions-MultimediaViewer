# MultimediaViewer Contributing Guide

## Welcome

Thank you for your interest in contributing to MultimediaViewer.

This guide describes the main ways you can contribute, including:

- Bug reports and bug fixes
- Documentation improvements

We do not currently accept feature requests because the extension's support
status is undecided. However, please discuss significant new features with
the [maintainers][maintainers] before beginning implementation. For more
information about support levels, refer to the [Reader Growth team's
maintenance levels and responsibilities][maintenance-levels].

### Overview

MultimediaViewer is a MediaWiki extension that provides an interface for
viewing full-size, or nearly full-size, images in the browser without
extraneous page loads or confusing interstitial pages. It is used in
production on Wikimedia projects and also hosts the mobile Image Browsing
experience.

For more information, refer to the [README][readme], [DEVELOPERS][developers],
and the [MultimediaViewer extension][mw-extension] page on mediawiki.org.

### Community engagement

Refer to the following channels to connect with fellow contributors or to
stay up-to-date with news about MultimediaViewer:

- Follow tasks on [Phabricator][phabricator-workboard].
- Connect via the [Reader Growth][reader-growth] team page.
- Participate in discussions in [Village Pump][village-pump].
- Follow [MediaWiki's version lifecycle][version-lifecycle] for release news.

## Contributing

### Code of conduct

Before contributing, read our [Code of Conduct][coc] to learn more about our
community guidelines and expectations.

### Bug reports

We use Phabricator to track tasks and bug reports. To report a bug:

1. **Search for existing issues** on
   [Phabricator][phabricator-workboard].
2. **Create a new issue** via the Create Task dropdown if needed.
3. **Tag** the task with `#MediaViewer` and `#reader-growth-team`.
4. **Provide details**: description, steps to reproduce, expected vs. actual
   behavior, environment (MediaWiki version, browser, etc.), and screenshots
   or error messages when applicable.

### Proposals and feature requests

To share your new ideas for the project, perform the following actions:

1. Create a task on [Phabricator][phabricator-workboard].
2. Describe the proposal clearly, including the problem you're trying to
   solve.
3. Wait for feedback before starting implementation.

### Code contribution

MultimediaViewer uses [Gerrit][gerrit] for code review.

For installation and configuration, refer to the
[MultimediaViewer extension page][mw-extension]. For local linting guidance, refer to
[DEVELOPERS][developers]. For Gerrit workflow and general MediaWiki
contribution practices, refer to the [Gerrit Tutorial][gerrit-tutorial] and
[How to become a MediaWiki hacker][mw-hacker].

Before submitting a patch, run the documented checks:

```sh
composer test
npm test
```

[`composer test`][composer] runs PHP linting and coding standards.
[`npm test`][package] runs ESLint, Stylelint, and banana-checker via Grunt.

[readme]: README.md
[developers]: DEVELOPERS.md
[coc]: CODE_OF_CONDUCT.md
[composer]: composer.json
[package]: package.json
[mw-extension]: https://www.mediawiki.org/wiki/Extension:MultimediaViewer
[maintenance-levels]: https://www.mediawiki.org/wiki/Readers/Reader_Growth/Maintenance_Levels_and_Responsibilities
[maintainers]: https://www.mediawiki.org/wiki/Developers/Maintainers
[reader-growth]: https://www.mediawiki.org/wiki/Readers/Reader_Growth
[phabricator-workboard]: https://phabricator.wikimedia.org/tag/mediaviewer/
[village-pump]: https://en.wikipedia.org/wiki/Wikipedia:Village_pump
[version-lifecycle]: https://www.mediawiki.org/wiki/Version_lifecycle
[gerrit]: https://www.mediawiki.org/wiki/Gerrit
[gerrit-tutorial]: https://www.mediawiki.org/wiki/Gerrit/Tutorial
[mw-hacker]: https://www.mediawiki.org/wiki/How_to_become_a_MediaWiki_hacker
