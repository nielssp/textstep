<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep;

use Blogstep\Files\FileSystem;

/**
 * Description of User
 */
class User
{
    
    private $id;
    
    private $username;
    
    private $hash;
    
    private $home;
    
    private $primaryGroup;
    
    private $groups;
    
    public function __construct($id, $username, $hash, FileSystem $home, $primaryGroupId, array $groupIds)
    {
        $this->id = $id;
        $this->username = $username;
        $this->hash = $hash;
        $this->home = $home;
        $this->primaryGroup = $primaryGroupId;
        $this->groups = $groupIds;
    }
    
    public function getId()
    {
        return $this->id;
    }
    
    public function getUsername()
    {
        return $this->username;
    }
    
    public function getPassword()
    {
        return $this->hash;
    }
    
    public function getHome()
    {
        return $this->home;
    }
    
    public function getPrimaryGroupId()
    {
        return $this->primaryGroup;
    }
    
    public function isMemberOf($groupId)
    {
        return $groupId === $this->primaryGroup or in_array($groupId, $this->groups, true);
    }
    
    /**
     * 
     * @return \Jivoo\Store\State
     */
    public function getSessions()
    {
        $file = new \Jivoo\Store\PhpStore($this->home->get('.sessions.php')->getRealPath());
        $file->touch();
        return new \Jivoo\Store\State($file);
    }
}
