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
                return [];
            }
            array_pop($path);
        }
    }

    public function check(array $path, $capability, \Blogstep\User $user = null)
    {
        if (!isset($user) or $user->isSystem()) {
            return true;
        }
        $record = $this->getRecord($path);
        if (!isset($record[$capability])) {
            return false;
        }
        return count(array_intersect($user->getGroups(), $record[$capability])) > 0;
    }
    
    public function grant(array $path, $capability, $group)
    {
        if (!isset($this->aclMap)) {
            $this->loadMap();
        }
        $record = $this->getRecord($path);
        if (!isset($record[$capability])) {
            $record[$capability] = [];
        } else if (in_array($group, $record[$capability])) {
            return;
        }
        $record[$capability][] = $group;
        $recordKey = implode('/', $path);
        if (isset($this->deletions[$recordKey])) {
            unset($this->deletions[$recordKey]);
        }
        $this->aclMap[$recordKey] = $record;
        $this->changes[$recordKey] = $this->aclMap[$recordKey];
    }

    public function revoke(array $path, $capability, $group)
    {
        if (!isset($this->aclMap)) {
            $this->loadMap();
        }
        $record = $this->getRecord($path);
        if (isset($record[$capability]) and in_array($group, $record[$capability])) {
            $record[$capability] = array_diff($record[$capability], [$group]);
            $recordKey = implode('/', $path);
            if (isset($this->deletions[$recordKey])) {
                unset($this->deletions[$recordKey]);
            }
            $this->aclMap[$recordKey] = $record;
            $this->changed[$recordKey] = $this->aclMap[$recordKey];
        }
    }

    public function revokeAll(array $path)
    {
        if (!isset($this->aclMap)) {
            $this->loadMap();
        }
        $recordKey = implode('/', $path);
        if (isset($this->deletions[$recordKey])) {
            unset($this->deletions[$recordKey]);
        }
        $this->aclMap[$recordKey] = [];
        $this->changed[$recordKey] = $this->aclMap[$recordKey];
    }
    
    public function reset(array $path)
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
}
