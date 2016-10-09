<?php
/* 
 * BlogSTEP 
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

use Blogstep\Build\Compiler;
use Blogstep\Build\DirNode;
use Blogstep\Build\FileNode;
use Blogstep\Build\SiteNode;

return function (SiteNode $node, Compiler $compiler, callable $visitChildren) {
    if ($node instanceof FileNode) {
        $dest = $node->root->getBuildPath()->get($node->getPath());
        $node->getFile()->copy($dest);
        $node->setFile($dest);
    } elseif ($node instanceof DirNode) {
        $node->root->getBuildPath()->get($node->getPath())->makeDirectory();
    }
    $visitChildren();
};