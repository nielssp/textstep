<?php
// BlogSTEP
// Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile;

/**
 * Compiles a single site node.
 */
class TemplateCompiler2
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
     * @var ContentMap
     */
    private $contentMap;

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

    private $templateCache = [];

    private $interpreter;

    private $env;

    public function __construct(\Blogstep\Files\File $buildDir, SiteMap $installMap, SiteMap $siteMap, ContentMap $contentMap, FilterSet $filterSet, \Jivoo\Store\Config $config)
    {
        $this->buildDir = $buildDir;
        $this->installMap = $installMap;
        $this->siteMap = $siteMap;
        $this->contentMap = $contentMap;
        $this->config = $config;
        $this->filterSet = $filterSet;
        $this->assetScheme = new \Jivoo\Http\Route\AssetScheme($buildDir->getHostPath());
        $this->router = new \Jivoo\Http\Router();
        $this->interpreter = new Tsc\Interpreter();
        $this->env = new Tsc\Env();
        $this->env->addModule('core', new Tsc\CoreModule(), true);
        $this->env->addModule('string', new Tsc\StringModule(), true);
        $this->env->addModule('collection', new Tsc\CollectionModule(), true);
        $this->env->addModule('time', new Tsc\TimeModule(), true);
        $this->env->addModule('contentmap', new Tsc\ContentMapModule($this->contentMap), true);
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

    public function getTemplate($template)
    {
        if (!isset($this->templateCache[$template])) {
            $source = $this->buildDir->get($template)->getContents();
            $lexer = new Tsc\Lexer($source);
            $tokens = $lexer->readAllTokens(true);
            $parser = new Tsc\Parser($tokens, $index->getPath());
            $this->templateCache[$template] = $parser->parse();
        }
        return $this->templateCache[$template];
    }

    public function assemble($path)
    {
        $node = $this->siteMap->get($path);
        if (!isset($node)) {
            trigger_error('Site node not found: ' . $path, E_USER_WARNING);
            return;
        }
        $target = $this->buildDir->get('output/' . $path);
        switch ($node['handler']) {
            case 'tsc':
                $data = $node['data'];
                $data['PATH'] = $path;
                $template = $this->getTemplate($data['TEMPLATE']);
                $env = $this->env->openScope();
                foreach ($data as $key => $value) {
                    $env->set($key, Tsc\Val::from($value));
                }
                $object = $this->interpreter->eval($node, $env);
                $target->getParent()->makeDirectory(true);
                $target->putContents($object);
                $this->installMap->add($path, 'copy', [$target->getPath()]);
                break;
            default:
                $this->installMap->add($path, $node['handler'], $node['data']);
                break;
        }
    }
}
