<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep;

use Blogstep\Files\FileSystem;
use Jivoo\Assume;
use Jivoo\Binary;
use Jivoo\Random;
use Jivoo\Store\PhpStore;
use Jivoo\Store\State;

/**
 * Description of UserModel
 */
class UserModel implements \Jivoo\Security\UserModel
{
    
    private $fs;
    
    private $system;
    
    private $sessionFile;
    
    private $userFile;
    
    private $users = null;
    
    public function __construct(FileSystem $fs)
    {
        $this->fs = $fs;
        $this->system = new User(0, 'system', null, $fs->get('system'));
        $this->userFile = new PhpStore($fs->get('system/users.php')->getRealPath());
        $this->userFile->touch();
        $this->sessionFile = new PhpStore($this->fs->get('system/sessions.php')->getRealPath());
        $this->sessionFile->touch();
    }
    
    public function getUsers()
    {
        if (! isset($this->users)) {
            $state = new State($this->userFile, false);
            $this->users = [];
            foreach ($state as $id => $user) {
                $this->users[$id] = new User($id, $user['username'], $user['hash'], $this->fs->get($user['home']));
            }
            $state->close();
        }
        return $this->users;
    }
    
    public function createSession($user, $validUntil)
    {
        Assume::isInstanceOf($user, 'Blogstep\User');
        $sessionId = Binary::base64Encode(Random::bytes(32), true);
        $sessions = $user->getSessions();
        $sessions[$sessionId] = $validUntil;
        $sessions->close();
        $state = new State($this->sessionFile, true);
        $state[$sessionId] = $user->getId();
        $state->close();
        return $sessionId;
    }

    public function deleteSession($sessionId)
    {
        $state = new State($this->sessionFile, true);
        $user = null;
        if (isset($state[$sessionId])) {
            $users = $this->getUsers();
            if (isset($users[$state[$sessionId]])) {
                $user = $users[$state[$sessionId]];
                $sessions = $user->getSessions();
                unset($sessions[$sessionId]);
                $sessions->close();
            }
            unset($state[$sessionId]);
        }
        $state->close();
    }

    public function findUser(array $data)
    {
        foreach ($this->getUsers() as $id => $user) {
            if ($user->getUsername() === $data['username']) {
                return $user;
            }
        }
        return null;
    }
    
    public function getPassword($user)
    {
        Assume::isInstanceOf($user, 'Blogstep\User');
        return $user->getPassword();
    }

    public function openSession($sessionId)
    {
        $state = new State($this->sessionFile, false);
        $user = null;
        if (isset($state[$sessionId])) {
            $users = $this->getUsers();
            if (isset($users[$state[$sessionId]])) {
                $user = $users[$state[$sessionId]];
                $sessions = $user->getSessions();
                if (! isset($sessions[$sessionId])) {
                    $user = null;
                } elseif ($sessions[$sessionId] < time()) {
                    $user = null;
                    unset($sessions[$sessionId]);
                }
                if (! isset($user)) {
                    // Upgrade lock and delete session in $state ?
                }
                $sessions->close();
            }
        }
        $state->close();
        return $user;
    }

    public function renewSession($sessionId, $validUntil)
    {
        $state = new State($this->sessionFile, false);
        $user = null;
        if (isset($state[$sessionId])) {
            $users = $this->getUsers();
            if (isset($users[$state[$sessionId]])) {
                $user = $users[$state[$sessionId]];
                $sessions = $user->getSessions();
                $sessions[$sessionId] = $validUntil;
                $sessions->close();
            }
        }
        $state->close();
    }
}
