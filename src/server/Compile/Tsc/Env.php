<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile\Tsc;

class Env
{
    private $root = null;

    private $parent;

    private $values = [];

    private $modules = [];

    public function __construct(Env $parent = null)
    {
        $this->parent = $parent;
        if (isset($this->parent)) {
            if (isset($this->parent->root)) {
                $this->root = $this->parent->root;
            } else {
                $this->root = $this->parent;
            }
        }
    }

    public function addModule($name, Module $module, $import = false)
    {
        if (isset($this->root)) {
            $this->root->addModule($name, $module, $import);
            return;
        }
        $this->modules[$name] = $module;
        if ($import) {
            $module->importInto($this);
        }
    }

    public function getModule($name)
    {
        if (isset($this->root)) {
            return $this->root->getModule($name);
        }
        if (isset($this->modules[$name])) {
            return $this->modules[$name];
        }
        return null;
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
