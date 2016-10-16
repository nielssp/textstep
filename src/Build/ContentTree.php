<?php
// BlogSTEP
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Build;

/**
 * Collection of content.
 */
class ContentTree implements \IteratorAggregate, Selectable
{

    private $dir;
    
    private $namespaces = [];
    
    private $nodes = null;
    
    private $properties;
    
    private $recursive = false;
    
    public function __construct(\Blogstep\Files\File $dir, $properties = [])
    {
        $this->dir = $dir;
        $this->properties = $properties;
        $propFile = $dir->get('.properties.php');
        if ($propFile->exists() and $propFile->isReadable()) {
            $properties = include $propFile->getRealPath();
            $this->properties = array_merge($this->properties, $properties);
        }
        $this->recursive = $dir->get('.recursive')->exists();
    }
    
    public function __get($namespace)
    {
        if (!isset($this->namespaces[$namespace])) {
            $this->namespaces[$namespace] = new ContentTree($this->dir->get($namespace), $this->properties);
        }
        return $this->namespaces[$namespace];
    }
    
    public function addProperty($name, callable $getter)
    {
        $this->properties[$name] = $getter;
    }
    
    public function setRecursive($recursive = true)
    {
        $this->recursive = $recursive;
    }
    
    private function select()
    {
        return new ContentSelection($this);
    }
    
    private function getNodesIn(\Blogstep\Files\File $dir, $relativePath)
    {
        $nodes = [];
        foreach ($dir as $file) {
            $name = $file->getName();
            if ($name[0] != '.') {
                if ($file->getType() == 'directory') {
                    if ($this->recursive) {
                        $path = $relativePath == '' ? $name : $relativePath . '/' . $name;
                        $nodes = array_merge($nodes, $this->getNodesIn($file, $path));
                    }
                } else {
                    $nodes[] = new ContentNode($file, $relativePath, $this->properties);
                }
            }
        }
        return $nodes;
    }
    
    public function getNodes()
    {
        if (! isset($this->nodes)) {
            $this->nodes = $this->getNodesIn($this->dir, '');
        }
        return $this->nodes;
    }
    
    public function getIterator()
    {
        return new \ArrayIterator($this->getNodes());
    }

    public function filter(callable $filter)
    {
        return $this->select()->filter($filter);
    }

    public function where($property, $value, $strict = true)
    {
        return $this->select()->where($property, $value, $strict);
    }
    
    public function orderBy($property)
    {
        return $this->select()->orderBy($property);
    }
    
    public function orderByDescending($property)
    {
        return $this->select()->orderByDescending($property);
    }

    public function count()
    {
        return count($this->getNodes());
    }

    public function limit($limit)
    {
        return $this->select()->limit($limit);
    }

    public function offset($offset)
    {
        return $this->select()->limit($offset);
    }
}
