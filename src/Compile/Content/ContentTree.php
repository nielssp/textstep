<?php
// BlogSTEP
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile\Content;

use IteratorAggregate;

/**
 * Collection of content.
 */
class ContentTree implements IteratorAggregate, Selectable
{
    use SelectableTrait;

    private $map;

    private $namespace;

    private $namespaces = [];

    private $nodes = null;

    private $recursive = false;

    public function __construct(\Blogstep\Compile\ContentMap $map, $namespace = '/')
    {
        $this->map = $map;
        $this->namespace = $namespace;
    }

    public function __get($namespace)
    {
        if (!isset($this->namespaces[$namespace])) {
            $this->namespaces[$namespace] = new ContentTree($this->map, $this->namespace . $namespace . '/');
        }
        return $this->namespaces[$namespace];
    }

    public function get($path)
    {
        return $this->map->get($path);
    }

    public function recursive($recursive = true)
    {
        $copy = clone $this;
        $copy->recursive = $recursive;
        return $copy;
    }

    protected function select()
    {
        return new ContentSelection($this);
    }

    public function getNodes()
    {
        if (! isset($this->nodes)) {
            $this->nodes = $this->map->getAll($this->namespace, $this->recursive);
        }
        return $this->nodes;
    }

    public function getIterator()
    {
        return new \ArrayIterator($this->getNodes());
    }

    public function count()
    {
        return count($this->getNodes());
    }

}
