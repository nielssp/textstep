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

    private $interpreter;

    private $env;

    public function __construct(SiteMap $siteMap, ContentMap $contentMap)
    {
        $this->siteMap = $siteMap;
        $this->contentMap = $contentMap;
        $this->interpreter = new Tsc\Interpreter();
        $this->env = new Tsc\Env();
        $this->env->addModule('core', new Tsc\CoreModule(), true);
        $this->env->addModule('string', new Tsc\StringModule(), true);
        $this->env->addModule('collection', new Tsc\CollectionModule(), true);
        $this->env->addModule('time', new Tsc\TimeModule(), true);
        $this->env->addModule('contentmap', new Tsc\ContentMapModule($this->contentMap), true);
        $this->env->addModule('sitemap', new Tsc\SiteMapModule($this->siteMap, $index->getParent()), true);
    }
    

    public function compile(\Blogstep\Files\File $index)
    {
        try {
            $source = $index->getContents();
            $lexer = new Tsc\Lexer($source);
            $tokens = $lexer->readAllTokens(false);
            $parser = new Tsc\Parser($tokens, $index->getPath());
            $node = $parser->parse();
            $this->interpreter->eval($node, $this->env->openScope());
        } catch (Tsc\Error $e) {
            throw new \RuntimeException($e->srcFile . ':' . $e->srcLine . ':' . $e->srcColumn . ': ' . $e->getMessage(), 0, $e);
        }
    }
}

