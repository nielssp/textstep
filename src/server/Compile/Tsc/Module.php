<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile\Tsc;

abstract class Module
{
    protected $constants = [];

    public function importInto(Env $env)
    {
        $ref = new \ReflectionClass($this);
        $methods = $ref->getMethods(\ReflectionMethod::IS_PUBLIC);
        foreach ($methods as $method) {
            if (!$method->isStatic() and !$method->isConstructor() and $method->getName() !== 'importInto') {
                $name = \Jivoo\Utilities::camelCaseToUnderscores($method->getName());
                $env->set($name, new FuncVal([$this, $method->getName()]));
            }
        }
        foreach ($this->constants as $name => $value) {
            $env->set($name, $value);
        }
    }

    public static function parseArg(array $args, $index, $expectedType = null, $allowNil = false, $default = null)
    {
        if ($index >= count($args)) {
            if ($allowNil) {
                return isset($default) ? $default() : NilVal::nil();
            }
            throw new ArgTypeError('too few arguments for function', $index, $expectedType);
        }
        if (!isset($expectedType)) {
            return $args[$index];
        }
        if ($allowNil and $args[$index] instanceof NilVal) {
            return isset($default) ? $default() : NilVal::nil();
        }
        if (is_array($expectedType)) {
            foreach ($expectedType as $t) {
                if ($args[$index]->getType() === $t) {
                    return $args[$index];
                }
            }
            throw new ArgTypeError('incorrect argument of type ' . $args[$index]->getType() . ', expected ' . implode(' or ', $expectedType), $index, $expectedType);
        } else  if ($args[$index]->getType() === $expectedType) {
            return $args[$index];
        }
        throw new ArgTypeError('incorrect argument of type ' . $args[$index]->getType() . ', expected ' . $expectedType, $index, $expectedType);
    }
}

