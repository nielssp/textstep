<?php
// BlogSTEP
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Build;

/**
 * Description of View
 */
class View extends \Jivoo\View\View
{
    private $siteMap;
    
    private $uriPrefix;
    
    private $availableFilters;
    
    private $defaultFilters;
    
    public $currentNode = null;

    public function __construct(SiteMap $siteMap, Compiler $compiler)
    {
        parent::__construct(
            new \Jivoo\Http\Route\AssetScheme($siteMap->getBuildPath()->getRealPath()),
            new \Jivoo\Http\Router()
        );
        $this->uriPrefix = rtrim($compiler->config->get('targetUri', ''), '/') . '/';
        $this->siteMap = $siteMap;
        $this->addTemplateDir($siteMap->getBuildPath()->getRealPath());
        
        $this->data->config = $compiler->config->toArray();
        $this->data->content = $compiler->content;
        $this->availableFilters = $compiler->content->getFilters();
        $this->defaultFilters = $compiler->content->getDefaultFilters();
        
        foreach (['getNode', 'isCurrent', 'link', 'url', 'filter'] as $f) {
            $this->addFunction($f, [$this, $f]);
        }
    }
    
    public function getNode($name)
    {
        return $this->siteMap->get($name);
    }
    
    public function isCurrent($link)
    {
        if (!($link instanceof SiteNode)) {
            $link = $this->siteMap->get($link);
        }
        if (!isset($link)) {
            return false;
        }
        if ($this->currentNode->getName() == 'index.html') {
            return $link === $this->currentNode->parent;
        }
        return $link === $this->currentNode;
    }
    
    public function link($link)
    {
        if (!($link instanceof SiteNode)) {
            $link = $this->siteMap->get($link);
        }
        if (!isset($link)) {
            return '#not-found';
        }
        if ($link->getName() == 'index.html') {
            $link = $link->parent;
        }
        return $link->getRelativePath($this->currentNode);
    }
    
    public function url($link) {
        if (!($link instanceof SiteNode)) {
            $link = $this->siteMap->get($link);
        }
        if (!isset($link)) {
            return '#not-found';
        }
        if ($link->getName() == 'index.html') {
            $link = $link->parent;
        }
        return $this->uriPrefix . $link->getPath();
    }
    
    public function filter(ContentNode $content, array $filters = []) {
        $dom = $content->createDom();
        $filters = array_merge($filters, $this->defaultFilters);
        foreach ($filters as $name) {
            if (isset($this->availableFilters[$name])) {
                call_user_func($this->availableFilters[$name], $this, $content, $dom);
            }
        }
        return $dom->__toString();
    }
}
