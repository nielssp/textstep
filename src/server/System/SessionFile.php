<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\System;

use Blogstep\UserModel;
use Blogstep\SystemAcl;
use Blogstep\Session;

class SessionFile extends SystemFile {

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

    private function toDocument(Session $session)
    {
        return [
            'id' => $session->id,
            'username' => $session->username,
            'validUntil' => date('c', $session->validUntil),
            'ip' => $session->ip,
            'userAgent' => $session->userAgent
        ];
    }

    public function getDocuments()
    {
        $sessions = [];
        if ($this->check('sessions.view')) {
            foreach ($this->users->getSessions() as $session) {
                $sessions[$session->id] = $this->toDocument($session);
            }
        } else if ($this->check('sessions.self.view')) {
            foreach ($this->users->getSessions($this->user) as $session) {
                $sessions[$session->id] = $this->toDocument($session);
            }
        }
        return $sessions;
    }

    public function createDocument($key, $document)
    {
    }

    public function getDocument($key)
    {
        if ($this->check('sessions.view')) {
            $session = $this->users->getSession($key);
            if ($session) {
                return $this->toDocument($session);
            }
        } else if ($this->check('sessions.self.view')) {
            $session = $this->users->getSession($key);
            if ($session and $session['username'] === $this->user->getName()) {
                return $this->toDocument($session);
            }
        }
        return null;
    }

    public function updateDocument($key, $document)
    {
        if (isset($document['validUntil'])) {
            $document['validUntil'] = strtotime($document['validUntil']);
        }
        $checked = $this->checkDocument('sessions.update', $document);
        if ($checked) {
            $this->users->updateSession($key, $checked);
        } else if ($this->user) {
            $checked = $this->checkDocument('sessions.self.update', $document);
            if ($checked) {
                $this->users->updateSession($key, $checked, $this->user);
            }
        }
    }

    public function deleteDocument($key)
    {
        if ($this->check('sessions.delete')) {
            $this->users->deleteSession($key);
        } else if ($this->check('sessions.self.delete')) {
            $this->users->deleteSession($key, $this->user);
        }
    }
}

