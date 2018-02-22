<?php
// BlogSTEP
// Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile;

/**
 * Compiles a single template.
 */
class TemplateCompiler
{
    
    /**
     * @var \Blogstep\Files\File
     */
    private $buildDir;
    
    /**
     * @var HtmlTemplateCompiler
     */
    private $templateCompiler;
    
    /**
     * @var BlogstepMacros
     */
    private $macros;
    
    public function __construct(\Blogstep\Files\File $buildDir, \Psr\Log\LoggerInterface $log)
    {
        $this->buildDir = $buildDir;
        $this->handler = new \Blogstep\Build\ContentHandler();
        $this->templateCompiler = new HtmlTemplateCompiler();
        $this->macros = new BlogstepMacros();
        $this->templateCompiler->addMacros($this->macros);
    }

    public function compile(\Blogstep\Files\File $file)
    {
        $name = $file->getName();
        if (\Jivoo\Unicode::endsWith($name, '.html')) {
            $html = $file->getContents();
            $node = $this->templateCompiler->compile($html);
            if ($node->count() > 1) {
                foreach ($node->getChildren() as $child) {
                    if (!$child->hasProperty('target-path')) {
                        throw new \Blogstep\RuntimeException('Missing target path property');
                    }
                    // TODO: add to sitemap .. if property 'detach' or something not set
                    $target = $this->buildDir->get('.' . $child->getProperty('target-path') . '.php');
                    $target->getParent()->makeDirectory(true);
                    $target->putContents($child->__toString());
                }
            } else {
                // TODO: add to sitemap
                $target = $this->buildDir->get('.' . $file->getPath() . '.php');
                $target->getParent()->makeDirectory(true);
                $target->putContents($node->__toString());
            }
        } elseif (preg_match('/\.([a-z0-9]+)\.php$/i', $name)) {
            // TODO: add to sitemap (minus .php extension) unless starting with _ or .
            $target = $this->buildDir->get('.' . $file->getPath());
            $target->getParent()->makeDirectory(true);
            $file->copy($target);
        } else {
            // TODO: add to sitemap unless starting with _ or .
            $target = $this->buildDir->get('.' . $file->getPath());
            $target->getParent()->makeDirectory(true);
            $file->copy($target);
        }
    }
}
