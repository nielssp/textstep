<?php
/* 
 * TEXTSTEP 
 * Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

use Blogstep\Compile\Filter;
use Blogstep\Compile\TemplateCompiler;
use Jivoo\Utilities;

$filter = new Filter();

$filter->output = function(TemplateCompiler $tc, $path, $content) {
    $ext = Utilities::getFileExtension($path);
    switch ($ext) {
        case 'html':
        case 'htm':
        case 'xml':
        case 'rss':
            return preg_replace('/^(?: +\n?|\n)/m', '', $content);
    }
    return $content;
};

return $filter;

