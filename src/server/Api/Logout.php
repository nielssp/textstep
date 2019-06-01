<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Api;

class Logout extends \Blogstep\AuthenticatedSnippet
{
    
    public function post(array $data)
    {
        $this->m->auth->deauthenticate();
        return $this->ok();
    }
    
    public function get()
    {
        return $this->methodNotAllowed();
    }
}
