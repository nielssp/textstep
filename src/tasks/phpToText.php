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
        $uriPrefix = rtrim($compiler->config->get('targetUri', ''), '/') . '/';
        $view = new Blogstep\Build\View($node->root, $uriPrefix);
        $view->data->config = $compiler->config->toArray();
        $view->data->content = $compiler->content;
        $availableFilters = $compiler->content->getFilters();
        $defaultFilters = $compiler->content->getDefaultFilters();
        $view->addFunction('filter', function (Blogstep\Build\ContentNode $content, array $filters = []) use ($view, $availableFilters, $defaultFilters) {
            $dom = $content->createDom();
            $filters = array_merge($filters, $defaultFilters);
            foreach ($filters as $name) {
                if (isset($availableFilters[$name])) {
                    call_user_func($availableFilters[$name], $view, $content, $dom);
                }
            }
            return $dom->__toString();
        });
    }
    if ($node instanceof \Blogstep\Build\FileNode) {
        $name = $node->getFile()->getPath();
        if (Jivoo\Unicode::endsWith($name, '.php')) {
            $path = $node->getPath();
            $view->currentNode = $node;
            $html = $view->render($path);
            $file = $node->root->getBuildPath()->get($path);
            $file->putContents($html);
            $node->setFile($file);
        }
    }
    $visitChildren();
};