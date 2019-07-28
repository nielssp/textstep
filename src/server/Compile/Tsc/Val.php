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

    public function compare(Val $other)
    {
        $t1 = $this->getType();
        $t2 = $this->getType();
        if ($t1 < $t2) {
            return -1;
        } else if ($t1 > $t2) {
            return 1;
        }
        return 0;
    }

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

    abstract public function encode();

    public function getIdentity()
    {
        return $this->getType();
    }

    public static function from($data)
    {
        if (is_int($data)) {
            return new IntVal($data);
        } else if (is_float($data)) {
            return new FloatVal($data);
        } else if (is_string($data)) {
            return new StringVal($data);
        } else if (is_bool($data)) {
            return $data ? TrueVal::true() : NilVal::nil();
        } else if (is_object($data)) {
            return new ObjectVal(array_map(['Blogstep\Compile\Tsc\Val', 'from'], get_object_vars($data)));
        } else if (is_array($data)) {
            $values = [];
            $isArray = true;
            $i = 0;
            foreach ($data as $key => $value) {
                if ($isArray and $key === $i) {
                    $values[] = self::from($value);
                    $i++;
                } else {
                    $isArray = false;
                    $values[$key] = self::from($value);
                }
            }
            if ($isArray) {
                return new ArrayVal($values);
            }
            return new ObjectVal($values);
        }
        throw new \DomainException(gettype($data) . ' cannot be converted to a Val');
    }
}
