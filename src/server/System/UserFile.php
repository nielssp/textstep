<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\System;

use Blogstep\UserModel;
use Blogstep\SystemAcl;
use Blogstep\User;

class UserFile extends SystemFile
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

    public function getCreated()
    {
    }

    private function toDocument(User $user)
    {
        return [
            'username' => $user->getName(),
            'home' => $user->getHome()->getPath(),
            'groups' => $user->getGroups(),
        ];
    }

    public function getDocuments($filter = null)
    {
        $users = [];
        if ($this->check('users.view')) {
            foreach ($this->users->getUsers() as $user) {
                $users[$user->getName()] = $this->toDocument($user);
            }
        } elseif ($this->check('users.self.view')) {
            $users[$this->user->getName()] = $this->toDocument($this->user);
        }
        if (isset($filter)) {
            return $this->applyFilter($users, $filter);
        }
        return $users;
    }

    public function createDocument($key, $document)
    {
        $checked = $this->checkDocument('users.create', $document);
        if ($checked) {
            $this->users->createUser($key, $checked);
        }
    }

    public function getDocument($key)
    {
        if ($this->check('users.view')) {
            $user = $this->users->getUser($key);
            if ($user) {
                return $this->toDocument($user);
            }
        } elseif ($this->check('users.self.view') and $key === $this->user->getName()) {
            return $this->toDocument($this->user);
        }
        return null;
    }

    public function updateDocument($key, $document)
    {
        $checked = $this->checkDocument('users.update', $document);
        if ($checked) {
            $this->users->updateUser($key, $checked);
        } elseif ($this->user and $key === $this->user->getName()) {
            $checked = $this->checkDocument('users.self.update', $document);
            if ($checked) {
                $this->users->updateUser($key, $checked);
            }
        }
    }

    public function deleteDocument($key)
    {
        if ($this->check('users.delete')) {
            $this->users->deleteUser($key);
        } elseif ($this->check('users.self.delete') and $key === $this->user->getName()) {
            $this->users->deleteUser($key);
        }
    }
}
