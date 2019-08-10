<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile\Tsc;

class HtmlModule extends Module
{
    private $compiler;

    public function __construct(\Blogstep\Compile\TemplateCompiler $compiler)
    {
        $this->compiler = $compiler;
    }

    public function h(array $args)
    {
        $string = self::parseArg($args, 0)->toString();
        return new StringVal(htmlentities($string, ENT_COMPAT, 'UTF-8', false));
    }

    public function href(array $args, Env $dynamicEnv)
    {
        $link = self::parseArg($args, 0, 'string', true, function () use ($dynamicEnv) {
            return $dynamicEnv->get('PATH');
        })->toString();
        $class = self::parseArg($args, 1, 'string', true, function () {
            return new StringVal('');
        })->toString();
        if ($this->compiler->isCurrent($link)) {
            if ($class !== '') {
                $class .= ' ';
            }
            $class .= 'current';
        }
        $link = $this->compiler->getLink($link);
        if ($class !== '') {
            $class = ' class="' . htmlentities($class, ENT_COMPAT, 'UTF-8', false) . '"';
        }
        return new StringVal(' href="' . htmlentities($link, ENT_COMPAT, 'UTF-8', false) . '"' . $class);
    }
}

