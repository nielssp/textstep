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
    
    public function __construct($id, $username, $hash, FileSystem $home)
    {
        $this->id = $id;
        $this->username = $username;
        $this->hash = $hash;
        $this->home = $home;
    }
    
    public function authenticate($password)
    {
        return password_verify($password, $this->hash);
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
