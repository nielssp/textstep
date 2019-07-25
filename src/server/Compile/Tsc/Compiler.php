<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile\Tsc;

class Compiler
{
    public function compile($source, $sourcePath, $path)
    {
        try {
            $lexer = new Lexer($source);
            $tokens = $lexer->readAllTokens();
            $parser = new Parser($tokens, $sourcePath);
            $node = $parser->parse();
            $interpreter = new Interpreter();
            $env = new Env();
            $env->addModule('core', new CoreModule(), true);
            $env->addModule('string', new StringModule(), true);
            $env->addModule('collection', new CollectionModule(), true);
            $env->addModule('time', new TimeModule(), true);
            $value = $interpreter->eval($node, $env);
        } catch (Error $e) {
            throw new \RuntimeException($e->srcFile . ':' . $e->srcLine . ':' . $e->srcColumn . ': ' . $e->getMessage());
        }
        return $value->toString();
    }
}
