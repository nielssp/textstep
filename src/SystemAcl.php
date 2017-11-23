<?php
// BlogSTEP
// Copyright (c) 2017 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep;

/**
 * Access control list for system operations.
 */
class SystemAcl
{
    private $file;
    private $store;
    private $aclMap = null;
    private $additions = [];
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
            foreach ($this->additions as $key => $groups) {
                if (!isset($data[$key])) {
                    $data[$key] = $groups;
                } else {
                    $data[$key] = array_merge($groups, $data[$key]);
                }
            }
            foreach ($this->deletions as $key => $groups) {
                if (!isset($data[$key])) {
                    continue;
                }
                $data[$key] = array_diff($data[$key], $groups);
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

    public function getRecord($key)
    {
        if (!isset($this->aclMap)) {
            $this->loadMap();
        }
        if (isset($this->aclMap[$key])) {
            return $this->aclMap[$key];
        }
        return [];
    }
    
    public function check($key, array $groups)
    {
        $record = $this->getRecord($key);
        return count(array_intersect($groups, $record)) > 0;
    }
    
    public function set($key, $group)
    {
        if (!isset($this->aclMap)) {
            $this->loadMap();
        }
        if (!isset($this->aclMap[$key])) {
            $this->aclMap[$key] = [];
        }
        if (isset($this->deletions[$key])) {
            $this->deletions[$key] = array_diff($this->deletions[$key], [$group]);
        }
        $this->aclMap[$key][] = $group;
        if (!isset($this->additions[$key])) {
            $this->additions[$key] = [];
        }
        $this->additions[$key][] = $group;
    }
    
    public function remove($key, $group)
    {
        if (!isset($this->aclMap)) {
            $this->loadMap();
        }
        if (isset($this->aclMap[$key])) {
            $this->aclMap[$key] = array_diff($this->aclMap[$key], [$group]);
            if (!isset($this->deletions[$key])) {
                $this->deletions[$key] = [];
            }
            $this->deletions[$key][] = $group;
        }
    }
}
