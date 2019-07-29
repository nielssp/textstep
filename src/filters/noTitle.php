<?php
/* 
 * BlogSTEP 
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

use Blogstep\Compile\ContentCompiler;
use Blogstep\Compile\TemplateCompiler;
use Blogstep\Compile\Filter;
use Blogstep\Compile\Html;
use Blogstep\Files\File;
use Jivoo\Store\Document;

$filter = new Filter();

$filter->html = function (ContentCompiler $cc, File $file, Document $metadata, \simple_html_dom $dom) {
    $title = $dom->find('h1', 0);
    if (isset($title)) {
        $attr = $title->attr;
        if (!is_array($attr)) {
            $attr = [];
        }
        $title->outertext = ContentCompiler::displayTag('noTitle', array_merge($attr, ['innerText' => $title->innertext]));
    }
};

$filter['noTitle'] = function (TemplateCompiler $tc, $attr, $enabled) {
    if ($enabled) {
        return '';
    }
    return Html::html('h1', $attr);
};

return $filter;
