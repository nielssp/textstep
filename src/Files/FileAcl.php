<?php
// BlogSTEP
// Copyright (c) 2017 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Files;

/**
 * Access control list for a file system.
 */
class FileAcl
{
    private $file;
    private $store;
    private $aclMap = null;
    private $changes = [];
    private $deletions = [];
    
    public function __construct($file)
    {
        $this->file = $file;
        $this->store = new \Jivoo\Store\PhpStore($file);
        $this->store->touch();
    }
    
    public function __destruct()
    {
        if (count($this->changes) > 0) {
            $this->store->open(true);
            $data = $this->store->read();
            foreach ($this->changes as $key => $value) {
                $data[$key] = $value;
            }
            foreach ($this->deletions as $key => $value) {
                unset($data[$key]);
            }
            $this->store->write($data);
            $this->store->close();
        }
    }
    
    private function loadMap()
    {
        $this->store->open(false);
        $this->aclMap = $this->store->read();
        $this->store->close();
    }

    public function getRecord(array $path)
    {
        if (!isset($this->aclMap)) {
            $this->loadMap();
        }
        while (true) {
            $key = implode('/', $path);
            if (isset($this->aclMap[$key])) {
                return $this->aclMap[$key];
            }
            if (count($path) == 0) {
                return null;
            }
            array_pop($path);
        }
    }
    
    public function get(array $path, $key, $default = null)
    {
        $record = $this->getRecord($path);
        if (isset($record)) {
            return isset($record[$key]) ? $record[$key] : $default;
        }
        return $default;
    }
    
    public function set(array $path, $key, $value)
    {
        if (!isset($this->aclMap)) {
            $this->loadMap();
        }
        $recordKey = implode('/', $path);
        if (!isset($this->aclMap[$recordKey])) {
            $this->aclMap[$recordKey] = [];
        }
        if (isset($this->deletions[$recordKey])) {
            unset($this->deletions[$recordKey]);
        }
        $this->aclMap[$recordKey][$key] = $value;
        $this->changes[$recordKey] = $this->aclMap[$recordKey];
    }
    
    public function remove(array $path)
    {
        if (!isset($this->aclMap)) {
            $this->loadMap();
        }
        $recordKey = implode('/', $path);
        if (isset($this->aclMap[$recordKey])) {
            unset($this->aclMap[$recordKey]);
            $this->deletions[$recordKey] = true;
        }
    }

    public function getOwner(array $path)
    {
        return $this->get($path, 'owner', 'system');
    }

    public function getGroup(array $path)
    {
        return $this->get($path, 'group', 'system');
    }

    public function getMode(array $path)
    {
        return $this->get($path, 'mode', 0x3A);
    }
}
