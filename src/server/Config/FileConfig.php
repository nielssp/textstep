<?php
// BlogSTEP
// Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.

namespace Blogstep\Config;

/**
 * Configuration file.
 */
class FileConfig extends Config
{
    /**
     * @var \Blogstep\Files\File
     */
    private $file;
    
    /**
     * @var array
     */
    private $data = null;

    /**
     * @var array
     */
    private $changes = [];
    
    /**
     * @var FileConfig
     */
    private $localRoot;

    /**
     * @var string
     */
    private $localNamespace = '';
    
    public function __construct(\Blogstep\Files\File $file)
    {
        parent::__construct();
        $this->file = $file;
        $this->localRoot = $this;
    }
    
    protected function getRelative($key)
    {
        $subconfig = new FileConfig($this->file);
        $subconfig->localRoot = $this->localRoot;
        $subconfig->localNamespace = $this->localNamespace . $key . '.';
        return $subconfig;
    }
    
    private function update()
    {
        if ($this->localRoot !== $this) {
            $this->localRoot->update();
        } else {
            $this->data = [];
            if ($this->file->getType() === 'php') {
                // TODO: getRealPath deprecated
                $store = new \Jivoo\Store\PhpStore($this->file->getHostPath());
            } else {
                $store = new \Jivoo\Store\JsonStore($this->file->getHostPath());
            }
            $store->open(false);
            $this->data = $store->read();
            $store->close();
        }
    }
    
    public function commit()
    {
        if ($this->localRoot !== $this) {
            $this->localRoot->commit();
        } else {
            if ($this->file->getType() === 'php') {
                // TODO: getRealPath deprecated
                $store = new \Jivoo\Store\PhpStore($this->file->getHostPath());
            } else {
                $store = new \Jivoo\Store\JsonStore($this->file->getHostPath());
            }
            $store->open(true);
            $this->data = $store->read();
            foreach ($this->changes as $key => $value) {
                $this->data[$key] = $value;
            }
            $store->write($this->data);
            $this->changes = [];
            $store->close();
        }
    }

    protected function getValue($key)
    {
        $key = $this->localNamespace . $key;
        if (isset($this->localRoot->changes[$key])) {
            return $this->localRoot->changes[$key];
        }
        if ($this->localRoot->data === null) {
            $this->update();
        }
        if (isset($this->localRoot->data[$key])) {
            return $this->localRoot->data[$key];
        }
        return null;
    }

    protected function setValue($key, $value)
    {
        $key = $this->localNamespace . $key;
        $this->localRoot->changes[$key] = $value;
    }

    public function getData()
    {
        if ($this->localRoot->data === null) {
            $this->update();
        }
        $data = [];
        $nsLength = strlen($this->localNamespace);
        foreach ($this->localRoot->data as $key => $value) {
            if ($nsLength == 0 || strpos($key, $this->localNamespace) === 0) {
                $data[substr($key, $nsLength)] = $value;
            }
        }
        foreach ($this->localRoot->changes as $key => $value) {
            if ($nsLength == 0 || strpos($key, $this->localNamespace) === 0) {
                $data[substr($key, $nsLength)] = $value;
            }
        }
        return $data;
    }
}
