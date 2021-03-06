<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile\Tsc;

class LexerError extends Error
{
    public function __construct($message, $line, $column)
    {
        parent::__construct($message, $line, $column);
    }
}
