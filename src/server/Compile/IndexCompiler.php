<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile;

class IndexCompiler
{

    /**
     * @var SiteMap
     */
    private $siteMap;

    /**
     * @var ContentMap
     */
    private $contentMap;

    private $filterSet;

    private $config;

    private $interpreter;

    private $env;

    public function __construct(SiteMap $siteMap, ContentMap $contentMap, FilterSet $filterSet, \Jivoo\Store\Config $config)
    {
        $this->siteMap = $siteMap;
        $this->contentMap = $contentMap;
        $this->filterSet = $filterSet;
        $this->config = $config;
        $this->interpreter = new Tsc\Interpreter();
        $this->env = new Tsc\Env();
        $this->env->addModule('core', new Tsc\CoreModule(), true);
        $this->env->addModule('string', new Tsc\StringModule(), true);
        $this->env->addModule('collection', new Tsc\CollectionModule(), true);
        $timeZone = new \DateTimeZone($config->get('timeZone', date_default_timezone_get()));
        $this->env->addModule('time', new Tsc\TimeModule($timeZone), true);
        $this->env->let('CONFIG', Tsc\Val::from($this->config->toArray()));
    }
    

    public function compile(\Blogstep\Files\File $index)
    {
        try {
            $source = $index->getContents();
            $lexer = new Tsc\Lexer($source, $index->getPath());
            $tokens = $lexer->readAllTokens(false);
            $parser = new Tsc\Parser($tokens, $index->getPath());
            $node = $parser->parse();
            $this->env->addModule('sitemap', new Tsc\SiteMapModule($this->siteMap, $this->filterSet, $index->getParent()), true);
            $this->env->addModule('contentmap', new Tsc\ContentMapModule($this->contentMap, $index->getParent()), true);
            $this->interpreter->eval($node, $this->env->openScope());
        } catch (Tsc\Error $e) {
            throw new \RuntimeException($e->srcFile . ':' . $e->srcLine . ':' . $e->srcColumn . ': ' . $e->getMessage(), 0, $e);
        }
    }
}

