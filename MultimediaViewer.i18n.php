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
	'multimediaviewer-desc' => 'Expand thumbnails in a larger size in a lightbox.',
	'multimediaviewer-pref' => 'Media Viewer',
	'multimediaviewer-pref-desc' => 'Improve your multimedia viewing experience with this new tool. It displays images in larger size on pages that have thumbnails. Images are shown in a nicer lightbox overlay, and can also be viewed in full-size.',
	'multimediaviewer-file-page' => 'Go to corresponding file page',
	'multimediaviewer-repository' => 'Learn more on $1',
	'multimediaviewer-datetime-created' => 'Created on $1',
	'multimediaviewer-datetime-uploaded' => 'Uploaded on $1',
	'multimediaviewer-userpage-link' => '{{GENDER:$2|Uploaded}} by $1',
	'multimediaviewer-credit' => '$1 - $2',
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
	'multimediaviewer-userpage-link' => 'Link to the user page for the uploader of the image. $1 is the username of the uploader, $2 is their gender.',
	'multimediaviewer-credit' => 'Credit line for images - $1 is HTML describing the authour, $2 is HTML describing the source. Neither are usernames, so GENDER is useless. Both come directly from the API, the extended metadata imageinfo prop in particular. They will usually be derived from the HTML output from wikitext on a file description page - however, no complicated HTML, only links, will be allowed.',
);

/** Arabic (العربية)
 * @author مشعل الحربي
 */
$messages['ar'] = array(
	'multimediaviewer-desc' => 'توسيع المصغرات إلى حجم أكبر في نافذة منبثقة.',
	'multimediaviewer-pref' => 'عارض الوسائط',
	'multimediaviewer-pref-desc' => 'حسن تجربة مشاهدة الوسائط المتعددة مع هذه الأداة الجديدة، حيث تعمل على عرض الصور بحجم أكبر على الصفحات التي تحتوي صورًا مصغرة. وتظهر الصور في صندوق منبثق أجمل، ويمكن أيضًا عرضها بالحجم الكامل.',
	'multimediaviewer-file-page' => 'الذهاب إلى الصفحة التابعة للملف',
);

/** Asturian (asturianu)
 * @author Xuacu
 */
$messages['ast'] = array(
	'multimediaviewer-desc' => 'Espande les miniatures a mayor tamañu nun visor.',
	'multimediaviewer-pref' => 'Visor de medios',
	'multimediaviewer-pref-desc' => 'Ameyore la esperiencia al ver multimedia con esta nueva ferramienta. Amuesa les imaxes a mayor tamañu nes páxines que tienen miniatures. Les imaxes vense nuna guapa capa de visor, y puen vese tamién a tamañu completu.',
	'multimediaviewer-file-page' => 'Dir a la páxina del ficheru correspondiente',
);

/** German (Deutsch)
 * @author Metalhead64
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
);

/** French (français)
 * @author Gomoko
 */
$messages['fr'] = array(
	'multimediaviewer-desc' => 'Ajoute une jolie visionneuse multimédia pour les images',
	'multimediaviewer-pref' => 'Activer un affichage des images plus joli',
	'multimediaviewer-pref-desc' => 'Active une jolie visionneuse multimédia pour les images dans les pages qui ont des vignettes. Utilise une bibliothèque tierce légère et JavaScript.',
	'multimediaviewer-file-page' => 'Aller à la page du fichier correspondant',
);

/** Galician (galego)
 * @author Toliño
 */
$messages['gl'] = array(
	'multimediaviewer-desc' => 'Engade un agradable visor de ficheiros multimedia para as imaxes',
	'multimediaviewer-pref' => 'Activar unha visualización das imaxes máis agradable',
	'multimediaviewer-pref-desc' => 'Activa un agradable visor de ficheiros multimedia para as imaxes nas páxinas que teñen miniaturas. Utiliza unha biblioteca lightbox de terceiros e JavaScript.',
	'multimediaviewer-file-page' => 'Ir á páxina de ficheiro correspondente',
);

/** Japanese (日本語)
 * @author Shirayuki
 */
$messages['ja'] = array(
	'multimediaviewer-desc' => '縮小画像を lightbox 内に拡大表示する',
	'multimediaviewer-pref' => 'メディア ビューアー',
	'multimediaviewer-pref-desc' => 'この新しいツールは、マルチメディアの表示体験を改善します。縮小画像があるページで、その画像をより大きなサイズで表示します。画像は lightbox オーバーレイ内に表示され、完全なサイズで表示させることもできます。',
	'multimediaviewer-file-page' => '対応するファイル ページに移動',
	'multimediaviewer-repository' => '$1の詳細情報',
);

/** Korean (한국어)
 * @author Hym411
 */
$messages['ko'] = array(
	'multimediaviewer-desc' => '사진을 위한 더 편리한 멀티미디어 뷰어를 추가',
	'multimediaviewer-pref' => '더 나은 사진 보기 활성화',
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
);

/** Russian (русский)
 * @author Okras
 */
$messages['ru'] = array(
	'multimediaviewer-desc' => 'Раскрывает эскизы в большие изображения внутри лайтбокса.',
	'multimediaviewer-pref' => 'Медиа-просмотрщик',
	'multimediaviewer-pref-desc' => 'Улучшает просмотр мультимедиа-файлов новым инструментом. Он раскрывает эскизы в большие изображения внутри лайтбокса. Изображения показываются в более красивом лайтбоксе, а также могут быть открыты в оригинальном разрешении.',
	'multimediaviewer-file-page' => 'Перейти на страницу соответствующего файла',
	'multimediaviewer-repository' => 'Подробнее на $1',
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
