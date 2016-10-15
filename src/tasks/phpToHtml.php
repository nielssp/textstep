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

return function (SiteNode $node, Compiler $compiler, callable $visitChildren) use ($view) {
    if (! isset($view)) {
        $assets = new \Jivoo\Http\Route\AssetScheme($node->getBuildPath());
        $router = new \Jivoo\Http\Router();
        $view = new Jivoo\View\View($assets, $router);
        $view->addTemplateDir($node->root->getBuildPath()->getRealPath());
        $view->data->content = $compiler->content;
        $view->addFunction('getContent', function ($name) use ($node) {
            return $node;
        });
        $view->addFunction('isCurrent', function ($link) {
            return false;
        });
        $view->addFunction('link', function ($link) {
            return '#';
        });
    }
    if ($node instanceof \Blogstep\Build\FileNode) {
        $name = $node->getFile()->getPath();
        if (Jivoo\Unicode::endsWith($name, '.html.php')) {
            $path = $node->getPath();
            $html = $view->render($path);
            $file = $node->root->getBuildPath()->get($path);
            $file->putContents($html);
            $node->setFile($file);
        }
    }
    $visitChildren();
};