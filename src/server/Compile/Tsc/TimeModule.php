<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile\Tsc;

class TimeModule extends Module
{

    public function now()
    {
        return new TimeVal(time());
    }

    public function date(array $args)
    {
        $time = self::parseArg($args, 0, 'time', false);
        $format = self::parseArg($args, 1, 'string', false);
        return new StringVal(strftime($format->toString(), $time->getValue()));
    }

    public function iso8601(array $args)
    {
        $time = self::parseArg($args, 0, 'time', false);
        return new StringVal(strftime('%Y-%m-%dT%H:%M:%S%z', $time->getValue()));
    }
}

