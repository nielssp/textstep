<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile\Tsc;

class CoreModule extends Module
{
    public function __construct()
    {
        $this->constants['nil'] = NilVal::nil();
        $this->constants['null'] = NilVal::nil();
        $this->constants['false'] = NilVal::nil();
        $this->constants['true'] = TrueVal::true();
    }

    public function import(array $args, Env $dynamicEnv)
    {
        $name = self::parseArg($args, 0, 'string', false)->getValue();
        $module = $dynamicEnv->getModule($name);
        if (!isset($module)) {
            throw new ArgError('module not found: ' . $name, 0);
        }
        Module::importInto($dynamicEnv, $module);
        return NilVal::nil();
    }

    public function type(array $args)
    {
        $val = self::parseArg($args, 0);
        return new StringVal($val->getType());
    }

    public function string(array $args)
    {
        return new StringVal(self::parseArg($args, 0, null, true)->toString());
    }
}

