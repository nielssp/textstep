<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile\Tsc;

class TypeError extends Error
{
    public function __construct($message, Node $node)
    {
        parent::__construct($message, $node->line, $node->column);
        $this->srcFile = $node->file;
    }
}

