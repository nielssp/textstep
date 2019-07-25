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
}


