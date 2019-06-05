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
use Jivoo\Store\AccessException;
use Jivoo\Store\StateMap;

/**
 * Description of UserModel
 */
class UserModel
{
    
    private $fs;
    
    private $systemGroup;
    
    private $system;
    
    /**
     * @var StateMap
     */
    private $state;
    
    private $users = null;
    
    private $groups = null;
    
    public function __construct(File $fs, $systemDir)
    {
        $this->fs = $fs;
        $this->systemGroup = new Group('system');
        $this->system = new User('system', null, $fs->get('system'), ['system']);
        $this->state = new StateMap($systemDir);
    }

    private function createUserObject($user)
    {
        return new User(
            $user['username'],
            $user->get('hash', ''),
            $this->fs->get($user->get('home', '/home/' . $user['username'])),
            $user->get('groups', [])
        );
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
                $this->users[$name] = $this->createUserObject($user);
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

    private function updateUserData($document, $data)
    {
        if (isset($data['password']) and is_string($data['password'])) {
            $document['hash'] = password_hash($data['password'], PASSWORD_DEFAULT);
        }
        if (isset($data['home']) and is_string($data['home'])) {
            $document['home'] = $data['home'];
        }
        if (isset($data['groups']) and is_array($data['groups'])) {
            $document['groups'] = array_unique(array_map('strval', array_values($data['groups'])));
        }
    }

    public function createUser($name, array $data)
    {
        $state = $this->state->write('users');
        if (!isset($state[$name])) {
            $user = $state->getSubset($name);
            $user['username'] = $name;
            $user->setDefault('home', '/home/' . $name);
            $user->setDefault('hash', '');
            $user->setDefault('groups', ['users']);
            $this->updateUserData($user, $data);
            if (isset($this->users)) {
                $this->users[$name] = $this->createUserObject($user);
            }
        }
        $state->close();
    }

    public function updateUser($name, array $data)
    {
        $state = $this->state->write('users');
        if (isset($state[$name])) {
            $user = $state->getSubset($name);
            $this->updateUserData($user, $data);
            if (isset($this->users)) {
                $this->users[$name] = $this->createUserObject($user);
            }
        }
        $state->close();
    }

    public function deleteUser($name)
    {
        $state = $this->state->write('users');
        if (isset($state[$name])) {
            unset($state[$name]);
            if (isset($this->users) and isset($this->users[$name])) {
                unset($this->users[$name]);
            }
        }
        $state->close();
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

    private function createSessionObject($id, $doc)
    {
        return new Session(
            $id,
            $doc['username'],
            $doc['validUntil'],
            $doc['ip'],
            $doc['userAgent']
        );
    }

    public function getSessions(User $user = null)
    {
        $state = $this->state->read('sessions');
        $sessions = [];
        foreach ($state as $id => $doc) {
            if (!is_array($doc)) {
                continue;
            }
            if (isset($user) and $doc['username'] !== $user->getName()) {
                continue;
            }
            $sessions[$id] = $this->createSessionObject($id, $doc);
        }
        $state->close();
        return $sessions;
    }

    public function getSession($sessionId)
    {
        $state = $this->state->read('sessions');
        $session = null;
        if (isset($state[$sessionId])) {
            $session = $this->createSessionObject($state[$sessionId]);
        }
        $state->close();
        return $session;
    }
    
    public function createSession($user, $validUntil)
    {
        Assume::isInstanceOf($user, 'Blogstep\User');
        $sessionId = Binary::base64Encode(Random::bytes(32), true);
        $state = $this->state->write('sessions');
        $state[$sessionId] = [
            'username' => $user->getName(),
            'validUntil' => $validUntil,
            'ip' => $_SERVER['REMOTE_ADDR'],
            'userAgent' => $_SERVER['HTTP_USER_AGENT']
        ];
        $state->close();
        return $sessionId;
    }

    public function updateSession($sessionId, $data = [], User $user = null)
    {
        $state = $this->state->write('sessions');
        if (isset($state[$sessionId]) and (!isset($user) or $user->getName() === $state[$sessionId]['username'])) {
            $session = $state->getSubset($sessionId);
            if (isset($data['validUntil'])) {
                $session['validUntil'] = $data['validUntil'];
            }
        }
        $state->close();
    }

    public function deleteSession($sessionId, User $user = null)
    {
        $state = $this->state->write('sessions');
        if (isset($state[$sessionId]) and (!isset($user) or $user->getName() === $state[$sessionId]['username'])) {
            unset($state[$sessionId]);
        }
        $state->close();
    }

    public function verifyPassword(User $user, $password)
    {
        if (password_verify($password, $user->getPassword())) {
            if (password_needs_rehash($user->getPassword(), PASSWORD_DEFAULT)) {
                $this->updateUser($user->getName(), ['password' => $password]);
            }
            return true;
        }
        return false;
    }

    public function openSession($sessionId)
    {
        $state = $this->state->write('sessions');
        $user = null;
        if (isset($state[$sessionId])) {
            $session = $state[$sessionId];
            if (isset($session['username']) and isset($session['validUntil']) and $session['validUntil'] > time()) {
                $user = $this->getUser($session['username']);
            }
            if (! isset($user)) {
                unset($state[$sessionId]);
            }
        }
        $state->close();
        return $user;
    }

    public function renewSession($sessionId, $validUntil)
    {
        $this->updateSession($sessionId, ['validUntil' => $validUntil]);
    }
}
