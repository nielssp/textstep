<?php
/* 
 * BlogSTEP 
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

use Blogstep\Compile\ContentCompiler;
use Blogstep\Compile\Filter;
use Blogstep\Compile\View;
use Blogstep\Files\File;
use SimpleHtmlDom\simple_html_dom;

$filter = new Filter();

$filter->html = function (ContentCompiler $cc, File $file, simple_html_dom $dom) {
    $title = $dom->find('h1', 0);
    if (isset($title)) {
        $title->outertext = ContentCompiler::displayTag('noTitle', array_merge($title->attr, ['innerText' => $title->innertext]));
    }
};

$filter['noTitle'] = function (View $view, $attr, $enabled) {
    if ($enabled) {
        return '';
    }
    return View::html('h1', $attr);
};

return $filter;
