<?php
// BlogSTEP
// Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile;

/**
 * Compiles a single site node.
 */
class SiteAssembler
{

    /**
     * @var \Blogstep\Files\File
     */
    private $buildDir;

    /**
     * @var SiteMap
     */
    private $installMap;

    /**
     * @var SiteMap
     */
    private $siteMap;

    /**
     * @var Content\ContentTree
     */
    private $content;

    /**
     * @var View
     */
    private $view;

    /**
     * @var \Blogstep\Config\Config
     */
    private $config;

    /**
     * @var FilterSet
     */
    private $filterSet;
    
    private $assetScheme;
    
    private $router;

    public function __construct(\Blogstep\Files\File $buildDir, SiteMap $installMap, SiteMap $siteMap, Content\ContentTree $contentTree, FilterSet $filterSet, \Jivoo\Store\Config $config)
    {
        $this->buildDir = $buildDir;
        $this->installMap = $installMap;
        $this->siteMap = $siteMap;
        $this->content = $contentTree;
        $this->config = $config;
        $this->filterSet = $filterSet;
        $this->assetScheme = new \Jivoo\Http\Route\AssetScheme($buildDir->getHostPath());
        $this->router = new \Jivoo\Http\Router();
    }

    public function getBuildDir()
    {
        return $this->buildDir;
    }

    public function getInstallMap()
    {
        return $this->installMap;
    }

    public function getSiteMap()
    {
        return $this->siteMap;
    }

    public function getContent()
    {
        return $this->content;
    }

    public function getConfig()
    {
        return $this->config;
    }

    public function getFilterSet()
    {
        return $this->filterSet;
    }
    
    public function getAssetScheme()
    {
        return $this->assetScheme;
    }
    
    public function getRouter()
    {
        return $this->router;
    }

    public function assemble($path)
    {
        $this->view = new View($this);
        $this->view->addTemplateDir($this->buildDir->get('site')->getHostPath());
        $this->view->addTemplateDir($this->buildDir->get('/site')->getHostPath());
        $node = $this->siteMap->get($path);
        if (!isset($node)) {
            trigger_error('Site node not found: ' . $path, E_USER_WARNING);
            return;
        }
        $target = $this->buildDir->get('output/' . $path);
        switch ($node['handler']) {
            case 'eval':
                $args = $node['data'];
                $template = array_shift($args);
                $this->view->currentPath = $path;
                $this->view->data->evalArgs = $args;
                $html = $this->view->render($template);
                $target->getParent()->makeDirectory(true);
                $target->putContents($html);
                $this->installMap->add($path, 'copy', [$target->getPath()]);
                break;
            default:
                $this->installMap->add($path, $node['handler'], $node['data']);
                break;
        }
    }
}
