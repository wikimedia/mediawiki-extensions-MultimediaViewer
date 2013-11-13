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
	'multimediaviewer-datetime-created' => 'أنشئت في $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|رفع}} بواسطة $1',
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
);

/** Bengali (বাংলা)
 * @author Aftab1995
 */
$messages['bn'] = array(
	'multimediaviewer-pref' => 'মিডিয়া ভিউয়ার',
	'multimediaviewer-file-page' => 'সংশ্লিষ্ট ফাইল পৃষ্ঠাতে যান',
	'multimediaviewer-repository' => '$1-এ আরও জানুন',
	'multimediaviewer-datetime-created' => '$1-এ তৈরী হয়েছে',
	'multimediaviewer-datetime-uploaded' => '$1-এ আপলোডকৃত',
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

/** Chechen (нохчийн)
 * @author Умар
 */
$messages['ce'] = array(
	'multimediaviewer-discuss-mmv' => 'Язде хьайна хетарг',
);

/** Czech (čeština)
 * @author Mormegil
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
	'multimediaviewer-license-cc-pd' => 'Volné dílo',
	'multimediaviewer-license-default' => 'Informace o licenci', # Fuzzy
	'multimediaviewer-use-file' => 'Použít tento soubor',
	'multimediaviewer-use-file-owt' => 'Použít tento soubor na wiki, jako náhled',
	'multimediaviewer-use-file-own' => 'Použít tento soubor na wiki, uvnitř textu',
	'multimediaviewer-use-file-offwiki' => 'Použít tento soubor na jiné webové stránce',
	'multimediaviewer-about-mmv' => 'O prohlížeči médií',
	'multimediaviewer-discuss-mmv' => 'Sdělte svůj názor',
);

/** German (Deutsch)
 * @author Metalhead64
 * @author Snatcher
 */
$messages['de'] = array(
	'multimediaviewer-desc' => 'Vorschaubilder in einem Leuchtkasten vergrößern.',
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

/** Greek (Ελληνικά)
 * @author Astralnet
 */
$messages['el'] = array(
	'multimediaviewer-use-file' => 'Χρησιμοποιήστε αυτό το αρχείο',
	'multimediaviewer-about-mmv' => 'Περί το Media Viewer',
);

/** Spanish (español)
 * @author Benfutbol10
 * @author Fitoschido
 */
$messages['es'] = array(
	'multimediaviewer-pref' => 'Visor multimedia',
	'multimediaviewer-pref-desc' => 'Mejore su experiencia de visualización multimedia con esta herramienta. Muestra imágenes en mayor tamaño en páginas que tienen miniaturas. Las imágenes se muestran en una ventana superpuesta agradable que también le permite verlas en tamaño completo.',
	'multimediaviewer-file-page' => 'Ir a la página del archivo correspondiente',
	'multimediaviewer-repository' => 'Más información en $1',
	'multimediaviewer-datetime-created' => 'Creado el $1',
	'multimediaviewer-datetime-uploaded' => 'Subido el $1',
	'multimediaviewer-license-cc-pd' => 'Dominio público',
	'multimediaviewer-license-default' => 'Información de licencia', # Fuzzy
	'multimediaviewer-discuss-mmv' => 'Dejar comentarios',
);

/** Persian (فارسی)
 * @author Ebraminio
 */
$messages['fa'] = array(
	'multimediaviewer-pref' => 'نمایش‌دهندهٔ رسانه',
	'multimediaviewer-pref-desc' => 'تجربهٔ بازدید چندرسانه‌ای شما با این ابزار جدید بهبود می‌یابد و تصاویر را در اندازهٔ بزرگتر در صفحه‌هایی که بندانگشتی دارند نمایش می‌دهد. تصاویر در پوشش سبک زیباتری نمایش داده می‌شوند و همچنین می‌توانند در اندازهٔ اصلی نمایش داده شوند.',
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
 */
$messages['he'] = array(
	'multimediaviewer-desc' => 'הגדלת תמונות ממוזערות בשיטת לייטבוקס.',
	'multimediaviewer-pref' => 'מציג מדיה',
	'multimediaviewer-pref-desc' => 'הכלי החדש הזה משפר את חוויית המולטימדיה שלך. הוא מציג תמונות מוגדלות בדפים עם תמונות ממוזעזרות. התמונות מוצגות בשכבה בסגנון "לייטבוקס" וניתן להציג אותן גם בגודל מלא.',
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
 */
$messages['it'] = array(
	'multimediaviewer-desc' => 'Espandere le miniature in un dimensioni maggiori in un Lightbox.',
	'multimediaviewer-pref' => 'Media Viewer',
	'multimediaviewer-pref-desc' => 'Migliora la vostra esperienza di visione multimediale con questo nuovo strumento. Visualizza le immagini in dimensioni maggiori su pagine che hanno le miniature. Le immagini sono mostrate in un gradevole Lightbox e possono anche essere visualizzate a dimensione originale.',
	'multimediaviewer-file-page' => 'Vai alla corrispondente pagina del file',
	'multimediaviewer-repository' => 'Ulteriori informazioni su $1',
	'multimediaviewer-datetime-created' => 'Creato il $1',
	'multimediaviewer-datetime-uploaded' => 'Caricato il $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|Caricato}} da $1',
	'multimediaviewer-license-cc-pd' => 'Pubblico dominio',
	'multimediaviewer-license-default' => 'Informazioni sulla licenza', # Fuzzy
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

/** Korean (한국어)
 * @author Hym411
 */
$messages['ko'] = array(
	'multimediaviewer-desc' => '사진을 위한 더 편리한 멀티미디어 뷰어를 추가',
	'multimediaviewer-pref' => '더 나은 사진 보기 활성화',
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
	'multimediaviewer-license-cc-pd' => 'Јавна сопственост',
	'multimediaviewer-license-default' => 'Погл. лиценцата',
	'multimediaviewer-use-file' => 'Употребете ја податотекава',
	'multimediaviewer-use-file-owt' => 'Употребете ја податотекава на викистраница, како минијатура',
	'multimediaviewer-use-file-own' => 'Употребете ја податотекава на викистраница, во ред',
	'multimediaviewer-use-file-offwiki' => 'Употребете ја податотекава на друго место на интернет',
	'multimediaviewer-about-mmv' => 'За Медиумскиот прегледувач',
	'multimediaviewer-discuss-mmv' => 'Дајте мислење',
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
 * @author WTM
 */
$messages['pl'] = array(
	'multimediaviewer-repository' => 'Dowiedz się więcej o {{GRAMMAR:D.lp|$1}}',
	'multimediaviewer-datetime-created' => 'Utworzony $1',
	'multimediaviewer-datetime-uploaded' => 'Przesłany $1',
	'multimediaviewer-userpage-link' => 'Przesłany przez {{GENDER:$2|użytkownika|użytkowniczkę}} $1',
	'multimediaviewer-license-cc-pd' => 'Domena publiczna',
	'multimediaviewer-license-default' => 'Zobacz licencję',
	'multimediaviewer-use-file' => 'Użyj tego pliku',
	'multimediaviewer-use-file-owt' => 'Użyj tego pliku na stronie wiki, jako miniatura',
	'multimediaviewer-use-file-own' => 'Użyj tego pliku na stronie wiki, wewnątrz tekstu',
	'multimediaviewer-use-file-offwiki' => 'Użyj tego pliku na innej stronie internetowej',
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

/** Swedish (svenska)
 * @author Ainali
 * @author WikiPhoenix
 */
$messages['sv'] = array(
	'multimediaviewer-pref' => 'Mediavisare',
	'multimediaviewer-pref-desc' => 'Förbättra din multimediatittarupplevelse med detta nya verktyg. Den visar bilder i större storlek på sidor som har miniatyrer. Bilder visas i ett trevligare Ljuslådeöverlägg, och kan också ses i full storlek.',
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
 */
$messages['zh-hans'] = array(
	'multimediaviewer-desc' => '添加一个更美观的图像多媒体查看器', # Fuzzy
	'multimediaviewer-pref' => '媒体查看器',
	'multimediaviewer-pref-desc' => '启用更美观的多媒体查看器查看有缩略图的页面上的图像。使用第三方库Lightbox和JavaScript。', # Fuzzy
	'multimediaviewer-file-page' => '转到相应的文件页',
	'multimediaviewer-repository' => '了解更多关于$1',
);
