<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\System;

use Jivoo\Store\Config;
use Blogstep\SystemAcl;

class ConfigFile extends SystemFile
{

    private $file;
    private $config;
    private $permission;

    public function __construct($file, Config $config, $permission, SystemAcl $acl)
    {
        parent::__construct($acl);
        $this->file = $file;
        $this->config = $config;
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


    public function close()
    {
        $this->config->save();
    }

    public function getDocuments($filter = null)
    {
        $data = [];
        foreach ($this->config as $key => $value) {
            if ($this->check($this->permission . '.view.' . $key)) {
                $data[$key] = $value;
            }
        }
        if (isset($filter)) {
            return $this->applyFilter($data, $filter);
        }
        return $data;
    }

    public function createDocument($key, $document)
    {
        if ($this->check($this->permission . '.update.' . $key)) {
            $this->config[$key] = $document;
        }
    }

    public function getDocument($key)
    {
        if ($this->check($this->permission . '.view.' . $key)) {
            if (isset($this->config[$key])) {
                return $this->config[$key];
            }
        }
        return null;
    }

    public function updateDocument($key, $document)
    {
        if ($this->check($this->permission . '.update.' . $key)) {
            $this->config[$key] = $document;
        }
    }

    public function deleteDocument($key)
    {
        if ($this->check($this->permission . '.update.' . $key)) {
            if (isset($this->config[$key])) {
                unset($this->config[$key]);
            }
        }
    }
}
