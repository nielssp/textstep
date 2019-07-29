<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile\Tsc;

class HtmlModule extends Module
{
    public function h(array $args)
    {
        $string = self::parseArg($args, 0)->toString();
        return new StringVal(htmlentities($string, ENT_COMPAT, 'UTF-8', false));
    }
}

