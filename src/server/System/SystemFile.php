<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\System;

use Blogstep\SystemAcl;
use Blogstep\User;

abstract class SystemFile implements \Blogstep\Files\Storage
{

    protected $acl ;

    protected $user = null;

    public function __construct(SystemAcl $acl)
    {
        $this->acl = $acl;
    }

    public function close()
    {
    }

    public function setUser(User $user = null)
    {
        $this->user = $user;
    }

    public function check($key)
    {
        return $this->acl->check($key, $this->user);
    }

    public function checkDocument($keyPrefix, array $document)
    {
        if ($this->check($keyPrefix)) {
            return $document;
        }
        $checked = [];
        foreach ($document as $key => $value) {
            if ($this->check($keyPrefix . '.' . $key)) {
                $checked[$key] = $value;
            }
        }
        if (count($checked)) {
            return $checked;
        }
        return null;
    }

    abstract public function getModified();

    public function updateDocuments($documents)
    {
        $existing = $this->getDocuments();
        foreach ($documents as $key => $document) {
            if (!isset($existing[$key])) {
                $this->createDocument($key, $document);
            } else {
                $this->updateDocument($key, $document);
            }
        }
        foreach ($existing as $key => $document) {
            if (!isset($documents[$key])) {
                $this->deleteDocument($key);
            }
        }
    }

    protected function applyFilter(array $unfiltered, array $filter)
    {
        $data = [];
        foreach ($unfiltered as $key => $document) {
            if (!is_array($document)) {
                continue;
            }
            $match = true;
            foreach ($filter as $field => $value) {
                if (!array_key_exists($field, $document) or $value != $document[$field]) {
                    $match = false;
                    break;
                }
            }
            if ($match) {
                $data[$key] = $document;
            }
        }
        return $data;
    }
}
