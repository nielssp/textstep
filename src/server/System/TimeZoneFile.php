<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\System;

use Blogstep\SystemAcl;

class TimeZoneFile extends SystemFile {

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
        return \DateTimeZone::listIdentifiers();
    }

    public function createDocument($key, $document)
    {
    }

    public function getDocument($key)
    {
        try {
            $zone = new \DateTimeZone($key);
            return $zone->getName();
        } catch (\Exception $e) {
            return null;
        }
    }

    public function updateDocument($key, $document)
    {
    }

    public function deleteDocument($key)
    {
    }
}
