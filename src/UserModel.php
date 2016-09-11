<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep;

/**
 * Description of UserModel
 */
class UserModel// implements \Jivoo\Security\UserModel
{
    
    private $fs;
    
    private $system;
    
    private $userFile;
    
    public function __construct(Files\FileSystem $fs)
    {
        $this->fs = $fs;
        $this->system = new User(0, 'system', null, $fs->get('system'));
        $this->userFile = new \Jivoo\Store\PhpStore($fs->get('system/users.php')->getRealPath());
        $this->userFile->touch();
    }
    
    public function createSession($user, $validUntil)
    {
        \Jivoo\Assume::isInstanceOf($user, 'Blogstep\User');
        $sessionId = \Jivoo\Binary::base64Encode(\Jivoo\Random::bytes(32), true);
        $sessions = $user->getSessions();
        $sessions[$sessionId] = $validUntil;
        $sessions->close();
        return $sessionId;
    }

    public function deleteSession($sessionId)
    {
        
    }

    public function findUser(array $data)
    {
        $state = new \Jivoo\Store\State($this->userFile, false);
        foreach ($state as $id => $user) {
            if ($user['username'] === $data['username']) {
                return new User($id, $user['username'], $user['hash'], $this->fs->get($user['home']));
            }
        }
        return null;
    }

    public function openSession($sessionId)
    {
        
    }

    public function renewSession($sessionId, $validUntil)
    {
        
    }
}
