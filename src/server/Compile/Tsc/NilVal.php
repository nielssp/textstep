<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile\Tsc;

class NilVal extends Val
{
    private static $nil = null;

    private function __construct()
    {
    }

    public static function nil()
    {
        if (!isset(self::$nil)) {
            self::$nil = new self();
        }
        return self::$nil;
    }

    public function isTruthy()
    {
        return false;
    }

    public function equals(Val $other)
    {
        return $this === $other;
    }

    public function toString()
    {
        return '';
    }
}
