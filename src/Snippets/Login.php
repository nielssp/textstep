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
    private function afterLogin()
    {
        if (isset($this->m->session['loginReturnPath'])) {
            $path = $this->m->session->get('loginReturnPath', []);
            $query = $this->m->session->get('loginReturnQuery', []);
            unset($this->m->session['loginReturnPath']);
            unset($this->m->session['loginReturnQuery']);
            return $this->redirect([
                'path' => $path,
                'query' => $query
            ]);
        }
        return $this->redirect('snippet:Files');
    }
    
    public function before()
    {
        if ($this->m->auth->isLoggedIn()) {
            return $this->afterLogin();
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
            if ($this->request->isAjax()) {
                return $this->ok();
            }
            return $this->afterLogin();
        } else {
            if ($this->request->isAjax()) {
                return $this->error('Invalid username or password', \Jivoo\Http\Message\Status::FORBIDDEN);
            }
            $this->viewData['username'] = $data['username'];
        }
        return $this->render();
    }
    
    public function get()
    {
        return $this->render();
    }
}
