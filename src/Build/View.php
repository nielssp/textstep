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
    
    private $compiler;
    
    private $uriPrefix;
    
    private $absPrefix;
    
    private $availableFilters;
    
    private $defaultFilters;
    
    public $currentNode = null;
    
    private $forceAbsolute = false;

    public function __construct(SiteMap $siteMap, Compiler $compiler)
    {
        parent::__construct(
            new \Jivoo\Http\Route\AssetScheme($siteMap->getBuildPath()->getRealPath()),
            new \Jivoo\Http\Router()
        );
        $this->compiler = $compiler;
        $this->uriPrefix = rtrim($compiler->config->get('targetUri', ''), '/') . '/';
        $this->absPrefix = parse_url($this->uriPrefix, PHP_URL_PATH);
        $this->siteMap = $siteMap;
        $this->addTemplateDir($siteMap->getBuildPath()->getRealPath());
        
        $this->data->config = $compiler->config->toArray();
        $this->data->content = $compiler->content;
        $this->availableFilters = $compiler->content->getFilters();
        $this->defaultFilters = $compiler->content->getDefaultFilters();
        
        foreach (['getNode', 'isCurrent', 'forceAbsoluteLinks', 'link', 'url', 'filter'] as $f) {
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
    
    public function forceAbsoluteLinks()
    {
        $this->forceAbsolute = true;
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
        if ($this->forceAbsolute or !$this->compiler->config->get('relativePaths', true)) {
            return $this->absPrefix . $link->getPath();
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
            $paramStart = strpos($name, '(');
            $param = [];
            if ($paramStart !== false) {
                $param = substr($name, $paramStart + 1, -1);
                $name = substr($name, 0, $paramStart);
                $param = \Jivoo\Json::decode('[' . $param . ']'); 
            }
            if (isset($this->availableFilters[$name])) {
                call_user_func_array($this->availableFilters[$name], array_merge(
                    [$this, $content, $dom],
                    $param
                ));
            }
        }
        return $dom->__toString();
    }
    
    public function render($template, $data = array(), $withLayout = true)
    {
        $this->forceAbsolute = false;
        return parent::render($template, $data, $withLayout);
    }
}
