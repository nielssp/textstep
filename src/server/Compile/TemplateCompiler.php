<?php
// BlogSTEP
// Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile;

/**
 * Compiles a single site node.
 */
class TemplateCompiler
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
    
    private $templateCache = [];

    private $uriPrefix;

    private $absPrefix;

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
        $this->uriPrefix = rtrim($this->config->get('websiteUri', ''), '/');
        $this->absPrefix = rtrim(parse_url($this->uriPrefix, PHP_URL_PATH), '/');
        $this->interpreter = new Tsc\Interpreter();
        $this->env = new Tsc\Env();
        $this->env->addModule('core', new Tsc\CoreModule(), true);
        $this->env->addModule('string', new Tsc\StringModule(), true);
        $this->env->addModule('collection', new Tsc\CollectionModule(), true);
        $timeZone = new \DateTimeZone($config->get('timeZone', date_default_timezone_get()));
        $this->env->addModule('time', new Tsc\TimeModule($timeZone), true);
        $this->env->addModule('contentmap', new Tsc\ContentMapModule($this->contentMap, $this->filterSet, $this->buildDir), true);
        $this->env->addModule('template', new Tsc\TemplateModule($this), true);
        $this->env->addModule('html', new Tsc\HtmlModule(), false);
        $this->env->let('CONFIG', Tsc\Val::from($this->config->toArray()));
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

    public function getEnv()
    {
        return $this->env;
    }

    public function getInterpreter()
    {
        return $this->interpreter;
    }

    public function getLink($link)
    {
        if (\Jivoo\Unicode::endsWith($link, 'index.html')) {
            $link = preg_replace('/\/index.html$/', '', $link);
        }
        return $this->absPrefix . '/' . ltrim($link, '/');
    }

    public function getUrl($link)
    {
        if (\Jivoo\Unicode::endsWith($link, 'index.html')) {
            $link = preg_replace('/\/index.html$/', '', $link);
        }
        return $this->uriPrefix . '/' . ltrim($link, '/');
    }


    public function getTemplate($template)
    {
        if (!isset($this->templateCache[$template])) {
            $source = $this->buildDir->get($template)->getContents();
            $lexer = new Tsc\Lexer($source, $template);
            $tokens = $lexer->readAllTokens(true);
            $parser = new Tsc\Parser($tokens, $template);
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
        try {
            switch ($node['handler']) {
                case 'tsc':
                    $this->env->let('PATH', new Tsc\StringVal($path));
                    $data = $node['data'];
                    $template = $this->getTemplate($data['TEMPLATE']);
                    $env = $this->env->openScope();
                    foreach ($data as $key => $value) {
                        $env->let($key, Tsc\Val::from($value));
                    }
                    $extension = strtolower(\Jivoo\Utilities::getFileExtension($data['TEMPLATE']));
                    if ($extension === 'html' or $extension === 'htm') {
                        $env->getModule('html')->importInto($env);
                    }
                    $object = $this->interpreter->eval($template, $env);
                    $layout = $env->get('LAYOUT');
                    if (isset($layout)) {
                        $layoutFile = $this->getBuildDir()->get($data['TEMPLATE'])
                                           ->getParent()
                                           ->get($layout->toString());
                        $layoutTemplate = $this->getTemplate($layoutFile->getPath());
                        $env->let('TEMPLATE', $layout);
                        $env->let('CONTENT', $object);
                        $object = $this->interpreter->eval($layoutTemplate, $env);
                    }
                    $target->getParent()->makeDirectory(true);
                    $target->putContents($object->toString());
                    $this->installMap->add($path, 'copy', [$target->getPath()]);
                    break;
                default:
                    $this->installMap->add($path, $node['handler'], $node['data']);
                    break;
            }
        } catch (Tsc\Error $e) {
            throw new \Blogstep\RuntimeException($e->srcFile . ':' . $e->srcLine . ':' . $e->srcColumn . ': ' . $e->getMessage(), 0, $e);
        }
    }
}
