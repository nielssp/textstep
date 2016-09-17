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

/**
 * Description of UserModel
 */
class UserModel implements \Jivoo\Security\UserModel
{
    
    private $fs;
    
    private $systemGroup;
    
    private $system;
    
    /**
     * @var \Jivoo\Store\StateMap
     */
    private $state;
    
    private $users = null;
    
    private $groups = null;
    
    public function __construct(FileSystem $fs)
    {
        $this->fs = $fs;
        $this->systemGroup = new Group(0, 'system');
        $this->system = new User(0, 'system', null, $fs->get('system'), 0, []);
        $this->state = new \Jivoo\Store\StateMap($fs->get('system')->getRealPath());
    }
    
    public function getUsers()
    {
        if (! isset($this->users)) {
            $state = $this->state->read('users');
            $this->users = [];
            foreach ($state as $id => $data) {
                $user = $state->getSubset($id);
                if (!isset($user['username'])) {
                    // TODO: Warning
                    continue;
                }
                $this->users[$id] = new User(
                    $id,
                    $user['username'],
                    $user->get('hash', ''),
                    $this->fs->get($user->get('home', '/home/' . $user['username'])),
                    $user->get('group', -1),
                    $user->get('groups', [])
                );
            }
            $state->close();
        }
        return $this->users;
    }
    
    public function getGroups()
    {
        if (! isset($this->groups)) {
            $state = $this->state->read('groups');
            $this->groups = [];
            foreach ($state as $id => $group) {
                $this->groups[$id] = new Group($id, $group['name']);
            }
            $state->close();
        }
        return $this->groups;
    }
    
    public function getUser($userId)
    {
        if ($userId === 0) {
            return $this->system;
        }
        $users = $this->getUsers();
        if (isset($users[$userId])) {
            return $users[$userId];
        }
        return null;
    }
    
    public function getGroup($groupId)
    {
        if ($groupId === 0) {
            return $this->systemGroup;
        }
        $groups = $this->getGroups();
        if (isset($groups[$groupId])) {
            return $groups[$groupId];
        }
        return null;
    }
    
    public function createSession($user, $validUntil)
    {
        Assume::isInstanceOf($user, 'Blogstep\User');
        $sessionId = Binary::base64Encode(Random::bytes(32), true);
        $sessions = $user->getSessions();
        $sessions[$sessionId] = $validUntil;
        $sessions->close();
        $state = $this->state->write('sessions');
        $state[$sessionId] = $user->getId();
        $state->close();
        return $sessionId;
    }

    public function deleteSession($sessionId)
    {
        $state = $this->state->write('sessions');
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
        $state = $this->state->read('sessions');
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
        $state = $this->state->read('sessions');
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
