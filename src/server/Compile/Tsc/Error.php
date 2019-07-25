<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile\Tsc;

class Error extends \RuntimeException
{
    public $srcFile = null;

    public $srcLine = null;

    public $srcColumn = null;

    public function __construct($message, $line = null, $column = null)
    {
        parent::__construct($message);
        $this->srcLine = $line;
        $this->srcColumn = $column;
    }
}
