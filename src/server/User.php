<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep;

use Blogstep\Files\File;

/**
 * Description of User
 */
class User
{
    
    private $username;
    
    private $hash;
    
    private $home;
    
    private $groups;
    
    public function __construct($username, $hash, File $home, array $groups)
    {
        $this->username = $username;
        $this->hash = $hash;
        $this->home = $home;
        $this->groups = array_map('strval', $groups);
    }
    
    public function getName()
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
    
    public function getGroups()
    {
        return $this->groups;
    }
    
    public function isMemberOf($group)
    {
        return in_array($group, $this->groups, true);
    }
    
    public function isSystem()
    {
        return $this->username === 'system' or $this->isMemberOf('system');
    }
}
