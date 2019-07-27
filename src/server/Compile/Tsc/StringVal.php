<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile\Tsc;

class StringVal extends Val
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
        return $this->value !== '';
    }

    public function equals(Val $other)
    {
        return $other instanceof self and $other->value === $this->value;
    }

    public function compare(Val $other)
    {
        if ($other instanceof self) {
            if ($this->value < $other->value) {
                return -1;
            } else if ($this->value > $other->value) {
                return 1;
            }
            return 0;
        }
        return parent::compare($other);
    }

    public function get($offset)
    {
        if ($offset < 0 or $offset >= strlen($this->value)) {
            return NilVal::nil();
        }
        return new StringVal($this->value[$offset]);
    }

    public function toString()
    {
        return $this->value;
    }

    public function getType()
    {
        return 'string';
    }

    public function encode()
    {
        return $this->value;
    }
}
