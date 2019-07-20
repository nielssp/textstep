<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile\Tsc;

abstract class Val
{
    public abstract function isTruthy();

    public abstract function equals(Val $other);

    public function getValues()
    {
        throw new \DomainException('Value is not iterable');
    }

    public function getEntries()
    {
        throw new \DomainException('Value is not iterable');
    }

    public abstract function toString();
}

