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
    
    private $recursive = false;
    
    private $handler;
    
    public function __construct(File $dir, File $buildDir, ContentHandler $handler)
    {
        $this->dir = $dir;
        $this->buildDir = $buildDir;
        $this->handler = $handler;
        $this->recursive = $dir->get('.recursive')->exists();
    }
    
    public function getHandler()
    {
        return $this->handler;
    }
    
    public function __get($namespace)
    {
        if (!isset($this->namespaces[$namespace])) {
            $buildDir = $this->buildDir->get($namespace);
            if (!$buildDir->exists()) {
                $buildDir->makeDirectory();
            }
            $this->namespaces[$namespace] = new ContentTree($this->dir->get($namespace), $buildDir, $this->handler);
        }
        return $this->namespaces[$namespace];
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
                } elseif ($this->handler->hasHandler($type)) {
                    $name .= '.html';
                    $outFile = $this->buildDir->get($relativePath == '' ? $name : $relativePath . '/' . $name);
                    $outFile->putContents(call_user_func($this->handler->getHandler($type), $file->getContents()));
                    $content = new ContentNode($file, $outFile, $relativePath, []); // TODO: properties, subhandlers?
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
