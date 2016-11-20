<?php
/* 
 * BlogSTEP 
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

use Blogstep\Build\Compiler;
use Blogstep\Build\SiteNode;

$view = null;

return function (SiteNode $node, Compiler $compiler) use ($view) {
    if (! isset($view)) {
        $view = new Blogstep\Build\View($node->root, $compiler);
    }
    if ($node instanceof \Blogstep\Build\FileNode) {
        $name = $node->getFile()->getPath();
        if (Jivoo\Unicode::endsWith($name, '.php')) {
            $path = $node->getPath();
            $view->currentNode = $node;
            $html = $view->render($path, $node->getData());
            $file = $node->root->getBuildPath()->get($path);
            $file->putContents($html);
            $node->setFile($file);
        }
    }
};