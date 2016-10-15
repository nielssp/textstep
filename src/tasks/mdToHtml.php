<?php
/* 
 * BlogSTEP 
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

use Blogstep\Build\Compiler;
use Blogstep\Build\SiteNode;

$parsedown = new Parsedown;

return function (SiteNode $node, Compiler $compiler, callable $visitChildren) use ($parsedown) {
    if ($node instanceof Blogstep\Build\ContentNode) {
        if ($node->getType() === 'md') {
            $markdown = $node->getContent()->getContents();
            $html = $parsedown->text($markdown);
            $file = $node->root->getBuildPath()->get($node->getPath() . '.content.html');
            $file->putContents($html);
            $node->setContent($file);
        }
    }
    $visitChildren();
};