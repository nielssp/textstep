<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile\Tsc;

class ArgError extends Error
{
    public $index;

    public function __construct($message, $index)
    {
        parent::__construct($message);
        $this->index = $index;
    }
}

