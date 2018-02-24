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

    public function __construct(\Blogstep\Files\File $buildDir, SiteMap $siteMap, Content\ContentTree $contentTree, \Blogstep\Config\Config $config)
    {
        $this->buildDir = $buildDir;
        $this->siteMap = $siteMap;
        $this->content = $contentTree;
        $this->config = $config;
        $this->view = new View($this);
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

    public function compile($path)
    {
        $node = $this->siteMap->get($path);
        $target = $this->buldDir->get('output' . $path);
        $target->getParent()->makeDirectory(true);
        switch ($node['handler']) {
            case 'eval':
                $args = $node['data'];
                $template = array_shift($args);
                $html = $this->view->render($this->buildDir->get($template)->getRealPath(), ['evalArgs' => $args]);
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
