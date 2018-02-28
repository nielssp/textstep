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

    /**
     * @var ContentMap
     */
    private $contentMap;

    /**
     * @var \Blogstep\Files\File
     */
    private $templateRoot = null;

    /**
     * @var FilterSet
     */
    private $filterSet;

    public function __construct(\Blogstep\Files\File $buildDir, SiteMap $siteMap, ContentMap $contentMap, FilterSet $filterSet)
    {
        $this->buildDir = $buildDir;
        $this->siteMap = $siteMap;
        $this->contentMap = $contentMap;
        $this->filterSet = $filterSet;
        $this->templateCompiler = new HtmlTemplateCompiler();
        $this->macros = new BlogstepMacros($siteMap, $contentMap);
        $this->templateCompiler->addMacros(new \Jivoo\View\Compile\DefaultMacros);
        $this->templateCompiler->addMacros($this->macros);
    }
    
    public function __get($property)
    {
        switch ($property)
        {
            case 'buildDir':
                return $this->$property;
        }
    }

    private function findRoot(\Blogstep\Files\File $file)
    {
        if ($file->isDirectory()) {
            if ($file->get('site.json')->isFile()) {
                return $file;
            } else if ($file->getParent() === $file) {
                return null;
            }
        }
        return $this->findRoot($file->getParent());
    }

    public function compile(\Blogstep\Files\File $file)
    {
        if ($file->isDirectory()) {
            foreach ($file as $child) {
                $this->compile($child);
            }
            return;
        }
        if (!isset($this->templateRoot) || !$file->isInside($this->templateRoot)) {
            $this->templateRoot = $this->findRoot($file);
            if (!isset($this->templateRoot)) {
                throw new \Blogstep\RuntimeException('File not inside valid template directory: ' . $file->getPath());
            }
        }
        $name = $file->getName();
        if (\Jivoo\Unicode::endsWith($name, '.html')) {
            $html = $file->getContents();
            $target = $this->buildDir->get('.' . $file->getPath() . '.php');
            $target->getParent()->makeDirectory(true);
            $path = $file->getRelativePath($this->templateRoot);
            $this->macros->targetTemplate = $path;
            if (!\Jivoo\Unicode::startsWith($name, '_')) {
                $this->siteMap->add($path, 'eval', [$path]);
                $this->macros->currentPath = $path;
            } else {
                $this->macros->currentPath = null;
            }
            $node = $this->templateCompiler->compile($html);
            $target->putContents($node->__toString());
        } elseif (preg_match('/\.([a-z0-9]+)\.php$/i', $name)) {
            $path = preg_replace('/\.php$/i', '', $file->getRelativePath($this->templateRoot));
            $this->siteMap->add($path, 'eval', [$path]);
        } else if (!\Jivoo\Unicode::startsWith($name, '_')) {
            $path = $file->getRelativePath($this->templateRoot);
            $file = $this->filterSet->applyFileFilters($this, $file);
            $this->siteMap->add($path, 'copy', [$file->getPath()]);
        }
    }
}
