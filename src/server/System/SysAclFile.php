<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\System;

use Blogstep\SystemAcl;

class SysAclFile extends SystemFile {

    public function __construct(SystemAcl $acl)
    {
        parent::__construct($acl);
    }

    public function getModified()
    {
    }

    public function getCreated()
    {
    }

    public function getDocuments($filter = null)
    {
        if ($this->check('sysacl.view')) {
            $data = $this->acl->getRecords();
            if (isset($filter)) {
                return $this->applyFilter($data, $filter);
            }
            return $data;
        }
        return [];
    }

    public function createDocument($key, $document)
    {
        if ($this->check('sysacl.update') and is_array($document)) {
            foreach ($document as $group) {
                if (is_string($group)) {
                    $this->acl->set($key, $group);
                }
            }
        }
    }

    public function getDocument($key)
    {
        if ($this->check('sysacl.view')) {
            $records = $this->acl->getRecords();
            if (isset($records[$key])) {
                return $records[$key];
            }
        }
        return null;
    }

    public function updateDocument($key, $document)
    {
        if ($this->check('sysacl.update') and is_array($document)) {
            $this->acl->update($key, array_map('strval', $document));
        }
    }

    public function deleteDocument($key)
    {
        if ($this->check('sysacl.update')) {
            $this->acl->removeAll($key);
        }
    }
}

