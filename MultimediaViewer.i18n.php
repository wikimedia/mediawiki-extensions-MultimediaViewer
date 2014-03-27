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
 */

$messages = array();

/**
 * English
 * @author Mark Holmquist <mtraceur@member.fsf.org>
 */
$messages['en'] = array(
	'multimediaviewer-desc' => 'Expand thumbnails in a larger size in a fullscreen interface.',
	'multimediaviewer-desc-nil' => 'No description available.',
	'multimediaviewer-pref' => 'Media Viewer',
	'multimediaviewer-pref-desc' => 'Improve your multimedia viewing experience with this new tool. It displays images in larger size on pages that have thumbnails. Images are shown in a nicer fullscreen interface overlay, and can also be viewed in full-size.',
	'multimediaviewer-optin-pref' => 'Enable new media viewing experience',
	'multimediaviewer-file-page' => 'Go to corresponding file page',
	'multimediaviewer-repository' => 'Learn more on $1',
	'multimediaviewer-repository-local' => 'Learn more',
	'multimediaviewer-datetime-created' => 'Created on $1',
	'multimediaviewer-datetime-uploaded' => 'Uploaded on $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|Uploaded}} by $1',
	'multimediaviewer-credit' => '$1 - $2',
	'multimediaviewer-metadata-error' => 'Error: Could not load image data. $1',
	'multimediaviewer-thumbnail-error' => 'Error: Could not load thumbnail data. $1',

	// Licenses
	'multimediaviewer-license-cc-by-1.0' => 'CC BY 1.0',
	'multimediaviewer-license-cc-sa-1.0' => 'CC SA 1.0',
	'multimediaviewer-license-cc-by-sa-1.0' => 'CC BY-SA 1.0',
	'multimediaviewer-license-cc-by-2.0' => 'CC BY 2.0',
	'multimediaviewer-license-cc-by-sa-2.0' => 'CC BY-SA 2.0',
	'multimediaviewer-license-cc-by-2.1' => 'CC BY 2.1',
	'multimediaviewer-license-cc-by-sa-2.1' => 'CC BY-SA 2.1',
	'multimediaviewer-license-cc-by-2.5' => 'CC BY 2.5',
	'multimediaviewer-license-cc-by-sa-2.5' => 'CC BY-SA 2.5',
	'multimediaviewer-license-cc-by-3.0' => 'CC BY 3.0',
	'multimediaviewer-license-cc-by-sa-3.0' => 'CC BY-SA 3.0',
	'multimediaviewer-license-cc-by-4.0' => 'CC BY 4.0',
	'multimediaviewer-license-cc-by-sa-4.0' => 'CC BY-SA 4.0',
	'multimediaviewer-license-cc-pd' => 'Public Domain',
	'multimediaviewer-license-cc-zero' => 'CC 0',
	'multimediaviewer-license-pd' => 'Public Domain',
	'multimediaviewer-license-default' => 'View license',

	'multimediaviewer-permission-title' => 'License details',
	'multimediaviewer-permission-link' => 'view terms',
	'multimediaviewer-permission-viewmore' => 'View more',

	'multimediaviewer-about-mmv' => 'About Media Viewer',
	'multimediaviewer-discuss-mmv' => 'Discuss this feature',
	'multimediaviewer-help-mmv' => 'Help',

	// Things for geolocation data
	'multimediaviewer-geoloc-north' => 'N',
	'multimediaviewer-geoloc-east' => 'E',
	'multimediaviewer-geoloc-south' => 'S',
	'multimediaviewer-geoloc-west' => 'W',
	'multimediaviewer-geoloc-coord' => '$1° $2′ $3″ $4',
	'multimediaviewer-geoloc-coords' => '$1, $2',
	'multimediaviewer-geolocation' => 'Location: $1',

	'multimediaviewer-fileusage-count' => 'Used in $1 {{PLURAL:$1|page|pages}}',
	'multimediaviewer-fileusage-count-more' => 'Used in more than $1 {{PLURAL:$1|pages}}',
	'multimediaviewer-fileusage-link' => 'View all uses',
	'multimediaviewer-fileusage-local-section' => 'On this site',
	'multimediaviewer-fileusage-global-section' => 'On other sites',

	'multimediaviewer-reuse-link' => 'Use this file',
	'multimediaviewer-reuse-loading-placeholder' => 'Loading…',

	'multimediaviewer-share-tab' => 'Share',
	'multimediaviewer-embed-tab' => 'Embed',

	'multimediaviewer-link-to-page' => 'Link to file description page',
	'multimediaviewer-link-to-file' => 'Link to original file',

	'multimediaviewer-share-explanation' => 'Copy and freely share the link',

	'multimediaviewer-embed-wt' => 'Wikitext',
	'multimediaviewer-embed-html' => 'HTML',

	'multimediaviewer-embed-explanation' => 'Use this code to embed the file',

	// Ridiculously complicated messages for embedding
	'multimediaviewer-html-embed-credit-text-tbls' => '"$1" by $2. Licensed under $3 via $4.',
	'multimediaviewer-html-embed-credit-text-tls' => '"$1". Licensed under $2 via $3.',
	'multimediaviewer-html-embed-credit-text-tbs' => '"$1" by $2. Via $3.',
	'multimediaviewer-html-embed-credit-text-tbl' => '"$1" by $2. Licensed under $3.',
	'multimediaviewer-html-embed-credit-text-tb' => '"$1" by $2.',
	'multimediaviewer-html-embed-credit-text-ts' => '"$1". Via $2.',
	'multimediaviewer-html-embed-credit-text-tl' => '"$1". Licensed under $2.',
	'multimediaviewer-html-embed-credit-text-t' => '"$1".',
	'multimediaviewer-embed-byline' => 'By $1',
	'multimediaviewer-embed-license' => 'Licensed under $1.',
	'multimediaviewer-embed-via' => 'Via $1.',

	// Embed size choices
	'multimediaviewer-default-embed-dimensions' => 'Default thumbnail size',
	'multimediaviewer-original-embed-dimensions' => 'Original size $1',
	'multimediaviewer-large-embed-dimensions' => 'Large $1',
	'multimediaviewer-medium-embed-dimensions' => 'Medium $1',
	'multimediaviewer-small-embed-dimensions' => 'Small $1',
	'multimediaviewer-embed-dimensions' => '- $1 × $2 px',
);

/** Message documentation (Message documentation)
 * @author Mark Holmquist <mtraceur@member.fsf.org>
 * @author Shirayuki
 */
$messages['qqq'] = array(
	'multimediaviewer-desc' => '{{desc|name=Multimedia Viewer|url=https://www.mediawiki.org/wiki/Extension:MultimediaViewer}}',
	'multimediaviewer-desc-nil' => 'Text to be used when no description is available.',
	'multimediaviewer-pref' => 'Preference title',
	'multimediaviewer-pref-desc' => 'Description of preference',
	'multimediaviewer-optin-pref' => 'Label for non-beta preference.',
	'multimediaviewer-file-page' => 'Text for a link to the file page for an image.',
	'multimediaviewer-repository' => 'Link to the repository where the image is hosted. Parameters:
* $1 - the display name of that site
See also:
* {{msg-mw|multimediaviewer-repository-local}}',
	'multimediaviewer-repository-local' => 'Link to repository where the image is locally hosted.
{{Identical|Learn more}}
See also:
* {{msg-mw|multimediaviewer-repository}}',
	'multimediaviewer-datetime-created' => 'Used in JavaScript code. Parameters:
* $1 - time and date (formatted)
See also:
* {{msg-mw|Multimediaviewer-datetime-uploaded}}',
	'multimediaviewer-datetime-uploaded' => 'Used in JavaScript code. Parameters:
* $1 - time and date (formatted)
See also:
* {{msg-mw|Multimediaviewer-datetime-created}}',
	'multimediaviewer-userpage-link' => 'Link to the user page for the uploader of the image.

Used in JavaScript code.

Parameters:
* $1 - the username of the uploader
* $2 - their gender',
	'multimediaviewer-credit' => 'Credit line for images. Parameters:
* $1 - HTML describing the author
* $2 - HTML describing the source

Neither parameters are usernames, so GENDER is useless. Both come directly from the API, the extended metadata imageinfo prop in particular.

They will usually be derived from the HTML output from wikitext on a file description page - however, no complicated HTML, only links, will be allowed.',
	'multimediaviewer-metadata-error' => 'Text shown when the information on the metadata panel could not be loaded.

Parameters:
* $1 - the error message (not localized)
See also:
* {{msg-mw|Multimediaviewer-thumbnail-error}}',
	'multimediaviewer-thumbnail-error' => 'Text shown when the image could not be loaded. Parameters:
* $1 - the error message (not localized)
See also:
* {{msg-mw|Multimediaviewer-metadata-error}}',
	'multimediaviewer-license-cc-by-1.0' => 'Very short label for the Creative Commons Attribution license, version 1.0, used in a link to the file information page that has more licensing information.
{{Identical|CC BY}}',
	'multimediaviewer-license-cc-sa-1.0' => 'Very short label for the Creative Commons ShareAlike license, version 1.0, used in a link to the file information page that has more licensing information.',
	'multimediaviewer-license-cc-by-sa-1.0' => 'Very short label for the Creative Commons Attribution ShareAlike license, version 1.0, used in a link to the file information page that has more licensing information.
{{Identical|CC BY-SA}}',
	'multimediaviewer-license-cc-by-2.0' => 'Very short label for the Creative Commons Attribution license, version 2.0, used in a link to the file information page that has more licensing information.
{{Identical|CC BY}}',
	'multimediaviewer-license-cc-by-sa-2.0' => 'Very short label for the Creative Commons Attribution ShareAlike license, version 2.0, used in a link to the file information page that has more licensing information.
{{Identical|CC BY-SA}}',
	'multimediaviewer-license-cc-by-2.1' => 'Very short label for the Creative Commons Attribution license, version 2.1, used in a link to the file information page that has more licensing information.
{{Identical|CC BY}}',
	'multimediaviewer-license-cc-by-sa-2.1' => 'Very short label for the Creative Commons Attribution ShareAlike license, version 2.1, used in a link to the file information page that has more licensing information.
{{Identical|CC BY-SA}}',
	'multimediaviewer-license-cc-by-2.5' => 'Very short label for the Creative Commons Attribution license, version 2.5, used in a link to the file information page that has more licensing information.
{{Identical|CC BY}}',
	'multimediaviewer-license-cc-by-sa-2.5' => 'Very short label for the Creative Commons Attribution ShareAlike license, version 2.5, used in a link to the file information page that has more licensing information.
{{Identical|CC BY-SA}}',
	'multimediaviewer-license-cc-by-3.0' => 'Very short label for the Creative Commons Attribution license, version 3.0, used in a link to the file information page that has more licensing information.
{{Identical|CC BY}}',
	'multimediaviewer-license-cc-by-sa-3.0' => 'Very short label for the Creative Commons Attribution ShareAlike license, version 3.0, used in a link to the file information page that has more licensing information.
{{Identical|CC BY-SA}}',
	'multimediaviewer-license-cc-by-4.0' => 'Very short label for the Creative Commons Attribution license, version 4.0, used in a link to the file information page that has more licensing information.
{{Identical|CC BY}}',
	'multimediaviewer-license-cc-by-sa-4.0' => 'Very short label for the Creative Commons Attribution ShareAlike license, version 4.0, used in a link to the file information page that has more licensing information.
{{Identical|CC BY-SA}}',
	'multimediaviewer-license-cc-pd' => 'Very short label for the Creative Commons Public Domain license, used in a link to the file information page that has more licensing information.
{{Identical|Public domain}}',
	'multimediaviewer-license-cc-zero' => 'Very short label for the Creative Commons Zero license, used in a link to the file information page that has more licensing information.',
	'multimediaviewer-license-pd' => 'Very short label for Public Domain images, used in a link to the file information page that has more licensing information.
{{Identical|Public domain}}',
	'multimediaviewer-license-default' => 'Short label for a link to generic license information.',
	'multimediaviewer-permission-title' => 'Title of the box containing additional license terms',
	'multimediaviewer-permission-link' => 'Text of the link (on top of the metadata box) which shows additional license terms',
	'multimediaviewer-permission-viewmore' => 'Text of the link (at the cutoff of the license term preview) which shows additional license terms.
{{Identical|View more}}',
	'multimediaviewer-about-mmv' => 'Text for a link to a page with more information about Media Viewer software.',
	'multimediaviewer-discuss-mmv' => 'Text for a link to a page where the user can discuss the Media Viewer software.
{{Identical|Leave feedback}}',
	'multimediaviewer-help-mmv' => 'Text for a link to a page with help about Media Viewer software.',
	'multimediaviewer-geoloc-north' => 'Symbol for representing "north" in geolocation coordinates.

Used as <code>$4</code> in {{msg-mw|Multimediaviewer-geoloc-coord}}.',
	'multimediaviewer-geoloc-east' => 'Symbol for representing "east" in geolocation coordinates.

Used as <code>$4</code> in {{msg-mw|Multimediaviewer-geoloc-coord}}.',
	'multimediaviewer-geoloc-south' => 'Symbol for representing "south" in geolocation coordinates.

Used as <code>$4</code> in {{msg-mw|Multimediaviewer-geoloc-coord}}.',
	'multimediaviewer-geoloc-west' => 'Symbol for representing "west" in geolocation coordinates.

Used as <code>$4</code> in {{msg-mw|Multimediaviewer-geoloc-coord}}.',
	'multimediaviewer-geoloc-coord' => 'Format for geolocation coordinates. Parameters:
* $1 - the number of degrees
* $2 - the number of minutes
* $3 - the number of seconds (rounded to the nearest hundredths place)
* $4 - the direction symbol, defined by the following messages:
** {{msg-mw|Multimediaviewer-geoloc-north}}
** {{msg-mw|Multimediaviewer-geoloc-east}}
** {{msg-mw|Multimediaviewer-geoloc-south}}
** {{msg-mw|Multimediaviewer-geoloc-west}}',
	'multimediaviewer-geoloc-coords' => 'Format for sets of geolocation coordinates. Parameters:
* $1 - the latitude
* $2 - the longitude
Both are formatted according to {{msg-mw|Multimediaviewer-geoloc-coord}}.',
	'multimediaviewer-geolocation' => 'Message for displaying a location. Parameters:
* $1 - a location which is formatted by {{msg-mw|Multimediaviewer-geoloc-coords}}',
	'multimediaviewer-fileusage-count' => 'Used as <code><nowiki><h3></nowiki></code> heading for the list of pages which use this image.

Parameters:
* $1 - the number of pages using the image
See also:
* {{msg-mw|Multimediaviewer-fileusage-count-more}}',
	'multimediaviewer-fileusage-count-more' => 'Used as <code><nowiki><h3></nowiki></code> heading for the list of pages which use this image.

This is used when the number is too large to accurately determine; it can be much larger than the value given in $1.

Parameters:
* $1 - the number of pages
See also:
* {{msg-mw|Multimediaviewer-fileusage-count}}',
	'multimediaviewer-fileusage-link' => 'Text of link pointing to [[Special:WhatLinksHere]] or [[Special:GlobalUsage]] when there are too many pages to fit into the metadata box.',
	'multimediaviewer-fileusage-local-section' => 'Section title for the local usages.

Followed by {{msg-mw|Multimediaviewer-fileusage-link}} and the list of pages.

See also:
* {{msg-mw|Multimediaviewer-fileusage-global-section}}',
	'multimediaviewer-fileusage-global-section' => 'Section title for the global usages.

Followed by {{msg-mw|Multimediaviewer-fileusage-link}} and the list of pages.

See also:
* {{msg-mw|Multimediaviewer-fileusage-local-section}}',
	'multimediaviewer-reuse-link' => 'Text of the link on the metadata panel which opens the reuse panel',
	'multimediaviewer-reuse-loading-placeholder' => 'Text that appears in all reuse text boxes as a placeholder while the data loads.
{{Identical|Loading}}',
	'multimediaviewer-share-tab' => 'Tab title text for the file reuse panel - used for the section with shareable URLs.',
	'multimediaviewer-embed-tab' => 'Tab title text for the file reuse panel - used for the section with embeddable HTML and wikitext.',
	'multimediaviewer-link-to-page' => 'Used as alt-text to describe a URL that goes to a File: page for an image.',
	'multimediaviewer-link-to-file' => 'Used as alt-text to describe a URL that goes to an image file.',
	'multimediaviewer-share-explanation' => 'Used below the URL share input to explain what we expect the user to do.',
	'multimediaviewer-embed-wt' => 'Used to represent a choice for embedding a file in a wiki page, as wikitext.',
	'multimediaviewer-embed-html' => 'Used to represent a choice for embedding a file in an HTML document, as HTML.',
	'multimediaviewer-embed-explanation' => 'Used below the embed textarea to explain what we expect the user to do.',
	'multimediaviewer-html-embed-credit-text-tbls' => 'Credit text, used when generating HTML to reuse an image.
Which one of the multimediaviewer-html-embed-credit-text-* messages is used will depend on what information about the image is available.
* $1 - name of the work (typically the filename without an extension)
* $2 - name of the author
* $3 - name of the license
* $4 - name of the website/institution which was the direct source for this image
Each of the parameters could be either plain text or a link.',
	'multimediaviewer-html-embed-credit-text-tls' => 'Credit text, used when generating HTML to reuse an image.
Which one of the multimediaviewer-html-embed-credit-text-* messages is used will depend on what information about the image is available.
* $1 - name of the work (typically the filename without an extension)
* $2 - name of the license
* $3 - name of the website/institution which was the direct source for this image
Each of the parameters could be either plain text or a link.',
	'multimediaviewer-html-embed-credit-text-tbs' => 'Credit text, used when generating HTML to reuse an image.
Which one of the multimediaviewer-html-embed-credit-text-* messages is used will depend on what information about the image is available.
* $1 - name of the work (typically the filename without an extension)
* $2 - name of the author
* $3 - name of the website/institution which was the direct source for this image
Each of the parameters could be either plain text or a link.',
	'multimediaviewer-html-embed-credit-text-tbl' => 'Credit text, used when generating HTML to reuse an image.
Which one of the multimediaviewer-html-embed-credit-text-* messages is used will depend on what information about the image is available.
* $1 - name of the work (typically the filename without an extension)
* $2 - name of the author
* $3 - name of the license
Each of the parameters could be either plain text or a link.',
	'multimediaviewer-html-embed-credit-text-tb' => 'Credit text, used when generating HTML to reuse an image.
Which one of the multimediaviewer-html-embed-credit-text-* messages is used will depend on what information about the image is available.
* $1 - name of the work (typically the filename without an extension)
* $2 - name of the author
Each of the parameters could be either plain text or a link.',
	'multimediaviewer-html-embed-credit-text-ts' => 'Credit text, used when generating HTML to reuse an image.
Which one of the multimediaviewer-html-embed-credit-text-* messages is used will depend on what information about the image is available.
* $1 - name of the work (typically the filename without an extension)
* $2 - name of the website/institution which was the direct source for this image
Each of the parameters could be either plain text or a link.',
	'multimediaviewer-html-embed-credit-text-tl' => 'Credit text, used when generating HTML to reuse an image.
Which one of the multimediaviewer-html-embed-credit-text-* messages is used will depend on what information about the image is available.
* $1 - name of the work (typically the filename without an extension)
* $2 - name of the license
Each of the parameters could be either plain text or a link.',
	'multimediaviewer-html-embed-credit-text-t' => 'Credit text, used when generating HTML to reuse an image.
Which one of the multimediaviewer-html-embed-credit-text-* messages is used will depend on what information about the image is available.
* $1 - name of the work (typically the filename without an extension)
Each of the parameters could be either plain text or a link.',
	'multimediaviewer-embed-byline' => 'Byline (author credit) text, used when generating wikitext/HTML to reuse the image. $1 is author name.',
	'multimediaviewer-embed-license' => 'License information, used when generating wikitext/HTML to reuse the image. $1 is the license name.',
	'multimediaviewer-embed-via' => 'Source information (e. g. "via Flickr"), used when generating wikitext/HTML to reuse the image.
$1 is source (probably a website or institution name)',
	'multimediaviewer-default-embed-size' => 'Text of size selector option which will generate wikitext for a thumbnail without explicit size.',
	'multimediaviewer-original-embed-dimensions' => 'Text of size selector option which will generate wikitext for a thumbnail with the original (full) size.
* $1 - thumbnail dimensions, defined by the following message:
** {{msg-mw|Multimediaviewer-embed-dimensions}}',
	'multimediaviewer-large-embed-dimensions' => 'Text of size selector option which will generate wikitext for a thumbnail with small size.
* $1 - thumbnail dimensions, defined by the following message:
** {{msg-mw|Multimediaviewer-embed-dimensions}}',
	'multimediaviewer-medium-embed-dimensions' => 'Text of size selector option which will generate wikitext for a thumbnail with medium size.
* $1 - thumbnail dimensions, defined by the following message:
** {{msg-mw|Multimediaviewer-embed-dimensions}}',
	'multimediaviewer-small-embed-dimensions' => 'Text of size selector option which will generate wikitext for a thumbnail with large size.
* $1 - thumbnail dimensions, defined by the following message:
** {{msg-mw|Multimediaviewer-embed-dimensions}}',
	'multimediaviewer-embed-dimensions' => 'Dimensions for a given size selector option which will generate wikitext for a thumbnail.
* $1 - width in pixels
* $2 - height in pixels',
);

/** Arabic (العربية)
 * @author Claw eg
 * @author Tarawneh
 * @author مشعل الحربي
 */
$messages['ar'] = array(
	'multimediaviewer-desc' => 'توسيع المصغرات إلى حجم أكبر في نافذة منبثقة.', # Fuzzy
	'multimediaviewer-pref' => 'عارض الوسائط',
	'multimediaviewer-pref-desc' => 'حسن تجربة مشاهدة الوسائط المتعددة مع هذه الأداة الجديدة، حيث تعمل على عرض الصور بحجم أكبر على الصفحات التي تحتوي صورًا مصغرة. وتظهر الصور في صندوق منبثق أجمل، ويمكن أيضًا عرضها بالحجم الكامل.', # Fuzzy
	'multimediaviewer-file-page' => 'الذهاب إلى الصفحة التابعة للملف',
	'multimediaviewer-repository' => 'تفاصيل أكثر على $1',
	'multimediaviewer-datetime-created' => 'أنشئت في $1',
	'multimediaviewer-datetime-uploaded' => 'رفعت في $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|رفع}} بواسطة $1',
	'multimediaviewer-license-cc-pd' => 'ملكية عامة',
	'multimediaviewer-license-default' => 'عرض الترخيص',
	'multimediaviewer-permission-title' => 'تفاصيل الترخيص',
	'multimediaviewer-permission-link' => 'راجع الشروط',
	'multimediaviewer-use-file' => 'استخدام هذا الملف',
	'multimediaviewer-use-file-owt' => 'استخدام هذا الملف في صفحة ويكي، على هيئة صورة مصغرة',
	'multimediaviewer-use-file-own' => 'استخدام هذا الملف في صفحة ويكي، على السطر',
	'multimediaviewer-use-file-offwiki' => 'استخدام هذا الملف في موقع آخر',
	'multimediaviewer-about-mmv' => 'حول عارض الوسائط',
	'multimediaviewer-discuss-mmv' => 'إعطاء رأيك',
);

/** Assamese (অসমীয়া)
 * @author Bishnu Saikia
 */
$messages['as'] = array(
	'multimediaviewer-share-tab' => 'বিতৰণ',
	'multimediaviewer-embed-wt' => 'ৱিকিপাঠ্য',
	'multimediaviewer-embed-byline' => '$1 ৰ দ্বাৰা',
);

/** Asturian (asturianu)
 * @author Xuacu
 */
$messages['ast'] = array(
	'multimediaviewer-desc' => 'Espande les miniatures a mayor tamañu nuna interfaz a pantalla completa.',
	'multimediaviewer-desc-nil' => 'Nun hai una descripción disponible.',
	'multimediaviewer-pref' => 'Visor de medios',
	'multimediaviewer-pref-desc' => 'Ameyore la esperiencia al ver multimedia con esta nueva ferramienta. Amuesa les imaxes a mayor tamañu nes páxines que tienen miniatures. Les imaxes vense nuna guapa capa a pantalla completa, y puen vese tamién a tamañu completu.',
	'multimediaviewer-file-page' => 'Dir a la páxina del ficheru correspondiente',
	'multimediaviewer-repository' => 'Ver más en $1',
	'multimediaviewer-repository-local' => 'Más información',
	'multimediaviewer-datetime-created' => 'Creáu el $1',
	'multimediaviewer-datetime-uploaded' => 'Xubíu el $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|Xubíu}} por $1',
	'multimediaviewer-license-cc-pd' => 'Dominiu públicu',
	'multimediaviewer-license-pd' => 'Dominiu públicu',
	'multimediaviewer-license-default' => 'Ver la llicencia',
	'multimediaviewer-permission-title' => 'Detalles de la llicencia',
	'multimediaviewer-permission-link' => 'ver los términos',
	'multimediaviewer-permission-viewmore' => 'Ver más',
	'multimediaviewer-use-file' => 'Usar esti ficheru',
	'multimediaviewer-use-file-owt' => 'Usar esti ficheru nuna páxina wiki, como miniatura',
	'multimediaviewer-use-file-own' => 'Usar esti ficheru nuna páxina wiki, en llinia',
	'multimediaviewer-use-file-offwiki' => "Usar esti ficheru n'otru sitiu web",
	'multimediaviewer-about-mmv' => 'Tocante a Media Viewer',
	'multimediaviewer-discuss-mmv' => 'Dexar un comentariu',
	'multimediaviewer-geolocation' => 'Allugamientu: $1',
	'multimediaviewer-fileusage-count' => 'Usada en $1 {{PLURAL:$1|páxina|páxines}}',
	'multimediaviewer-fileusage-count-more' => 'Usada en más de $1 {{PLURAL:$1|páxines}}',
	'multimediaviewer-fileusage-link' => 'Ver tolos usos',
	'multimediaviewer-fileusage-local-section' => 'Nesti sitiu',
	'multimediaviewer-fileusage-global-section' => "N'otros sitios",
);

/** Bikol Central (Bikol Central)
 * @author Geopoet
 */
$messages['bcl'] = array(
	'multimediaviewer-permission-title' => 'Mga detalye kan Lisensiya',
	'multimediaviewer-permission-link' => 'Hilngon an mga termino',
);

/** Bulgarian (български)
 * @author Mitzev
 */
$messages['bg'] = array(
	'multimediaviewer-permission-title' => 'Лицензна информация',
	'multimediaviewer-permission-link' => 'Вижте условията',
	'multimediaviewer-permission-viewmore' => 'Виж още',
);

/** Bengali (বাংলা)
 * @author Aftab1995
 * @author Tauhid16
 */
$messages['bn'] = array(
	'multimediaviewer-pref' => 'মিডিয়া ভিউয়ার',
	'multimediaviewer-pref-desc' => 'এই নতুন সরঞ্জামটি দিয়ে মাল্টিমিডিয়া দেখার নতুন অভিজ্ঞতা নিন। এটা থাম্বনেল আছে এমন পাতায় বড় মাপের চিত্র প্রদর্শন করে। চিত্র একটি সুন্দর উজ্জ্বল আচ্ছাদনকৃত বাক্সে প্রদর্শিত হয়, এছাড়াও পূর্ণ মাপ দেখা যাবে।', # Fuzzy
	'multimediaviewer-file-page' => 'সংশ্লিষ্ট ফাইল পৃষ্ঠাতে যান',
	'multimediaviewer-repository' => '$1-এ আরও জানুন',
	'multimediaviewer-datetime-created' => '$1 তারিখে তৈরী হয়েছে',
	'multimediaviewer-datetime-uploaded' => '$1 তারিখে আপলোডকৃত',
	'multimediaviewer-userpage-link' => '$1 দ্বারা {{GENDER:$2|আপলোডকৃত}}',
	'multimediaviewer-license-cc-pd' => 'পাবলিক ডোমেইন',
	'multimediaviewer-license-pd' => 'পাবলিক ডোমেইন',
	'multimediaviewer-license-default' => 'লাইসেন্স দেখুন',
	'multimediaviewer-use-file' => 'এই ফাইলটি ব্যবহার করুন',
	'multimediaviewer-use-file-owt' => 'থাম্বনেইল হিসাবে, উইকি পাতায় এই ফাইলটি ব্যবহার করুন',
	'multimediaviewer-use-file-own' => 'ইনলাইন হিসাবে, উইকি পাতায় এই ফাইলটি ব্যবহার করুন',
	'multimediaviewer-use-file-offwiki' => 'অন্য ওয়েবসাইটে এই ফাইলটি ব্যবহার করুন',
	'multimediaviewer-about-mmv' => 'মিডিয়া ভিউয়ার সম্পর্কে',
	'multimediaviewer-discuss-mmv' => 'আপনার প্রতিক্রিয়া জানান',
);

/** Breton (brezhoneg)
 * @author Fulup
 */
$messages['br'] = array(
	'multimediaviewer-repository-local' => "Gouzout hiroc'h",
);

/** Catalan (català)
 * @author Fitoschido
 * @author QuimGil
 * @author Vriullop
 */
$messages['ca'] = array(
	'multimediaviewer-desc' => 'Amplia les miniatures en una interfície a pantalla complerta.',
	'multimediaviewer-desc-nil' => 'Sense descripció disponible.',
	'multimediaviewer-pref' => 'Visor multimèdia',
	'multimediaviewer-pref-desc' => 'Milloreu la vostra experiència de visualització multimèdia amb aquesta nova eina. Mostra imatges a mida més gran en les pàgines que tenen miniatures. Les imatges es mostren en una pantalla completa més agradable, i també es poden veure a mida completa.',
	'multimediaviewer-file-page' => 'Vés a la pàgina corresponent del fitxer',
	'multimediaviewer-repository' => 'Més informació a $1',
	'multimediaviewer-repository-local' => 'Més informació',
	'multimediaviewer-datetime-created' => 'Creat el $1',
	'multimediaviewer-datetime-uploaded' => 'Carregat el $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|Carregat}} per $1',
	'multimediaviewer-license-cc-pd' => 'Domini públic',
	'multimediaviewer-license-pd' => 'Domini públic',
	'multimediaviewer-license-default' => 'Mostra la llicència',
	'multimediaviewer-permission-title' => 'Detalls de la llicència',
	'multimediaviewer-permission-link' => 'Vegeu les condicions',
	'multimediaviewer-permission-viewmore' => "Mostra'n més",
	'multimediaviewer-use-file' => 'Utilitza aquest fitxer',
	'multimediaviewer-use-file-owt' => 'Utilitza aquest fitxer en una pàgina wiki, com una miniatura',
	'multimediaviewer-use-file-own' => 'Utilitza aquest fitxer en una pàgina wiki, directament',
	'multimediaviewer-use-file-offwiki' => 'Utilitza aquest fitxer en un altre lloc web',
	'multimediaviewer-about-mmv' => 'Quant al visor multimèdia',
	'multimediaviewer-discuss-mmv' => 'Comentaris',
	'multimediaviewer-geolocation' => 'Emplaçament: $1',
	'multimediaviewer-fileusage-count' => 'Utilitzat en $1 {{PLURAL:$1|pàgina|pàgines}}',
	'multimediaviewer-fileusage-count-more' => 'Utilitzat en més de $1 {{PLURAL:$1|pàgines}}',
	'multimediaviewer-fileusage-link' => 'Mostra tots els usos',
	'multimediaviewer-fileusage-local-section' => 'En aquest web',
	'multimediaviewer-fileusage-global-section' => 'En altres llocs',
);

/** Chechen (нохчийн)
 * @author Умар
 */
$messages['ce'] = array(
	'multimediaviewer-desc' => 'Схьадосту суьрташ юьззина экран.',
	'multimediaviewer-pref' => 'Медиа-хьожург',
	'multimediaviewer-pref-desc' => 'Мультимедиа-файлашка хьажар хаза кечдина гойту.', # Fuzzy
	'multimediaviewer-repository-local' => 'Ма-дарра',
	'multimediaviewer-license-pd' => 'Юкъараллин рицӀкъ',
	'multimediaviewer-permission-title' => 'Лецензех лаьцна',
	'multimediaviewer-permission-link' => 'хьоле хьажар',
	'multimediaviewer-permission-viewmore' => 'Хьажа мадарра',
	'multimediaviewer-discuss-mmv' => 'Язде хьайна хетарг',
	'multimediaviewer-geolocation' => 'Географин йолу меттиг: $1',
	'multimediaviewer-fileusage-count' => 'Лело $1 {{PLURAL:$1|агӀонехь|агӀонашкахь}}',
	'multimediaviewer-fileusage-link' => 'Хьажа массо лелор',
	'multimediaviewer-fileusage-local-section' => 'ХӀокху сайтехь',
	'multimediaviewer-fileusage-global-section' => 'Кхечу сайташкахь',
	'multimediaviewer-reuse-loading-placeholder' => 'Чуйолуш...',
);

/** Czech (čeština)
 * @author Mormegil
 * @author Paxt
 * @author Rosnicka.kacka
 * @author Utar
 */
$messages['cs'] = array(
	'multimediaviewer-desc' => 'Zvětší náhledy obrázků do celoobrazovkového rozhraní.',
	'multimediaviewer-desc-nil' => 'Popis není k dispozici.',
	'multimediaviewer-pref' => 'Prohlížeč médií',
	'multimediaviewer-pref-desc' => 'Pomocí tohoto nástroje si můžete zpříjemnit prohlížení multimédií. Na stránkách, na kterých se používají náhledy obrázků, umožňuje prohlížení těchto obrázků ve větší velikosti. Obrázky se zobrazí v hezčím celoobrazovkovém rozhraní a lze si je prohlédnout také v plné velikosti.',
	'multimediaviewer-file-page' => 'Přejít na stránku s popisem souboru',
	'multimediaviewer-repository' => 'Více informací na {{grammar:6sg|$1}}',
	'multimediaviewer-repository-local' => 'Více informací',
	'multimediaviewer-datetime-created' => 'Vytvořeno $1',
	'multimediaviewer-datetime-uploaded' => 'Načteno $1',
	'multimediaviewer-userpage-link' => 'Načteno {{GENDER:$2|uživatelem|uživatelkou}} $1',
	'multimediaviewer-credit' => '$1 – $2',
	'multimediaviewer-license-cc-pd' => 'Volné dílo',
	'multimediaviewer-license-pd' => 'Volné dílo',
	'multimediaviewer-license-default' => 'Zobrazit licenci',
	'multimediaviewer-permission-title' => 'Podrobnosti o licenci',
	'multimediaviewer-permission-link' => 'zobrazit podmínky',
	'multimediaviewer-use-file' => 'Použít tento soubor',
	'multimediaviewer-use-file-owt' => 'Použít tento soubor na wiki, jako náhled',
	'multimediaviewer-use-file-own' => 'Použít tento soubor na wiki, uvnitř textu',
	'multimediaviewer-use-file-offwiki' => 'Použít tento soubor na jiné webové stránce',
	'multimediaviewer-about-mmv' => 'O prohlížeči médií',
	'multimediaviewer-discuss-mmv' => 'Sdělte svůj názor',
	'multimediaviewer-geolocation' => 'Místo: $1',
	'multimediaviewer-fileusage-count' => 'Použito na $1 {{PLURAL:$1|stránce|stránkách}}',
	'multimediaviewer-fileusage-count-more' => 'Užito na více než $1 {{PLURAL:$1|stránce|stránkách}}',
	'multimediaviewer-fileusage-link' => 'Zobrazit všechna využití',
	'multimediaviewer-fileusage-local-section' => 'Na tomto projektu',
	'multimediaviewer-fileusage-global-section' => 'Na ostatních projektech',
);

/** Danish (dansk)
 * @author Christian List
 */
$messages['da'] = array(
	'multimediaviewer-desc' => 'Udvid miniaturebilleder i en større størrelse på en fuld skærm.',
	'multimediaviewer-desc-nil' => 'Ingen beskrivelse tilgængelig.',
	'multimediaviewer-pref' => 'Medieviser',
	'multimediaviewer-pref-desc' => 'Med dette nye værktøj kan du forbedre din multimedieoplevelse. Det viser billeder i større størrelse på sider, der har miniaturer. Billederne er vist i et pænere fuldskærmsformat, og kan også ses i fuld størrelse.',
	'multimediaviewer-file-page' => 'Gå til tilsvarende filside',
	'multimediaviewer-repository' => 'Læs mere på $1',
	'multimediaviewer-repository-local' => 'Lær mere',
	'multimediaviewer-datetime-created' => 'Oprettet den $1',
	'multimediaviewer-datetime-uploaded' => 'Uploadet den $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|Uploadet}} af $1',
	'multimediaviewer-license-cc-pd' => 'Offentlig ejendom',
	'multimediaviewer-license-default' => 'Se licens',
	'multimediaviewer-use-file' => 'Brug denne fil',
	'multimediaviewer-use-file-owt' => 'Brug denne fil på en wikiside, som en miniature',
	'multimediaviewer-use-file-own' => 'Brug denne fil på en wikiside, inline',
	'multimediaviewer-use-file-offwiki' => 'Brug denne fil på en anden hjemmeside',
	'multimediaviewer-about-mmv' => 'Om Medieviser',
	'multimediaviewer-discuss-mmv' => 'Giv feedback',
	'multimediaviewer-geolocation' => 'Sted: $1',
);

/** German (Deutsch)
 * @author Kghbln
 * @author Metalhead64
 * @author Snatcher
 */
$messages['de'] = array(
	'multimediaviewer-desc' => 'Ermöglicht die Darstellung von Vorschaubildern in einer Vollbildschnittstelle',
	'multimediaviewer-desc-nil' => 'Keine Beschreibung verfügbar.',
	'multimediaviewer-pref' => 'Medienbetrachter',
	'multimediaviewer-pref-desc' => 'Dieses neue Werkzeug steigert dein Multimedia-Betrachtungserlebnis. Es zeigt Bilder auf Seiten größer an, die Vorschaubilder haben. Bilder werden in einem schöneren Vollbildschnittstellenoverlay angezeigt und können auch als Vollbild dargestellt werden.',
	'multimediaviewer-optin-pref' => 'Neues Medienbetrachtungserlebnis aktivieren',
	'multimediaviewer-file-page' => 'Gehe zur dazugehörigen Dateiseite',
	'multimediaviewer-repository' => 'Mehr erfahren auf $1',
	'multimediaviewer-repository-local' => 'Mehr erfahren',
	'multimediaviewer-datetime-created' => 'Erstellt am $1',
	'multimediaviewer-datetime-uploaded' => 'Hochgeladen am $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|Hochgeladen}} von $1',
	'multimediaviewer-metadata-error' => 'Fehler: Bilddaten konnten nicht geladen werden. $1',
	'multimediaviewer-thumbnail-error' => 'Fehler: Daten des Vorschaubildes konnten nicht geladen werden. $1',
	'multimediaviewer-license-cc-by-4.0' => 'CC-BY 4.0',
	'multimediaviewer-license-cc-by-sa-4.0' => 'CC-BY-SA 4.0',
	'multimediaviewer-license-cc-pd' => 'Gemeinfrei',
	'multimediaviewer-license-pd' => 'Gemeinfrei',
	'multimediaviewer-license-default' => 'Lizenz ansehen',
	'multimediaviewer-permission-title' => 'Lizenzeinzelheiten',
	'multimediaviewer-permission-link' => 'Bedingungen ansehen',
	'multimediaviewer-permission-viewmore' => 'Mehr',
	'multimediaviewer-about-mmv' => 'Über Media Viewer',
	'multimediaviewer-discuss-mmv' => 'Eine Rückmeldung hinterlassen',
	'multimediaviewer-geolocation' => 'Standort: $1',
	'multimediaviewer-fileusage-count' => 'Auf {{PLURAL:$1|einer Seite|$1 Seiten}} verwendet',
	'multimediaviewer-fileusage-count-more' => 'Auf mehr als $1 {{PLURAL:$1|Seiten}} verwendet',
	'multimediaviewer-fileusage-link' => 'Alle Verwendungen ansehen',
	'multimediaviewer-fileusage-local-section' => 'Auf dieser Website',
	'multimediaviewer-fileusage-global-section' => 'Auf anderen Websites',
	'multimediaviewer-reuse-link' => 'Diese Datei verwenden',
	'multimediaviewer-reuse-loading-placeholder' => 'Lade …',
	'multimediaviewer-share-tab' => 'Teilen',
	'multimediaviewer-embed-tab' => 'Einbetten',
	'multimediaviewer-link-to-page' => 'Link zur Dateibeschreibungsseite',
	'multimediaviewer-link-to-file' => 'Link zur Originaldatei',
	'multimediaviewer-embed-wt' => 'Wikitext',
	'multimediaviewer-embed-html' => 'HTML',
	'multimediaviewer-html-embed-credit-text-tbls' => '„$1“ von $2. Lizenziert unter $3 über $4.',
	'multimediaviewer-html-embed-credit-text-tls' => '„$1“. Lizenziert unter $2 über $3.',
	'multimediaviewer-html-embed-credit-text-tbs' => '„$1“ von $2. Über $3.',
	'multimediaviewer-html-embed-credit-text-tbl' => '„$1“ von $2. Lizenziert unter $3.',
	'multimediaviewer-html-embed-credit-text-tb' => '„$1“ von $2.',
	'multimediaviewer-html-embed-credit-text-ts' => '„$1“. Über $2.',
	'multimediaviewer-html-embed-credit-text-tl' => '„$1“. Lizenziert unter $2.',
	'multimediaviewer-embed-byline' => 'Von $1',
	'multimediaviewer-embed-license' => 'Lizenziert unter $1.',
	'multimediaviewer-embed-via' => 'Über $1.',
	'multimediaviewer-default-embed-size' => 'Standardvorschaubildgröße',
	'multimediaviewer-original-embed-size' => 'Originalgröße – $1 × $2 Pixel',
	'multimediaviewer-large-embed-size' => 'Groß – $1 × $2 Pixel',
	'multimediaviewer-medium-embed-size' => 'Mittel – $1 × $2 Pixel',
	'multimediaviewer-small-embed-size' => 'Klein – $1 × $2 Pixel',
);

/** Swiss High German (Schweizer Hochdeutsch)
 * @author Filzstift
 */
$messages['de-ch'] = array(
	'multimediaviewer-desc' => 'Ermöglicht die Darstellung von Vorschaubildern in einer Vollbildschnittstelle',
);

/** Lower Sorbian (dolnoserbski)
 * @author Michawiki
 */
$messages['dsb'] = array(
	'multimediaviewer-desc' => 'Miniaturki w pówjerchu połneje wobrazowki powětsyś.',
	'multimediaviewer-desc-nil' => 'Žedno wopisanje k dispoziciji',
	'multimediaviewer-pref' => 'Medijowy wobglědowak',
	'multimediaviewer-pref-desc' => 'Polěpš swójo dožywjenje multimedijowego woglědowanja z toś tym rědom. Zwobraznja wobraze we wětšej wjelikosći na bokach, kótarež maju miniaturki. Wobraze pokazuju se w rědnjejšem pówjerchu połneje wobrazowki a daju se w połnej wjelikosći pśedstajiś.',
	'multimediaviewer-file-page' => 'K pśisłušnemu datajowemu bokoju',
	'multimediaviewer-repository' => 'Dalšne informacije wó $1',
	'multimediaviewer-repository-local' => 'Dalšne informacije',
	'multimediaviewer-datetime-created' => 'Napórany $1',
	'multimediaviewer-datetime-uploaded' => 'Nagraty $1',
	'multimediaviewer-userpage-link' => 'Wót $1 {{GENDER:$2|nagraty|nagrata}}',
	'multimediaviewer-license-cc-pd' => 'Zjawnosći pśistupny',
	'multimediaviewer-license-default' => 'Licencu se woglědaś',
	'multimediaviewer-use-file' => 'Toś tu dataju wužywaś',
	'multimediaviewer-use-file-owt' => 'Toś tu dataju na wikiboku ako miniaturku wužywaś',
	'multimediaviewer-use-file-own' => 'Toś tu dataju na wikiboku zasajźonu wužywaś',
	'multimediaviewer-use-file-offwiki' => 'Toś tu dataju na drugem websydle wužywaś',
	'multimediaviewer-about-mmv' => 'Wó medijowem wobglědowaku',
	'multimediaviewer-discuss-mmv' => 'Komentar zawóstajiś',
	'multimediaviewer-geolocation' => 'Městno: $1',
);

/** Greek (Ελληνικά)
 * @author Astralnet
 * @author Geraki
 * @author Nikosguard
 */
$messages['el'] = array(
	'multimediaviewer-desc' => 'Επεκτείνετε τις μικρογραφίες σε μεγαλύτερο μέγεθος σε ένα περιβάλλον εργασίας πλήρους οθόνης.',
	'multimediaviewer-desc-nil' => 'Χωρίς διαθέσιμη περιγραφή.',
	'multimediaviewer-pref' => 'Media Viewer',
	'multimediaviewer-pref-desc' => 'Βελτιώστε την εμπειρία σας στην εμφάνιση πολυμέσων με αυτό το νέο εργαλείο. Εμφανίζει εικόνες σε μεγαλύτερο μέγεθος σε σελίδες που έχουν μικρογραφίες. Οι εικόνες εμφανίζονται σε μια καλύτερη πλήρους οθόνης διεπαφή επικάλυψης, και μπορούν επίσης να εμφανιστούν σε πλήρες μέγεθος.',
	'multimediaviewer-file-page' => 'Μεταβείτε στην αντίστοιχη σελίδα του αρχείου',
	'multimediaviewer-repository' => 'Μάθετε περισσότερα σχετικά με το $1',
	'multimediaviewer-repository-local' => 'Μάθετε περισσότερα',
	'multimediaviewer-datetime-created' => 'Δημιουργήθηκε στις $1',
	'multimediaviewer-datetime-uploaded' => 'Ανέβηκε στις $1',
	'multimediaviewer-userpage-link' => 'Ανέβηκε από {{GENDER:$2|τον|την}} $1',
	'multimediaviewer-license-cc-by-4.0' => 'CC BY 4.0',
	'multimediaviewer-license-cc-by-sa-4.0' => 'CC BY-SA 4.0',
	'multimediaviewer-license-cc-pd' => 'Κοινό κτήμα',
	'multimediaviewer-license-default' => 'Δείτε την άδεια',
	'multimediaviewer-use-file' => 'Χρησιμοποιήστε αυτό το αρχείο',
	'multimediaviewer-use-file-owt' => 'Χρησιμοποιήστε αυτό το αρχείο σε μια σελίδα wiki, ως μια μικρογραφία',
	'multimediaviewer-use-file-own' => 'Χρησιμοποιήστε αυτό το αρχείο σε μια σελίδα wiki, εντός κειμένου',
	'multimediaviewer-use-file-offwiki' => 'Χρησιμοποιήστε αυτό το αρχείο σε μια άλλη ιστοσελίδα',
	'multimediaviewer-about-mmv' => 'Περί το Media Viewer',
	'multimediaviewer-discuss-mmv' => 'Αφήστε σχόλια',
	'multimediaviewer-geolocation' => 'Τοποθεσία: $1',
	'multimediaviewer-fileusage-count' => 'Χρησιμοποιείται στο $1 {{PLURAL:$1|σελίδα|σελίδες}}',
);

/** British English (British English)
 * @author Shirayuki
 */
$messages['en-gb'] = array(
	'multimediaviewer-license-default' => 'View licence',
	'multimediaviewer-permission-title' => 'Licence details',
	'multimediaviewer-html-embed-credit-text-tbls' => '"$1" by $2. Licenced under $3 via $4.',
	'multimediaviewer-html-embed-credit-text-tls' => '"$1". Licenced under $2 via $3.',
	'multimediaviewer-html-embed-credit-text-tbl' => '"$1" by $2. Licenced under $3.',
	'multimediaviewer-html-embed-credit-text-tl' => '"$1". Licenced under $2.',
	'multimediaviewer-embed-license' => 'Licenced under $1.',
);

/** Esperanto (Esperanto)
 * @author KuboF
 */
$messages['eo'] = array(
	'multimediaviewer-permission-viewmore' => 'Montri pli',
);

/** Spanish (español)
 * @author Benfutbol10
 * @author Carlitosag
 * @author Ciencia Al Poder
 * @author Csbotero
 * @author Fitoschido
 * @author PoLuX124
 */
$messages['es'] = array(
	'multimediaviewer-desc-nil' => 'Sin descripción disponible.',
	'multimediaviewer-pref' => 'Visor multimedia',
	'multimediaviewer-pref-desc' => 'Mejora tu experiencia de visualización multimedia con esta herramienta. Las imágenes se muestran en una vista a pantalla completa que incluye información relevante de las mismas.',
	'multimediaviewer-file-page' => 'Ir a la página del archivo correspondiente',
	'multimediaviewer-repository' => 'Más información en $1',
	'multimediaviewer-repository-local' => 'Más información',
	'multimediaviewer-datetime-created' => 'Creado el $1',
	'multimediaviewer-datetime-uploaded' => 'Subido el $1',
	'multimediaviewer-userpage-link' => 'Cargado por $1', # Fuzzy
	'multimediaviewer-metadata-error' => 'Error: no se pueden cargar los datos de la imagen. $1',
	'multimediaviewer-thumbnail-error' => 'Error: no se pueden cargar los datos de miniaturas. $1',
	'multimediaviewer-license-cc-pd' => 'Dominio público',
	'multimediaviewer-license-pd' => 'Dominio público',
	'multimediaviewer-license-default' => 'Ver licencia',
	'multimediaviewer-permission-title' => 'Detalles de la licencia',
	'multimediaviewer-permission-link' => 'ver términos',
	'multimediaviewer-permission-viewmore' => 'Ver más',
	'multimediaviewer-about-mmv' => 'Acerca del visor multimedia',
	'multimediaviewer-discuss-mmv' => 'Dejar comentarios',
	'multimediaviewer-geolocation' => 'Ubicación: $1',
	'multimediaviewer-fileusage-count' => 'Utilizado en $1 {{PLURAL:$1| page|pages}}',
	'multimediaviewer-fileusage-count-more' => 'Utilizado en más de $1 {{PLURAL:$1|pages}}',
	'multimediaviewer-fileusage-link' => 'Ver todos los usos',
	'multimediaviewer-fileusage-local-section' => 'En este sitio',
	'multimediaviewer-fileusage-global-section' => 'En otros sitios',
	'multimediaviewer-reuse-link' => 'Usar este archivo',
	'multimediaviewer-share-tab' => 'Compartir',
	'multimediaviewer-embed-tab' => 'Incrustar',
	'multimediaviewer-link-to-page' => 'Enlace a la página de descripción del archivo',
	'multimediaviewer-link-to-file' => 'Enlace al archivo original',
	'multimediaviewer-embed-wt' => 'Wikitexto',
	'multimediaviewer-embed-html' => 'HTML',
	'multimediaviewer-html-embed-credit-text-tbls' => '«$1» por $2. Disponible bajo la licencia $3 vía $4.',
	'multimediaviewer-html-embed-credit-text-tls' => '«$1». Disponible bajo la licencia $2 vía $3.',
	'multimediaviewer-html-embed-credit-text-tbs' => '«$1» por $2. Vía $3.',
	'multimediaviewer-html-embed-credit-text-tbl' => '«$1» por $2. Disponible bajo la licencia $3.',
	'multimediaviewer-html-embed-credit-text-tb' => '«$1» por $2.',
	'multimediaviewer-html-embed-credit-text-ts' => '«$1». Vía $2.',
	'multimediaviewer-html-embed-credit-text-tl' => '«$1». Disponible bajo la licencia $2.',
	'multimediaviewer-embed-byline' => 'Por $1',
	'multimediaviewer-embed-license' => 'Disponible bajo la licencia $1.',
	'multimediaviewer-embed-via' => 'Vía $1.',
	'multimediaviewer-default-embed-size' => 'Tamaño de miniaturas predeterminado',
	'multimediaviewer-original-embed-size' => 'Tamaño original: $1 × $2 px',
	'multimediaviewer-large-embed-size' => 'Grande: $1 × $2 px',
	'multimediaviewer-medium-embed-size' => 'Mediana: $1 × $2 px',
	'multimediaviewer-small-embed-size' => 'Pequeña: $1 × $2 px',
);

/** Estonian (eesti)
 * @author Pikne
 */
$messages['et'] = array(
	'multimediaviewer-desc' => 'Võimaldab vaadata pisipilte täisekraaniliideses.',
	'multimediaviewer-desc-nil' => 'Kirjeldus pole saadaval.',
	'multimediaviewer-pref' => 'Failivaatur',
	'multimediaviewer-pref-desc' => 'Täienda meediafailide vaatamise võimalusi selle uue tööriistaga. See võimaldab kuvada pisipiltidega lehekülgedel pildid suuremana. Pilte saab näidata kenamas täisekraaniliideses ja ka täissuuruses.',
	'multimediaviewer-file-page' => 'Mine failileheküljele',
	'multimediaviewer-repository' => 'Lisateave asukohas $1',
	'multimediaviewer-repository-local' => 'Lisateave',
	'multimediaviewer-datetime-created' => 'Valmistamisaeg: $1',
	'multimediaviewer-datetime-uploaded' => 'Üleslaadimisaeg: $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|Üleslaadija:}} $1',
	'multimediaviewer-license-cc-pd' => 'Avalik omand',
	'multimediaviewer-license-pd' => 'Avalik omand',
	'multimediaviewer-license-default' => 'Vaata litsentsi',
	'multimediaviewer-permission-viewmore' => 'Vaata rohkem',
	'multimediaviewer-use-file' => 'Kasuta seda faili',
	'multimediaviewer-use-file-owt' => 'Kasuta seda faili vikileheküljel pisipildina',
	'multimediaviewer-use-file-own' => 'Viita sellele failile vikilehekülje tekstis',
	'multimediaviewer-use-file-offwiki' => 'Kasuta seda faili teises võrgukohas',
	'multimediaviewer-about-mmv' => 'Failivaaturist',
	'multimediaviewer-discuss-mmv' => 'Anna tagasisidet',
	'multimediaviewer-geolocation' => 'Asukoht: $1',
	'multimediaviewer-fileusage-count' => 'Kasutuses {{PLURAL:$1|ühel|$1}} leheküljel',
	'multimediaviewer-fileusage-count-more' => 'Kasutuses rohkem kui {{PLURAL:$1|ühel|$1}} leheküljel',
	'multimediaviewer-fileusage-link' => 'Vaata kõiki kasutusi',
	'multimediaviewer-fileusage-local-section' => 'Selles võrgukohas',
	'multimediaviewer-fileusage-global-section' => 'Teistes võrgukohtades',
);

/** Persian (فارسی)
 * @author Armin1392
 * @author Ebraminio
 * @author Mcuteangel
 * @author Omidh
 * @author Reza1615
 */
$messages['fa'] = array(
	'multimediaviewer-desc' => 'تصاویر بندانگشتی در حجم بزرگتر داخل یک رابط کاربری تمام صفحه گسترش یابند.',
	'multimediaviewer-desc-nil' => 'هیچ توضیحی در دسترس نمی باشد.',
	'multimediaviewer-pref' => 'نمایش‌دهندهٔ رسانه',
	'multimediaviewer-pref-desc' => 'تجربهٔ بازدید چندرسانه‌ای شما با این ابزار جدید بهبود می‌یابد و تصاویر را در اندازهٔ بزرگتر در صفحه‌هایی که بندانگشتی دارند نمایش می‌دهد. تصاویر در پوشش سبک زیباتری نمایش داده می‌شوند و همچنین می‌توانند در اندازهٔ اصلی نمایش داده شوند.',
	'multimediaviewer-file-page' => 'رفتن به صفحهٔ مرتبط با پرونده',
	'multimediaviewer-repository' => 'بیشتر بدانید در $1',
	'multimediaviewer-repository-local' => 'اطلاعات بیشتر',
	'multimediaviewer-datetime-created' => 'ایجادشده توسط $1',
	'multimediaviewer-datetime-uploaded' => 'ارسال شده در$1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|ارسال شده توسط}} $1',
	'multimediaviewer-license-cc-by-2.0' => 'CC BY 2.0',
	'multimediaviewer-license-cc-by-sa-2.0' => 'CC BY-SA 2.0',
	'multimediaviewer-license-cc-by-2.5' => 'CC BY 2.5',
	'multimediaviewer-license-cc-by-sa-2.5' => 'CC BY-SA 2.5',
	'multimediaviewer-license-cc-by-3.0' => 'CC BY 3.0',
	'multimediaviewer-license-cc-by-sa-3.0' => 'CC BY-SA 3.0',
	'multimediaviewer-license-cc-pd' => 'مالکیت عمومی',
	'multimediaviewer-license-pd' => 'دامنهٔ عمومی',
	'multimediaviewer-license-default' => 'مشاهده مجوز',
	'multimediaviewer-permission-title' => 'جزئیات مجوز',
	'multimediaviewer-permission-link' => 'مشاهدهٔ شرایط',
	'multimediaviewer-permission-viewmore' => 'مشاهدهٔ بیشتر',
	'multimediaviewer-use-file' => 'استفاده از این پرونده',
	'multimediaviewer-use-file-owt' => 'استفاده از این پرونده به صورت بندانگشتی در صفحه ویکی',
	'multimediaviewer-use-file-own' => 'استفاده از این پرونده به صورت درون متن، در صفحه ویکی',
	'multimediaviewer-use-file-offwiki' => 'ساتفاده از این پرونده در وب‌گاه دیگر',
	'multimediaviewer-about-mmv' => 'دربارهٔ نمایش‌دهندهٔ رسانه',
	'multimediaviewer-discuss-mmv' => 'گذاشتن بازخورد',
	'multimediaviewer-geolocation' => 'مکان: $1',
	'multimediaviewer-fileusage-count' => 'استفاده شده در {{PLURAL:$1|صفحه|صفحه‌ها}}',
	'multimediaviewer-fileusage-count-more' => 'استفاده شده در بیش از $1  {{PLURAL:$1|صفحات}}',
	'multimediaviewer-fileusage-link' => 'مشاهدهٔ همهٔ استفاده‌ها',
	'multimediaviewer-fileusage-local-section' => 'در این سایت',
	'multimediaviewer-fileusage-global-section' => 'در سایت‌های دیگر',
);

/** Finnish (suomi)
 * @author Elseweyr
 * @author Nike
 * @author Stryn
 */
$messages['fi'] = array(
	'multimediaviewer-desc' => 'Näytä pienoiskuvat suuremmassa koossa kokoruututilassa.',
	'multimediaviewer-desc-nil' => 'Ei kuvausta saatavilla.',
	'multimediaviewer-pref' => 'Media Viewer',
	'multimediaviewer-pref-desc' => 'Paranna multimedian katselukokemustasi tällä uudella työkalulla. Se näyttää kuvat suuremmassa koossa sivuilla, joissa on kuvakkeita. Kuvat aukeavat suuremmassa koossa kokoruututilassa, ja ne voidaan näyttää myös täysikokoisina.',
	'multimediaviewer-file-page' => 'Siirry tiedostosivulle',
	'multimediaviewer-repository' => 'Lisätietoa sivustolla $1',
	'multimediaviewer-repository-local' => 'Lue lisää',
	'multimediaviewer-datetime-created' => 'Luotu $1',
	'multimediaviewer-datetime-uploaded' => 'Tallennettu $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|Tallentanut}} $1',
	'multimediaviewer-license-cc-pd' => 'Vapaasti käytettävä',
	'multimediaviewer-license-pd' => 'Vapaasti käytettävä',
	'multimediaviewer-license-default' => 'Näytä lisenssi',
	'multimediaviewer-permission-title' => 'Lisenssitiedot',
	'multimediaviewer-permission-link' => 'näytä ehdot',
	'multimediaviewer-permission-viewmore' => 'Näytä lisää',
	'multimediaviewer-about-mmv' => 'Tietoa Media Vieweristä',
	'multimediaviewer-discuss-mmv' => 'Jätä palautetta',
	'multimediaviewer-geolocation' => 'Sijainti: $1',
	'multimediaviewer-fileusage-count' => 'Käytössä {{PLURAL:$1|yhdellä|$1}} sivulla',
	'multimediaviewer-fileusage-count-more' => 'Käytössä useammalla kuin {{PLURAL:$1|yhdellä|$1}} sivulla',
	'multimediaviewer-fileusage-link' => 'Näytä kaikki, joissa käytössä',
	'multimediaviewer-fileusage-local-section' => 'Tällä sivustolla',
	'multimediaviewer-fileusage-global-section' => 'Muilla sivustoilla',
	'multimediaviewer-reuse-link' => 'Käytä tätä tiedostoa', # Fuzzy
);

/** French (français)
 * @author Gomoko
 * @author Jean-Frédéric
 * @author Ltrlg
 * @author NemesisIII
 * @author Verdy p
 */
$messages['fr'] = array(
	'multimediaviewer-desc' => 'Agrandit les vignettes dans une interface en plein écran.',
	'multimediaviewer-desc-nil' => 'Aucune description disponible.',
	'multimediaviewer-pref' => 'Visionneuse de Médias',
	'multimediaviewer-pref-desc' => 'Améliorez votre expérience de visualisation multimédia avec ce nouvel outil. Il affiche les images en grande taille sur les pages qui ont des vignettes. Les images sont affichées dans un joli cadre d’interface en plein écran, et peuvent aussi être affichées en taille maximale.',
	'multimediaviewer-file-page' => 'Aller à la page du fichier correspondant',
	'multimediaviewer-repository' => 'En savoir plus sur $1',
	'multimediaviewer-repository-local' => 'En savoir plus',
	'multimediaviewer-datetime-created' => 'Créé le $1',
	'multimediaviewer-datetime-uploaded' => 'Téléversé le $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|Téléversé}} par $1',
	'multimediaviewer-credit' => '$1 — $2',
	'multimediaviewer-metadata-error' => 'Erreur : Impossible de charger les données de l’image. $1',
	'multimediaviewer-thumbnail-error' => 'Erreur : Impossible de charger les données de la vignette. $1',
	'multimediaviewer-license-cc-pd' => 'Domaine public',
	'multimediaviewer-license-pd' => 'Domaine public',
	'multimediaviewer-license-default' => 'Afficher la licence',
	'multimediaviewer-permission-title' => 'Détails de la licence',
	'multimediaviewer-permission-link' => 'afficher les conditions',
	'multimediaviewer-permission-viewmore' => 'Voir plus',
	'multimediaviewer-about-mmv' => 'À propos de la visionneuse de médias',
	'multimediaviewer-discuss-mmv' => 'Laisser un avis à propos de la visionneuse de médias',
	'multimediaviewer-geolocation' => 'Emplacement : $1',
	'multimediaviewer-fileusage-count' => 'Utilisé sur $1 {{PLURAL:$1|page|pages}}',
	'multimediaviewer-fileusage-count-more' => 'Utilisé sur plus de $1 {{PLURAL:$1|pages}}',
	'multimediaviewer-fileusage-link' => 'Voir toutes les utilisations',
	'multimediaviewer-fileusage-local-section' => 'Sur ce site',
	'multimediaviewer-fileusage-global-section' => 'Sur d’autres sites',
	'multimediaviewer-reuse-link' => 'Utiliser ce fichier',
	'multimediaviewer-reuse-loading-placeholder' => 'Chargement en cours…',
	'multimediaviewer-share-tab' => 'Partager',
	'multimediaviewer-embed-tab' => 'Intégrer',
	'multimediaviewer-link-to-page' => 'Lien vers la page de description du fichier',
	'multimediaviewer-link-to-file' => 'Lien vers le fichier d’origine',
	'multimediaviewer-embed-wt' => 'Wikitexte',
	'multimediaviewer-embed-html' => 'HTML',
	'multimediaviewer-html-embed-credit-text-tbls' => '« $1 » par $2. Sous licence $3 via $4.',
	'multimediaviewer-html-embed-credit-text-tls' => '« $1 ». Sous licence $2 via $3.',
	'multimediaviewer-html-embed-credit-text-tbs' => '« $1 » par $2. Via $3.',
	'multimediaviewer-html-embed-credit-text-tbl' => '« $1 » par $2. Sous licence $3.',
	'multimediaviewer-html-embed-credit-text-tb' => '« $1 » par $2.',
	'multimediaviewer-html-embed-credit-text-ts' => '« $1 ». Via $2.',
	'multimediaviewer-html-embed-credit-text-tl' => '« $1 ». Sous licence $2.',
	'multimediaviewer-embed-byline' => 'Par $1',
	'multimediaviewer-embed-license' => 'Sous licence $1.',
	'multimediaviewer-embed-via' => 'Via $1.',
	'multimediaviewer-default-embed-size' => 'Taille de vignette par défaut',
	'multimediaviewer-original-embed-size' => 'Taille originale - $1 × $2 px',
	'multimediaviewer-large-embed-size' => 'Grande - $1 × $2 px',
	'multimediaviewer-medium-embed-size' => 'Moyenne - $1 × $2 px',
	'multimediaviewer-small-embed-size' => 'Petite - $1 × $2 px',
);

/** Galician (galego)
 * @author Toliño
 */
$messages['gl'] = array(
	'multimediaviewer-desc' => 'Expande as miniaturas ata un tamaño maior dentro dunha interface a pantalla completa.',
	'multimediaviewer-desc-nil' => 'Non hai ningunha descrición dispoñible.',
	'multimediaviewer-pref' => 'Visor de ficheiros multimedia',
	'multimediaviewer-pref-desc' => 'Mellore a súa experiencia de visualización de ficheiros multimedia con esta nova ferramenta. Mostra as imaxes nun tamaño maior nas páxinas que teñen miniaturas. As imaxes móstranse nun visor a pantalla completa agradable e as imaxes tamén se poden ver a tamaño completo.',
	'multimediaviewer-file-page' => 'Ir á páxina de ficheiro correspondente',
	'multimediaviewer-repository' => 'Máis información en $1',
	'multimediaviewer-repository-local' => 'Máis información',
	'multimediaviewer-datetime-created' => 'Creado o $1',
	'multimediaviewer-datetime-uploaded' => 'Cargado o $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|Cargado}} por $1',
	'multimediaviewer-license-cc-pd' => 'Dominio público',
	'multimediaviewer-license-pd' => 'Dominio público',
	'multimediaviewer-license-default' => 'Ver a licenza',
	'multimediaviewer-permission-title' => 'Detalles da licenza',
	'multimediaviewer-permission-link' => 'ver os termos',
	'multimediaviewer-permission-viewmore' => 'Ollar máis',
	'multimediaviewer-about-mmv' => 'Acerca do visor de ficheiros multimedia',
	'multimediaviewer-discuss-mmv' => 'Deixe un comentario',
	'multimediaviewer-geolocation' => 'Localización: $1',
	'multimediaviewer-fileusage-count' => 'Empregada {{PLURAL:$1|nunha páxina|en $1 páxinas}}',
	'multimediaviewer-fileusage-count-more' => 'Empregada en máis de $1 {{PLURAL:$1|páxinas}}',
	'multimediaviewer-fileusage-link' => 'Ver todos os usos',
	'multimediaviewer-fileusage-local-section' => 'Neste sitio',
	'multimediaviewer-fileusage-global-section' => 'Noutros sitios',
	'multimediaviewer-reuse-link' => 'Utilizar este ficheiro', # Fuzzy
);

/** Gujarati (ગુજરાતી)
 * @author KartikMistry
 */
$messages['gu'] = array(
	'multimediaviewer-permission-viewmore' => 'વધુ જુઓ',
);

/** Hebrew (עברית)
 * @author Amire80
 * @author Neukoln
 */
$messages['he'] = array(
	'multimediaviewer-desc' => 'הגדלת תמונות ממוזערות למסך מלא.',
	'multimediaviewer-desc-nil' => 'התיאור אינו זמין.',
	'multimediaviewer-pref' => 'מציג מדיה',
	'multimediaviewer-pref-desc' => 'הכלי החדש הזה משפר את חוויית המולטימדיה שלך. הוא מציג תמונות מוגדלות בדפים עם תמונות ממוזערות. התמונות מוצגות בשכבה במסך מלא וניתן להציג אותן גם בגודל מלא.',
	'multimediaviewer-optin-pref' => 'הפעלת חוויית הצגת מולטימדיה חדשה',
	'multimediaviewer-file-page' => 'מעבר אל דף הקובץ המתאים',
	'multimediaviewer-repository' => 'מידע נוסף על $1',
	'multimediaviewer-repository-local' => 'מידע נוסף',
	'multimediaviewer-datetime-created' => 'נוצר ב־$1',
	'multimediaviewer-datetime-uploaded' => 'הועלה ב־$1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|הועלה}} על־ידי $1',
	'multimediaviewer-metadata-error' => 'שגיאה: לא היה ניתן לטעון את נתוני התמונה. $1',
	'multimediaviewer-thumbnail-error' => 'שגיאה: לא היה ניתן לטעון את נתוני התמונה הממוזערת. $1',
	'multimediaviewer-license-cc-pd' => 'נחלת הכלל',
	'multimediaviewer-license-pd' => 'נחלת הכלל',
	'multimediaviewer-license-default' => 'הצגת הרישיון',
	'multimediaviewer-permission-title' => 'פרטי הרישיון',
	'multimediaviewer-permission-link' => 'הצגת התנאים',
	'multimediaviewer-permission-viewmore' => 'להראות עוד',
	'multimediaviewer-about-mmv' => 'אודות מציג מדיה',
	'multimediaviewer-discuss-mmv' => 'השארת תגובה',
	'multimediaviewer-geolocation' => 'מיקום: $1',
	'multimediaviewer-fileusage-count' => 'משמש {{PLURAL:$1|בדף אחד|ב־$1 דפים}}',
	'multimediaviewer-fileusage-count-more' => 'משמש ביותר {{PLURAL:$1|מדף אחד|מ־$1 דפים}}',
	'multimediaviewer-fileusage-link' => 'הצגת כל השימושים',
	'multimediaviewer-fileusage-local-section' => 'באתר הזה',
	'multimediaviewer-fileusage-global-section' => 'באתרים אחרים',
	'multimediaviewer-reuse-link' => 'שימוש בקובץ הזה',
	'multimediaviewer-reuse-loading-placeholder' => 'טעינה...',
	'multimediaviewer-share-tab' => 'שיתוף',
	'multimediaviewer-embed-tab' => 'הטמעה',
	'multimediaviewer-link-to-page' => 'קישור לדף תיאור הקובץ',
	'multimediaviewer-link-to-file' => 'קישור לקובץ המקורי',
	'multimediaviewer-embed-wt' => 'קוד ויקי',
	'multimediaviewer-embed-html' => 'HTML',
	'multimediaviewer-html-embed-credit-text-tbls' => '"$1" מאת $2. ברישיון $3 דרך $4.',
	'multimediaviewer-html-embed-credit-text-tls' => '"$1". ברישיון $2 דרך $3.',
	'multimediaviewer-html-embed-credit-text-tbs' => '"$1" מאת $2. דרך $3.',
	'multimediaviewer-html-embed-credit-text-tbl' => '"$1" מאת $2. ברישיון $3.',
	'multimediaviewer-html-embed-credit-text-tb' => '"$1" מאת $2.',
	'multimediaviewer-html-embed-credit-text-ts' => '"$1". דרך $2.',
	'multimediaviewer-html-embed-credit-text-tl' => '"$1". ברישיון $2.',
	'multimediaviewer-embed-byline' => 'מאת $1',
	'multimediaviewer-embed-license' => 'ברישיון $1.',
	'multimediaviewer-embed-via' => 'דרך $1.',
	'multimediaviewer-default-embed-size' => 'גודל התחלתי לתמונה ממוזערת',
	'multimediaviewer-original-embed-size' => 'גודל מקורי – $1 × $2 פיקסלים',
	'multimediaviewer-large-embed-size' => 'גדול – $1 × $2 פיקסלים',
	'multimediaviewer-medium-embed-size' => 'בינוני – $1 × $2 פיקסלים',
	'multimediaviewer-small-embed-size' => 'קטן – $1 × $2 פיקסלים',
);

/** Hindi (हिन्दी)
 * @author Kunalgrover05
 * @author Siddhartha Ghai
 * @author Vivek Rai
 * @author Wikiuser13
 */
$messages['hi'] = array(
	'multimediaviewer-permission-title' => 'लाइसेंस विवरण',
	'multimediaviewer-permission-link' => 'शर्तें देखें',
	'multimediaviewer-reuse-loading-placeholder' => 'लोड हो रहा है…',
	'multimediaviewer-embed-tab' => 'एम्बेड करें',
	'multimediaviewer-link-to-file' => 'मूल फ़ाइल से लिंक करें',
	'multimediaviewer-embed-byline' => '$1 द्वारा',
);

/** Croatian (hrvatski)
 * @author MaGa
 */
$messages['hr'] = array(
	'multimediaviewer-pref' => 'Preglednik medijskih datoteka',
	'multimediaviewer-pref-desc' => 'Poboljšajte svoje iskustvo pregledavajući multimedijske sadržaje uz pomoć ovog alata. Alat prikazuje slike u većoj veličini i u ljepšem Lightbox okviru. Slike se mogu vidjeti i u pravoj veličini.',
	'multimediaviewer-repository' => 'Više na projektu $1',
	'multimediaviewer-datetime-created' => 'Napravljeno $1',
	'multimediaviewer-userpage-link' => 'Sliku {{GENDER:$2|postavio|postavila}} $1',
	'multimediaviewer-license-default' => 'Prikaži licenciju',
	'multimediaviewer-use-file' => 'Uporaba datoteke',
	'multimediaviewer-use-file-owt' => 'Uporaba datoteke kao sličice na wiki stranici',
	'multimediaviewer-use-file-own' => 'Uporaba datoteke na wiki stranici u pravoj veličini',
	'multimediaviewer-use-file-offwiki' => 'Uporaba datoteke na nekoj drugoj internetskoj stranici',
	'multimediaviewer-about-mmv' => 'O pregledniku multimedijskih datoteka',
	'multimediaviewer-discuss-mmv' => 'Napišite povratnu informaciju',
);

/** Upper Sorbian (hornjoserbsce)
 * @author J budissin
 * @author Michawiki
 */
$messages['hsb'] = array(
	'multimediaviewer-desc' => 'Miniaturki w powjerchu połneje wobrazowki powjetšić.',
	'multimediaviewer-desc-nil' => 'Žane wopisanje k dispoziciji',
	'multimediaviewer-pref' => 'Medijowy wobhladowak',
	'multimediaviewer-pref-desc' => 'Polěpš swoje dožiwjenje multimedijoweho wobhladowanja z tutym nastrojom. Zwobraznja wobrazy we wjetšej wulkosći na stronach, kotrež maja miniaturki. Wobrazy pokazuja so w rjeńšim powjerchu połneje wobrazowki a hodźa so w połnej wulkosći předstajić.',
	'multimediaviewer-file-page' => 'K přisłušnej datajowej stronje',
	'multimediaviewer-repository' => 'Dalše informacije na $1',
	'multimediaviewer-repository-local' => 'Dalše informacije',
	'multimediaviewer-datetime-created' => 'Wutworjeny $1',
	'multimediaviewer-datetime-uploaded' => 'Nahraty $1',
	'multimediaviewer-userpage-link' => 'Wot $1 {{GENDER:$2|nahraty|nahrata}}',
	'multimediaviewer-license-cc-pd' => 'Powšitkownosći přistupny',
	'multimediaviewer-license-default' => 'Licencu sej wobhladać',
	'multimediaviewer-use-file' => 'Tutu dataju wužiwać',
	'multimediaviewer-use-file-owt' => 'Wužij tutu dataju na wikistronje jako miniaturku',
	'multimediaviewer-use-file-own' => 'Wužij tutu dataju na wikistronje zasadźenu',
	'multimediaviewer-use-file-offwiki' => 'Wužij tutu dataju na druhim websydle',
	'multimediaviewer-about-mmv' => 'Wo medijowym wobhladowaku',
	'multimediaviewer-discuss-mmv' => 'Komentar zawostajić',
	'multimediaviewer-geolocation' => 'Městno: $1',
);

/** Hungarian (magyar)
 * @author Tgr
 */
$messages['hu'] = array(
	'multimediaviewer-desc' => 'A teljes képernyőre kinagyíthatóvá teszi a beágyazott képeket.',
	'multimediaviewer-desc-nil' => 'Nincs leírás.',
	'multimediaviewer-pref' => 'Képnézegető',
	'multimediaviewer-pref-desc' => 'A multimédiás tartalmak megnézését könnyebbé tevő eszköz. Az oldalak szövegébe beágyazott bélyegképeket kattintásra nagyobb méretben jeleníti meg, és számos egyéb adatot is mutat róluk.',
	'multimediaviewer-file-page' => 'Ugrás a fájl saját lapjára',
	'multimediaviewer-repository' => 'Bővebben - $1',
	'multimediaviewer-repository-local' => 'Bővebben',
	'multimediaviewer-datetime-created' => 'Készítés ideje: $1',
	'multimediaviewer-datetime-uploaded' => 'Feltöltés ideje: $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|Feltöltő}}: $1',
	'multimediaviewer-license-cc-pd' => 'Közkincs',
	'multimediaviewer-license-pd' => 'Közkincs',
	'multimediaviewer-license-default' => 'Licenc megtekintése',
	'multimediaviewer-permission-title' => 'Részletes engedély',
	'multimediaviewer-permission-link' => 'feltételek mutatása',
	'multimediaviewer-permission-viewmore' => 'Bővebben',
	'multimediaviewer-use-file' => 'A fájl használata máshol',
	'multimediaviewer-use-file-owt' => 'Egy wikiben, bélyegképként',
	'multimediaviewer-use-file-own' => 'Egy wikiben, teljes méretben',
	'multimediaviewer-use-file-offwiki' => 'Egy másik weboldalon',
	'multimediaviewer-about-mmv' => 'A Képnézegetőről',
	'multimediaviewer-discuss-mmv' => 'Üzenj a fejlesztőknek',
	'multimediaviewer-geolocation' => 'Hely: $1',
	'multimediaviewer-fileusage-count' => '$1 lapon szerepel',
	'multimediaviewer-fileusage-count-more' => 'Több, mint $1 lapon szerepel',
	'multimediaviewer-fileusage-link' => 'Mutasd az összeset',
	'multimediaviewer-fileusage-local-section' => 'Ezen a wikin',
	'multimediaviewer-fileusage-global-section' => 'Más wikiken',
);

/** Indonesian (Bahasa Indonesia)
 * @author William Surya Permana
 */
$messages['id'] = array(
	'multimediaviewer-desc' => "Membentangkan gambar mini dalam ukuran yang lebih desar di dalam 'kotak tipis'",
	'multimediaviewer-pref' => 'Penampil Media',
	'multimediaviewer-pref-desc' => "Tingkatkan pengalaman penampilan multimedia Anda dengan alat baru ini. Penampil Media menampilkan gambar dalam ukuran yang lebih besar pada halaman yang memiliki gambar mini. Gambar ditampilkan dalam 'kotak tipis' melayang yang lebih indah, dan dapat juga ditampilkan dalam ukuran penuh.",
	'multimediaviewer-file-page' => 'Pergi ke halaman berkas terkait',
	'multimediaviewer-repository' => 'Pelajari selengkapnya di $1',
	'multimediaviewer-datetime-created' => 'Dibuat pada $1',
	'multimediaviewer-datetime-uploaded' => 'Diunggah pada $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|Diunggah}} oleh $1',
	'multimediaviewer-license-cc-pd' => 'Domain Umum',
	'multimediaviewer-license-default' => 'Lihat lisensi',
	'multimediaviewer-use-file' => 'Gunakan berkas ini',
	'multimediaviewer-use-file-owt' => 'Gunakan berkas ini pada halaman wiki, sebagai gambar mini',
	'multimediaviewer-use-file-own' => 'Gunakan berkas ini pada halaman wiki, dalam baris',
	'multimediaviewer-use-file-offwiki' => 'Gunakan berkas ini pada situs web lain',
	'multimediaviewer-about-mmv' => 'Tentang Penampil Media',
	'multimediaviewer-discuss-mmv' => 'Tinggalkan umpan balik',
);

/** Iloko (Ilokano)
 * @author Lam-ang
 */
$messages['ilo'] = array(
	'multimediaviewer-desc' => 'Palawaen dagiti bassit a ladawan iti dakdakkel iti napno a pangbuyaan ti interface.',
	'multimediaviewer-desc-nil' => 'Awan ti magun-od a deskripsion.',
	'multimediaviewer-pref' => 'Media Viewer',
	'multimediaviewer-pref-desc' => 'Pasayaatem ti panagsanay a panagbuya ti nadumaduma a midia iti daytoy baro a ramit. Daytoy ket agiparang kadagiti dakdakkel a ladawan kadagiti panid nga addaan kadagiti bassit a ladawan. Dagiti ladawan ket maiparang iti nasaysayaat a tuon iti napno a pangbuyaan ti interface, ken mabalin pay a makita iti napno a kadakkel.',
	'multimediaviewer-file-page' => 'Mapan iti maitutop a panid ti papeles',
	'multimediaviewer-repository' => 'Agadal pay ti adu idiay $1',
	'multimediaviewer-repository-local' => 'Agadal pay ti adu',
	'multimediaviewer-datetime-created' => 'Pinartuat idi $1',
	'multimediaviewer-datetime-uploaded' => 'Inkarga idi $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|Inkarga}} babaen ni $1',
	'multimediaviewer-license-cc-pd' => 'Dominio a Publiko',
	'multimediaviewer-license-pd' => 'Dominio a Publiko',
	'multimediaviewer-license-default' => 'Kitaen ti lisensia',
	'multimediaviewer-permission-title' => 'Dagiti salaysay ti lisensia',
	'multimediaviewer-permission-link' => 'kitaen dagiti termino',
	'multimediaviewer-permission-viewmore' => 'Agkita pay ti adu',
	'multimediaviewer-use-file' => 'Usaren daytoy a papeles',
	'multimediaviewer-use-file-owt' => 'Usaren daytoy a papeles iti panid ti wiki, a kas bassit a ladawan',
	'multimediaviewer-use-file-own' => 'Usaren daytoy a papeles iti panid ti wiki, a nailinia',
	'multimediaviewer-use-file-offwiki' => 'Usaren daytoy a papeles iti sabali a website',
	'multimediaviewer-about-mmv' => 'Maipanggep ti Media Viewer',
	'multimediaviewer-discuss-mmv' => 'Mangibati ti feedback',
	'multimediaviewer-geolocation' => 'Lokasion: $1',
	'multimediaviewer-fileusage-count' => 'Naus-usar iti $1 a {{PLURAL:$1|panid|pampanid}}',
	'multimediaviewer-fileusage-count-more' => 'Naus-usar iti ad-adu ngem $1 a {{PLURAL:$1|pampanid}}',
	'multimediaviewer-fileusage-link' => 'Kitaen amin a panag-usar',
	'multimediaviewer-fileusage-local-section' => 'Iti daytoy a sitio',
	'multimediaviewer-fileusage-global-section' => 'Kadagiti sabali a sitio',
);

/** Italian (italiano)
 * @author Beta16
 * @author CristianCantoro
 * @author Maria victoria
 * @author OrbiliusMagister
 * @author Rosh
 */
$messages['it'] = array(
	'multimediaviewer-desc' => "Espande le miniature in dimensioni maggiori in un'interfaccia a schermo intero.",
	'multimediaviewer-desc-nil' => 'Nessuna descrizione disponibile.',
	'multimediaviewer-pref' => 'Media Viewer',
	'multimediaviewer-pref-desc' => "Sperimenta una miglior visualizzazione dei file multimediali con questo nuovo strumento che visualizza le immagini più grandi su pagine che ne riportano le miniature. Le immagini sono mostrate in un'interfaccia a schermo intero più gradevole, ma possono essere visualizzate anche alla dimensione originale.",
	'multimediaviewer-file-page' => 'Vai alla corrispondente pagina del file',
	'multimediaviewer-repository' => 'Ulteriori informazioni su $1',
	'multimediaviewer-repository-local' => 'Ulteriori informazioni',
	'multimediaviewer-datetime-created' => 'Creato il $1',
	'multimediaviewer-datetime-uploaded' => 'Caricato il $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|Caricato}} da $1',
	'multimediaviewer-metadata-error' => "Errore: impossibile caricare i dati dell'immagine. $1",
	'multimediaviewer-thumbnail-error' => 'Errore: impossibile caricare i dati della miniatura. $1',
	'multimediaviewer-license-cc-pd' => 'Pubblico dominio',
	'multimediaviewer-license-pd' => 'Pubblico dominio',
	'multimediaviewer-license-default' => 'Vedi la licenza',
	'multimediaviewer-permission-title' => 'Dettagli della licenza',
	'multimediaviewer-permission-link' => 'vedi termini',
	'multimediaviewer-permission-viewmore' => 'Mostra altro',
	'multimediaviewer-about-mmv' => 'Su Media Viewer',
	'multimediaviewer-discuss-mmv' => 'Lascia un commento',
	'multimediaviewer-geolocation' => 'Posizione: $1',
	'multimediaviewer-fileusage-count' => 'Usato in $1 {{PLURAL:$1|pagina|pagine}}',
	'multimediaviewer-fileusage-count-more' => 'Usato in più di $1 {{PLURAL:$1|pagina|pagine}}',
	'multimediaviewer-fileusage-link' => 'Mostra tutti gli usi',
	'multimediaviewer-fileusage-local-section' => 'Su questo sito',
	'multimediaviewer-fileusage-global-section' => 'Su altri siti',
	'multimediaviewer-reuse-link' => 'Usa questo file',
	'multimediaviewer-reuse-loading-placeholder' => 'Caricamento in corso…',
	'multimediaviewer-share-tab' => 'Condividi',
	'multimediaviewer-embed-tab' => 'Incorpora',
	'multimediaviewer-link-to-page' => 'Collegamento alla pagina di descrizione del file.',
	'multimediaviewer-link-to-file' => 'Collegamento al file originale.',
	'multimediaviewer-embed-wt' => 'Wikitesto',
	'multimediaviewer-embed-html' => 'HTML',
	'multimediaviewer-html-embed-credit-text-tbls' => '"$1" di $2. Con licenza $3 tramite $4.',
	'multimediaviewer-html-embed-credit-text-tls' => '"$1". Con licenza $2 tramite $3.',
	'multimediaviewer-html-embed-credit-text-tbs' => '"$1" di $2. Tramite $3.',
	'multimediaviewer-html-embed-credit-text-tbl' => '"$1" di $2. Con licenza $3.',
	'multimediaviewer-html-embed-credit-text-tb' => '"$1" di $2.',
	'multimediaviewer-html-embed-credit-text-ts' => '"$1". Tramite $2.',
	'multimediaviewer-html-embed-credit-text-tl' => '"$1". Con licenza $2.',
	'multimediaviewer-embed-byline' => 'Di $1',
	'multimediaviewer-embed-license' => 'Con licenza $1.',
	'multimediaviewer-embed-via' => 'Tramite $1.',
	'multimediaviewer-default-embed-size' => 'Dimensioni miniatura predefinite',
	'multimediaviewer-original-embed-size' => 'Dimensioni originali - $1 × $2 px',
	'multimediaviewer-large-embed-size' => 'Grande - $1 × $2 px',
	'multimediaviewer-medium-embed-size' => 'Media - $1 × $2 px',
	'multimediaviewer-small-embed-size' => 'Piccola - $1 × $2 px',
);

/** Japanese (日本語)
 * @author Shirayuki
 */
$messages['ja'] = array(
	'multimediaviewer-desc' => '縮小画像を全画面表示インターフェイス内に拡大表示する',
	'multimediaviewer-desc-nil' => '解説はありません。',
	'multimediaviewer-pref' => 'メディア ビューアー',
	'multimediaviewer-pref-desc' => 'この新しいツールは、マルチメディアの表示体験を改善します。縮小画像があるページで、その画像をより大きなサイズで表示します。画像は全画面表示インターフェイスのオーバーレイ内に表示され、完全なサイズで表示させることもできます。',
	'multimediaviewer-file-page' => '対応するファイル ページに移動',
	'multimediaviewer-repository' => '$1の詳細情報',
	'multimediaviewer-repository-local' => '詳細',
	'multimediaviewer-datetime-created' => '作成日時: $1',
	'multimediaviewer-datetime-uploaded' => 'アップロード日時: $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|アップロード}}者: $1',
	'multimediaviewer-metadata-error' => 'エラー: 画像データを読み込めませんでした。$1',
	'multimediaviewer-thumbnail-error' => 'エラー: サムネイルのデータを読み込めませんでした。$1',
	'multimediaviewer-license-cc-by-1.0' => 'CC 表示 1.0',
	'multimediaviewer-license-cc-sa-1.0' => 'CC 継承 1.0',
	'multimediaviewer-license-cc-by-sa-1.0' => 'CC 表示-継承 1.0',
	'multimediaviewer-license-cc-by-2.0' => 'CC 表示 2.0',
	'multimediaviewer-license-cc-by-sa-2.0' => 'CC 表示-継承 2.0',
	'multimediaviewer-license-cc-by-2.1' => 'CC 表示 2.1',
	'multimediaviewer-license-cc-by-sa-2.1' => 'CC 表示-継承 2.1',
	'multimediaviewer-license-cc-by-2.5' => 'CC 表示 2.5',
	'multimediaviewer-license-cc-by-sa-2.5' => 'CC 表示-継承 2.5',
	'multimediaviewer-license-cc-by-3.0' => 'CC 表示 3.0',
	'multimediaviewer-license-cc-by-sa-3.0' => 'CC 表示-継承 3.0',
	'multimediaviewer-license-cc-by-4.0' => 'CC 表示 4.0',
	'multimediaviewer-license-cc-by-sa-4.0' => 'CC 表示-継承 4.0',
	'multimediaviewer-license-cc-pd' => 'パブリック・ドメイン',
	'multimediaviewer-license-cc-zero' => 'CC 0',
	'multimediaviewer-license-pd' => 'パブリック・ドメイン',
	'multimediaviewer-license-default' => 'ライセンスを閲覧',
	'multimediaviewer-permission-title' => 'ライセンスの詳細',
	'multimediaviewer-permission-link' => '規約を閲覧',
	'multimediaviewer-about-mmv' => 'メディア ビューアーについて',
	'multimediaviewer-discuss-mmv' => 'フィードバックを送信',
	'multimediaviewer-geoloc-north' => '北緯',
	'multimediaviewer-geoloc-east' => '東経',
	'multimediaviewer-geoloc-south' => '南緯',
	'multimediaviewer-geoloc-west' => '西経',
	'multimediaviewer-geoloc-coord' => '$4$1度$2分$3秒',
	'multimediaviewer-geoloc-coords' => '$1 $2',
	'multimediaviewer-geolocation' => '場所: $1',
	'multimediaviewer-fileusage-link' => 'すべての使用状況を閲覧',
	'multimediaviewer-fileusage-local-section' => 'このサイト上',
	'multimediaviewer-fileusage-global-section' => '他のサイト上',
	'multimediaviewer-reuse-link' => 'このファイルを使用',
	'multimediaviewer-reuse-loading-placeholder' => '読み込み中…',
);

/** Georgian (ქართული)
 * @author Otogi
 */
$messages['ka'] = array(
	'multimediaviewer-pref' => 'მედია დამთვალიერებელი',
);

/** Kazakh (Cyrillic script) (қазақша (кирил)‎)
 * @author Arystanbek
 */
$messages['kk-cyrl'] = array(
	'multimediaviewer-desc' => 'Толық экранды интерфейсте шақын суреттерді өлшемін үлкен етіп кеңейту',
	'multimediaviewer-desc-nil' => 'Сипаттамасы қолжетімді емес',
	'multimediaviewer-pref' => 'Медиа қарап шығу құралы',
	'multimediaviewer-pref-desc' => 'Өзіңіздің мультимедиа көру мүмкіндігіңізді мына жаңа құралмен жетілдіріп көріңіз. Ол шағын суреті (thumbnail) бар беттердегі суреттерді үлкенірек өлшемде көрсетеді.',
	'multimediaviewer-file-page' => 'Тиісті файл бетіне өту',
	'multimediaviewer-repository' => '$1 туралы көбірек білу',
	'multimediaviewer-repository-local' => 'Көбірек білу',
	'multimediaviewer-datetime-created' => '$1 кезінде құрылған',
	'multimediaviewer-datetime-uploaded' => '$1 кезінде жүктелген',
	'multimediaviewer-userpage-link' => '$1 {{GENDER:$2|жүктеген}}',
	'multimediaviewer-metadata-error' => 'Қате: Сурет деректері жүктелмеді. $1',
	'multimediaviewer-thumbnail-error' => 'Қате: Нобай деректері жүктелмеді. $1',
	'multimediaviewer-license-cc-pd' => 'Қоғамдық қазына',
	'multimediaviewer-license-pd' => 'Қоғамдық қазына',
	'multimediaviewer-license-default' => 'Лицензиясын қарау',
	'multimediaviewer-permission-title' => 'Лицензия егжей-тегжейі',
	'multimediaviewer-permission-link' => 'шарттарын қарау',
	'multimediaviewer-permission-viewmore' => 'Көбірек қарау',
	'multimediaviewer-about-mmv' => 'Медиа қарап шығу құралы туралы',
	'multimediaviewer-discuss-mmv' => 'Пікір қалдыру',
	'multimediaviewer-geolocation' => 'Мекені: $1',
	'multimediaviewer-fileusage-count' => '$1 {{PLURAL:$1|бетте|бетте}} қолданылады',
	'multimediaviewer-fileusage-count-more' => '$1 {{PLURAL:$1|беттен|беттен}} көбірек бетте қолданылады',
	'multimediaviewer-fileusage-link' => 'Барлық қолданылуын көру',
	'multimediaviewer-fileusage-local-section' => 'Бұл сайтта',
	'multimediaviewer-fileusage-global-section' => 'Басқа сайттарда',
	'multimediaviewer-reuse-link' => 'Бұл файлды қолдану',
	'multimediaviewer-share-tab' => 'Бөлісу',
	'multimediaviewer-embed-tab' => 'Ендіру',
	'multimediaviewer-link-to-page' => 'Файл сипаттама бетіне сілтеу',
	'multimediaviewer-link-to-file' => 'Тұпнұсқа файлға сілтеу',
	'multimediaviewer-embed-wt' => 'Уикимәтін',
	'multimediaviewer-embed-html' => 'HTML',
	'multimediaviewer-html-embed-credit-text-tbls' => '"$1" $2 арқылы. $4 арқылы $3 лицензиясы аясында.',
	'multimediaviewer-html-embed-credit-text-tls' => '"$1". $3 арқылы $2 лицензиясы аясында.',
	'multimediaviewer-html-embed-credit-text-tbs' => '"$1" $2 арқылы. $3 арқылы',
	'multimediaviewer-html-embed-credit-text-tbl' => '"$1" $2 арқылы. $3 лицензиясы аясында',
	'multimediaviewer-html-embed-credit-text-tb' => '"$1" $2 арқылы.',
	'multimediaviewer-html-embed-credit-text-ts' => '"$1". $2 арқылы.',
	'multimediaviewer-html-embed-credit-text-tl' => '"$1". $2 лицензиясы аясында.',
	'multimediaviewer-embed-byline' => '$1 арқылы',
	'multimediaviewer-embed-license' => '$1 лицензиясы аясында',
	'multimediaviewer-embed-via' => '$1 арқылы',
	'multimediaviewer-default-embed-size' => 'Әдепкі нобай өлшемі',
	'multimediaviewer-original-embed-size' => 'Түпнұсқа өлшемі - $1 × $2 px',
	'multimediaviewer-large-embed-size' => 'Үлкен - $1 × $2 px',
	'multimediaviewer-medium-embed-size' => 'Орташа - $1 × $2 px',
	'multimediaviewer-small-embed-size' => 'Кішкене - $1 × $2 px',
);

/** Khmer (ភាសាខ្មែរ)
 * @author វ័ណថារិទ្ធ
 */
$messages['km'] = array(
	'multimediaviewer-repository-local' => 'ស្វែងយល់បន្ថែម',
);

/** Kannada (ಕನ್ನಡ)
 * @author Vikassy
 */
$messages['kn'] = array(
	'multimediaviewer-reuse-loading-placeholder' => 'ಉತ್ಪೂರಿತವಾಗುತ್ತಿದೆ',
);

/** Korean (한국어)
 * @author Freebiekr
 * @author Hym411
 * @author Jskang
 * @author Priviet
 * @author 아라
 */
$messages['ko'] = array(
	'multimediaviewer-desc' => '섬네일 이미지를 풀스크린 인터페이스에서 더 큰 크기로 확장합니다.',
	'multimediaviewer-desc-nil' => '설명이 없습니다.',
	'multimediaviewer-pref' => '미디어 뷰어',
	'multimediaviewer-pref-desc' => '이 새 도구로 멀티미디어를 더 쉽게 감상하십시오. 이 도구는 섬네일 이미지가 있는 문서에서 그 섬네일을 더 크게 나타냅니다. 큰 이미지는 보기 편리한 풀스크린 인터페이스로 표시되며 원본 크기로 표시될 수도 있습니다.',
	'multimediaviewer-file-page' => '해당 파일 문서로 이동',
	'multimediaviewer-repository' => '$1에서 더 자세히 보기',
	'multimediaviewer-repository-local' => '더 알아보기',
	'multimediaviewer-datetime-created' => '$1에 만듦',
	'multimediaviewer-datetime-uploaded' => '$1에 업로드',
	'multimediaviewer-userpage-link' => '$1가 {{GENDER:$2|업로드}}',
	'multimediaviewer-license-cc-pd' => '퍼블릭 도메인',
	'multimediaviewer-license-pd' => '퍼블릭 도메인',
	'multimediaviewer-license-default' => '라이선스 보기',
	'multimediaviewer-permission-title' => '라이선스 세부 사항',
	'multimediaviewer-permission-link' => '이용 약관 보기',
	'multimediaviewer-permission-viewmore' => '더 보기',
	'multimediaviewer-use-file' => '이 파일을 사용',
	'multimediaviewer-use-file-owt' => '이 파일을 위키 문서에서 섬네일로 사용',
	'multimediaviewer-use-file-own' => '이 파일을 위키 문서의 텍스트 사이에 사용',
	'multimediaviewer-use-file-offwiki' => '이 파일을 다른 웹사이트에서 사용',
	'multimediaviewer-about-mmv' => '미디어 뷰어 정보',
	'multimediaviewer-discuss-mmv' => '의견 남기기',
	'multimediaviewer-geolocation' => '위치: $1',
	'multimediaviewer-fileusage-count' => '{{PLURAL:$1|문서}} $1개에서 사용됨',
	'multimediaviewer-fileusage-count-more' => '$1개 보다 많은 {{PLURAL:$1|문서}}에서 사용됨',
	'multimediaviewer-fileusage-link' => '모든 사용 보기',
	'multimediaviewer-fileusage-local-section' => '이 사이트에서',
	'multimediaviewer-fileusage-global-section' => '다른 사이트에서',
);

/** Luxembourgish (Lëtzebuergesch)
 * @author Robby
 */
$messages['lb'] = array(
	'multimediaviewer-desc-nil' => 'Keng Beschreiwung disponibel.',
	'multimediaviewer-pref' => 'Media Viewer',
	'multimediaviewer-repository' => 'Méi gewuer ginn op $1',
	'multimediaviewer-repository-local' => 'Fir méi ze wëssen',
	'multimediaviewer-datetime-uploaded' => 'Eropgelueden den $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|Eropgeluede}} vum $1',
	'multimediaviewer-license-cc-by-4.0' => 'CC BY 4.0',
	'multimediaviewer-license-cc-by-sa-4.0' => 'CC BY-SA 4.0',
	'multimediaviewer-license-pd' => 'Ëffentlechen Domaine',
	'multimediaviewer-license-default' => 'Lizenz weisen',
	'multimediaviewer-permission-title' => 'Detailer vun der Lizenz',
	'multimediaviewer-permission-viewmore' => 'Méi weisen',
	'multimediaviewer-about-mmv' => 'Iwwer Media Viewer',
	'multimediaviewer-discuss-mmv' => 'Feedback verloossen',
	'multimediaviewer-geolocation' => 'Plaz: $1',
	'multimediaviewer-fileusage-count' => 'op {{PLURAL:$1|enger Säit|$1 Säite}} benotzt',
	'multimediaviewer-fileusage-count-more' => 'Op méi wéi {{PLURAL:$1|enger Säit|$1 Säite}} benotzt',
	'multimediaviewer-fileusage-link' => 'All Benotzunge weisen',
	'multimediaviewer-fileusage-local-section' => 'Op dësem Site',
	'multimediaviewer-fileusage-global-section' => 'Op anere Siten',
	'multimediaviewer-reuse-link' => 'Benotzt dëse Fichier',
	'multimediaviewer-reuse-loading-placeholder' => 'Lueden...',
	'multimediaviewer-share-tab' => 'Deelen',
	'multimediaviewer-embed-tab' => 'Abannen',
	'multimediaviewer-link-to-page' => "Link op d'Beschreiwungssäit vum Fichier",
	'multimediaviewer-link-to-file' => 'Link op den Originalfichier',
	'multimediaviewer-embed-wt' => 'Wikitext',
	'multimediaviewer-embed-html' => 'HTML',
	'multimediaviewer-html-embed-credit-text-tb' => '"$1" vum $2.',
	'multimediaviewer-html-embed-credit-text-ts' => '"$1". Iwwer $2.',
	'multimediaviewer-embed-byline' => 'Vum $1',
	'multimediaviewer-embed-license' => 'Lizenséiert ënner $1.',
	'multimediaviewer-embed-via' => 'Iwwer $1.',
	'multimediaviewer-original-embed-size' => 'Originalgréisst – $1 × $2 Pixel',
	'multimediaviewer-large-embed-size' => 'Grouss – $1 × $2 Pixel',
	'multimediaviewer-medium-embed-size' => 'Mëttel – $1 × $2 Pixel',
	'multimediaviewer-small-embed-size' => 'Kleng – $1 × $2 Pixel',
);

/** لوری (لوری)
 * @author Mogoeilor
 */
$messages['lrc'] = array(
	'multimediaviewer-repository-local' => 'بيشتر يا بيئريت',
);

/** Lithuanian (lietuvių)
 * @author Mantak111
 * @author Robotukas11
 */
$messages['lt'] = array(
	'multimediaviewer-desc-nil' => 'Aprašymas neprieinamas.',
	'multimediaviewer-permission-title' => 'Licencijos informacija',
	'multimediaviewer-permission-viewmore' => 'Rodyti daugiau',
);

/** Latvian (latviešu)
 * @author Papuass
 */
$messages['lv'] = array(
	'multimediaviewer-desc-nil' => 'Apraksts nav pieejams.',
	'multimediaviewer-share-tab' => 'Dalīties',
	'multimediaviewer-embed-html' => 'HTML',
);

/** Malagasy (Malagasy)
 * @author Jagwar
 */
$messages['mg'] = array(
	'multimediaviewer-permission-viewmore' => 'Hijery be kokoa',
);

/** Macedonian (македонски)
 * @author Bjankuloski06
 */
$messages['mk'] = array(
	'multimediaviewer-desc' => 'Зголемување на минијатурите на цел екран.',
	'multimediaviewer-desc-nil' => 'Нема опис.',
	'multimediaviewer-pref' => 'Прегледувач на слики и снимки',
	'multimediaviewer-pref-desc' => 'Дава поубаво прегледување на слики на страници. Ги прикажува поголеми на страниците со минијатури. Можат да се прегледуваат и на цел екран.',
	'multimediaviewer-file-page' => 'Оди на соодветната податотечна страница',
	'multimediaviewer-repository' => 'Дознајте повеќе на $1',
	'multimediaviewer-repository-local' => 'Дознајте повеќе',
	'multimediaviewer-datetime-created' => 'Создадено на $1',
	'multimediaviewer-datetime-uploaded' => 'Подигнато на $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|Подигнато}} од $1',
	'multimediaviewer-credit' => '$1 — $2',
	'multimediaviewer-metadata-error' => 'Грешка: Не можев да ги вчитам податоците за сликата. $1',
	'multimediaviewer-thumbnail-error' => 'Грешка: Не можев да ги вчитам податоците за минијатурата. $1',
	'multimediaviewer-license-cc-by-4.0' => 'CC BY 4.0',
	'multimediaviewer-license-cc-by-sa-4.0' => 'CC BY-SA 4.0',
	'multimediaviewer-license-cc-pd' => 'Јавна сопственост',
	'multimediaviewer-license-pd' => 'Јавна сопственост',
	'multimediaviewer-license-default' => 'Погл. лиценцата',
	'multimediaviewer-permission-title' => 'Лиценцни податоци',
	'multimediaviewer-permission-link' => 'погл. услови',
	'multimediaviewer-permission-viewmore' => 'Погл. уште',
	'multimediaviewer-about-mmv' => 'За Медиумскиот прегледувач',
	'multimediaviewer-discuss-mmv' => 'Дајте мислење',
	'multimediaviewer-geoloc-north' => 'СГШ',
	'multimediaviewer-geoloc-east' => 'ИГД',
	'multimediaviewer-geoloc-south' => 'ЈГШ',
	'multimediaviewer-geoloc-west' => 'ЗГД',
	'multimediaviewer-geoloc-coords' => '$1, $2',
	'multimediaviewer-geolocation' => 'Местоположба: $1',
	'multimediaviewer-fileusage-count' => 'Се користи на {{PLURAL:$1|една страница|$1 страници}}',
	'multimediaviewer-fileusage-count-more' => 'Се користи на повеќе од $1 {{PLURAL:$1|страници}}',
	'multimediaviewer-fileusage-link' => 'Погл. сите употреби',
	'multimediaviewer-fileusage-local-section' => 'На ова мрежно место',
	'multimediaviewer-fileusage-global-section' => 'На други мрежни места',
	'multimediaviewer-reuse-link' => 'Употреби ја податотекава',
	'multimediaviewer-reuse-loading-placeholder' => 'Вчитувам…',
	'multimediaviewer-share-tab' => 'Сподели',
	'multimediaviewer-embed-tab' => 'Вметни',
	'multimediaviewer-link-to-page' => 'Врска до описната страница на податотеката',
	'multimediaviewer-link-to-file' => 'Врска до изворната податотека',
	'multimediaviewer-embed-wt' => 'Викитекст',
	'multimediaviewer-embed-html' => 'HTML',
	'multimediaviewer-html-embed-credit-text-tbls' => '„$1“ од $2. Под лиценцата $3 преку $4.',
	'multimediaviewer-html-embed-credit-text-tls' => '„$1“. Под лиценцата $2 преку $3.',
	'multimediaviewer-html-embed-credit-text-tbs' => '„$1“ од $2. Преку $3.',
	'multimediaviewer-html-embed-credit-text-tbl' => '„$1“ од $2. Под лиценцата $3.',
	'multimediaviewer-html-embed-credit-text-tb' => '„$1“ од $2.',
	'multimediaviewer-html-embed-credit-text-ts' => '„$1“. Преку $2.',
	'multimediaviewer-html-embed-credit-text-tl' => '„$1“. Под лиценцата $2.',
	'multimediaviewer-embed-byline' => 'Од $1',
	'multimediaviewer-embed-license' => 'Под лиценцата $1.',
	'multimediaviewer-embed-via' => 'Преку $1.',
	'multimediaviewer-default-embed-size' => 'Стандардна големина на минијатурата',
	'multimediaviewer-original-embed-size' => 'Изворна големина — $1 × $2 пиксели',
	'multimediaviewer-large-embed-size' => 'Голема — $1 × $2 пиксели',
	'multimediaviewer-medium-embed-size' => 'Средна големина — $1 × $2 пиксели',
	'multimediaviewer-small-embed-size' => 'Мала — $1 × $2 пиксели',
);

/** Malayalam (മലയാളം)
 * @author Clockery
 * @author Praveenp
 */
$messages['ml'] = array(
	'multimediaviewer-desc' => 'ലഘുചിത്രങ്ങൾ ഫുൾസ്ക്രീനായി വികസിപ്പിക്കുക',
	'multimediaviewer-desc-nil' => 'വിവരണം ലഭ്യമല്ല.',
	'multimediaviewer-pref' => 'മീഡിയ ദർശനോപാധി',
	'multimediaviewer-pref-desc' => 'ഈ പുതിയ ഉപകരണമുപയോഗിച്ച് താങ്കളുടെ മീഡിയ ദർശനാനുഭവം മെച്ചപ്പെടുത്തൂ. ലഘുചിത്രങ്ങൾ ഉപയോഗിച്ചിരിക്കുന്ന താളുകളിലെ ചിത്രങ്ങൾ ഇതുപയോഗിച്ച് വലുതായി കാണാം. ചിത്രങ്ങൾ സുന്ദരമായ ഫുൾസ്ക്രീൻ സമ്പർക്കമുഖ രൂപത്തിലോ, പൂർണ്ണവലിപ്പത്തിലോ കാണാനാവുന്നതാണ്.',
	'multimediaviewer-file-page' => 'ബന്ധപ്പെട്ട പ്രമാണത്താളിലേയ്ക്ക് പോവുക',
	'multimediaviewer-repository' => '$1 സംരംഭത്തിൽ കൂടുതൽ അറിയുക',
	'multimediaviewer-repository-local' => 'കൂടുതൽ അറിയുക',
	'multimediaviewer-datetime-created' => 'സൃഷ്ടിച്ചത്: $1',
	'multimediaviewer-datetime-uploaded' => 'അപ്‌ലോഡ് ചെയ്തത്: $1',
	'multimediaviewer-userpage-link' => 'അപ്‌ലോഡ് {{GENDER:$2|ചെയ്ത}} ഉപയോക്താവ്: $1',
	'multimediaviewer-license-cc-pd' => 'പൊതുസഞ്ചയം',
	'multimediaviewer-license-pd' => 'പൊതുസഞ്ചയം',
	'multimediaviewer-license-default' => 'ഉപയോഗാനുമതി കാണുക',
	'multimediaviewer-permission-title' => 'ഉപയോഗാനുമതി വിവരങ്ങൾ',
	'multimediaviewer-permission-link' => 'നിബന്ധനകൾ കാണുക',
	'multimediaviewer-permission-viewmore' => 'കൂടുതൽ കാണുക',
	'multimediaviewer-use-file' => 'ഈ പ്രമാണം ഉപയോഗിക്കുക',
	'multimediaviewer-use-file-owt' => 'ഈ പ്രമാണം ഒരു വിക്കി താളിൽ, ലഘുചിത്രമായി ഉപയോഗിക്കുക',
	'multimediaviewer-use-file-own' => 'ഈ പ്രമാണം ഒരു വിക്കിതാളിൽ, വരികൾക്കിടയിൽ ഉപയോഗിക്കുക',
	'multimediaviewer-use-file-offwiki' => 'ഈ പ്രമാണം മറ്റൊരു വെബ്സൈറ്റിൽ ഉപയോഗിക്കുക',
	'multimediaviewer-about-mmv' => 'മീഡിയ ദർശനോപാധിയുടെ വിവരണം',
	'multimediaviewer-discuss-mmv' => 'പ്രതികരണം ചേർക്കുക',
	'multimediaviewer-geolocation' => 'സ്ഥാനം: $1',
	'multimediaviewer-fileusage-count' => '{{PLURAL:$1|ഒരു താളിൽ|$1 താളുകളിൽ}} ഉപയോഗിച്ചിരിക്കുന്നു',
	'multimediaviewer-fileusage-count-more' => '{{PLURAL:$1|ഒന്നിൽ|$1 എണ്ണത്തിൽ}} അധികം താളുകളിൽ ഉപയോഗിച്ചിരിക്കുന്നു',
	'multimediaviewer-fileusage-link' => 'എല്ലാ ഉപയോഗവും കാണുക',
	'multimediaviewer-fileusage-local-section' => 'ഈ സൈറ്റിൽ',
	'multimediaviewer-fileusage-global-section' => 'മറ്റ് സൈറ്റുകളിൽ',
);

/** Marathi (मराठी)
 * @author V.narsikar
 */
$messages['mr'] = array(
	'multimediaviewer-desc-nil' => 'वर्णन उपलब्ध नाही',
	'multimediaviewer-license-pd' => 'सार्वजनिक अधिक्षेत्र',
	'multimediaviewer-fileusage-count' => 'Used in $1  {{PLURAL:$1|पाना|पानां}}मध्ये वापरल्या गेले',
	'multimediaviewer-fileusage-count-more' => '$1 पेक्षा अधिक {{PLURAL:$1|पानांमध्ये}} वापरल्या गेले',
	'multimediaviewer-fileusage-link' => 'सर्व वापर बघा',
	'multimediaviewer-fileusage-local-section' => 'या संकेतस्थळावर',
	'multimediaviewer-fileusage-global-section' => 'दुसऱ्या संकेतस्थळांवर',
);

/** Malay (Bahasa Melayu)
 * @author Anakmalaysia
 */
$messages['ms'] = array(
	'multimediaviewer-license-pd' => 'Domain Awam',
	'multimediaviewer-fileusage-count' => 'Digunakan di $1 halaman',
	'multimediaviewer-fileusage-count-more' => 'Digunakan di lebih daripada $1 halaman',
	'multimediaviewer-fileusage-link' => 'Lihat semua kegunaan',
	'multimediaviewer-fileusage-local-section' => 'Di laman ini',
	'multimediaviewer-fileusage-global-section' => 'Di laman-laman lain',
);

/** Neapolitan (Napulitano)
 * @author Chelin
 */
$messages['nap'] = array(
	'multimediaviewer-repository-local' => "Ppe saperne 'e cchiù",
	'multimediaviewer-license-pd' => 'Pubbreco duminio',
	'multimediaviewer-fileusage-local-section' => "Ncopp'â chisto sito",
);

/** Dutch (Nederlands)
 * @author Arent
 * @author SPQRobin
 * @author Siebrand
 * @author Sjoerddebruin
 */
$messages['nl'] = array(
	'multimediaviewer-desc' => 'Miniatuurafbeeldingen schermvullend weergeven.',
	'multimediaviewer-desc-nil' => 'Geen omschrijving beschikbaar.',
	'multimediaviewer-pref' => 'Mediaviewer',
	'multimediaviewer-pref-desc' => "Verbeteren uw multimediaervaring met dit nieuwe instrument. Afbeeldingen worden groter weergegeven op pagina's met miniaturen. Afbeeldingen worden schermvullend weergegeven en kunnen ook worden bekeken op ware grootte.",
	'multimediaviewer-file-page' => 'Naar de bestandspagina gaan',
	'multimediaviewer-repository' => 'Meer informatie over $1',
	'multimediaviewer-repository-local' => 'Lees meer',
	'multimediaviewer-datetime-created' => 'Aangemaakt op $1',
	'multimediaviewer-datetime-uploaded' => 'Geupload op $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|Geüpload}} door $1',
	'multimediaviewer-metadata-error' => 'Fout: de afbeeldingsgegevens konden niet geladen worden. $1',
	'multimediaviewer-thumbnail-error' => 'Fout. De miniatuurgegevens konden niet geladen worden. $1',
	'multimediaviewer-license-cc-pd' => 'Publiek domein',
	'multimediaviewer-license-pd' => 'Publiek domein',
	'multimediaviewer-license-default' => 'Licentie weergeven',
	'multimediaviewer-permission-title' => 'Licentiegegevens',
	'multimediaviewer-permission-link' => 'voorwaarden bekijken',
	'multimediaviewer-permission-viewmore' => 'Meer weergeven',
	'multimediaviewer-about-mmv' => 'Over Mediaviewer',
	'multimediaviewer-discuss-mmv' => 'Terugkoppeling achterlaten',
	'multimediaviewer-geolocation' => 'Locatie: $1',
	'multimediaviewer-fileusage-count' => "Gebruikt op $1 {{PLURAL:$1|pagina|pagina's}}",
	'multimediaviewer-fileusage-count-more' => "Gebruikt in meer dan $1 pagina{{PLURAL:$1||'s}}",
	'multimediaviewer-fileusage-link' => 'Alle toepassingen weergeven',
	'multimediaviewer-fileusage-local-section' => 'Op deze site',
	'multimediaviewer-fileusage-global-section' => "Op andere site's",
	'multimediaviewer-reuse-link' => 'Dit bestand gebruiken',
	'multimediaviewer-share-tab' => 'Delen',
	'multimediaviewer-embed-tab' => 'Invoegen',
	'multimediaviewer-link-to-page' => 'Koppeling naar de pagina met de bestandsbeschrijving',
	'multimediaviewer-link-to-file' => 'Koppeling naar het originele bestand',
	'multimediaviewer-embed-wt' => 'Wikitekst',
	'multimediaviewer-embed-html' => 'HTML',
	'multimediaviewer-html-embed-credit-text-tbls' => '"$1" door $2. Licentie $3 via $4.',
	'multimediaviewer-html-embed-credit-text-tls' => '"$1". Licentie $2 via $3.',
	'multimediaviewer-html-embed-credit-text-tbs' => '"$1" door $2. Via $3.',
	'multimediaviewer-html-embed-credit-text-tbl' => '"$1" door $2. Licentie $3.',
	'multimediaviewer-html-embed-credit-text-tb' => '"$1" door $2.',
	'multimediaviewer-html-embed-credit-text-ts' => '"$1". Via $2.',
	'multimediaviewer-html-embed-credit-text-tl' => '"$1". Licentie $2.',
	'multimediaviewer-embed-byline' => 'Door $1',
	'multimediaviewer-embed-license' => 'Licentie $1.',
	'multimediaviewer-embed-via' => 'Via $1.',
	'multimediaviewer-default-embed-size' => 'Standaard miniatuurgrootte',
	'multimediaviewer-original-embed-size' => 'Oorspronkelijke grootte - $1 × $2 px',
	'multimediaviewer-large-embed-size' => 'Groot - $1 × $2 px',
	'multimediaviewer-medium-embed-size' => 'Gemiddeld - $1 × $2 px',
	'multimediaviewer-small-embed-size' => 'Klein - $1 × $2 px',
);

/** Occitan (occitan)
 * @author Cedric31
 */
$messages['oc'] = array(
	'multimediaviewer-desc' => 'Agrandís las vinhetas dins una interfàcia en ecran complet.',
	'multimediaviewer-desc-nil' => 'Cap de descripcion pas disponibla.',
	'multimediaviewer-pref' => 'Visionadoira de Mèdias',
	'multimediaviewer-pref-desc' => "Melhoratz vòstra experiéncia de visualizacion multimèdia amb aquesta aisina novèla. Aficha los imatges en granda talha sus las paginas qu'an de vinhetas. Los imatges son afichats dins un polit quadre d’interfàcia en ecran complet, e tanben, se pòdon afichar en talha maximala.",
	'multimediaviewer-file-page' => 'Anar a la pagina del fichièr correspondent',
	'multimediaviewer-repository' => 'Ne saber mai sus $1',
	'multimediaviewer-repository-local' => 'Ne saber mai',
	'multimediaviewer-datetime-created' => 'Creat lo $1',
	'multimediaviewer-datetime-uploaded' => 'Mandat lo $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|Mandat}} per $1',
	'multimediaviewer-license-cc-pd' => 'Domeni public',
	'multimediaviewer-license-pd' => 'Domeni public',
	'multimediaviewer-license-default' => 'Afichar la licéncia',
	'multimediaviewer-permission-title' => 'Detalhs de la licéncia',
	'multimediaviewer-permission-link' => 'afichar las condicions',
	'multimediaviewer-permission-viewmore' => 'Veire mai',
	'multimediaviewer-about-mmv' => 'A prepaus de la visionadoira de mèdias',
	'multimediaviewer-discuss-mmv' => 'Daissar un vejaire a prepaus de la visionadoira de mèdias',
	'multimediaviewer-geolocation' => 'Emplaçament : $1',
	'multimediaviewer-fileusage-count' => 'Utilizat sus $1 {{PLURAL:$1|pagina|paginas}}',
	'multimediaviewer-fileusage-count-more' => 'Utilizat sus mai de $1 {{PLURAL:$1|paginas}}',
	'multimediaviewer-fileusage-link' => 'Veire totas las utilizacions',
	'multimediaviewer-fileusage-local-section' => 'Sus aqueste site',
	'multimediaviewer-fileusage-global-section' => 'Sus d’autres sites',
	'multimediaviewer-reuse-link' => 'Utilizar aqueste fichièr',
	'multimediaviewer-reuse-loading-placeholder' => 'Cargament en cors…',
);

/** Polish (polski)
 * @author Chrumps
 * @author Jacenty359
 * @author Matik7
 * @author Nux
 * @author Tar Lócesilion
 * @author WTM
 */
$messages['pl'] = array(
	'multimediaviewer-desc-nil' => 'Brak dostępnego opisu.',
	'multimediaviewer-pref' => 'Przeglądarka multimedów',
	'multimediaviewer-pref-desc' => 'To narzędzie to przyjazna użytkownikowi przeglądarka multimediów. Umożliwia powiększanie miniaturek obrazków bez opuszczania strony z artykułem. Narzędzie to domyślnie wyświetla obrazki na półprzezroczystej nakładce w stylu „Lightbox”, ale można także powiększyć je na pełny ekran.', # Fuzzy
	'multimediaviewer-file-page' => 'Przejdź na stronę z opisem pliku',
	'multimediaviewer-repository' => 'Dowiedz się więcej na {{GRAMMAR:D.lp|$1}}',
	'multimediaviewer-datetime-created' => 'Utworzony $1',
	'multimediaviewer-datetime-uploaded' => 'Przesłany $1',
	'multimediaviewer-userpage-link' => 'Przesłany przez {{GENDER:$2|użytkownika|użytkowniczkę}} $1',
	'multimediaviewer-license-cc-pd' => 'Domena publiczna',
	'multimediaviewer-license-default' => 'Zobacz licencję',
	'multimediaviewer-permission-title' => 'Szczegóły licencji',
	'multimediaviewer-permission-link' => 'zobacz zasady',
	'multimediaviewer-permission-viewmore' => 'Zobacz więcej',
	'multimediaviewer-about-mmv' => 'O przeglądarce multimedów',
	'multimediaviewer-discuss-mmv' => 'Prześlij opinię',
	'multimediaviewer-geolocation' => 'Położenie: $1',
	'multimediaviewer-fileusage-link' => 'Zobacz wszystkich użytkowników',
	'multimediaviewer-reuse-link' => 'Użyj tego pliku', # Fuzzy
	'multimediaviewer-reuse-loading-placeholder' => 'Wczytywanie...',
);

/** Pashto (پښتو)
 * @author Ahmed-Najib-Biabani-Ibrahimkhel
 */
$messages['ps'] = array(
	'multimediaviewer-pref' => 'رسنۍ ښکاره کوونکی',
	'multimediaviewer-datetime-created' => 'په $1 جوړ شو',
	'multimediaviewer-datetime-uploaded' => 'په $1 پورته شو',
	'multimediaviewer-license-cc-pd' => 'ټولگړی شپول',
	'multimediaviewer-license-default' => 'د منښتليک مالومات', # Fuzzy
	'multimediaviewer-use-file' => 'دا دوتنه کارول',
	'multimediaviewer-use-file-owt' => 'دا دوتنه د ويکي په يو مخ، د بټنوک په توگه کارول',
);

/** Portuguese (português)
 * @author Fúlvio
 * @author Imperadeiro98
 * @author SandroHc
 * @author Vitorvicentevalente
 */
$messages['pt'] = array(
	'multimediaviewer-desc' => 'Expandir miniaturas num tamanho maior numa interface em ecrã cheio.',
	'multimediaviewer-desc-nil' => 'Nenhuma descrição disponível.',
	'multimediaviewer-pref' => 'Visualizador multimédia',
	'multimediaviewer-pref-desc' => 'Melhore a sua experiência de visualização multimédia com esta nova ferramenta. Ela exibe imagens em tamanho maior nas páginas que possuam miniaturas. As imagens são mostradas em uma agradável sobreposição em ecrã cheio, e também podem ser visualizadas em tamanho real.',
	'multimediaviewer-file-page' => 'Ir para a página correspondente ao arquivo',
	'multimediaviewer-repository' => 'Saiba mais em $1',
	'multimediaviewer-repository-local' => 'Saiba mais',
	'multimediaviewer-datetime-created' => 'Criado em $1',
	'multimediaviewer-datetime-uploaded' => 'Carregado em $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|Carregado}} por $1',
	'multimediaviewer-license-cc-pd' => 'Domínio Público',
	'multimediaviewer-license-pd' => 'Domínio público',
	'multimediaviewer-license-default' => 'Ver licença',
	'multimediaviewer-permission-title' => 'Detalhes da licença',
	'multimediaviewer-permission-link' => 'ver termos',
	'multimediaviewer-permission-viewmore' => 'Ver mais',
	'multimediaviewer-use-file' => 'Usar este ficheiro',
	'multimediaviewer-use-file-owt' => 'Usar este ficheiro numa página wiki em forma de miniatura',
	'multimediaviewer-use-file-own' => 'Usar este ficheiro numa página wiki',
	'multimediaviewer-use-file-offwiki' => 'Usar este ficheiro noutro sítio da Internet',
	'multimediaviewer-about-mmv' => 'Sobre o Visualizador multimédia',
	'multimediaviewer-discuss-mmv' => 'Deixe o seu comentário',
	'multimediaviewer-geolocation' => 'Localização: $1',
	'multimediaviewer-fileusage-count' => 'Utilizada em $1 {{PLURAL:$1|página|páginas}}',
	'multimediaviewer-fileusage-count-more' => 'Utilizada em mais de $1 {{PLURAL:$1|páginas}}',
	'multimediaviewer-fileusage-link' => 'Ver todas as utilizações',
	'multimediaviewer-fileusage-local-section' => 'Neste sítio',
	'multimediaviewer-fileusage-global-section' => 'Noutros sítios',
);

/** Romanian (română)
 * @author Minisarm
 */
$messages['ro'] = array(
	'multimediaviewer-desc' => 'Extinde miniaturile la o dimensiune mai mare într-o interfață pe tot ecranul.',
	'multimediaviewer-desc-nil' => 'Nicio descriere disponibilă.',
	'multimediaviewer-pref' => 'Vizualizator multimedia',
	'multimediaviewer-pref-desc' => 'Îmbunătățiți-vă experiența de vizualizare a conținutului multimedia cu această nouă unealtă. Afișează imaginile la dimensiune mare în cadrul paginilor care conțin miniaturi. Imaginile sunt afișate într-o interfață pe tot ecranul mai simpatică, acestea putând fi, de asemenea, vizualizate la dimensiunea reală.',
	'multimediaviewer-file-page' => 'Du-te la pagina asociată fișierului',
	'multimediaviewer-repository' => 'Mai multe la $1',
	'multimediaviewer-repository-local' => 'Mai multe',
	'multimediaviewer-datetime-created' => 'Creată la $1',
	'multimediaviewer-datetime-uploaded' => 'Încărcată la $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|Încărcată}} de $1',
	'multimediaviewer-license-cc-pd' => 'Domeniu public',
	'multimediaviewer-license-pd' => 'Domeniu public',
	'multimediaviewer-license-default' => 'Vezi licența',
	'multimediaviewer-permission-title' => 'Informații despre licență',
	'multimediaviewer-permission-link' => 'vezi condițiile',
	'multimediaviewer-permission-viewmore' => 'Mai mult',
	'multimediaviewer-use-file' => 'Utilizează acest fișier',
	'multimediaviewer-use-file-owt' => 'Utilizați acest fișier în cadrul unei pagini wiki, ca miniatură',
	'multimediaviewer-use-file-own' => 'Utilizați acest fișier în cadrul unei pagini wiki, în linie cu textul',
	'multimediaviewer-use-file-offwiki' => 'Utilizați acest fișier pe un alt site web',
	'multimediaviewer-about-mmv' => 'Despre Vizualizatorul multimedia',
	'multimediaviewer-discuss-mmv' => 'Lăsați o părere',
	'multimediaviewer-geolocation' => 'Poziție: $1',
	'multimediaviewer-fileusage-count' => 'Folosită {{PLURAL:$1|într-o pagină|în $1 pagini|în $1 de pagini}}',
	'multimediaviewer-fileusage-count-more' => 'Folosită în mai mult de $1 {{PLURAL:$1|pagini|de pagini}}',
	'multimediaviewer-fileusage-link' => 'Vezi toate utilizările',
	'multimediaviewer-fileusage-local-section' => 'Pe acest site',
	'multimediaviewer-fileusage-global-section' => 'Pe alte site-uri',
);

/** tarandíne (tarandíne)
 * @author Joetaras
 */
$messages['roa-tara'] = array(
	'multimediaviewer-license-pd' => 'Dominie pubbleche',
	'multimediaviewer-geolocation' => 'Posizione: $1',
);

/** Russian (русский)
 * @author Kaganer
 * @author Okras
 * @author Tucvbif
 */
$messages['ru'] = array(
	'multimediaviewer-desc' => 'Раскрывает эскизы в большие изображения на весь экран.',
	'multimediaviewer-desc-nil' => 'Описание отсутствует.',
	'multimediaviewer-pref' => 'Медиа-просмотрщик',
	'multimediaviewer-pref-desc' => 'Улучшает просмотр мультимедиа-файлов новым инструментом. На странице с эскизами изображений он раскрывает эскизы в большие изображения. Изображения показываются в более красивом полноэкранном интерфейсе, а также могут быть открыты в оригинальном разрешении.',
	'multimediaviewer-file-page' => 'Перейти на страницу соответствующего файла',
	'multimediaviewer-repository' => 'Подробнее на $1',
	'multimediaviewer-repository-local' => 'Подробнее',
	'multimediaviewer-datetime-created' => 'Создано в $1',
	'multimediaviewer-datetime-uploaded' => 'Загружено в $1',
	'multimediaviewer-userpage-link' => 'Загружено {{GENDER:$2|участником|участницей}} $1',
	'multimediaviewer-metadata-error' => 'Ошибка: Не удалось загрузить данные изображения. $1',
	'multimediaviewer-thumbnail-error' => 'Ошибка: Не удалось загрузить данные эскиза. $1',
	'multimediaviewer-license-cc-pd' => 'Общественное достояние',
	'multimediaviewer-license-pd' => 'Общественное достояние',
	'multimediaviewer-license-default' => 'Посмотр лицензии',
	'multimediaviewer-permission-title' => 'Сведения о лицензии',
	'multimediaviewer-permission-link' => 'просмотр условий',
	'multimediaviewer-permission-viewmore' => 'Посмотреть подробнее',
	'multimediaviewer-about-mmv' => 'О Медиа-просмотрщике',
	'multimediaviewer-discuss-mmv' => 'Оставить отзыв',
	'multimediaviewer-geolocation' => 'Географическое положение: $1',
	'multimediaviewer-fileusage-count' => 'Используется на $1 {{PLURAL:$1|странице|страницах}}',
	'multimediaviewer-fileusage-count-more' => 'Используются более чем на $1   {{PLURAL:$1|страницах}}',
	'multimediaviewer-fileusage-link' => 'Все включения',
	'multimediaviewer-fileusage-local-section' => 'На этом сайте',
	'multimediaviewer-fileusage-global-section' => 'На других сайтах',
	'multimediaviewer-reuse-link' => 'Использовать этот файл',
	'multimediaviewer-reuse-loading-placeholder' => 'Загрузка…',
	'multimediaviewer-share-tab' => 'Поделиться',
	'multimediaviewer-embed-tab' => 'Внедрённый',
	'multimediaviewer-link-to-page' => 'Ссылка на страницу описания файла',
	'multimediaviewer-link-to-file' => 'Ссылка на исходный файл',
	'multimediaviewer-embed-wt' => 'Викитекст',
	'multimediaviewer-embed-html' => 'HTML',
	'multimediaviewer-html-embed-credit-text-tbls' => '«$1» участника $2. Под лицензией $3 с сайта $4.',
	'multimediaviewer-html-embed-credit-text-tls' => '«$1». Под лицензией $2 с сайта $3.',
	'multimediaviewer-html-embed-credit-text-tbs' => '«$1» участника $2. С сайта $3.',
	'multimediaviewer-html-embed-credit-text-tbl' => '«$1» участника $2. Под лицензией $3.',
	'multimediaviewer-html-embed-credit-text-tb' => '«$1» участника $2.',
	'multimediaviewer-html-embed-credit-text-ts' => '«$1». С сайта $2.',
	'multimediaviewer-html-embed-credit-text-tl' => '«$1». Под лицензией $2.',
	'multimediaviewer-embed-byline' => 'Участника $1',
	'multimediaviewer-embed-license' => 'Под лицензией $1.',
	'multimediaviewer-embed-via' => 'Через $1.',
	'multimediaviewer-default-embed-size' => 'Размер эскиза по умолчанию',
	'multimediaviewer-original-embed-size' => 'Оригинальный размер — $1 × $2 px',
	'multimediaviewer-large-embed-size' => 'Большое — $1 × $2 px',
	'multimediaviewer-medium-embed-size' => 'Среднее — $1 × $2 px',
	'multimediaviewer-small-embed-size' => 'Маленькое — $1 × $2 px',
);

/** Scots (Scots)
 * @author John Reid
 */
$messages['sco'] = array(
	'multimediaviewer-metadata-error' => 'Mistak: Coudna laid eemage data. $1',
	'multimediaviewer-thumbnail-error' => 'Mistak: Coudna laid thummnail data. $1',
	'multimediaviewer-license-pd' => 'Public Domain',
	'multimediaviewer-permission-title' => 'License details',
	'multimediaviewer-permission-link' => 'view terms',
	'multimediaviewer-permission-viewmore' => 'View mair',
	'multimediaviewer-fileusage-count' => 'Uised in $1 {{PLURAL:$1|page|pages}}',
	'multimediaviewer-fileusage-count-more' => 'Uised in mair than $1 {{PLURAL:$1|pages}}',
	'multimediaviewer-fileusage-link' => 'View aw uisses',
	'multimediaviewer-fileusage-local-section' => 'Oan this site',
	'multimediaviewer-fileusage-global-section' => 'Oan ither sites',
	'multimediaviewer-reuse-loading-placeholder' => 'Laidin...',
	'multimediaviewer-share-tab' => 'Shair',
	'multimediaviewer-embed-tab' => 'Embed',
	'multimediaviewer-link-to-page' => 'Link til file descreeption page',
	'multimediaviewer-link-to-file' => 'Airt til oreeginal file',
	'multimediaviewer-embed-wt' => 'Wikitex',
	'multimediaviewer-embed-html' => 'HTML',
	'multimediaviewer-html-embed-credit-text-tbls' => '"$1" bi $2. Licensed unner $3 bi wa o $4.',
	'multimediaviewer-html-embed-credit-text-tls' => '"$1". Licensed unner $2 bi waa o $3.',
	'multimediaviewer-html-embed-credit-text-tbs' => '"$1" bi $2. Bi waa o $3.',
	'multimediaviewer-html-embed-credit-text-tbl' => '"$1" bi $2. Licensed unner $3.',
	'multimediaviewer-html-embed-credit-text-tb' => '"$1" bi $2.',
	'multimediaviewer-html-embed-credit-text-ts' => '"$1". Bi waa o $2.',
	'multimediaviewer-html-embed-credit-text-tl' => '"$1". Licensed unner $2.',
	'multimediaviewer-embed-byline' => 'Bi $1',
	'multimediaviewer-embed-license' => 'Licensed unner $1.',
	'multimediaviewer-embed-via' => 'Bi waa o $1.',
	'multimediaviewer-default-embed-size' => 'Defaut thummnail size',
	'multimediaviewer-original-embed-size' => 'Oreeginal size - $1 × $2 px',
	'multimediaviewer-large-embed-size' => 'Muckle - $1 × $2 px',
	'multimediaviewer-medium-embed-size' => 'Medium - $1 × $2 px',
	'multimediaviewer-small-embed-size' => 'Smaa - $1 × $2 px',
);

/** Sassaresu (Sassaresu)
 * @author Jun Misugi
 */
$messages['sdc'] = array(
	'multimediaviewer-repository-local' => 'Imparà più',
);

/** Sinhala (සිංහල)
 * @author Sahan.ssw
 */
$messages['si'] = array(
	'multimediaviewer-metadata-error' => 'දෝෂය:පින්තූරයෙහි විස්තර  පෙන්විය නොහැකිය.$1',
	'multimediaviewer-thumbnail-error' => 'දෝෂය:පින්තූරය පෙන්විය නොහැකිය.$1',
	'multimediaviewer-permission-title' => 'බලපත්‍ර විස්තර',
	'multimediaviewer-permission-link' => 'කොන්දේසි පෙන්වන්න',
	'multimediaviewer-permission-viewmore' => 'තවත් බලන්න',
	'multimediaviewer-embed-html' => 'HTML',
);

/** Slovenian (slovenščina)
 * @author Dbc334
 * @author Eleassar
 */
$messages['sl'] = array(
	'multimediaviewer-desc' => 'Razširitev sličic v večji velikosti v celozaslonskem vmesniku.',
	'multimediaviewer-desc-nil' => 'Opis ni na voljo.',
	'multimediaviewer-pref' => 'Predstavnostni pregledovalnik',
	'multimediaviewer-pref-desc' => 'S tem orodjem lahko izboljšate svojo izkušnjo pri ogledovanju večpredstavnostnih vsebin. Orodje prikazuje slike na straneh s sličicami v večji velikosti in v lepšem okvirčku celozaslonskega vmesnika, mogoč pa je tudi celozaslonski prikaz.',
	'multimediaviewer-file-page' => 'Pojdi na pripadajočo opisno stran datoteke.',
	'multimediaviewer-repository' => 'Več o $1',
	'multimediaviewer-repository-local' => 'Preberite več',
	'multimediaviewer-datetime-created' => 'Ustvarjeno: $1',
	'multimediaviewer-datetime-uploaded' => 'Naloženo: $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|Naložil|Naložila}}: $1',
	'multimediaviewer-license-cc-pd' => 'javna last',
	'multimediaviewer-license-default' => 'Prikaz licence',
	'multimediaviewer-about-mmv' => 'O Predstavnostnem pregledovalniku',
	'multimediaviewer-discuss-mmv' => 'Pustite povratno informacijo',
	'multimediaviewer-geolocation' => 'Lokacija: $1',
	'multimediaviewer-fileusage-count' => 'Uporabljeno na $1 {{PLURAL:$1|strani|straneh}}',
	'multimediaviewer-fileusage-count-more' => 'Uporabljeno na več kot $1 {{PLURAL:$1|strani|straneh}}',
	'multimediaviewer-fileusage-link' => 'Ogled vseh uporab',
	'multimediaviewer-fileusage-local-section' => 'Na tej strani',
	'multimediaviewer-fileusage-global-section' => 'Na drugih straneh',
	'multimediaviewer-reuse-link' => 'Uporabi datoteko',
);

/** Serbian (Cyrillic script) (српски (ћирилица)‎)
 * @author Milicevic01
 */
$messages['sr-ec'] = array(
	'multimediaviewer-datetime-created' => 'Направљено $', # Fuzzy
	'multimediaviewer-reuse-link' => 'Користи ову датотеку',
);

/** Serbian (Latin script) (srpski (latinica)‎)
 * @author Milicevic01
 */
$messages['sr-el'] = array(
	'multimediaviewer-reuse-link' => 'Koristi ovu datoteku',
);

/** Swedish (svenska)
 * @author Ainali
 * @author Jopparn
 * @author Lokal Profil
 * @author NH
 * @author WikiPhoenix
 */
$messages['sv'] = array(
	'multimediaviewer-desc' => 'Expandera miniatyrer i en större storlek i fulkskärmsgränssnitt.',
	'multimediaviewer-desc-nil' => 'Ingen beskrivning tillgänglig.',
	'multimediaviewer-pref' => 'Mediavisare',
	'multimediaviewer-pref-desc' => 'Förbättra din multimediaupplevelse med detta nya verktyg. Det visar bilder i större storlek på sidor som har miniatyrer. Bilder visas i ett trevligare fullskärmsöverlägg, och kan också ses i full storlek.',
	'multimediaviewer-file-page' => 'Gå till motsvarande filsida',
	'multimediaviewer-repository' => 'Läs mer på $1',
	'multimediaviewer-repository-local' => 'Läs mer',
	'multimediaviewer-datetime-created' => 'Skapades den $1',
	'multimediaviewer-datetime-uploaded' => 'Laddades upp den $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|Uppladdad}} av $1',
	'multimediaviewer-metadata-error' => 'Fel: Kunde inte läsa in bilddata. $1',
	'multimediaviewer-thumbnail-error' => 'Fel: Kunde inte läsa in miniatyrdata. $1',
	'multimediaviewer-license-cc-by-4.0' => 'CC BY 4.0',
	'multimediaviewer-license-cc-by-sa-4.0' => 'CC BY-SA 4.0',
	'multimediaviewer-license-cc-pd' => 'Public Domain',
	'multimediaviewer-license-pd' => 'Public Domain',
	'multimediaviewer-license-default' => 'Visa licens',
	'multimediaviewer-permission-title' => 'Licensdetaljer',
	'multimediaviewer-permission-link' => 'se villkoren',
	'multimediaviewer-permission-viewmore' => 'Visa mer',
	'multimediaviewer-about-mmv' => 'Om Mediavisaren',
	'multimediaviewer-discuss-mmv' => 'Ge återkoppling',
	'multimediaviewer-geolocation' => 'Plats: $1',
	'multimediaviewer-fileusage-count' => 'Används på $1 {{PLURAL:$1|sida|sidor}}',
	'multimediaviewer-fileusage-count-more' => 'Används på fler än $1 {{PLURAL:$1|sidor}}',
	'multimediaviewer-fileusage-link' => 'Visa all användning',
	'multimediaviewer-fileusage-local-section' => 'På denna webbplats',
	'multimediaviewer-fileusage-global-section' => 'På andra webbplatser',
	'multimediaviewer-reuse-link' => 'Använd denna fil',
	'multimediaviewer-reuse-loading-placeholder' => 'Läser in...',
	'multimediaviewer-share-tab' => 'Dela',
	'multimediaviewer-embed-tab' => 'Bädda in',
	'multimediaviewer-link-to-page' => 'Länk till filbeskrivningssidan',
	'multimediaviewer-link-to-file' => 'Länk till originalfil',
	'multimediaviewer-embed-wt' => 'Wikitext',
	'multimediaviewer-embed-html' => 'HTML',
	'multimediaviewer-html-embed-credit-text-tbls' => '"$1" av $2. Licenserat under $3 via $4.',
	'multimediaviewer-html-embed-credit-text-tls' => '"$1". Licenserat under $2 via $3.',
	'multimediaviewer-html-embed-credit-text-tbs' => '"$1" av $2. Via $3.',
	'multimediaviewer-html-embed-credit-text-tbl' => '"$1" av $2. Licenserat under $3.',
	'multimediaviewer-html-embed-credit-text-tb' => '"$1" av $2.',
	'multimediaviewer-html-embed-credit-text-ts' => '"$1". Via $2.',
	'multimediaviewer-html-embed-credit-text-tl' => '"$1". Licenserat under $2.',
	'multimediaviewer-embed-byline' => 'Av $1',
	'multimediaviewer-embed-license' => 'Licenserat under $1.',
	'multimediaviewer-embed-via' => 'Via $1.',
	'multimediaviewer-default-embed-size' => 'Standardstorlek för miniatyrer',
	'multimediaviewer-original-embed-size' => 'Originalstorlek - $1 × $2 px',
	'multimediaviewer-large-embed-size' => 'Stor - $1 × $2 px',
	'multimediaviewer-medium-embed-size' => 'Mellan - $1 × $2 px',
	'multimediaviewer-small-embed-size' => 'Liten - $1 × $2 px',
);

/** Telugu (తెలుగు)
 * @author Chaduvari
 * @author Ravichandra
 * @author రహ్మానుద్దీన్
 */
$messages['te'] = array(
	'multimediaviewer-license-pd' => 'పబ్లిక్ డోమెయిను',
	'multimediaviewer-permission-viewmore' => 'మరింత చూడండి',
	'multimediaviewer-fileusage-link' => 'అన్ని వాడుకలు చూడు',
	'multimediaviewer-fileusage-local-section' => 'ఈ సైటుపై',
	'multimediaviewer-fileusage-global-section' => 'ఇతర సైట్లలో',
	'multimediaviewer-reuse-loading-placeholder' => 'లోడవుతోంది...',
);

/** Thai (ไทย)
 * @author Horus
 * @author Nullzero
 * @author Taweetham
 */
$messages['th'] = array(
	'multimediaviewer-desc' => 'ขยายรูปขนาดย่อให้มีขนาดใหญ่ขึ้นในอินเตอร์เฟซเต็มหน้าจอ',
	'multimediaviewer-desc-nil' => 'ไม่มีคำอธิบาย',
	'multimediaviewer-pref' => 'Media Viewer',
	'multimediaviewer-pref-desc' => 'ด้วยเครื่องมือใหม่นี้ คุณสามารถดูสื่อได้ดีไปกว่าเดิม เครื่องมือจะแสดงภาพขนาดใหญ่ขึ้นบนหน้าที่มีรูปขนาดย่อ คุณยังสามารถดูภาพแบบในอินเตอร์เฟซเต็มหน้าจอและดูภาพในขนาดเต็มได้ด้วย',
	'multimediaviewer-file-page' => 'ไปยังหน้าไฟล์ที่ตรงกัน',
	'multimediaviewer-repository' => 'เรียนรู้เพิ่มเติมใน$1',
	'multimediaviewer-repository-local' => 'เรียนรู้เพิ่มเติม',
	'multimediaviewer-datetime-created' => 'สร้างเมื่อ $1',
	'multimediaviewer-datetime-uploaded' => 'อัปโหลดเมื่อ $1',
	'multimediaviewer-userpage-link' => '$2 อัปโหลดโดย $1',
	'multimediaviewer-license-cc-pd' => 'โดเมนสาธารณะ',
	'multimediaviewer-license-pd' => 'โดเมนสาธารณะ',
	'multimediaviewer-license-default' => 'ดูสัญญาอนุญาต',
	'multimediaviewer-permission-title' => 'รายละเอียดสัญญาอนุญาต',
	'multimediaviewer-permission-link' => 'ดูเงื่อนไข',
	'multimediaviewer-permission-viewmore' => 'ดูเพิ่มเติม',
	'multimediaviewer-about-mmv' => 'เกี่ยวกับ Media Viewer',
	'multimediaviewer-discuss-mmv' => 'ฝากคำติชม',
	'multimediaviewer-geolocation' => 'สถานที่: $1',
	'multimediaviewer-fileusage-count' => 'มีการใช้ใน $1 หน้า',
	'multimediaviewer-fileusage-count-more' => 'มีการใช้มากกว่า $1 หน้า',
	'multimediaviewer-fileusage-link' => 'ดูการใช้ทั้งหมด',
	'multimediaviewer-fileusage-local-section' => 'บนไซต์นี้',
	'multimediaviewer-fileusage-global-section' => 'บนไซต์อื่น ๆ',
	'multimediaviewer-reuse-link' => 'ใช้ไฟล์นี้', # Fuzzy
);

/** Tagalog (Tagalog)
 * @author Jewel457
 */
$messages['tl'] = array(
	'multimediaviewer-fileusage-count' => 'Gamit sa', # Fuzzy
	'multimediaviewer-fileusage-link' => 'Tingnan ang mga iba pang gamit',
	'multimediaviewer-fileusage-global-section' => 'Sa ibang mga sites',
);

/** Turkish (Türkçe)
 * @author Ceas08
 * @author Incelemeelemani
 * @author Rapsar
 * @author SiLveRLeaD
 * @author Sucsuzz
 */
$messages['tr'] = array(
	'multimediaviewer-pref' => 'Ortam Görüntüleyici',
	'multimediaviewer-pref-desc' => 'Bu yeni araçla multimedya görüntüleme deneyiminizi geliştirin. Bu sayede küçük sayfaları daha büyük boyutlarda görüntüleyebilirsiniz. Ayrıca görüntüler Lightbox (açılır pencere) olarak ve tam boyutlu gösterilir.', # Fuzzy
	'multimediaviewer-about-mmv' => 'Ortam Görüntüleyici hakkında',
	'multimediaviewer-geolocation' => 'Konum: $1',
	'multimediaviewer-reuse-loading-placeholder' => 'Yükleniyor...',
	'multimediaviewer-embed-html' => 'HTML',
);

/** Ukrainian (українська)
 * @author Andriykopanytsia
 */
$messages['uk'] = array(
	'multimediaviewer-desc' => 'Розгорнути мініатюри в більшому розмірі у лайтбоксі.',
	'multimediaviewer-desc-nil' => 'Немає доступного опису.',
	'multimediaviewer-pref' => 'Медіа переглядач',
	'multimediaviewer-pref-desc' => 'Поліпшити ваші враження від перегляду мультимедіа з цим новим інструментом. Він відображає зображення у більшому розмірі на сторінках, які мають ескізи. Зображення показані у кращому накладенні і також відображаються в натуральну величину.',
	'multimediaviewer-file-page' => 'Перейти на сторінку відповідного файлу',
	'multimediaviewer-repository' => 'Дізнайтеся більше на $1',
	'multimediaviewer-repository-local' => 'Дізнатися більше',
	'multimediaviewer-datetime-created' => 'Створено $1',
	'multimediaviewer-datetime-uploaded' => 'Завантажено $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|Завантажив|Завантажила}} $1',
	'multimediaviewer-metadata-error' => 'Помилка: не вдалося завантажити дані зображення. $1',
	'multimediaviewer-thumbnail-error' => 'Помилка: не вдалося завантажити дані мініатюри. $1',
	'multimediaviewer-license-cc-pd' => 'Суспільне надбання',
	'multimediaviewer-license-pd' => 'Суспільне надбання (Public Domain)',
	'multimediaviewer-license-default' => 'Перегляд ліцензії',
	'multimediaviewer-permission-title' => 'Відомості про ліцензію',
	'multimediaviewer-permission-link' => 'перегляд умов',
	'multimediaviewer-permission-viewmore' => 'Показати докладно',
	'multimediaviewer-about-mmv' => 'Про медіапереглядач',
	'multimediaviewer-discuss-mmv' => 'Залишити відгук',
	'multimediaviewer-geolocation' => 'Розташування:$1',
	'multimediaviewer-fileusage-count' => 'Використано на $1 {{PLURAL:$1|сторінці|сторінках}}',
	'multimediaviewer-fileusage-count-more' => 'Використано на понад $1 {{PLURAL:$1|сторінках}}',
	'multimediaviewer-fileusage-link' => 'Переглянути усі використання',
	'multimediaviewer-fileusage-local-section' => 'На цьому сайті',
	'multimediaviewer-fileusage-global-section' => 'На інших сайтах',
	'multimediaviewer-reuse-link' => 'Використовувати цей файл',
	'multimediaviewer-reuse-loading-placeholder' => 'Завантаження...',
	'multimediaviewer-share-tab' => 'Поділитись',
	'multimediaviewer-embed-tab' => 'Вбудований',
	'multimediaviewer-link-to-page' => 'Посилання на сторінку опису файл',
	'multimediaviewer-link-to-file' => 'Посилання на оригінал файлу',
	'multimediaviewer-embed-wt' => 'Вікітекст',
	'multimediaviewer-embed-html' => 'HTML',
	'multimediaviewer-html-embed-credit-text-tbls' => '"$1" від $2. Ліцензований під $3 через $4.',
	'multimediaviewer-html-embed-credit-text-tls' => '"$1". Під ліцензією  $2  через  $3 .',
	'multimediaviewer-html-embed-credit-text-tbs' => '"$1" від $2. За допомогою $3.',
	'multimediaviewer-html-embed-credit-text-tbl' => '"$1" від $2. Ліцензований під $3.',
	'multimediaviewer-html-embed-credit-text-tb' => '"$1" від $2.',
	'multimediaviewer-html-embed-credit-text-ts' => '"$1". Через $2.',
	'multimediaviewer-html-embed-credit-text-tl' => '"$1". Під ліцензією  $2 .',
	'multimediaviewer-embed-byline' => 'Від $1',
	'multimediaviewer-embed-license' => 'Під ліцензією $1.',
	'multimediaviewer-embed-via' => 'Через $1.',
	'multimediaviewer-default-embed-size' => 'Типовий розмір мініатюри',
	'multimediaviewer-original-embed-size' => 'Оригінальний розмір -  $1  ×  $2  px',
	'multimediaviewer-large-embed-size' => 'Великий -  $1 × $2 px',
	'multimediaviewer-medium-embed-size' => 'Середній - $1 × $2 px',
	'multimediaviewer-small-embed-size' => 'Малий - $1 × $2 px',
);

/** Vietnamese (Tiếng Việt)
 * @author Minh Nguyen
 * @author Withoutaname
 */
$messages['vi'] = array(
	'multimediaviewer-desc' => 'Mở các hình nhỏ lớn hơn trong giao diện toàn màn hình.',
	'multimediaviewer-desc-nil' => 'Không có miêu tả.',
	'multimediaviewer-pref' => 'Cửa sổ phương tiện',
	'multimediaviewer-pref-desc' => 'Cải thiện trải nghiệm xem phương tiện của bạn với công cụ mới này. Nó mở rộng các hình nhỏ để phủ lên toàn cửa sổ. Các hình ảnh được hiển thị trong giao diện toàn màn hình đẹp đẽ và cũng có thể xem kích thước gốc.',
	'multimediaviewer-file-page' => 'Mở trang ứng với tập tin',
	'multimediaviewer-repository' => 'Tìm hiểu thêm về $1',
	'multimediaviewer-repository-local' => 'Tìm hiểu thêm',
	'multimediaviewer-datetime-created' => 'Được tạo vào $1',
	'multimediaviewer-datetime-uploaded' => 'Được tải lên vào $1',
	'multimediaviewer-userpage-link' => 'Do $1 {{GENDER:$2}}tải lên',
	'multimediaviewer-credit' => '$1 – $2',
	'multimediaviewer-metadata-error' => 'Lỗi: Không thể tải dữ liệu hình ảnh. $1',
	'multimediaviewer-thumbnail-error' => 'Lỗi: Không thể tải dữ liệu hình nhỏ. $1',
	'multimediaviewer-license-cc-by-4.0' => 'CC-BY 4.0',
	'multimediaviewer-license-cc-by-sa-4.0' => 'CC-BY-SA 4.0',
	'multimediaviewer-license-cc-pd' => 'Phạm vi công cộng',
	'multimediaviewer-license-pd' => 'Phạm vi công cộng',
	'multimediaviewer-license-default' => 'Xem giấy phép',
	'multimediaviewer-permission-title' => 'Chi tiết giấy phép',
	'multimediaviewer-permission-link' => 'xem điều khoản',
	'multimediaviewer-permission-viewmore' => 'Xem thêm',
	'multimediaviewer-about-mmv' => 'Giới thiệu về Cửa sổ phương tiện',
	'multimediaviewer-discuss-mmv' => 'Gửi phản hồi',
	'multimediaviewer-geoloc-north' => 'B',
	'multimediaviewer-geoloc-east' => 'Đ',
	'multimediaviewer-geoloc-south' => 'N',
	'multimediaviewer-geoloc-west' => 'T',
	'multimediaviewer-geolocation' => 'Vị trí: $1',
	'multimediaviewer-fileusage-count' => 'Đang dùng trên $1 trang',
	'multimediaviewer-fileusage-count-more' => 'Đang dùng trên hơn $1 trang',
	'multimediaviewer-fileusage-link' => 'Xem tất cả các trang sử dụng',
	'multimediaviewer-fileusage-local-section' => 'Trên website này',
	'multimediaviewer-fileusage-global-section' => 'Trên website khác',
	'multimediaviewer-reuse-link' => 'Sử dụng tập tin này',
	'multimediaviewer-share-tab' => 'Chia sẻ',
	'multimediaviewer-embed-tab' => 'Nhúng',
	'multimediaviewer-link-to-page' => 'Liên kết đến trang miêu tả',
	'multimediaviewer-link-to-file' => 'Liên kết đến tập tin gốc',
	'multimediaviewer-embed-wt' => 'Mã wiki',
	'multimediaviewer-embed-html' => 'HTML',
	'multimediaviewer-html-embed-credit-text-tbls' => '“$1” của $2, phát hành theo giấy phép $3 do $4 cung cấp.',
	'multimediaviewer-html-embed-credit-text-tls' => '“$1”, phát hành theo giấy phép $2 do $3 cung cấp.',
	'multimediaviewer-html-embed-credit-text-tbs' => '“$1” của $2, do $3 cung cấp.',
	'multimediaviewer-html-embed-credit-text-tbl' => '“$1” của $2, phát hành theo giấy phép $3.',
	'multimediaviewer-html-embed-credit-text-tb' => '“$1” của $2.',
	'multimediaviewer-html-embed-credit-text-ts' => '“$1” do $2 cung cấp.',
	'multimediaviewer-html-embed-credit-text-tl' => '“$1”, phát hành theo giấy phép $2.',
	'multimediaviewer-embed-byline' => 'Bởi $1',
	'multimediaviewer-embed-license' => 'Phát hành theo giấy phép $1.',
	'multimediaviewer-embed-via' => 'Do $1 cung cấp.',
	'multimediaviewer-default-embed-size' => 'Kích thước hình nhỏ mặc định',
	'multimediaviewer-original-embed-size' => 'Kích thước gốc – $1×$2 px',
	'multimediaviewer-large-embed-size' => 'Lớn – $1×$2 px',
	'multimediaviewer-medium-embed-size' => 'Vừa – $1×$2 px',
	'multimediaviewer-small-embed-size' => 'Nhỏ – $1×$2 px',
);

/** Volapük (Volapük)
 * @author Malafaya
 */
$messages['vo'] = array(
	'multimediaviewer-datetime-created' => 'Pejafon tü $1',
	'multimediaviewer-datetime-uploaded' => 'Pelöpükon tü $1',
);

/** Yiddish (ייִדיש)
 * @author פוילישער
 */
$messages['yi'] = array(
	'multimediaviewer-permission-link' => 'באקוקן טערמינען',
	'multimediaviewer-reuse-loading-placeholder' => 'לאָדנדיק…',
);

/** Simplified Chinese (中文（简体）‎)
 * @author Liuxinyu970226
 * @author Qiyue2001
 * @author Shizhao
 * @author Stieizc
 * @author Xiaomingyan
 * @author Yfdyh000
 */
$messages['zh-hans'] = array(
	'multimediaviewer-desc' => '在全屏界面中以较大尺寸显示缩略图。',
	'multimediaviewer-desc-nil' => '没有说明。',
	'multimediaviewer-pref' => '媒体文件查看器',
	'multimediaviewer-pref-desc' => '使用这个新工具改善你的多媒体浏览体验。它能以更大的尺寸显示页面中的缩略图。图像将显示于一个漂亮的全屏界面浮层中，并能以完整尺寸查看。',
	'multimediaviewer-file-page' => '前往对应的文件页面',
	'multimediaviewer-repository' => '在$1了解详情',
	'multimediaviewer-repository-local' => '了解更多',
	'multimediaviewer-datetime-created' => '创作时间：$1',
	'multimediaviewer-datetime-uploaded' => '上传时间：$1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|上传者}}：$1',
	'multimediaviewer-metadata-error' => '出错：无法载入图像数据。$1',
	'multimediaviewer-thumbnail-error' => '出错：无法载入缩略图数据。$1',
	'multimediaviewer-license-cc-pd' => '公共领域',
	'multimediaviewer-license-pd' => '公共领域',
	'multimediaviewer-license-default' => '查看许可协议',
	'multimediaviewer-permission-title' => '许可协议详细信息',
	'multimediaviewer-permission-link' => '查看条款',
	'multimediaviewer-permission-viewmore' => '查看更多',
	'multimediaviewer-about-mmv' => '关于媒体文件查看器',
	'multimediaviewer-discuss-mmv' => '留下反馈意见',
	'multimediaviewer-geolocation' => '位置：$1',
	'multimediaviewer-fileusage-count' => '在$1个{{PLURAL:$1|页面}}中使用',
	'multimediaviewer-fileusage-count-more' => '在超过$1个{{PLURAL:$1|页面}}中使用',
	'multimediaviewer-fileusage-link' => '查看所有用途',
	'multimediaviewer-fileusage-local-section' => '本网站',
	'multimediaviewer-fileusage-global-section' => '其他网站',
	'multimediaviewer-reuse-link' => '使用该文件',
	'multimediaviewer-reuse-loading-placeholder' => '正在载入…',
	'multimediaviewer-share-tab' => '分享',
	'multimediaviewer-embed-tab' => '嵌入',
	'multimediaviewer-link-to-page' => '至文件说明页面的链接',
	'multimediaviewer-link-to-file' => '至原始文件的链接',
	'multimediaviewer-embed-wt' => 'wiki文本',
	'multimediaviewer-embed-html' => 'HTML',
	'multimediaviewer-html-embed-credit-text-tbls' => '“$1”，作者$2。采用$3授权，来自$4。',
	'multimediaviewer-html-embed-credit-text-tls' => '“$1”。采用$2授权，来自$3。',
	'multimediaviewer-html-embed-credit-text-tbs' => '“$1”，作者$2。来自$3。',
	'multimediaviewer-html-embed-credit-text-tbl' => '“$1”，作者$2。采用$3授权。',
	'multimediaviewer-html-embed-credit-text-tb' => '“$1”，作者$2。',
	'multimediaviewer-html-embed-credit-text-ts' => '“$1”。来自$2。',
	'multimediaviewer-html-embed-credit-text-tl' => '“$1”。采用$2授权。',
	'multimediaviewer-html-embed-credit-text-t' => '“$1”。',
	'multimediaviewer-embed-byline' => '作者$1',
	'multimediaviewer-embed-license' => '采用$1授权。',
	'multimediaviewer-embed-via' => '来自$1。',
	'multimediaviewer-default-embed-size' => '默认缩略图尺寸',
	'multimediaviewer-original-embed-size' => '原始尺寸 - $1 × $2 像素',
	'multimediaviewer-large-embed-size' => '大 - $1 × $2 像素',
	'multimediaviewer-medium-embed-size' => '中 - $1 × $2 像素',
	'multimediaviewer-small-embed-size' => '小 - $1 × $2 像素',
);

/** Traditional Chinese (中文（繁體）‎)
 * @author Liuxinyu970226
 */
$messages['zh-hant'] = array(
	'multimediaviewer-license-cc-pd' => '公共領域',
	'multimediaviewer-license-pd' => '公共領域',
	'multimediaviewer-discuss-mmv' => '遞交反饋',
);
