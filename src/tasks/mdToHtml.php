<?php
/* 
 * BlogSTEP 
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

use Blogstep\Build\Compiler;
use Blogstep\Build\SiteNode;
use Jivoo\Unicode;

$parsedown = new Parsedown;

return function (SiteNode $node, Compiler $compiler, callable $visitChildren) use ($parsedown) {
    if ($node instanceof Blogstep\Build\ContentNode) {
        $name = $node->getFile()->getName();
        if (Unicode::endsWith($name, '.md')) {
            $markdown = $node->getFile()->getContents();
            $html = $parsedown->text($markdown);
            $file = $node->root->getBuildPath()->get($node->getPath() . '.html');
            $file->putContents($html);
        }
    }
    $visitChildren();
};