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
use Blogstep\Files\File;
use Jivoo\Store\Document;

$filter = new Filter();

$filter->html = function (ContentCompiler $cc, File $file, Document $metadata, \simple_html_dom $dom) {
    $break = $dom->find('.break', 0);
    if (isset($break)) {
        $break->outertext = '<?bs brief ?>';
        $metadata['has_break'] = true;
    }
};

$filter->content = function (TemplateCompiler $tc, $content, array $parameters) {
    if (isset($parameters['brief'])) {
        return explode('<?bs brief ?>', $content)[0];
    }
    return $content;
};

$filter['brief'] = function (TemplateCompiler $tc, $attr, $enabled) {
    return '';
};

return $filter;
