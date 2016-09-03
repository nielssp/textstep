<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Files;

/**
 * A file system node.
 */
class FileSystem implements \IteratorAggregate, \Jivoo\Http\Route\HasRoute
{
    
    private $root;
    
    private $path;
    
    private $type;
    
    private function __construct(array $path, $root, $type)
    {
        $this->root = $root;
        $this->path = $path;
        $this->type = $type;
    }
    
    public static function open($rootPath)
    {
        \Jivoo\Assume::that(is_dir($rootPath));
        return new self([], rtrim($rootPath, '/'), 'dir');
    }

    public function getIterator()
    {
        $names = [];
        $path = $this->getRealPath();
        if (is_dir($path)) {
            $names = scandir($path);
        }
        $files = [];
        foreach ($names as $name) {
            if ($name == '.' or $name == '..') {
                continue;
            }
            $files[] = $this->get($name);
        }
        return new \ArrayIterator($files);
    }
    
    public function getRealPath()
    {
        return $this->root . $this->getPath();
    }
    
    public function getPath()
    {
        return '/' . implode('/', $this->path);
    }
    
    public function getName()
    {
        if (count($this->path)) {
            return $this->path[count($this->path) - 1];
        }
        return '';
    }
    
    public function getRoute()
    {
        return [
            'snippet' => 'Open',
            'parameters' => $this->path
        ];
    }
    
    public function getType()
    {
        return $this->type;
    }
    
    public function getMetadata()
    {
        
    }
    
    public function getParent()
    {
        if (count($this->path)) {
            return new FileSystem(array_slice($this->path, 0, -1), $this->root, 'directory');
        }
        return $this;
    }
    
    public function get($relativePath)
    {
        if ($relativePath == '') {
            return $this;
        }
        $path = $this->path;
        if ($relativePath[0] == '/') {
            $path = [];
        }
        $relativePath = explode('/', $relativePath);
        foreach ($relativePath as $component) {
            if ($component == '.') {
                continue;
            } elseif ($component == '..') {
                array_pop($path);
            } else if ($component != '') {
                array_push($path, $component);
            }
        }
        $type = 'unknown';
        $real = $this->root . '/' . implode('/', $path);
        if (is_dir($real)) {
            $type = 'directory';
        } else if (\Jivoo\Utilities::getFileExtension($real) === 'md') {
            $type = 'markdown';
        } 
        return new self($path, $this->root, $type);
    }

}
