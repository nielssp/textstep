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
    if (!isset($parameters['linksAbsolute'])) {
        return $content;
    }
    return preg_replace_callback('/(src|href)\s*=\s*"(bs|asset):([^"]*)"/i', function ($matches) use ($tc) {
        if ($matches[2] === 'bs') {
            $link = $tc->getUrl($matches[3]);
        } else {
            $contentNode = $tc->getContentMap()->get($matches[3]);
            if (isset($contentNode)) {
                $link = $contentNode->link;
                if (isset($link)) {
                    $link = $tc->getUrl($link);
                } else {
                    $assetPath = $contentNode->assetPath;
                    if (isset($assetPath)) {
                        $path = 'assets/' . $assetPath;
                        $file = $tc->getBuildDir()->get($contentNode->path);
                        $tc->getInstallMap()->add($path, 'copy', [$file->getPath()]);
                        $link = $tc->getUrl($path);
                    } else {
                        $link =  '#no-path:' . $matches[3];
                    }
                }
            } else {
                $link = '#not-found:' . $matches[3];
            }
        }
        return $matches[1] . '="' . Html::h($link) . '"';
    }, $content);
};

return $filter;
