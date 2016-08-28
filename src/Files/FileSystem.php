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
    
    private $vpath;
    
    private $path;
    
    private $type;
    
    private function __construct($vpath, $path, $type)
    {
        $this->vpath = $vpath;
        $this->path = $path;
        $this->type = $type;
    }
    
    public static function open($rootPath)
    {
        \Jivoo\Assume::that(is_dir($rootPath));
        return new self('/', $rootPath, 'dir');
    }

    public function getIterator()
    {
        $names = [];
        if (is_dir($this->path)) {
            $names = scandir($this->path);
        }
        $files = [];
        foreach ($names as $name) {
            if ($name == '.') {
                continue;
            } else if ($name == '..' and $this->vpath == '/') {
                continue;
            }
            $files[] = $this->get($name);
        }
        return new \ArrayIterator($files);
    }
    
    public function getVirtualPath()
    {
        return $this->vpath;
    }
    
    public function getPath()
    {
        return $this->path;
    }
    
    public function getName()
    {
        return basename($this->vpath);
    }
    
    public function getRoute()
    {
        return [
            'snippet' => 'Open',
            'parameters' => explode('/', trim($this->vpath, '/'))
        ];
    }
    
    public function getType()
    {
        return $this->type;
    }
    
    public function getMetadata()
    {
        
    }
    
    public function get($rpath)
    {
        $path = \Jivoo\Paths::combinePaths($this->path, $rpath);
        $vpath = \Jivoo\Paths::combinePaths($this->vpath, $rpath);
        $type = is_dir($path) ? 'dir' : 'file';
        return new self($vpath, $path, $type);
    }

}
