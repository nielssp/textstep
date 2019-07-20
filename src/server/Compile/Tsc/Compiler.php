<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile\Tsc;

class Compiler
{
    public function compile($source, $path)
    {
        $lexer = new Lexer($source);
        $tokens = $lexer->readAllTokens();
        $parser = new Parser($tokens);
        $node = $parser->parse();
        $interpreter = new Interpreter();
        $value = $interpreter->eval($node, new Env());
        return $value->toString();
    }
}
