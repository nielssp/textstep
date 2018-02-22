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
        $contentBuildDir = $this->buildDir->get('.' . $file->getPath());
        if (!$contentBuildDir->makeDirectory(true)) {
            throw new \Blogstep\RuntimeException('Could not create build directory: ' . $contentBuildDir->getPath());
        }
        $name = $file->getName();
        if (Unicode::endsWith($name, '.html')) {
            $html = $file->getContents();
            $node = $this->templateCompiler->compile($html);
            if ($node->count() > 1) {
                // TODO: do something
            } else {
                $output = $node->__toString();
            }
        } elseif (preg_match('/\.([a-z0-9]+)\.php$/i', $name)) {
            
        } else {
            // nothing to do
        }
    }
}
