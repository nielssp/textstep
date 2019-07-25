<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile\Tsc;

class ArgTypeError extends ArgError
{
    public $expectedType;

    public function __construct($message, $index, $expectedType = null)
    {
        parent::__construct($message, $index);
        $this->expectedType = $expectedType;
    }
}

