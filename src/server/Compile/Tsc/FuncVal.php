<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile\Tsc;

class FuncVal extends Val
{
    private $f;

    public function __construct(callable $f)
    {
        $this->f = $f;
    }

    public function apply(array $args, Env $dynamicEnv)
    {
        return $this->f($args, $dynamicEnv);
    }

    public function isTruthy()
    {
        return true;
    }

    public function equals(Val $other)
    {
        return $other instanceof self and $other->f === $this->f;
    }

    public function toString()
    {
        return '';
    }
}


