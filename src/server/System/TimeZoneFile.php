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

    private function toDocument($identifier)
    {
        $split = explode('/', $identifier, 2);
        if (count($split) > 1) {
            $region = $split[0];
            $location = str_replace('_', ' ', $split[1]);
        } else {
            $region = '';
            $location = $split[0];
        }
        return [
            'identifier' => $identifier,
            'region' => $region,
            'location' => $location
        ];
    }

    public function getDocuments($filter = null)
    {
        $documents = [];
        foreach (\DateTimeZone::listIdentifiers() as $identifier) {
            $documents[$identifier] = $this->toDocument($identifier);
        }
        if (isset($filter)) {
            return $this->applyFilter($documents, $filter);
        }
        return $documents;
    }

    public function createDocument($key, $document)
    {
    }

    public function getDocument($key)
    {
        try {
            $zone = new \DateTimeZone($key);
            return $this->toDocument($zone->getName());
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
