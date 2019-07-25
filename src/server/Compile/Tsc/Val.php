<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile\Tsc;

abstract class Val
{
    abstract public function isTruthy();

    abstract public function equals(Val $other);

    public function getValues()
    {
        throw new \DomainException('Value is not iterable');
    }

    public function getEntries()
    {
        throw new \DomainException('Value is not iterable');
    }

    abstract public function toString();

    abstract public function getType();
}
