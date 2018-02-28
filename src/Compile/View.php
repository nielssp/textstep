<?php
// BlogSTEP
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile;

/**
 * Description of View
 */
class View extends \Jivoo\View\View
{
    private $siteMap;

    private $uriPrefix;

    private $absPrefix;

    private $contentHandler;

    private $buildDir;

    public $currentPath = null;

    private $forceAbsolute = false;
    
    private $assembler;

    private $filterSet;

    public function __construct(SiteAssembler $assembler)
    {
        parent::__construct(
            new \Jivoo\Http\Route\AssetScheme($assembler->getBuildDir()->getHostPath()),
            new \Jivoo\Http\Router()
        );
        $this->assembler = $assembler;
        $this->filterSet = $assembler->getFilterSet();
        $this->buildDir = $assembler->getBuildDir();
        $this->uriPrefix = rtrim($assembler->getConfig()->get('targetUri', ''), '/') . '/';
        $this->absPrefix = rtrim(parse_url($this->uriPrefix, PHP_URL_PATH), '/');
        $this->siteMap = $assembler->getSiteMap();
        $this->addTemplateDir($assembler->getBuildDir()->get('/site')->getHostPath());

        $this->data->config = $assembler->getConfig()->getData();
        $this->data->content = $assembler->getContent();

        foreach (['isCurrent', 'forceAbsoluteLinks', 'link', 'url', 'filter'] as $f) {
            $this->addFunction($f, [$this, $f]);
        }
    }
    
    public function __get($property)
    {
        switch ($property) {
            case 'assembler':
            case 'uriPrefix':
            case 'absPrefix':
                return $this->$property;
        }
        return parent::__get($property);
    }
    
    private function getRelativePath($destination)
    {
        $path = explode('/', ltrim($destination, '/'));
        $other = explode('/', $this->currentPath);
        while (true) {
            if (!isset($path[0]) or !isset($other[0]) or $path[0] !== $other[0]) {
                break;
            }
            array_shift($path);
            array_shift($other);
        }
        $relative = '';
        $ups = count($other) - 1;
        for ($i = 0; $i < $ups; $i++) {
            $relative .= '../';
        }
        $relative .= implode('/', $path);
        if ($relative == '') {
            return '.';
        }
        return $relative;
    }

    public function isCurrent($link)
    {
        if ($link instanceof Content\ContentNode) {
            $link = $link->link;
        }
        if (!isset($link)) {
            return false;
        }
        if ($this->currentPath != null and \Jivoo\Unicode::endsWith($this->currentPath, 'index.html')) {
            return ltrim($link, '/') === preg_replace('/\/index.html$/', '', $this->currentPath);
        }
        return ltrim($link, '/') === $this->currentPath;
    }

    public function forceAbsoluteLinks()
    {
        $this->forceAbsolute = true;
    }

    public function link($link = null, $absolute = false)
    {
        if (!isset($link)) {
            $link = $this->currentPath;
        }
        if ($link instanceof Content\ContentNode) {
            $content = $link;
            $link = $content->link;
            if (!isset($link)) {
                return '#not-found' . $content->path;
            }
        }
        if (\Jivoo\Unicode::endsWith($link, 'index.html')) {
            $link = preg_replace('/\/index.html$/', '', $link);
        }
        if ($absolute or $this->forceAbsolute or !$this->assembler->getConfig()->get('relativePaths', true)) {
            return $this->absPrefix . '/' . ltrim($link, '/');
        }
        return $this->getRelativePath($link);
    }

    public function url($link = null)
    {
        if (!isset($link)) {
            $link = $this->currentPath;
        }
        if ($link instanceof Content\ContentNode) {
            $content = $link;
            $link = $content->link;
            if (!isset($link)) {
                return '#not-found' . $content->path;
            }
        }
        if (\Jivoo\Unicode::endsWith($link, 'index.html')) {
            $link = preg_replace('/\/index.html$/', '', $link);
        }
        return $this->uriPrefix . '/' . $link;
    }

    public function filter(Content\ContentNode $content, array $filters = [])
    {
        $parameters = [];
        foreach ($filters as $name => $param) {
            if (is_int($name)) {
                $name = $param;
                $paramStart = strpos($name, '(');
                $param = [];
                if ($paramStart !== false) {
                    $param = substr($name, $paramStart + 1, -1);
                    $name = substr($name, 0, $paramStart);
                    $param = \Jivoo\Json::decode('[' . $param . ']');
                }
            }
            $parameters[$name] = $param;
        }
        $content = $content->getContent();
        $content = $this->filterSet->applyContentFilters($this, $content, $parameters);
        $content = $this->filterSet->applyDisplayTags($this, $content, $parameters);
        return $this->filterSet->applyDisplayFilters($this, $content, $parameters);
    }


    public function findTemplate($name)
    {
        if (\Jivoo\Utilities::isAbsolutePath($name)) {
            return array(
                'compiled' => false,
                'name' => $name,
                'file' => $this->buildDir->get($name)->getHostPath()
            );
        }
        return parent::findTemplate($name);
    }

    public function render($template, $data = array(), $withLayout = true)
    {
//        $this->resources->clear();
        $this->blocks->clear();
        $this->forceAbsolute = false;
        return parent::render($template, $data, $withLayout);
    }

    public static function html($tag, array $attributes = [])
    {
        $html = new \Jivoo\View\Html($tag);
        if (isset($attributes['innerText'])) {
            $html->html(\Jivoo\View\Html::h($attributes['innerText']));
            unset($attributes['innerText']);
        }
        if (isset($attributes['innerHtml'])) {
            $html->html($attributes['innerHtml']);
            unset($attributes['innerHtml']);
        }
        $html->attr($attributes);
        return $html->toString();
    }
}
