<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Snippets\Api;

class Login extends \Blogstep\Snippet
{
    
    public function post(array $data)
    {
        if ($this->m->auth->isLoggedIn()) {
            return $this->ok();
        }
        $this->m->auth->form = new \Jivoo\Security\Authentication\FormAuthentication();
        if ($this->m->auth->authenticate($data)) {
            if (isset($data['remember'])) {
                $this->m->auth->cookie->create();
            } else {
                $this->m->auth->session->create();
            }
            return $this->ok();
        } else {
            return $this->error('Invalid username or password', \Jivoo\Http\Message\Status::FORBIDDEN);
        }
    }
    
    public function get()
    {
        return $this->methodNotAllowed();
    }
}
