<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile\Tsc;

class ObjectVal extends Val
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

    public function get($property)
    {
        if (isset($this->value[$property]) and $this->value[$property] instanceof Val) {
            return $this->value[$property];
        }
        return NilVal::nil();
    }

    public function has($property)
    {
        return isset($this->value[$property]);
    }

    public function set($property, Val $value)
    {
        $this->value[$property] = $value;
    }

    public function getKeys()
    {
        return array_map(function ($key) {
            return new StringVal($key);
        }, array_keys($this->value));
    }

    public function getValues()
    {
        return array_values($this->value);
    }

    public function getEntries()
    {
        $entries = [];
        foreach ($this->value as $key => $value) {
            $entries[] = [new StringVal($key), $value];
        }
        return $entries;
    }

    public function toString()
    {
        $strs = [];
        foreach ($this->value as $key => $value) {
            $strs[] = $key . ': ' . $value->toString();
        }
        return implode(', ', $strs);
    }

    public function getType()
    {
        return 'object';
    }

    public function getIdentity()
    {
        return 'o:' . count($this->value) . ':' . implode(':', array_map(function ($key, $value) {
            return strlen($key) . ':' . $key . ':' . $value->getIdentity();
        }, array_keys($this->value), $this->value));
    }

    public function encode()
    {
        return array_map(function ($item) {
            return $item->encode();
        }, $this->value);
    }
}
