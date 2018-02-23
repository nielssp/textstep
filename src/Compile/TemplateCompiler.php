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

    /**
     * @var SiteMap
     */
    private $siteMap;
    
    public function __construct(\Blogstep\Files\File $buildDir, \Psr\Log\LoggerInterface $log, SiteMap $siteMap)
    {
        $this->buildDir = $buildDir;
        $this->handler = new \Blogstep\Build\ContentHandler();
        $this->templateCompiler = new HtmlTemplateCompiler();
        $this->macros = new BlogstepMacros($siteMap);
        $this->templateCompiler->addMacros($this->macros);
        $this->siteMap = $siteMap;
    }

    public function compile(\Blogstep\Files\File $file, $destination = null)
    {
        if (!isset($destination)) {
            // TODO: something
            $destination = preg_replace('/^\/site/', '', $file->getParent()->getPath());
        }
        $name = $file->getName();
        if (\Jivoo\Unicode::endsWith($name, '.html')) {
            $html = $file->getContents();
            $target = $this->buildDir->get('.' . $file->getPath() . '.php');
            $target->getParent()->makeDirectory(true);
            $this->templateCompiler->targetTemplate = $target;
            if (!\Jivoo\Unicode::startsWith($name, '_')) {
                $path = $destination . '/' . $name;
                $this->siteMap->add($path, 'eval', [$target->getPath()]);
                $this->templateCompiler->currentPath = $path;
            } else {
                $this->templateCompiler->currentPath = null;
            }
            $node = $this->templateCompiler->compile($html);
            $target->putContents($node->__toString());
        } elseif (preg_match('/\.([a-z0-9]+)\.php$/i', $name)) {
            $path = $destination . '/' . preg_replace('/\.php$/i', '', $name);
            $this->siteMap->add($path, 'eval', [$file->getPath()]);
        } else if (!\Jivoo\Unicode::startsWith($name, '_')) {
            $path = $destination . '/' . $name;
            $this->siteMap->add($path, 'copy', [$file->getPath()]);
        }
    }
}
