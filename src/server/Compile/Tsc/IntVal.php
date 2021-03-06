<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile\Tsc;

class IntVal extends Val
{
    private $value;

    public function __construct($value)
    {
        $this->value = $value;
    }

    public function getValue()
    {
        return $this->value;
    }

    public function isTruthy()
    {
        return $this->value !== 0;
    }

    public function equals(Val $other)
    {
        return $other instanceof self and $other->value === $this->value;
    }

    public function compare(Val $other)
    {
        if ($other instanceof self) {
            return $this->value - $other->value;
        }
        return parent::compare($other);
    }

    public function toString()
    {
        return $this->value;
    }

    public function getType()
    {
        return 'int';
    }

    public function getIdentity()
    {
        return 'i:' . $this->value;
    }

    public function encode()
    {
        return $this->value;
    }
}
