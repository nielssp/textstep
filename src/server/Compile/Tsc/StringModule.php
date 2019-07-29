<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile\Tsc;

class StringModule extends Module
{

    public function lower(array $args)
    {
        $string = self::parseArg($args, 0, 'string', false)->getValue();
        return new StringVal(strtolower($string));
    }

    public function upper(array $args)
    {
        $string = self::parseArg($args, 0, 'string', false)->getValue();
        return new StringVal(strtoupper($string));
    }

    public function startsWith(array $args)
    {
        $string = self::parseArg($args, 0, 'string', false)->getValue();
        $prefix = self::parseArg($args, 1, 'string', false)->getValue();
        return TrueVal::from(strncmp($string, $prefix, strlen($prefix)) === 0);
    }

    public function endsWith(array $args)
    {
        $string = self::parseArg($args, 0, 'string', false)->getValue();
        $suffix = self::parseArg($args, 1, 'string', false)->getValue();
        $l = strlen($suffix);
        if ($l == 0) {
            return true;
        }
        return TrueVal::from(substr($string, - $l) === $suffix);
    }

    public function json(array $args)
    {
        $arg = self::parseArg($args, 0);
        return new StringVal(json_encode($arg->encode()));
    }
}

