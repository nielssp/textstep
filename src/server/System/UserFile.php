<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\System;

use Blogstep\UserModel;
use Blogstep\SystemAcl;

class UserFile extends SystemFile {

    private $users;

    private $acl;

    public function __construct(UserModel $users, SystemAcl $acl)
    {
        $this->users = $users;
        $this->acl = $acl;
    }

    public function getModified()
    {
    }

    public function getCreated()
    {
    }

    public function lock()
    {
    }

    public function unlock()
    {
    }

    public function getDocuments()
    {
        $users = [];
        foreach ($this->users->getUsers() as $user) {
            $users[$user->getName()] = [
                'username' => $user->getName(),
                'home' => $user->getHome()->getPath()
            ];
        }
        return $users;
    }

    public function updateDocuments($documents)
    {
    }

    public function createDocument($key, $document)
    {
    }

    public function getDocument($key)
    {
    }

    public function updateDocument($key, $document)
    {
    }

    public function deleteDocument($key)
    {
    }
}
