<?php
/* 
 * BlogSTEP 
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

use Blogstep\Build\ContentNode;
use Blogstep\Build\View;
use SimpleHtmlDom\simple_html_dom;

return function (View $view, ContentNode $contentNode, simple_html_dom $dom) {
    $title = $dom->find('h1', 0);
    if (isset($title)) {
        $title->outertext = '';
    }
};