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

    public $currentNode = null;

    private $forceAbsolute = false;

    public function __construct(SiteAssembler $assembler)
    {
        parent::__construct(
            new \Jivoo\Http\Route\AssetScheme($assembler->getBuildDir()->getHostPath()),
            new \Jivoo\Http\Router()
        );
        $this->buildDir = $assembler->getBuildDir();
        $this->uriPrefix = rtrim($assembler->getConfig()->get('targetUri', ''), '/') . '/';
        $this->absPrefix = parse_url($this->uriPrefix, PHP_URL_PATH);
        $this->siteMap = $assembler->getSiteMap();
        $this->addTemplateDir($assembler->getBuildDir()->get('/site')->getHostPath());

        $this->data->config = $assembler->getConfig()->getData();
        $this->data->content = $assembler->getContent();

        foreach (['getNode', 'isCurrent', 'forceAbsoluteLinks', 'link', 'url', 'filter', 'forkArg'] as $f) {
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

    public function link($link = null, $absolute = false)
    {
        if (!isset($link)) {
            $link = $this->currentNode;
        }
        if (!($link instanceof SiteNode)) {
            $path = $link;
            $link = $this->siteMap->get($path);
            if (!isset($link)) {
                return '#not-found/' . $path;
            }
        }
        if ($link->getName() == 'index.html') {
            $link = $link->parent;
        }
        if ($absolute or $this->forceAbsolute or !$this->compiler->config->get('relativePaths', true)) {
            return $this->absPrefix . $link->getPath();
        }
        return $link->getRelativePath($this->currentNode);
    }

    public function url($link = null)
    {
        if (!isset($link)) {
            $link = $this->currentNode;
        }
        if (!($link instanceof SiteNode)) {
            $path = $link;
            $link = $this->siteMap->get($path);
            if (!isset($link)) {
                return '#not-found/' . $path;
            }
        }
        if ($link->getName() == 'index.html') {
            $link = $link->parent;
        }
        return $this->uriPrefix . $link->getPath();
    }

    public function filter(ContentNode $content, array $filters = [])
    {
        $dom = $content->createDom();
        $filters = array_merge($filters, $this->contentHandler->getDefaultFilters());
        $available = $this->contentHandler->getFilters();
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
            if (isset($available[$name])) {
                call_user_func_array($available[$name], array_merge(
                    [$this, $content, $dom],
                    $param
                ));
            }
        }
        return $dom->__toString();
    }

    public function forkArg()
    {

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
}
