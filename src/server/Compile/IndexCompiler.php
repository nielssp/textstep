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

    public function __construct(SiteMap $siteMap, ContentMap $contentMap)
    {
        $this->siteMap = $siteMap;
        $this->contentMap = $contentMap;
    }
    

    public function compile(\Blogstep\Files\File $index)
    {
        try {
            $source = $index->getContents();
            $lexer = new Tsc\Lexer($source);
            $tokens = $lexer->readAllTokens(false);
            $parser = new Tsc\Parser($tokens, $index->getPath());
            $node = $parser->parse();
            $interpreter = new Tsc\Interpreter();
            $env = new Tsc\Env();
            $env->addModule('core', new Tsc\CoreModule(), true);
            $env->addModule('string', new Tsc\StringModule(), true);
            $env->addModule('collection', new Tsc\CollectionModule(), true);
            $env->addModule('time', new Tsc\TimeModule(), true);
            $env->addModule('contentmap', new Tsc\ContentMapModule($this->contentMap), true);
            $env->addModule('sitemap', new Tsc\SiteMapModule($this->siteMap, $index->getParent()), true);
            $interpreter->eval($node, $env);
        } catch (Tsc\Error $e) {
            throw new \RuntimeException($e->srcFile . ':' . $e->srcLine . ':' . $e->srcColumn . ': ' . $e->getMessage(), 0, $e);
        }
    }
}

