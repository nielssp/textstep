<?php
// TEXTSTEP 
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep;

class Session
{

    public $id;
    
    public $username;
    
    public $validUntil;

    public $ip;

    public $userAgent;
    
    public function __construct($id, $username, $validUntil, $ip, $userAgent)
    {
        $this->id = $id;
        $this->username = $username;
        $this->validUntil = intval($validUntil);
        $this->ip = $ip;
        $this->userAgent = $userAgent;
    }
}
