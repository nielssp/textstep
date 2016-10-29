<?php
/* 
 * BlogSTEP 
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

use Blogstep\Build\Compiler;
use Blogstep\Build\FileNode;
use Blogstep\Build\SiteNode;
use Jivoo\Utilities;

return function (SiteNode $node, Compiler $compiler, callable $visitChildren) {
    if ($node instanceof FileNode) {
        $ext = Utilities::getFileExtension($node->getName());
        $destName = preg_replace('/\.[^\.]+$/', '.min.' . $ext, $node->getName());
        $destFile = $node->getFile()->getParent()->get($destName);
        switch ($ext) {
            case 'js':
                $minifier = new MatthiasMullie\Minify\JS($node->getFile()->getRealPath());
                $minifier->minify($destFile->getRealPath());
                $node->setFile($destFile);
                break;
            case 'css':
                $minifier = new MatthiasMullie\Minify\CSS($node->getFile()->getRealPath());
                $minifier->minify($destFile->getRealPath());
                $node->setFile($destFile);
                break;
        }
    }
    $visitChildren();
};