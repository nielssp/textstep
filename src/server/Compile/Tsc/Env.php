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

    private $consts = [];

    private $vars = [];

    private $modules = [];

    private $readOnly = false;

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

    public function isReadOnly()
    {
        return $this->readOnly;
    }

    public function setReadOnly($readOnly = true)
    {
        $this->readOnly = $readOnly;
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
        if (isset($this->consts[$name])) {
            return $this->consts[$name];
        } elseif (isset($this->vars[$name])) {
            return $this->vars[$name];
        } elseif (isset($this->parent)) {
            return $this->parent->get($name);
        }
        return null;
    }

    public function let($name, Val $value)
    {
        $this->vars[$name] = $value;
    }

    public function letConst($name, Val $value)
    {
        $this->consts[$name] = $value;
    }

    private function findScope($name)
    {
        if (isset($this->consts[$name]) or isset($this->vars[$name])) {
            return $this;
        } elseif (isset($this->parent)) {
            return $this->parent->findScope($name);
        }
        return null;
    }

    public function set($name, Val $value)
    {
        $scope = $this->findScope($name);
        if (!isset($scope)) {
            $this->let($name, $value);
            return;
        }
        if (isset($scope->consts[$name])) {
            throw new ReadOnlyError('reassignment of constant "' . $name . '" not allowed');
        }
        $scope->vars[$name] = $value;
    }
}
