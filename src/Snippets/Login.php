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
        $this->viewData['token'] = $this->m->token;
        return null;
    }
    
    public function post(array $data)
    {
        $user = $this->m->users->findUser($data);
        if (isset($user) and $user->authenticate($data['password'])) {
            echo $this->m->users->createSession($user, time() + 30);exit;
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
