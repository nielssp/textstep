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

return function (SiteNode $node, Compiler $compiler, callable $visitChildren) use ($templateCompiler, $macros) {
    if ($node instanceof Blogstep\Build\FileNode) {
        $name = $node->getName();
        if (Unicode::endsWith($name, '.html')) {
            $macros->siteNode = $node;
            $template = $node->getFile();
            $dest = $node->getFile()->getParent()->get($name . '.php');
            $node->setFile($template);
            $data = $templateCompiler->compile($template->getRealPath());
            $dest->putContents($data);
        }
    }
    $visitChildren();
};