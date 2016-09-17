<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Snippets;

/**
 * Description of Login
 */
class Login extends \Blogstep\Snippet
{
    
    public function before()
    {
        if ($this->m->auth->isLoggedIn()) {
            return $this->redirect('snippet:Files');
        }
        $this->m->auth->form = new \Jivoo\Security\Authentication\FormAuthentication();
        return null;
    }
    
    public function post(array $data)
    {
        if ($this->m->auth->authenticate($data)) {
            if (isset($data['remember'])) {
                $this->m->auth->cookie->create();
            } else {
                $this->m->auth->session->create();
            }
            return $this->redirect('snippet:Files');
        } else {
            echo 'incorrect username or password';
            exit;
        }
        return $this->render();
    }
    
    public function get()
    {
        return $this->render();
    }
}
