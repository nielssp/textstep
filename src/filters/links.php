<?php
/* 
 * BlogSTEP 
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

use Blogstep\Compile\View;
use Blogstep\Compile\Filter;
use Jivoo\View\Html;

$filter = new Filter();

$filter->display = function (View $view, $content, array $parameters) {
    if (isset($parameters['linksAbsolute'])) {
        return $content;
    }
    return preg_replace_callback('/(src|href)\s*=\s*"bs:([^"]*)"/i', function ($matches) use ($view) {
        $link = $view->link($matches[2]);
        return $matches[1] . '="' . Html::h($link) . '"';
    }, $content);
};

return $filter;