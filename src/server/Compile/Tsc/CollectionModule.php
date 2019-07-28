<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile\Tsc;

class CollectionModule extends Module
{
    public function length(array $args)
    {
        $arg = self::parseArg($args, 0);
        if ($arg instanceof ArrayVal) {
            return new IntVal(count($arg->getValues()));
        } else if ($arg instanceof ObjectVal) {
            return new IntVal(count($arg->getValues()));
        } else if ($arg instanceof StringVal) {
            return new IntVal(strlen($arg->getValue()));
        }
        throw new ArgTypeError('length() is not applicable to argument of type ' . $arg->getType(), 0);
    }

    public function keys(array $args)
    {
        $obj = self::parseArg($args, 0, 'object', false);
        return $obj->getKeys();
    }

    public function values(array $args)
    {
        $obj = self::parseArg($args, 0, 'object', false);
        return $obj->getValues();
    }

    public function map(array $args, Env $dynamicEnv)
    {
        $array = self::parseArg($args, 0, ['array', 'object'], false);
        $func = self::parseArg($args, 1, 'func', false);
        $result = [];
        if ($array instanceof ArrayVal) {
            foreach ($array->getValues() as $key => $value) {
                $result[$key] = $func->apply([$value, new IntVal($key)], $dynamicEnv);
            }
            return new ArrayVal($result);
        }
        foreach ($array->getValues() as $key => $value) {
            $result[$key] = $func->apply([$value, new StringVal($key)], $dynamicEnv);
        }
        return new ObjectVal($result);
    }

    public function flatMap(array $args, Env $dynamicEnv)
    {
        $array = self::parseArg($args, 0, 'array', false);
        $func = self::parseArg($args, 1, 'func', false);
        $result = [];
        foreach ($array->getValues() as $key => $value) {
            $subitems = $func->apply([$value, new IntVal($key)], $dynamicEnv);
            if (!($subitems instanceof ArrayVal)) {
                throw new ArgTypeError('incorrect flat map function return value of type ' . $subitems->getType() . ', expected array', 1, 'array');
            }
            foreach ($subitems->getValues() as $subitem) {
                $result[] = $subitem;
            }
        }
        return new ArrayVal($result);
    }

    public function mapKeys(array $args, Env $dynamicEnv)
    {
        $array = self::parseArg($args, 0, 'object', false);
        $func = self::parseArg($args, 1, 'func', false);
        $result = [];
        foreach ($array->getValues() as $key => $value) {
            $result[$func->apply([new StringVal($key)], $dynamicEnv)->toString()] = $value;
        }
        return new ObjectVal($result);
    }

    public function filter(array $args, Env $dynamicEnv)
    {
        $array = self::parseArg($args, 0, ['array', 'object'], false);
        $func = self::parseArg($args, 1, 'func', false);
        $result = [];
        if ($array instanceof ArrayVal) {
            foreach ($array->getValues() as $key => $value) {
                if ($func->apply([$value, new IntVal($key)], $dynamicEnv)->isTruthy()) {
                    $result[] = $value;
                }
            }
            return new ArrayVal($result);
        }
        foreach ($array->getValues() as $key => $value) {
            if ($func->apply([$value, new StringVal($key)], $dynamicEnv)->isTruthy()) {
                $result[$key] = $value;
            }
        }
        return new ObjectVal($result);
    }

    public function exclude(array $args, Env $dynamicEnv)
    {
        $array = self::parseArg($args, 0, ['array', 'object'], false);
        $func = self::parseArg($args, 1, 'func', false);
        $result = [];
        if ($array instanceof ArrayVal) {
            foreach ($array->getValues() as $key => $value) {
                if (!$func->apply([$value, new IntVal($key)], $dynamicEnv)->isTruthy()) {
                    $result[] = $value;
                }
            }
            return new ArrayVal($result);
        }
        foreach ($array->getValues() as $key => $value) {
            if (!$func->apply([$value, new StringVal($key)], $dynamicEnv)->isTruthy()) {
                $result[$key] = $value;
            }
        }
        return new ObjectVal($result);
    }

    public function sort(array $args)
    {
        $array = self::parseArg($args, 0, 'array', false);
        return $array->sort(function ($a, $b) {
            return $a->compare($b);
        });
    }

    public function sortWith(array $args, Env $dynamicEnv)
    {
        $array = self::parseArg($args, 0, 'array', false);
        $comparator = self::parseArg($args, 1, 'func', false);
        return $array->sort(function ($a, $b) use ($comparator, $dynamicEnv){
            $order = $comparator->apply([$a, $b], $dynamicEnv);
            if (!($order instanceof IntVal)) {
                throw new ArgTypeError('incorrect comparator return value of type ' . $order->getType() . ', expected int', 1, 'int');
            }
            return $order->getValue();
        });
    }

    public function sortBy(array $args, Env $dynamicEnv)
    {
        $array = self::parseArg($args, 0, 'array', false);
        $propertyGetter = self::parseArg($args, 1, 'func', false);
        return $array->sort(function ($a, $b) use ($propertyGetter, $dynamicEnv) {
            $a = $propertyGetter->apply([$a], $dynamicEnv);
            $b = $propertyGetter->apply([$b], $dynamicEnv);
            return $a->compare($b);
        });
    }

    public function sortByDesc(array $args, Env $dynamicEnv)
    {
        $array = self::parseArg($args, 0, 'array', false);
        $propertyGetter = self::parseArg($args, 1, 'func', false);
        return $array->sort(function ($a, $b) use ($propertyGetter, $dynamicEnv) {
            $a = $propertyGetter->apply([$a], $dynamicEnv);
            $b = $propertyGetter->apply([$b], $dynamicEnv);
            return $b->compare($a);
        });
    }

    public function groupBy(array $args, Env $dynamicEnv)
    {
        $array = self::parseArg($args, 0, 'array', false);
        $propertyGetter = self::parseArg($args, 1, 'func', false);
        $groups = [];
        foreach ($array->getValues() as $item) {
            $key = $propertyGetter->apply([$item], $dynamicEnv)->getIdentity();
            if (!isset($groups[$key])) {
                $groups[$key] = new ArrayVal([]);
            }
            $groups[$key]->push($item);
        }
        return new ArrayVal(array_values($groups));
    }

    public function take(array $args)
    {
        $array = self::parseArg($args, 0, 'array', false)->getValues();
        $n = self::parseArg($args, 1, 'int', false)->getValue();
        return new ArrayVal(array_slice($array, 0, $n));
    }

    public function drop(array $args)
    {
        $array = self::parseArg($args, 0, 'array', false)->getValues();
        $n = self::parseArg($args, 1, 'int', false)->getValue();
        return new ArrayVal(array_slice($array, $n));
    }

    public function push(array $args)
    {
        $array = self::parseArg($args, 0, 'array', false);
        $item = self::parseArg($args, 1);
        $array->push($item);
        return $array;
    }

    public function pop(array $args)
    {
        $array = self::parseArg($args, 0, 'array', false);
        return $array->pop();
    }

    public function unshift(array $args)
    {
        $array = self::parseArg($args, 0, 'array', false);
        $item = self::parseArg($args, 1);
        $array->unshift($item);
        return $array;
    }

    public function shift(array $args)
    {
        $array = self::parseArg($args, 0, 'array', false);
        return $array->shift();
    }
}


