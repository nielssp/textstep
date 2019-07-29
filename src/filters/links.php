<?php
/* 
 * BlogSTEP 
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

use Blogstep\Compile\TemplateCompiler;
use Blogstep\Compile\Filter;
use Blogstep\Compile\Html;

$filter = new Filter();

$filter->display = function (TemplateCompiler $tc, $content, array $parameters) {
    if (isset($parameters['linksAbsolute'])) {
        return $content;
    }
    return preg_replace_callback('/(src|href)\s*=\s*"bs:([^"]*)"/i', function ($matches) use ($tc) {
        $link = $tc->getLink($matches[2]);
        return $matches[1] . '="' . Html::h($link) . '"';
    }, $content);
};

return $filter;
