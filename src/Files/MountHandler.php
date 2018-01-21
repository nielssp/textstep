<?php
// BlogSTEP
// Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Files;

/**
 * Handles persistent mount points.
 */
class MountHandler
{
    private $files;
    private $store;
    private $mounts;
    
    public function __construct(File $fileSystem, $file)
    {
        $this->files = $fileSystem;
        $this->store = new \Jivoo\Store\PhpStore($file);
        $this->store->open(false);
        $this->mounts = $this->store->read();
        $this->store->close();
        $this->mountAll();
        
    }
    
    private function mountAll()
    {
        foreach ($this->mounts as $mountPoint => $options) {
            $this->files->get($mountPoint)->mount($this->openDevice($options));
        }
    }
    
    public function openDevice($options)
    {
        if (is_string($options)) {
            $options = [
                'type' => 'host',
                'path' => $options
            ];
        }
        if (!isset($options['type']) or $options['type'] !== 'host') {
            throw new \Blogstep\RuntimeException(
                'Unsupported file system type: ' . 
                (isset($options['type']) ? $options['type'] : '(null)')
            );
        }
        if (!isset($options['path']) || !is_string($options['path'])) {
            throw new \Blogstep\RuntimeException('Missing device path');
        }
        return new HostDevice($options['path']);
    }
    
    public function mount(File $mountPoint, $options)
    {
        $mountPoint->mount($this->openDevice($options));
        $this->mounts[$mountPoint->getPath()] = $options;
        $this->store->open(true);
        $this->store->write($this->mounts);
        $this->store->close();
    }
    
    public function unmount(File $mountPoint)
    {
        $path = $mountPoint->getPath();
        if (isset($this->mounts[$path])) {
            unset($this->mounts[$path]);
            $this->store->open(true);
            $this->store->write($this->mounts);
            $this->store->close();
        }
    }
}
