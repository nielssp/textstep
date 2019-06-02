<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\System;

use Blogstep\SystemAcl;

class ConfigFile extends SystemFile {

    private $file;
    private $store;
    private $permission;
    private $data = null;
    private $modified = false;

    public function __construct($file, $permission, SystemAcl $acl)
    {
        parent::__construct($acl);
        $this->file = $file;
        $this->store = new \Jivoo\Store\PhpStore($file);
        $this->store->touch();
        $this->permission = $permission;
    }

    public function getModified()
    {
        return filemtime($this->file);
    }

    public function getCreated()
    {
        return filectime($this->file);
    }

    private function open()
    {
        if (! isset($this->data)) {
            $this->store->open(false);
            $this->data = $this->store->read();
            $this->store->close();
            $this->modified = false;
        }
    }

    public function close()
    {
        if (isset($this->data)) {
            if ($this->modified) {
                $this->store->open(true);
                $this->store->write($this->data);
                $this->store->close();
            }
            $this->data = null;
        }
    }

    public function getDocuments()
    {
        $this->open();
        $data = [];
        foreach ($this->data as $key => $value) {
            if ($this->check($this->permission . '.view.' . $key)) {
                $data[$key] =$value;
            }
        }
        return $data;
    }

    public function createDocument($key, $document)
    {
        if ($this->check($this->permission . '.update.' . $key)) {
            $this->open();
            $this->data[$key] = $document;
            $this->modified = true;
        }
    }

    public function getDocument($key)
    {
        if ($this->check($this->permission . '.view.' . $key)) {
            $this->open();
            if (isset($this->data[$key])) {
                return $this->data[$key];
            }
        }
        return null;
    }

    public function updateDocument($key, $document)
    {
        if ($this->check($this->permission . '.update.' . $key)) {
            $this->open();
            $this->data[$key] = $document;
            $this->modified = true;
        }
    }

    public function deleteDocument($key)
    {
        if ($this->check($this->permission . '.update.' . $key)) {
            $this->open();
            if (isset($this->data[$key])) {
                unset($this->data[$key]);
                $this->modified = true;
            }
        }
    }
}

