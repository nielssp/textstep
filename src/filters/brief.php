<?php
/* 
 * BlogSTEP 
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

use Blogstep\Compile\View;
use Blogstep\Compile\ContentCompiler;
use Blogstep\Compile\Filter;
use Blogstep\Files\File;
use SimpleHtmlDom\simple_html_dom;

$filter = new Filter();

$filter->html = function (ContentCompiler $cc, File $file, simple_html_dom $dom) {
    $break = $dom->find('.break', 0);
    if (isset($break)) {
        $break->outertext = '<?bs brief ?>';
    }
};

$filter->content = function (View $view, $content, array $parameters) {
    if (isset($parameters['brief'])) {
        return explode('<?bs brief ?>', $content)[0];
    }
    return $content;
};

$filter['brief'] = function (View $view, $attr, $enabled) {
    return '';
};

return $filter;