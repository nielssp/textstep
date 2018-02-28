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

    public function __construct(\Blogstep\Files\File $buildDir, SiteMap $siteMap, Content\ContentTree $contentTree, FilterSet $filterSet, \Blogstep\Config\Config $config)
    {
        $this->buildDir = $buildDir;
        $this->siteMap = $siteMap;
        $this->content = $contentTree;
        $this->config = $config;
        $this->filterSet = $filterSet;
        $this->view = new View($this);
        $this->view->addTemplateDir($this->buildDir->get('site')->getHostPath());
        $this->view->addTemplateDir($this->buildDir->get('/site')->getHostPath());
    }

    public function getBuildDir()
    {
        return $this->buildDir;
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

    public function assemble($path)
    {
        $node = $this->siteMap->get($path);
        $target = $this->buildDir->get('output/' . $path);
        $target->getParent()->makeDirectory(true);
        switch ($node['handler']) {
            case 'eval':
                $args = $node['data'];
                $template = array_shift($args);
                $this->view->currentPath = $path;
                $this->view->data->evalArgs = $args;
                $html = $this->view->render($template);
                $target->putContents($html);
                break;
            case 'copy':
                $target->get($node['data'][0])->copy($target);
                break;
            default:
                throw new \Blogstep\RuntimeException('Undefined site node handler: ' . $node['handler']);
        }
    }
}
