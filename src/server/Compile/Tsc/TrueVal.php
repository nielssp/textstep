<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile\Tsc;

class TrueVal extends Val
{
    private static $true = null;

    private function __construct()
    {
    }

    public static function true()
    {
        if (!isset(self::$true)) {
            self::$true = new self();
        }
        return self::$true;
    }

    public function isTruthy()
    {
        return true;
    }

    public function equals(Val $other)
    {
        return $this === $other;
    }

    public function toString()
    {
        return '';
    }

    public static function from($boolean)
    {
        if ($boolean) {
            return TrueVal::true();
        }
        return NilVal::nil();
    }

    public function getType()
    {
        return 'true';
    }

    public function encode()
    {
        return true;
    }
}
