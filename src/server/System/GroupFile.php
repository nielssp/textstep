<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\System;

use Blogstep\UserModel;
use Blogstep\SystemAcl;
use Blogstep\Group;

class GroupFile extends SystemFile
{

    private $users;

    public function __construct(UserModel $users, SystemAcl $acl)
    {
        parent::__construct($acl);
        $this->users = $users;
    }

    public function getModified()
    {
    }

    private function toDocument(Group $group)
    {
        return [
            'name' => $group->getName(),
        ];
    }

    public function getDocuments($filter = null)
    {
        $groups = [];
        if ($this->check('groups.view')) {
            foreach ($this->users->getGroups() as $group) {
                $groups[$group->getName()] = $this->toDocument($group);
            }
        }
        if (isset($filter)) {
            return $this->applyFilter($groups, $filter);
        }
        return $groups;
    }

    public function createDocument($key, $document)
    {
        $checked = $this->checkDocument('groups.create', $document);
        if ($checked) {
            $this->users->createGroup($key, $checked);
        }
    }

    public function getDocument($key)
    {
        if ($this->check('groups.view')) {
            $group = $this->users->getGroup($key);
            if ($group) {
                return $this->toDocument($group);
            }
        }
        return null;
    }

    public function updateDocument($key, $document)
    {
    }

    public function deleteDocument($key)
    {
        if ($this->check('groups.delete')) {
            // TODO: cascade
            $this->users->deleteGroup($key);
        }
    }
}
