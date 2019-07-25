<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile\Tsc;

class ArrayVal extends Val
{
    private $value;

    public function __construct(array $value)
    {
        $this->value = $value;
    }

    public function getValue()
    {
        return $this->value;
    }

    public function isTruthy()
    {
        return count($this->value) > 0;
    }

    public function equals(Val $other)
    {
        return $other instanceof self and $other->value === $this->value;
    }

    public function get($offset)
    {
        if ($offset < 0 or $offset >= count($this->value)) {
            return NilVal::nil();
        }
        return $this->value[$offset];
    }

    public function set($offset, Val $value)
    {
        if ($offset < 0 or $offset >= count($this->value)) {
            return;
        }
        $this->value[$offset] = $value;
    }

    public function getValues()
    {
        return $this->value;
    }

    public function getEntries()
    {
        $entries = [];
        foreach ($this->value as $key => $value) {
            $entries[] = [new IntVal($key), $value];
        }
        return $entries;
    }

    public function toString()
    {
        $strs = [];
        foreach ($this->value as $value) {
            $strs[] = $value->toString();
        }
        return implode(', ', $strs);
    }

    public function getType()
    {
        return 'array';
    }
}
