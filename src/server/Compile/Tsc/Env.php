<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile\Tsc;

class Env
{
    private $parent;

    private $values = [];

    public function __construct(Env $parent = null)
    {
        $this->parent = $parent;
    }

    public function openScope()
    {
        return new Env($this);
    }

    public function get($name)
    {
        if (isset($this->values[$name])) {
            return $this->values[$name];
        } elseif (isset($this->parent)) {
            return $this->parent->get($name);
        }
        return null;
    }

    public function set($name, Val $value)
    {
        if (!isset($this->values[$name]) and isset($htis->parent)) {
            $this->parent->set($name, $value);
            return;
        }
        $this->values[$name] = $value;
    }
}
