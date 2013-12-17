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
	'multimediaviewer-desc' => 'Expand thumbnails in a larger size in a Lightbox.',
	'multimediaviewer-pref' => 'Media Viewer',
	'multimediaviewer-pref-desc' => 'Improve your multimedia viewing experience with this new tool. It displays images in larger size on pages that have thumbnails. Images are shown in a nicer Lightbox overlay, and can also be viewed in full-size.',
	'multimediaviewer-file-page' => 'Go to corresponding file page',
	'multimediaviewer-repository' => 'Learn more on $1',
	'multimediaviewer-datetime-created' => 'Created on $1',
	'multimediaviewer-datetime-uploaded' => 'Uploaded on $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|Uploaded}} by $1',
	'multimediaviewer-credit' => '$1 - $2',

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
	'multimediaviewer-license-cc-pd' => 'Public Domain',
	'multimediaviewer-license-cc-zero' => 'CC 0',
	'multimediaviewer-license-default' => 'View license',

	'multimediaviewer-use-file' => 'Use this file',
	'multimediaviewer-use-file-owt' => 'Use this file on a wiki page, as a thumbnail',
	'multimediaviewer-use-file-own' => 'Use this file on a wiki page, inline',
	'multimediaviewer-use-file-offwiki' => 'Use this file on another website',

	'multimediaviewer-about-mmv' => 'About Media Viewer',
	'multimediaviewer-discuss-mmv' => 'Leave feedback',
);

/** Message documentation (Message documentation)
 * @author Mark Holmquist <mtraceur@member.fsf.org>
 * @author Shirayuki
 */
$messages['qqq'] = array(
	'multimediaviewer-desc' => '{{desc|name=Multimedia Viewer|url=https://www.mediawiki.org/wiki/Extension:MultimediaViewer}}',
	'multimediaviewer-pref' => 'Preference title',
	'multimediaviewer-pref-desc' => 'Description of preference',
	'multimediaviewer-file-page' => 'Text for a link to the file page for an image.',
	'multimediaviewer-repository' => 'Link to the repository where the image is hosted. Parameters:
* $1 - the display name of that site',
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
	'multimediaviewer-license-cc-by-1.0' => 'Very short label for the Creative Commons Attribution license, version 1.0, used in a link to the file information page that has more licensing information.',
	'multimediaviewer-license-cc-sa-1.0' => 'Very short label for the Creative Commons ShareAlike license, version 1.0, used in a link to the file information page that has more licensing information.',
	'multimediaviewer-license-cc-by-sa-1.0' => 'Very short label for the Creative Commons Attribution ShareAlike license, version 1.0, used in a link to the file information page that has more licensing information.',
	'multimediaviewer-license-cc-by-2.0' => 'Very short label for the Creative Commons Attribution license, version 2.0, used in a link to the file information page that has more licensing information.',
	'multimediaviewer-license-cc-by-sa-2.0' => 'Very short label for the Creative Commons Attribution ShareAlike license, version 2.0, used in a link to the file information page that has more licensing information.',
	'multimediaviewer-license-cc-by-2.1' => 'Very short label for the Creative Commons Attribution license, version 2.1, used in a link to the file information page that has more licensing information.',
	'multimediaviewer-license-cc-by-sa-2.1' => 'Very short label for the Creative Commons Attribution ShareAlike license, version 2.1, used in a link to the file information page that has more licensing information.',
	'multimediaviewer-license-cc-by-2.5' => 'Very short label for the Creative Commons Attribution license, version 2.5, used in a link to the file information page that has more licensing information.',
	'multimediaviewer-license-cc-by-sa-2.5' => 'Very short label for the Creative Commons Attribution ShareAlike license, version 2.5, used in a link to the file information page that has more licensing information.',
	'multimediaviewer-license-cc-by-3.0' => 'Very short label for the Creative Commons Attribution license, version 3.0, used in a link to the file information page that has more licensing information.',
	'multimediaviewer-license-cc-by-sa-3.0' => 'Very short label for the Creative Commons Attribution ShareAlike license, version 3.0, used in a link to the file information page that has more licensing information.',
	'multimediaviewer-license-cc-pd' => 'Very short label for the Creative Commons Public Domain license, used in a link to the file information page that has more licensing information.
{{Identical|Public domain}}',
	'multimediaviewer-license-cc-zero' => 'Very short label for the Creative Commons Zero license, used in a link to the file information page that has more licensing information.',
	'multimediaviewer-license-default' => 'Short label for a link to generic license information.',
	'multimediaviewer-use-file' => 'Link that opens a dialog with options for sharing the file, e.g. onwiki or on another site. Similar to the Commons gadget stockPhoto.',
	'multimediaviewer-use-file-owt' => 'Label for input box which has wikitext used to show an image with the thumb option and a helpful caption.

The wikitext is like <code><nowiki>[[filename|thumb|desc]]</nowiki></code>.

Similar to the Commons gadget stockPhoto.

See also:
* {{msg-mw|Multimediaviewer-use-file-own}}',
	'multimediaviewer-use-file-own' => 'Label for input box which has wikitext used to show an image inline with a helpful title attribute.

The wikitext is like <code><nowiki>[[filename|desc]]</nowiki></code>.

Similar to the Commons gadget stockPhoto.

See also:
* {{msg-mw|Multimediaviewer-use-file-owt}}',
	'multimediaviewer-use-file-offwiki' => 'Label for HTML used to show an image on an external site, with a link back to the wiki. Similar to the Commons gadget stockPhoto.',
	'multimediaviewer-about-mmv' => 'Text for a link to a page with more information about Media Viewer software.',
	'multimediaviewer-discuss-mmv' => 'Text for a link to a page where the user can discuss the Media Viewer software.
{{Identical|Leave feedback}}',
);

/** Arabic (العربية)
 * @author Claw eg
 * @author مشعل الحربي
 */
$messages['ar'] = array(
	'multimediaviewer-desc' => 'توسيع المصغرات إلى حجم أكبر في نافذة منبثقة.',
	'multimediaviewer-pref' => 'عارض الوسائط',
	'multimediaviewer-pref-desc' => 'حسن تجربة مشاهدة الوسائط المتعددة مع هذه الأداة الجديدة، حيث تعمل على عرض الصور بحجم أكبر على الصفحات التي تحتوي صورًا مصغرة. وتظهر الصور في صندوق منبثق أجمل، ويمكن أيضًا عرضها بالحجم الكامل.',
	'multimediaviewer-file-page' => 'الذهاب إلى الصفحة التابعة للملف',
	'multimediaviewer-repository' => 'تفاصيل أكثر على $1',
	'multimediaviewer-datetime-created' => 'أنشئت في $1',
	'multimediaviewer-datetime-uploaded' => 'رفعت في $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|رفع}} بواسطة $1',
	'multimediaviewer-license-cc-pd' => 'ملكية عامة',
	'multimediaviewer-license-default' => 'عرض الترخيص',
	'multimediaviewer-use-file' => 'استخدام هذا الملف',
	'multimediaviewer-use-file-owt' => 'استخدام هذا الملف في صفحة ويكي، على هيئة صورة مصغرة',
	'multimediaviewer-use-file-own' => 'استخدام هذا الملف في صفحة ويكي، على السطر',
	'multimediaviewer-use-file-offwiki' => 'استخدام هذا الملف في موقع آخر',
	'multimediaviewer-about-mmv' => 'حول عارض الوسائط',
	'multimediaviewer-discuss-mmv' => 'إعطاء رأيك',
);

/** Asturian (asturianu)
 * @author Xuacu
 */
$messages['ast'] = array(
	'multimediaviewer-desc' => 'Espande les miniatures a mayor tamañu nun visor.',
	'multimediaviewer-pref' => 'Visor de medios',
	'multimediaviewer-pref-desc' => 'Ameyore la esperiencia al ver multimedia con esta nueva ferramienta. Amuesa les imaxes a mayor tamañu nes páxines que tienen miniatures. Les imaxes vense nuna guapa capa de visor, y puen vese tamién a tamañu completu.',
	'multimediaviewer-file-page' => 'Dir a la páxina del ficheru correspondiente',
	'multimediaviewer-repository' => 'Ver más en $1',
	'multimediaviewer-datetime-created' => 'Creáu el $1',
	'multimediaviewer-datetime-uploaded' => 'Xubíu el $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|Xubíu}} por $1',
	'multimediaviewer-license-cc-pd' => 'Dominiu públicu',
	'multimediaviewer-license-default' => 'Ver la llicencia',
	'multimediaviewer-use-file' => 'Usar esti ficheru',
	'multimediaviewer-use-file-owt' => 'Usar esti ficheru nuna páxina wiki, como miniatura',
	'multimediaviewer-use-file-own' => 'Usar esti ficheru nuna páxina wiki, en llinia',
	'multimediaviewer-use-file-offwiki' => "Usar esti ficheru n'otru sitiu web",
	'multimediaviewer-about-mmv' => 'Tocante a Media Viewer',
	'multimediaviewer-discuss-mmv' => 'Dexar un comentariu',
);

/** Bengali (বাংলা)
 * @author Aftab1995
 */
$messages['bn'] = array(
	'multimediaviewer-pref' => 'মিডিয়া ভিউয়ার',
	'multimediaviewer-pref-desc' => 'এই নতুন সরঞ্জামটি দিয়ে মাল্টিমিডিয়া দেখার নতুন অভিজ্ঞতা নিন। এটা থাম্বনেল আছে এমন পাতায় বড় মাপের চিত্র প্রদর্শন করে। চিত্র একটি সুন্দর উজ্জ্বল আচ্ছাদনকৃত বাক্সে প্রদর্শিত হয়, এছাড়াও পূর্ণ মাপ দেখা যাবে।',
	'multimediaviewer-file-page' => 'সংশ্লিষ্ট ফাইল পৃষ্ঠাতে যান',
	'multimediaviewer-repository' => '$1-এ আরও জানুন',
	'multimediaviewer-datetime-created' => '$1 তারিখে তৈরী হয়েছে',
	'multimediaviewer-datetime-uploaded' => '$1 তারিখে আপলোডকৃত',
	'multimediaviewer-userpage-link' => '$1 দ্বারা {{GENDER:$2|আপলোডকৃত}}',
	'multimediaviewer-license-cc-pd' => 'পাবলিক ডোমেইন',
	'multimediaviewer-license-default' => 'লাইসেন্স দেখুন',
	'multimediaviewer-use-file' => 'এই ফাইলটি ব্যবহার করুন',
	'multimediaviewer-use-file-owt' => 'থাম্বনেইল হিসাবে, উইকি পাতায় এই ফাইলটি ব্যবহার করুন',
	'multimediaviewer-use-file-own' => 'ইনলাইন হিসাবে, উইকি পাতায় এই ফাইলটি ব্যবহার করুন',
	'multimediaviewer-use-file-offwiki' => 'অন্য ওয়েবসাইটে এই ফাইলটি ব্যবহার করুন',
	'multimediaviewer-about-mmv' => 'মিডিয়া ভিউয়ার সম্পর্কে',
	'multimediaviewer-discuss-mmv' => 'আপনার প্রতিক্রিয়া জানান',
);

/** Catalan (català)
 * @author Fitoschido
 * @author Vriullop
 */
$messages['ca'] = array(
	'multimediaviewer-desc' => 'Expansió de miniatures a una mida més gran en un Lightbox',
	'multimediaviewer-pref' => 'Visor multimèdia',
	'multimediaviewer-pref-desc' => 'Milloreu la vostra experiència de visualització multimèdia amb aquesta nova eina. Mostra imatges a mida més gran en les pàgines que tenen miniatures. Les imatges es mostren en una caixa Lightbox superposada més agradable i també es poden veure a mida completa.',
	'multimediaviewer-file-page' => 'Vés a la pàgina corresponent del fitxer',
	'multimediaviewer-repository' => 'Més informació a $1',
	'multimediaviewer-datetime-created' => 'Creat el $1',
	'multimediaviewer-datetime-uploaded' => 'Carregat el $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|Carregat}} per $1',
	'multimediaviewer-license-cc-pd' => 'Domini públic',
	'multimediaviewer-license-default' => 'Mostra la llicència',
	'multimediaviewer-use-file' => 'Utilitza aquest fitxer',
	'multimediaviewer-use-file-owt' => 'Utilitza aquest fitxer en una pàgina wiki, com una miniatura',
	'multimediaviewer-use-file-own' => 'Utilitza aquest fitxer en una pàgina wiki, directament',
	'multimediaviewer-use-file-offwiki' => 'Utilitza aquest fitxer en un altre lloc web',
	'multimediaviewer-about-mmv' => 'Quant al visor multimèdia',
	'multimediaviewer-discuss-mmv' => 'Comentaris',
);

/** Chechen (нохчийн)
 * @author Умар
 */
$messages['ce'] = array(
	'multimediaviewer-pref' => 'Медиа-хьожург',
	'multimediaviewer-pref-desc' => 'Мультимедиа-файлашка хьажар хаза кечдина гойту.',
	'multimediaviewer-discuss-mmv' => 'Язде хьайна хетарг',
);

/** Czech (čeština)
 * @author Mormegil
 * @author Rosnicka.kacka
 */
$messages['cs'] = array(
	'multimediaviewer-desc' => 'Roztáhne náhledy obrázků do lightboxu.',
	'multimediaviewer-pref' => 'Prohlížeč médií',
	'multimediaviewer-pref-desc' => 'Pomocí tohoto nástroje si můžete zpříjemnit prohlížení multimédií. Na stránkách, na kterých se používají náhledy obrázků, umožňuje prohlížení těchto obrázků ve větší velikosti. Obrázky se zobrazí v hezčím lightboxu přes stránku a lze si je prohlédnout také v plné velikosti.',
	'multimediaviewer-file-page' => 'Přejít na stránku s popisem souboru',
	'multimediaviewer-repository' => 'Více informací na {{grammar:6sg|$1}}',
	'multimediaviewer-datetime-created' => 'Vytvořeno $1',
	'multimediaviewer-datetime-uploaded' => 'Načteno $1',
	'multimediaviewer-userpage-link' => 'Načteno {{GENDER:$2|uživatelem|uživatelkou}} $1',
	'multimediaviewer-credit' => '$1 – $2',
	'multimediaviewer-license-cc-pd' => 'Volné dílo',
	'multimediaviewer-license-default' => 'Zobrazit licenci',
	'multimediaviewer-use-file' => 'Použít tento soubor',
	'multimediaviewer-use-file-owt' => 'Použít tento soubor na wiki, jako náhled',
	'multimediaviewer-use-file-own' => 'Použít tento soubor na wiki, uvnitř textu',
	'multimediaviewer-use-file-offwiki' => 'Použít tento soubor na jiné webové stránce',
	'multimediaviewer-about-mmv' => 'O prohlížeči médií',
	'multimediaviewer-discuss-mmv' => 'Sdělte svůj názor',
);

/** German (Deutsch)
 * @author Kghbln
 * @author Metalhead64
 * @author Snatcher
 */
$messages['de'] = array(
	'multimediaviewer-desc' => 'Ermöglicht die Darstellungen von Vorschaubildern im „Lightbox“-Stil',
	'multimediaviewer-pref' => 'Medienbetrachter',
	'multimediaviewer-pref-desc' => 'Dieses neue Werkzeug steigert dein Multimedia-Betrachtungserlebnis. Es zeigt Bilder auf Seiten größer an, die Vorschaubilder haben. Bilder werden in einem schöneren Leuchtkastenoverlay angezeigt und können auch als Vollbild dargestellt werden.',
	'multimediaviewer-file-page' => 'Gehe zur dazugehörigen Dateiseite',
	'multimediaviewer-repository' => 'Mehr erfahren auf $1',
	'multimediaviewer-datetime-created' => 'Erstellt am $1',
	'multimediaviewer-datetime-uploaded' => 'Hochgeladen am $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|Hochgeladen}} von $1',
	'multimediaviewer-license-cc-pd' => 'Gemeinfrei',
	'multimediaviewer-license-default' => 'Lizenz ansehen',
	'multimediaviewer-use-file' => 'Diese Datei weiterverwenden',
	'multimediaviewer-use-file-owt' => 'Diese Datei als Vorschaubild auf einer Wikiseite verwenden',
	'multimediaviewer-use-file-own' => 'Diese Datei auf einer Wikiseite verwenden, Inline',
	'multimediaviewer-use-file-offwiki' => 'Diese Datei auf einer anderen Website verwenden',
	'multimediaviewer-about-mmv' => 'Über Media Viewer',
	'multimediaviewer-discuss-mmv' => 'Eine Rückmeldung hinterlassen',
);

/** Swiss High German (Schweizer Hochdeutsch)
 * @author Filzstift
 */
$messages['de-ch'] = array(
	'multimediaviewer-desc' => 'Ermöglicht die Darstellung von Vorschaubildern im «Lightbox»-Stil',
);

/** Lower Sorbian (dolnoserbski)
 * @author Michawiki
 */
$messages['dsb'] = array(
	'multimediaviewer-desc' => 'Miniaturki w swěśecem kašćiku powětsyś.',
	'multimediaviewer-pref' => 'Medijowy wobglědowak',
	'multimediaviewer-pref-desc' => 'Polěpš swójo dožywjenje multimedijowego woglědowanja z toś tym rědom. Zwobraznja wobraze we wětšej wjelikosći na bokach, kótarež maju miniaturki. Wobraze pokazuju se w rědnjejšej swěśecej warsće a daju se w połnej wjelikosći pśedstajiś.',
	'multimediaviewer-file-page' => 'K pśisłušnemu datajowemu bokoju',
	'multimediaviewer-repository' => 'Dalšne informacije wó $1',
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
);

/** Greek (Ελληνικά)
 * @author Astralnet
 */
$messages['el'] = array(
	'multimediaviewer-use-file' => 'Χρησιμοποιήστε αυτό το αρχείο',
	'multimediaviewer-about-mmv' => 'Περί το Media Viewer',
);

/** British English (British English)
 * @author Shirayuki
 */
$messages['en-gb'] = array(
	'multimediaviewer-license-default' => 'View licence',
);

/** Spanish (español)
 * @author Benfutbol10
 * @author Fitoschido
 * @author PoLuX124
 */
$messages['es'] = array(
	'multimediaviewer-pref' => 'Visor multimedia',
	'multimediaviewer-pref-desc' => 'Mejora tu experiencia de visualización multimedia con esta herramienta. Muestra imágenes en mayor tamaño en páginas que tienen miniaturas. Las imágenes se muestran en una ventana superpuesta agradable que también te permite verlas en tamaño completo.',
	'multimediaviewer-file-page' => 'Ir a la página del archivo correspondiente',
	'multimediaviewer-repository' => 'Más información en $1',
	'multimediaviewer-datetime-created' => 'Creado el $1',
	'multimediaviewer-datetime-uploaded' => 'Subido el $1',
	'multimediaviewer-license-cc-pd' => 'Dominio público',
	'multimediaviewer-license-default' => 'Información de licencia', # Fuzzy
	'multimediaviewer-discuss-mmv' => 'Dejar comentarios',
);

/** Estonian (eesti)
 * @author Pikne
 */
$messages['et'] = array(
	'multimediaviewer-desc' => 'Võimaldab suurendada pisipilte Lightbox-vaates.',
	'multimediaviewer-pref' => 'Failivaatur',
	'multimediaviewer-pref-desc' => 'Täienda meediafailide vaatamise võimalusi selle uue tööriistaga. See võimaldab kuvada pisipiltidega lehekülgedel pildid suuremana. Pilte saab näidata kenamas Lightbox-vaates ja ka täissuuruses.',
	'multimediaviewer-file-page' => 'Mine failileheküljele',
	'multimediaviewer-repository' => 'Lisateave asukohas $1',
	'multimediaviewer-datetime-created' => 'Valmistamisaeg: $1',
	'multimediaviewer-datetime-uploaded' => 'Üleslaadimisaeg: $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|Üleslaadija:}} $1',
	'multimediaviewer-license-cc-pd' => 'Avalik omand',
	'multimediaviewer-license-default' => 'Vaata litsentsi',
	'multimediaviewer-use-file' => 'Kasuta seda faili',
	'multimediaviewer-use-file-owt' => 'Kas seda faili vikileheküljel pisipildina',
	'multimediaviewer-use-file-own' => 'Viita sellele failile vikilehekülje tekstis',
	'multimediaviewer-use-file-offwiki' => 'Kasuta seda faili teises võrgukohas',
	'multimediaviewer-about-mmv' => 'Failivaaturist',
	'multimediaviewer-discuss-mmv' => 'Anna tagasisidet',
);

/** Persian (فارسی)
 * @author Ebraminio
 * @author Reza1615
 */
$messages['fa'] = array(
	'multimediaviewer-desc' => 'نمایش تصویر بندانگشتی در اندازه بزرگتر در یک حعبه روشن',
	'multimediaviewer-pref' => 'نمایش‌دهندهٔ رسانه',
	'multimediaviewer-pref-desc' => 'تجربهٔ بازدید چندرسانه‌ای شما با این ابزار جدید بهبود می‌یابد و تصاویر را در اندازهٔ بزرگتر در صفحه‌هایی که بندانگشتی دارند نمایش می‌دهد. تصاویر در پوشش سبک زیباتری نمایش داده می‌شوند و همچنین می‌توانند در اندازهٔ اصلی نمایش داده شوند.',
	'multimediaviewer-file-page' => 'رفتن به صفحهٔ مرتبط با پرونده',
	'multimediaviewer-repository' => 'بیشتر بدانید در $1',
	'multimediaviewer-datetime-created' => 'ایجادشده توسط $1',
	'multimediaviewer-datetime-uploaded' => 'ارسال شده در$1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|ارسال شده توسط}} $1',
	'multimediaviewer-license-cc-pd' => 'مالکیت عمومی',
	'multimediaviewer-license-default' => 'مشاهده مجوز',
	'multimediaviewer-use-file' => 'استفاده از این پرونده',
	'multimediaviewer-use-file-owt' => 'استفاده از این پرونده به صورت بندانگشتی در صفحه ویکی',
	'multimediaviewer-use-file-own' => 'استفاده از این پرونده به صورت درون متن، در صفحه ویکی',
	'multimediaviewer-use-file-offwiki' => 'ساتفاده از این پرونده در وب‌گاه دیگر',
	'multimediaviewer-about-mmv' => 'دربارهٔ نمایش‌دهندهٔ رسانه',
	'multimediaviewer-discuss-mmv' => 'گذاشتن بازخورد',
);

/** Finnish (suomi)
 * @author Nike
 * @author Stryn
 */
$messages['fi'] = array(
	'multimediaviewer-desc' => 'Näytä pienoiskuvat suuremmassa koossa Lightbox-näkymässä.',
	'multimediaviewer-pref' => 'Media Viewer',
	'multimediaviewer-pref-desc' => 'Paranna multimedian näyttämiskokemustasi tällä uudella työkalulla. Se näyttää sivuilla olevat pienoiskuvat suuremmassa koossa. Kuvat aukeavat Lightbox-näkymässä, ja ne voidaan näyttää myös täysikokoisina.',
	'multimediaviewer-file-page' => 'Siirry tiedostosivulle',
	'multimediaviewer-repository' => 'Lisätietoa sivustolla $1',
	'multimediaviewer-datetime-created' => 'Luotu $1',
	'multimediaviewer-datetime-uploaded' => 'Tallennettu $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|Tallentanut}} $1',
	'multimediaviewer-license-cc-pd' => 'Vapaasti käytettävä',
	'multimediaviewer-license-default' => 'Lisenssitiedot', # Fuzzy
	'multimediaviewer-use-file' => 'Käytä tätä tiedostoa',
	'multimediaviewer-use-file-owt' => 'Käytä tätä tiedostoa wikisivulla pienoiskuvana',
	'multimediaviewer-use-file-own' => 'Käytä tätä tiedostoa wikisivulla täysikokoisena',
	'multimediaviewer-use-file-offwiki' => 'Käytä tätä tiedostoa toisella sivustolla',
	'multimediaviewer-about-mmv' => 'Tietoa Media Vieweristä',
	'multimediaviewer-discuss-mmv' => 'Jätä palautetta',
);

/** French (français)
 * @author Gomoko
 * @author Ltrlg
 * @author NemesisIII
 */
$messages['fr'] = array(
	'multimediaviewer-desc' => 'Agrandit les vignettes dans une visionneuse.',
	'multimediaviewer-pref' => 'Visionneuse de Médias',
	'multimediaviewer-pref-desc' => 'Améliorer votre expérience de visualisation multimédia avec ce nouvel outil. Il affiche les images en grande taille sur les pages qui ont des vignettes. Les images sont affichées dans un joli cadre Lightbox, et peuvent aussi être affichées en taille réelle.',
	'multimediaviewer-file-page' => 'Aller à la page du fichier correspondant',
	'multimediaviewer-repository' => 'En savoir plus sur $1',
	'multimediaviewer-datetime-created' => 'Créé le $1',
	'multimediaviewer-datetime-uploaded' => 'Téléversé le $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|Téléversé}} par $1',
	'multimediaviewer-license-cc-pd' => 'Domaine public',
	'multimediaviewer-license-default' => 'Afficher la licence',
	'multimediaviewer-use-file' => 'Utiliser ce fichier',
	'multimediaviewer-use-file-owt' => 'Utiliser ce fichier comme vignette sur une page de wiki',
	'multimediaviewer-use-file-own' => 'Utiliser ce fichier dans une ligne sur une page de wiki',
	'multimediaviewer-use-file-offwiki' => 'Utiliser ce fichier sur un autre site web',
	'multimediaviewer-about-mmv' => 'À propos de la visionneuse de médias',
	'multimediaviewer-discuss-mmv' => 'Laisser un avis à propos de la visionneuse de médias',
);

/** Galician (galego)
 * @author Toliño
 */
$messages['gl'] = array(
	'multimediaviewer-desc' => 'Expande as miniaturas ata un tamaño maior dentro dun visor.',
	'multimediaviewer-pref' => 'Visor de ficheiros multimedia',
	'multimediaviewer-pref-desc' => 'Mellore a súa experiencia de visualización de ficheiros multimedia con esta nova ferramenta. Mostra as imaxes nun tamaño maior nas páxinas que teñen miniaturas. As imaxes móstranse nun visor agradable e as imaxes tamén se poden ver a tamaño completo.',
	'multimediaviewer-file-page' => 'Ir á páxina de ficheiro correspondente',
	'multimediaviewer-license-cc-pd' => 'Dominio público',
	'multimediaviewer-discuss-mmv' => 'Deixe un comentario',
);

/** Hebrew (עברית)
 * @author Amire80
 * @author Neukoln
 */
$messages['he'] = array(
	'multimediaviewer-desc' => 'הגדלת תמונות ממוזערות בשיטת לייטבוקס.',
	'multimediaviewer-pref' => 'מציג מדיה',
	'multimediaviewer-pref-desc' => 'הכלי החדש הזה משפר את חוויית המולטימדיה שלך. הוא מציג תמונות מוגדלות בדפים עם תמונות ממוזערות. התמונות מוצגות בשכבה בסגנון "לייטבוקס" וניתן להציג אותן גם בגודל מלא.',
	'multimediaviewer-file-page' => 'מעבר אל דף הקובץ המתאים',
	'multimediaviewer-repository' => 'מידע נוסף על $1',
	'multimediaviewer-datetime-created' => 'נוצר ב־$1',
	'multimediaviewer-datetime-uploaded' => 'הועלה ב־$1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|הועלה}} על־ידי $1',
	'multimediaviewer-license-cc-pd' => 'נחלת הכלל',
	'multimediaviewer-license-default' => 'הצגת הרישיון',
	'multimediaviewer-use-file' => 'שימוש בקובץ הזה',
	'multimediaviewer-use-file-owt' => 'שימוש בקובץ בזה בדף ויקי כתמונה ממוזערת',
	'multimediaviewer-use-file-own' => 'שימוש בקובץ הזה בדף ויקי ברצף הטקסט',
	'multimediaviewer-use-file-offwiki' => 'שימוש בקובץ הזה באתר אחר',
	'multimediaviewer-about-mmv' => 'אודות מציג מדיה',
	'multimediaviewer-discuss-mmv' => 'השארת תגובה',
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
	'multimediaviewer-desc' => 'Miniaturki w swětłokašćiku powjetšić.',
	'multimediaviewer-pref' => 'Medijowy wobhladowak',
	'multimediaviewer-pref-desc' => 'Polěpš swoje dožiwjenje multimedijoweho wobhladowanja z tutym nastrojom. Zwobraznja wobrazy we wjetšej wulkosći na stronach, kotrež maja miniaturki. Wobrazy pokazuja so w rjeńšej swětłokašćikowej woršće a hodźa so w połnej wulkosći předstajić.',
	'multimediaviewer-file-page' => 'K přisłušnej datajowej stronje',
	'multimediaviewer-repository' => 'Dalše informacije na $1',
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
	'multimediaviewer-desc' => 'Mangpadakkel kadagiti bassit a ladawan iti dakdakkel iti maysa a Lightbox.',
	'multimediaviewer-pref' => 'Media Viewer',
	'multimediaviewer-pref-desc' => 'Pasayaatem ti panagsanay a panagbuya ti nadumaduma a midia iti daytoy a ramit. Daytoy ket agiparang kadagiti dakdakkel a ladawan kadagiti panid nga addaan kadagiti bassit a ladawan. Dagiti ladawan ket maiparang ti nasaysayaat a tuon ti Lightbox, ken mabalin pay a makita iti napno a kadakkel.',
	'multimediaviewer-file-page' => 'Mapan iti maitutop a panid ti papeles',
	'multimediaviewer-repository' => 'Agadal pay ti adu idiay $1',
	'multimediaviewer-datetime-created' => 'Pinartuat idi $1',
	'multimediaviewer-datetime-uploaded' => 'Inkarga idi $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|Inkarga}} babaen ni $1',
	'multimediaviewer-license-cc-pd' => 'Dominio a Publiko',
	'multimediaviewer-license-default' => 'Kitaen ti lisensia',
	'multimediaviewer-use-file' => 'Usaren daytoy a papeles',
	'multimediaviewer-use-file-owt' => 'Usaren daytoy a papeles iti panid ti wiki, a kas bassit a ladawan',
	'multimediaviewer-use-file-own' => 'Usaren daytoy a papeles iti panid ti wiki, a nailinia',
	'multimediaviewer-use-file-offwiki' => 'Usaren daytoy a papeles iti sabali a website',
	'multimediaviewer-about-mmv' => 'Maipanggep ti Media Viewer',
	'multimediaviewer-discuss-mmv' => 'Mangibati ti feedback',
);

/** Italian (italiano)
 * @author Beta16
 * @author CristianCantoro
 * @author OrbiliusMagister
 */
$messages['it'] = array(
	'multimediaviewer-desc' => 'Espandere le miniature in un dimensioni maggiori in un Lightbox.',
	'multimediaviewer-pref' => 'Media Viewer',
	'multimediaviewer-pref-desc' => 'Sperimenta una miglior visualizzazione dei file multimediali con questo nuovo strumento che visualizza le immagini più grandi su pagine che ne riportano le miniature. Le immagini sono mostrate in un riquadro piccolo più gradevole, ma possono essere visualizzate anche alla dimensione originale.',
	'multimediaviewer-file-page' => 'Vai alla corrispondente pagina del file',
	'multimediaviewer-repository' => 'Ulteriori informazioni su $1',
	'multimediaviewer-datetime-created' => 'Creato il $1',
	'multimediaviewer-datetime-uploaded' => 'Caricato il $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|Caricato}} da $1',
	'multimediaviewer-license-cc-pd' => 'Pubblico dominio',
	'multimediaviewer-license-default' => 'Vedi la licenza',
	'multimediaviewer-use-file' => 'Usa questo file',
	'multimediaviewer-use-file-owt' => 'Usa questo file in una pagina wiki, come miniatura',
	'multimediaviewer-use-file-own' => 'Usa questo file in una pagina wiki, in linea',
	'multimediaviewer-use-file-offwiki' => 'Usa questo file su un altro sito',
	'multimediaviewer-about-mmv' => 'Su Media Viewer',
	'multimediaviewer-discuss-mmv' => 'Lascia un commento',
);

/** Japanese (日本語)
 * @author Shirayuki
 */
$messages['ja'] = array(
	'multimediaviewer-desc' => '縮小画像を Lightbox 内に拡大表示する',
	'multimediaviewer-pref' => 'メディア ビューアー',
	'multimediaviewer-pref-desc' => 'この新しいツールは、マルチメディアの表示体験を改善します。縮小画像があるページで、その画像をより大きなサイズで表示します。画像は Lightbox オーバーレイ内に表示され、完全なサイズで表示させることもできます。',
	'multimediaviewer-file-page' => '対応するファイル ページに移動',
	'multimediaviewer-repository' => '$1の詳細情報',
	'multimediaviewer-datetime-created' => '作成日時: $1',
	'multimediaviewer-datetime-uploaded' => 'アップロード日時: $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|アップロード}}者: $1',
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
	'multimediaviewer-license-cc-pd' => 'パブリック・ドメイン',
	'multimediaviewer-license-cc-zero' => 'CC 0',
	'multimediaviewer-license-default' => 'ライセンスを閲覧',
	'multimediaviewer-use-file' => 'このファイルを使用',
	'multimediaviewer-use-file-owt' => 'このファイルをウィキページ内 (サムネイル) で使用',
	'multimediaviewer-use-file-own' => 'このファイルをウィキページ内 (インライン) で使用',
	'multimediaviewer-use-file-offwiki' => 'このファイルを別のウェブサイトで使用',
	'multimediaviewer-about-mmv' => 'メディア ビューアーについて',
	'multimediaviewer-discuss-mmv' => 'フィードバックを送信',
);

/** Kazakh (Cyrillic script) (қазақша (кирил)‎)
 * @author Arystanbek
 */
$messages['kk-cyrl'] = array(
	'multimediaviewer-pref' => 'Медиа қарап шығу құралы',
	'multimediaviewer-file-page' => 'Тиісті файл бетіне өту',
	'multimediaviewer-repository' => '$1 туралы көбірек білу',
	'multimediaviewer-datetime-created' => '$1 кезінде құрылған',
	'multimediaviewer-datetime-uploaded' => '$1 кезінде жүктелген',
	'multimediaviewer-userpage-link' => '$1 {{GENDER:$2|жүктеген}}',
	'multimediaviewer-license-cc-pd' => 'Қоғамдық қазына',
	'multimediaviewer-license-default' => 'Лицензиясын қарау',
	'multimediaviewer-use-file' => 'Бұл файлды қолдану',
	'multimediaviewer-use-file-owt' => 'Бұл файлды уики бетінде нобай түрінде қолдану',
	'multimediaviewer-use-file-own' => 'Бұл файлды уики бетінде қолдану, кірістіру',
	'multimediaviewer-use-file-offwiki' => 'Бұл файлды басқа уебсайтта қолдану',
	'multimediaviewer-about-mmv' => 'Медиа қарап шығу құралы туралы',
	'multimediaviewer-discuss-mmv' => 'Пікір қалдыру',
);

/** Korean (한국어)
 * @author Freebiekr
 * @author Hym411
 */
$messages['ko'] = array(
	'multimediaviewer-desc' => '섬네일 이미지를 라이트 박스에서 더 큰 크기로 확장합니다.',
	'multimediaviewer-pref' => '미디어 뷰어',
	'multimediaviewer-pref-desc' => '이 새 도구로 멀티미디어를 더 쉽게 감상하십시오. 이 도구는 섬네일 이미지가 있는 문서에서 그 섬네일을 더 크게 나타냅니다. 큰 이미지는 보기 편리한 라이트박스에 나타나며 원본 크기로 표시될 수도 있습니다.',
	'multimediaviewer-file-page' => '해당 파일 문서로 이동',
	'multimediaviewer-repository' => '$1에서 더 자세히 보기',
	'multimediaviewer-datetime-created' => '$1에 만듦',
	'multimediaviewer-datetime-uploaded' => '$1에 업로드',
	'multimediaviewer-userpage-link' => '$1가 {{GENDER:$2|업로드}}',
	'multimediaviewer-license-cc-pd' => '퍼블릭 도메인',
	'multimediaviewer-license-default' => '라이선스 보기',
	'multimediaviewer-use-file' => '이 파일을 사용',
	'multimediaviewer-use-file-owt' => '이 파일을 위키 문서에서 섬네일로 사용',
	'multimediaviewer-use-file-own' => '이 파일을 위키 문서의 텍스트 사이에 사용',
	'multimediaviewer-use-file-offwiki' => '이 파일을 다른 웹사이트에서 사용',
	'multimediaviewer-about-mmv' => '미디어 뷰어 정보',
	'multimediaviewer-discuss-mmv' => '의견 남기기',
);

/** Luxembourgish (Lëtzebuergesch)
 * @author Robby
 */
$messages['lb'] = array(
	'multimediaviewer-pref' => 'Media Viewer',
	'multimediaviewer-repository' => 'Méi gewuer ginn op $1',
	'multimediaviewer-datetime-uploaded' => 'Eropgelueden den $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|Eropgeluede}} vum $1',
	'multimediaviewer-license-default' => 'Lizenz weisen',
	'multimediaviewer-use-file' => 'Benotzt dëse Fichier',
	'multimediaviewer-use-file-owt' => 'Dëse Fichier op enger Wikisäit als Miniaturbild benotzen',
	'multimediaviewer-use-file-own' => 'Benotzt dëse Fichier op enger Wiki-Säit, inline',
	'multimediaviewer-use-file-offwiki' => 'Dëse Fichier op engem aneren Internetsite benotzen',
	'multimediaviewer-about-mmv' => 'Iwwer Media Viewer',
	'multimediaviewer-discuss-mmv' => 'Feedback verloossen',
);

/** Macedonian (македонски)
 * @author Bjankuloski06
 */
$messages['mk'] = array(
	'multimediaviewer-desc' => 'Зголемување на минијатурите во прегледувач на слики',
	'multimediaviewer-pref' => 'Прегледувач на слики и снимки',
	'multimediaviewer-pref-desc' => 'Дава поубаво прегледување на слики на страници. Ги прикажува поголеми на страниците со минијатури. Можат да се прегледуваат и во полна големина.',
	'multimediaviewer-file-page' => 'Оди на соодветната податотечна страница',
	'multimediaviewer-repository' => 'Дознајте повеќе на $1',
	'multimediaviewer-datetime-created' => 'Создадено на $1',
	'multimediaviewer-datetime-uploaded' => 'Подигнато на $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|Подигнато}} од $1',
	'multimediaviewer-credit' => '$1 — $2',
	'multimediaviewer-license-cc-pd' => 'Јавна сопственост',
	'multimediaviewer-license-default' => 'Погл. лиценцата',
	'multimediaviewer-use-file' => 'Употребете ја податотекава',
	'multimediaviewer-use-file-owt' => 'Употребете ја податотекава на викистраница, како минијатура',
	'multimediaviewer-use-file-own' => 'Употребете ја податотекава на викистраница, во ред',
	'multimediaviewer-use-file-offwiki' => 'Употребете ја податотекава на друго место на интернет',
	'multimediaviewer-about-mmv' => 'За Медиумскиот прегледувач',
	'multimediaviewer-discuss-mmv' => 'Дајте мислење',
);

/** Malayalam (മലയാളം)
 * @author Clockery
 * @author Praveenp
 */
$messages['ml'] = array(
	'multimediaviewer-desc' => 'ലഘുചിത്രങ്ങൾ വികസിപ്പിക്കുക',
	'multimediaviewer-pref' => 'മീഡിയ ദർശനോപാധി',
	'multimediaviewer-pref-desc' => 'ഈ പുതിയ ഉപകരണമുപയോഗിച്ച് താങ്കളുടെ മീഡിയ ദർശനാനുഭവം മെച്ചപ്പെടുത്തൂ. ലഘുചിത്രങ്ങൾ ഉപയോഗിച്ചിരിക്കുന്ന താളുകളിലെ ചിത്രങ്ങൾ ഇതുപയോഗിച്ച് വലുതായി കാണാം. ചിത്രങ്ങൾ സുന്ദരമായ ലൈറ്റ്ബോക്സ് രൂപത്തിലോ, പൂർണ്ണവലിപ്പത്തിലോ കാണാനാവുന്നതാണ്.',
	'multimediaviewer-file-page' => 'ബന്ധപ്പെട്ട പ്രമാണത്താളിലേയ്ക്ക് പോവുക',
	'multimediaviewer-repository' => '$1 സംരംഭത്തിൽ കൂടുതൽ അറിയുക',
	'multimediaviewer-datetime-created' => 'സൃഷ്ടിച്ചത്: $1',
	'multimediaviewer-datetime-uploaded' => 'അപ്‌ലോഡ് ചെയ്തത്: $1',
	'multimediaviewer-userpage-link' => 'അപ്‌ലോഡ് {{GENDER:$2|ചെയ്ത}} ഉപയോക്താവ്: $1',
	'multimediaviewer-license-cc-pd' => 'പൊതുസഞ്ചയം',
	'multimediaviewer-license-default' => 'ഉപയോഗാനുമതി കാണുക',
	'multimediaviewer-use-file' => 'ഈ പ്രമാണം ഉപയോഗിക്കുക',
	'multimediaviewer-use-file-owt' => 'ഈ പ്രമാണം ഒരു വിക്കി താളിൽ, ലഘുചിത്രമായി ഉപയോഗിക്കുക',
	'multimediaviewer-use-file-own' => 'ഈ പ്രമാണം ഒരു വിക്കിതാളിൽ, വരികൾക്കിടയിൽ ഉപയോഗിക്കുക',
	'multimediaviewer-use-file-offwiki' => 'ഈ പ്രമാണം മറ്റൊരു വെബ്സൈറ്റിൽ ഉപയോഗിക്കുക',
	'multimediaviewer-about-mmv' => 'മീഡിയ ദർശനോപാധിയുടെ വിവരണം',
	'multimediaviewer-discuss-mmv' => 'പ്രതികരണം ചേർക്കുക',
);

/** Dutch (Nederlands)
 * @author SPQRobin
 * @author Siebrand
 */
$messages['nl'] = array(
	'multimediaviewer-desc' => 'Miniatuurafbeeldingen groter weergeven in een Lightbox.',
	'multimediaviewer-pref' => 'Mediaviewer',
	'multimediaviewer-pref-desc' => "Verbeteren uw multimediaervaring met dit nieuwe instrument. Afbeeldingen worden groter weergegeven op pagina's met miniaturen. Afbeeldingen worden weergegeven in een Lightbox en kunnen ook worden bekeken op ware grootte.",
	'multimediaviewer-file-page' => 'Naar de bestandspagina gaan',
	'multimediaviewer-repository' => 'Meer informatie over $1',
	'multimediaviewer-datetime-created' => 'Aangemaakt op $1',
	'multimediaviewer-datetime-uploaded' => 'Geupload op $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|Geüpload}} door $1',
	'multimediaviewer-license-cc-pd' => 'Publiek domein',
	'multimediaviewer-license-default' => 'Licentie weergeven',
	'multimediaviewer-use-file' => 'Dit bestand gebruiken',
	'multimediaviewer-use-file-owt' => 'Gebruik dit bestand op een wikipagina, als een miniatuur',
	'multimediaviewer-use-file-own' => 'Gebruik dit bestand op een wikipagina, in lopende tekst',
	'multimediaviewer-use-file-offwiki' => 'Gebruik dit bestand op een andere website',
	'multimediaviewer-about-mmv' => 'Over Mediaviewer',
	'multimediaviewer-discuss-mmv' => 'Terugkoppeling achterlaten',
);

/** Occitan (occitan)
 * @author Cedric31
 */
$messages['oc'] = array(
	'multimediaviewer-desc' => 'Agrandís las vinhetas dins una visionadoira.',
	'multimediaviewer-pref' => 'Visionadoira de Mèdias',
	'multimediaviewer-file-page' => 'Anar a la pagina del fichièr correspondent',
	'multimediaviewer-repository' => 'Ne saber mai sus $1',
	'multimediaviewer-datetime-created' => 'Creat lo $1',
	'multimediaviewer-datetime-uploaded' => 'Mandat lo $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|Mandat}} per $1',
	'multimediaviewer-license-cc-pd' => 'Domeni public',
);

/** Polish (polski)
 * @author Nux
 * @author Tar Lócesilion
 * @author WTM
 */
$messages['pl'] = array(
	'multimediaviewer-pref' => 'Przeglądarka multimedów',
	'multimediaviewer-pref-desc' => 'To narzędzie to przyjazna użytkownikowi przeglądarka multimediów. Umożliwia powiększanie miniaturek obrazków bez opuszczania strony z artykułem. Narzędzie to domyślnie wyświetla obrazki na półprzezroczystej nakładce w stylu „Lightbox”, ale można także powiększyć je na pełny ekran.',
	'multimediaviewer-file-page' => 'Przejdź na stronę z opisem pliku',
	'multimediaviewer-repository' => 'Dowiedz się więcej na {{GRAMMAR:D.lp|$1}}',
	'multimediaviewer-datetime-created' => 'Utworzony $1',
	'multimediaviewer-datetime-uploaded' => 'Przesłany $1',
	'multimediaviewer-userpage-link' => 'Przesłany przez {{GENDER:$2|użytkownika|użytkowniczkę}} $1',
	'multimediaviewer-license-cc-pd' => 'Domena publiczna',
	'multimediaviewer-license-default' => 'Zobacz licencję',
	'multimediaviewer-use-file' => 'Użyj tego pliku',
	'multimediaviewer-use-file-owt' => 'Użyj tego pliku na stronie wiki, jako miniatura',
	'multimediaviewer-use-file-own' => 'Użyj tego pliku na stronie wiki, wewnątrz tekstu',
	'multimediaviewer-use-file-offwiki' => 'Użyj tego pliku na innej stronie internetowej',
	'multimediaviewer-about-mmv' => 'O przeglądarce multimedów',
	'multimediaviewer-discuss-mmv' => 'Prześlij opinię',
);

/** Pashto (پښتو)
 * @author Ahmed-Najib-Biabani-Ibrahimkhel
 */
$messages['ps'] = array(
	'multimediaviewer-datetime-created' => 'په $1 جوړ شو',
	'multimediaviewer-datetime-uploaded' => 'په $1 پورته شو',
	'multimediaviewer-license-cc-pd' => 'ټولگړی شپول',
	'multimediaviewer-license-default' => 'د منښتليک مالومات', # Fuzzy
	'multimediaviewer-use-file' => 'دا دوتنه کارول',
	'multimediaviewer-use-file-owt' => 'دا دوتنه د ويکي په يو مخ، د بټنوک په توگه کارول',
);

/** Portuguese (português)
 * @author Vitorvicentevalente
 */
$messages['pt'] = array(
	'multimediaviewer-desc' => 'Expandir miniaturas num tamanho maior numa caixa agradável',
	'multimediaviewer-pref' => 'Visualizador multimédia',
	'multimediaviewer-pref-desc' => 'Melhore a sua experiência de visualização multimédia com esta nova ferramenta. A ferramenta exibe imagens em tamanho maior nas páginas que têm miniaturas. As imagens são mostradas em sobreposição numa caixa mais agradável e também podem ser visualizadas em tamanho real.',
	'multimediaviewer-file-page' => 'Ir para a página correspondente ao arquivo',
	'multimediaviewer-repository' => 'Saiba mais em $1',
	'multimediaviewer-datetime-created' => 'Criado em $1',
	'multimediaviewer-datetime-uploaded' => 'Carregado em $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|Carregado}} por $1',
	'multimediaviewer-license-cc-pd' => 'Domínio Público',
	'multimediaviewer-license-default' => 'Ver licença',
	'multimediaviewer-use-file' => 'Usar este ficheiro',
	'multimediaviewer-use-file-owt' => 'Usar este ficheiro numa página wiki em forma de miniatura',
	'multimediaviewer-use-file-own' => 'Usar este ficheiro numa página wiki',
	'multimediaviewer-use-file-offwiki' => 'Usar este ficheiro noutro sítio da Internet',
	'multimediaviewer-about-mmv' => 'Sobre o Visualizador multimédia',
	'multimediaviewer-discuss-mmv' => 'Deixe o seu comentário',
);

/** Romanian (română)
 * @author Minisarm
 */
$messages['ro'] = array(
	'multimediaviewer-desc' => 'Extinde miniaturile la o dimensiune mai mare într-un cadru Lightbox.',
	'multimediaviewer-pref' => 'Vizualizator multimedia',
	'multimediaviewer-pref-desc' => 'Îmbunătățiți-vă experiența de vizualizare a conținutului multimedia cu această nouă unealtă. Afișează imaginile la dimensiune mare în cadrul paginilor care conțin miniaturi. Imaginile sunt afișate într-un cadru Lightbox mai simpatic, acestea putând fi, de asemenea, vizualizate la dimensiunea reală.',
	'multimediaviewer-file-page' => 'Du-te la pagina asociată fișierului',
	'multimediaviewer-repository' => 'Mai multe la $1',
	'multimediaviewer-datetime-created' => 'Creată la $1',
	'multimediaviewer-datetime-uploaded' => 'Încărcată la $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|Încărcată}} de $1',
	'multimediaviewer-license-cc-pd' => 'Domeniu public',
	'multimediaviewer-license-default' => 'Vezi licența',
	'multimediaviewer-use-file' => 'Utilizează acest fișier',
	'multimediaviewer-use-file-owt' => 'Utilizați acest fișier în cadrul unei pagini wiki, ca miniatură',
	'multimediaviewer-use-file-own' => 'Utilizați acest fișier în cadrul unei pagini wiki, în linie cu textul',
	'multimediaviewer-use-file-offwiki' => 'Utilizați acest fișier pe un alt site web',
	'multimediaviewer-about-mmv' => 'Despre Vizualizatorul multimedia',
	'multimediaviewer-discuss-mmv' => 'Lăsați o părere',
);

/** Russian (русский)
 * @author Kaganer
 * @author Okras
 */
$messages['ru'] = array(
	'multimediaviewer-desc' => 'Раскрывает эскизы в большие изображения внутри лайтбокса.',
	'multimediaviewer-pref' => 'Медиа-просмотрщик',
	'multimediaviewer-pref-desc' => 'Улучшает просмотр мультимедиа-файлов новым инструментом. Он раскрывает эскизы в большие изображения внутри лайтбокса. Изображения показываются в более красивом лайтбоксе, а также могут быть открыты в оригинальном разрешении.',
	'multimediaviewer-file-page' => 'Перейти на страницу соответствующего файла',
	'multimediaviewer-repository' => 'Подробнее на $1',
	'multimediaviewer-datetime-created' => 'Создано в $1',
	'multimediaviewer-datetime-uploaded' => 'Загружено в $1',
	'multimediaviewer-userpage-link' => 'Загружено {{GENDER:$2|участником|участницей}} $1',
	'multimediaviewer-license-cc-pd' => 'Общественное достояние',
	'multimediaviewer-license-default' => 'Посмотр лицензии',
	'multimediaviewer-use-file' => 'Использовать этот файл',
	'multimediaviewer-use-file-owt' => 'Использовать этот файл на вики-странице, с уменьшенной копией',
	'multimediaviewer-use-file-own' => 'Использовать этот файл на вики-странице, в полный размер',
	'multimediaviewer-use-file-offwiki' => 'Использовать этот файл на другом сайте',
	'multimediaviewer-about-mmv' => 'О Медиа-просмотрщике',
	'multimediaviewer-discuss-mmv' => 'Оставить отзыв',
);

/** Slovenian (slovenščina)
 * @author Eleassar
 */
$messages['sl'] = array(
	'multimediaviewer-desc' => 'Razširitev sličic v prikazovalniku.',
	'multimediaviewer-pref' => 'Predstavnostni pregledovalnik',
	'multimediaviewer-pref-desc' => 'S tem orodjem lahko izboljšate svojo izkušnjo pri ogledovanju predstavnostnih vsebin. Orodje prikazuje slike na straneh s sličicami v večji velikosti in v lepšem okvirčku Lightbox, mogoč pa je tudi celozaslonski prikaz.',
	'multimediaviewer-file-page' => 'Pojdi na pripadajočo opisno stran datoteke.',
	'multimediaviewer-repository' => 'Več o $1',
	'multimediaviewer-datetime-created' => 'Ustvarjeno: $1',
	'multimediaviewer-datetime-uploaded' => 'Naloženo: $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|Naložil|Naložila}}: $1',
	'multimediaviewer-license-cc-pd' => 'javna last',
	'multimediaviewer-license-default' => 'Prikaz licence',
	'multimediaviewer-use-file' => 'Uporaba datoteke',
	'multimediaviewer-use-file-owt' => 'Uporaba datoteke kot sličice na wikistrani',
	'multimediaviewer-use-file-own' => 'Uporaba datoteke znotrajvrstično na wikistrani',
	'multimediaviewer-use-file-offwiki' => 'Uporaba datoteke na drugi spletni strani',
	'multimediaviewer-about-mmv' => 'O Predstavnostnem pregledovalniku',
	'multimediaviewer-discuss-mmv' => 'Pustite povratno informacijo',
);

/** Serbian (Cyrillic script) (српски (ћирилица)‎)
 * @author Milicevic01
 */
$messages['sr-ec'] = array(
	'multimediaviewer-datetime-created' => 'Направљено $', # Fuzzy
);

/** Swedish (svenska)
 * @author Ainali
 * @author NH
 * @author WikiPhoenix
 */
$messages['sv'] = array(
	'multimediaviewer-pref' => 'Mediavisare',
	'multimediaviewer-pref-desc' => 'Förbättrad visning av bilder. Istället för bildbeskrivningssidan visas bilden på ett ljusbord när du klickar på den. Miniatyrer visas i större storlek.',
	'multimediaviewer-file-page' => 'Gå till motsvarande filsida',
	'multimediaviewer-repository' => 'Läs mer på $1',
	'multimediaviewer-datetime-created' => 'Skapades $1',
	'multimediaviewer-datetime-uploaded' => 'Laddades upp $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|Uppladdad}} av $1',
	'multimediaviewer-license-cc-pd' => 'Allmän egendom',
	'multimediaviewer-license-default' => 'Visa licens',
	'multimediaviewer-use-file' => 'Använd denna fil',
	'multimediaviewer-use-file-owt' => 'Använd denna fil på en wikisida, som en miniatyr',
	'multimediaviewer-use-file-offwiki' => 'Använd denna fil på en annan webbplats',
	'multimediaviewer-about-mmv' => 'Om Mediavisaren',
	'multimediaviewer-discuss-mmv' => 'Ge återkoppling',
);

/** Turkish (Türkçe)
 * @author Incelemeelemani
 * @author Rapsar
 */
$messages['tr'] = array(
	'multimediaviewer-pref' => 'Ortam Görüntüleyici',
	'multimediaviewer-pref-desc' => 'Bu yeni araçla multimedya görüntüleme deneyiminizi geliştirin. Bu sayede küçük sayfaları daha büyük boyutlarda görüntüleyebilirsiniz. Ayrıca görüntüler Lightbox (açılır pencere) olarak ve tam boyutlu gösterilir.',
	'multimediaviewer-about-mmv' => 'Ortam Görüntüleyici hakkında',
);

/** Ukrainian (українська)
 * @author Andriykopanytsia
 */
$messages['uk'] = array(
	'multimediaviewer-desc' => 'Розгорнути мініатюри в більшому розмірі у лайтбоксі.',
	'multimediaviewer-pref' => 'Медіа переглядач',
	'multimediaviewer-pref-desc' => 'Поліпшити ваші враження від перегляду мультимедіа з цим новим інструментом. Він відображає зображення у більшому розмірі на сторінках, які мають ескізи. Зображення показані у кращому накладенні і також відображаються в натуральну величину.',
	'multimediaviewer-file-page' => 'Перейти на сторінку відповідного файлу',
	'multimediaviewer-repository' => 'Дізнайтеся більше на $1',
	'multimediaviewer-datetime-created' => 'Створено $1',
	'multimediaviewer-datetime-uploaded' => 'Завантажено $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|Завантажив|Завантажила}} $1',
	'multimediaviewer-license-cc-pd' => 'Суспільне надбання',
	'multimediaviewer-license-default' => 'Перегляд ліцензії',
	'multimediaviewer-use-file' => 'Використовувати цей файл',
	'multimediaviewer-use-file-owt' => 'Використовувати цей файл на вікі-сторінці у вигляді мініатюри',
	'multimediaviewer-use-file-own' => 'Використовувати цей файл на вікі-сторінці у тексті',
	'multimediaviewer-use-file-offwiki' => 'Використовувати цей файл на іншому веб-сайті',
	'multimediaviewer-about-mmv' => 'Про медіапереглядач',
	'multimediaviewer-discuss-mmv' => 'Залишити відгук',
);

/** Vietnamese (Tiếng Việt)
 * @author Minh Nguyen
 */
$messages['vi'] = array(
	'multimediaviewer-desc' => 'Mở các hình nhỏ lớn hơn trong cửa sổ Lightbox.',
	'multimediaviewer-pref' => 'Cửa sổ phương tiện',
	'multimediaviewer-pref-desc' => 'Cải thiện trải nghiệm xem phương tiện của bạn với công cụ mới này. Nó mở rộng các hình nhỏ để phủ lên toàn cửa sổ. Các hình ảnh được hiển thị trong panel Lightbox đẹp đẽ và cũng có thể xem kích thước gốc.',
	'multimediaviewer-file-page' => 'Mở trang ứng với tập tin',
	'multimediaviewer-repository' => 'Tìm hiểu thêm về $1',
	'multimediaviewer-datetime-created' => 'Được tạo vào $1',
	'multimediaviewer-datetime-uploaded' => 'Được tải lên vào $1',
	'multimediaviewer-userpage-link' => 'Do $1 {{GENDER:$2}}tải lên',
	'multimediaviewer-credit' => '$1 – $2',
	'multimediaviewer-license-cc-pd' => 'Phạm vi công cộng',
	'multimediaviewer-license-default' => 'Xem giấy phép',
	'multimediaviewer-use-file' => 'Sử dụng tập tin này',
	'multimediaviewer-use-file-owt' => 'Sử dụng hình nhỏ của tập tin này trên một trang wiki',
	'multimediaviewer-use-file-own' => 'Sử dụng tập tin này trong dòng trên một trang wiki',
	'multimediaviewer-use-file-offwiki' => 'Sử dụng tập tin này trên một trang Web khác',
	'multimediaviewer-about-mmv' => 'Giới thiệu về Cửa sổ phương tiện',
	'multimediaviewer-discuss-mmv' => 'Gửi phản hồi',
);

/** Volapük (Volapük)
 * @author Malafaya
 */
$messages['vo'] = array(
	'multimediaviewer-datetime-created' => 'Pejafon tü $1',
	'multimediaviewer-datetime-uploaded' => 'Pelöpükon tü $1',
);

/** Simplified Chinese (中文（简体）‎)
 * @author Liuxinyu970226
 * @author Qiyue2001
 * @author Shizhao
 * @author Xiaomingyan
 */
$messages['zh-hans'] = array(
	'multimediaviewer-desc' => '在Lightbox视图中以较大的尺寸显示缩略图。',
	'multimediaviewer-pref' => '媒体文件查看器',
	'multimediaviewer-pref-desc' => '使用这个新工具可以改善你的多媒体浏览体验。它能以更大的尺寸显示页面中的缩略图。图像将显示于一个漂亮的Lightbox视图中，并能以完整尺寸查看。',
	'multimediaviewer-file-page' => '转到相应的文件页',
	'multimediaviewer-repository' => '在$1了解详情',
	'multimediaviewer-datetime-created' => '创作时间：$1',
	'multimediaviewer-datetime-uploaded' => '上传时间：$1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|上传者}}：$1',
	'multimediaviewer-license-cc-pd' => '公共领域',
	'multimediaviewer-license-default' => '查看许可协议',
	'multimediaviewer-use-file' => '使用此文件',
	'multimediaviewer-use-file-owt' => '在wiki页面上插入本文件的缩略图',
	'multimediaviewer-use-file-own' => '在wiki页面上直接插入本文件',
	'multimediaviewer-use-file-offwiki' => '在其他网站使用本文件',
	'multimediaviewer-about-mmv' => '关于媒体文件查看器',
	'multimediaviewer-discuss-mmv' => '留下反馈意见',
);
