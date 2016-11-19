<?php
// BlogSTEP
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Build;

use Blogstep\Files\File;
use IteratorAggregate;

/**
 * Collection of content.
 */
class ContentTree implements IteratorAggregate, Selectable
{
    use SelectableTrait;

    private $dir;
    
    private $buildDir;
    
    private $namespaces = [];
    
    private $nodes = null;
    
    private $properties;
    
    private $filters;
    
    private $defaultFilters = [];
    
    private $handlers;
    
    private $recursive = false;
    
    public function __construct(File $dir, File $buildDir, $properties = [], $handlers = [], $filters = [])
    {
        $this->dir = $dir;
        $this->buildDir = $buildDir;
        $this->properties = $properties;
        $this->handlers = $handlers;
        $this->filters = $filters;
        $propFile = $dir->get('.properties.php');
        if ($propFile->exists() and $propFile->isReadable()) {
            $properties = include $propFile->getRealPath();
            $this->properties = array_merge($this->properties, $properties);
        }
        $this->recursive = $dir->get('.recursive')->exists();
    }
    
    public function resume(SiteMap $siteMap, array $state)
    {
        foreach ($state['namespaces'] as $namespace => $subState) {
            $this->__get($namespace)->resume($siteMap, $subState);
        }
        if (isset($state['nodes'])) {
            $this->nodes = [];
            foreach ($state['nodes'] as $path) {
                $this->nodes[] = $siteMap->get($path);
            }
        }
    }
    
    public function suspend()
    {
        $state = ['namespaces' => []];
        foreach ($this->namespaces as $namespace => $tree) {
            $state['namespaces'][$namespace] = $tree->suspend();
        }
        if (isset($this->nodes)) {
            $state['nodes'] = [];
            foreach ($this->nodes as $node) {
                $state['nodes'][] = $node->getPath();
            }
        }
        return $state;
    }
    
    public function __get($namespace)
    {
        if (!isset($this->namespaces[$namespace])) {
            $buildDir = $this->buildDir->get($namespace);
            if (!$buildDir->exists()) {
                $buildDir->makeDirectory();
            }
            $this->namespaces[$namespace] = new ContentTree($this->dir->get($namespace), $buildDir, $this->properties, $this->handlers);
        }
        return $this->namespaces[$namespace];
    }
    
    public function addHandler($type, callable $handler)
    {
        $this->handlers[$type] = $handler;
    }
    
    public function addFilter($name, callable $filter)
    {
        $this->filters[$name] = $filter;
    }

    public function getFilters()
    {
        return $this->filters;
    }
    
    public function getDefaultFilters()
    {
        return $this->defaultFilters;
    }
    
    public function setDefaultFilters($filters)
    {
        $this->defaultFilters = $filters;
    }
    
    public function addProperty($name, callable $getter)
    {
        $this->properties[$name] = $getter;
    }
    
    public function setRecursive($recursive = true)
    {
        $this->recursive = $recursive;
    }
    
    protected function select()
    {
        return new ContentSelection($this);
    }
    
    private function getNodesIn(File $dir, $relativePath)
    {
        $nodes = [];
        foreach ($dir as $file) {
            $name = $file->getName();
            if ($name[0] != '.') {
                $type = $file->getType();
                if ($type == 'directory') {
                    if ($this->recursive) {
                        $path = $relativePath == '' ? $name : $relativePath . '/' . $name;
                        $buildDir = $this->buildDir->get($path);
                        if (!$buildDir->exists()) {
                            $buildDir->makeDirectory();
                        }
                        $nodes = array_merge($nodes, $this->getNodesIn($file, $path));
                    }
                } elseif (isset($this->handlers[$type])) {
                    $name .= '.html';
                    $outFile = $this->buildDir->get($relativePath == '' ? $name : $relativePath . '/' . $name);
                    $outFile->putContents(call_user_func($this->handlers[$type], $file->getContents()));
                    $content = new ContentNode($file, $outFile, $relativePath, $this->properties);
                    $metadata = $content->getMetadata();
                    if (!isset($metadata['published'])) {
                        $metadata['published'] = $file->getCreated();
                    }
                    $nodes[] = $content;
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

    public function count()
    {
        return count($this->getNodes());
    }
}
