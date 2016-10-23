<?php
/* 
 * BlogSTEP 
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

use Blogstep\Build\ContentNode;
use Blogstep\Build\SiteNode;
use SimpleHtmlDom\simple_html_dom;

$attributes = ['src', 'href'];

return function (\Blogstep\Build\View $view, ContentNode $contentNode, simple_html_dom $dom) use ($attributes) {
    foreach ($attributes as $attribute) {
        foreach ($dom->find('[' . $attribute . '^=bs:]') as $element) {
            $path = preg_replace('/^bs:/', '', $element->getAttribute($attribute));
            $link = $view->currentNode->root->get($path);
            $element->setAttribute($attribute, $view->url($link));
        }
    }
};