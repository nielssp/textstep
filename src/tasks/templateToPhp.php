<?php
/* 
 * BlogSTEP 
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

use Blogstep\Build\BlogstepMacros;
use Blogstep\Build\Compiler;
use Blogstep\Build\SiteNode;
use Jivoo\Unicode;
use Jivoo\View\Compile\TemplateCompiler;

$templateCompiler = new TemplateCompiler(true);
$macros = new BlogstepMacros();

$templateCompiler->addMacros($macros);

return function (SiteNode $node, Compiler $compiler) use ($templateCompiler, $macros) {
    if ($node instanceof Blogstep\Build\FileNode) {
        $name = $node->getName();
        if (Unicode::endsWith($name, '.html')) {
            $macros->siteNode = $node;
            $macros->compiler = $compiler;
            $template = $node->getFile();
            $dest = $node->getFile()->getParent()->get($name . '.php');
            $node->setFile($dest);
            $data = $templateCompiler->compile($template->getRealPath());
            $dest->putContents($data);
            if (isset($node->parent) and Unicode::startsWith($name, '_')) {
                $node->detach();
            }
        } elseif (preg_match('/\.([a-z0-9]+)\.php$/i', $name)) {
            if (Unicode::startsWith($name, '_')) {
                $node->detach();
            } else {
                $replacement = new \Blogstep\Build\FileNode($node->getFile());
                $replacement->setName(substr($name, 0, -4));
                $node->replaceWith($replacement);
            }
        }
    }
};