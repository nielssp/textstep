<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep;

use Blogstep\Files\File;
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
    
    public function __construct(File $fs)
    {
        $this->fs = $fs;
        $this->systemGroup = new Group('system');
        $this->system = new User('system', null, $fs->get('system'), 'system', []);
        $this->state = new \Jivoo\Store\StateMap($fs->get('system')->getRealPath());
    }
    
    public function getUsers()
    {
        if (! isset($this->users)) {
            $state = $this->state->read('users');
            $this->users = [];
            foreach ($state as $name => $data) {
                $user = $state->getSubset($name);
                if (!isset($user['username']) or $name !== $user['username']) {
                    trigger_error('missing or incorrect name for user: ' . $name, E_USER_WARNING);
                    continue;
                }
                $this->users[$name] = new User(
                    $user['username'],
                    $user->get('hash', ''),
                    $this->fs->get($user->get('home', '/home/' . $user['username'])),
                    $user->get('group', ''),
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
            foreach ($state as $name => $group) {
                if (!isset($group['name']) or $name !== $group['name']) {
                    trigger_error('missing or incorrect name for group: ' . $name, E_USER_WARNING);
                    continue;
                }
                $this->groups[$name] = new Group($group['name']);
            }
            $state->close();
        }
        return $this->groups;
    }
    
    public function createGroup($name)
    {
        $state = $this->state->write('groups');
        $state[$name] = ['name' => $name];
        $state->close();
        $this->groups[$name] = new Group($name);
        return $this->groups[$name];
    }
    
    public function getUser($user)
    {
        if ($user === 'system') {
            return $this->system;
        }
        $users = $this->getUsers();
        if (isset($users[$user])) {
            return $users[$user];
        }
        return null;
    }
    
    public function getGroup($group)
    {
        if ($group === 'system') {
            return $this->systemGroup;
        }
        $groups = $this->getGroups();
        if (isset($groups[$group])) {
            return $groups[$group];
        }
        return null;
    }
    
    /**
     * @deprecated since version 0.2.0
     */
    public function findGroup($name)
    {
        if ($name === 'system') {
            return $this->systemGroup;
        }
        $groups = $this->getGroups();
        foreach ($groups as $group) {
            if ($group->getName() === $name) {
                return $group;
            }
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
        $state[$sessionId] = $user->getName();
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
        return $this->getUser($data['username']);
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
                try {
                    $sessions = $user->getSessions();
                    if (! isset($sessions[$sessionId])) {
                        $user = null;
                    } elseif ($sessions[$sessionId] < time()) {
                        $user = null;
                        unset($sessions[$sessionId]);
                    }
                    $sessions->close();
                } catch (\Jivoo\Store\AccessException $e) {
                   $user = null;
                }
            }
            if (! isset($user)) {
                $state = $this->state->write('sessions');
                unset($state[$sessionId]);
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
