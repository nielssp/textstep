<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Api;

class Login extends \Blogstep\Snippet
{
    
    public function post(array $data)
    {
        $this->m->auth->form = new \Jivoo\Security\Authentication\FormAuthentication();
        if ($this->m->auth->authenticate($data)) {
            $sessionId = $this->m->users->createSession($this->m->auth->user, time() + 36000);
            $this->m->logger->info('User authenticated: {user}', ['user' => $this->m->auth->user->getName()]);
            return $this->json([
              'session_id' => $sessionId
            ]);
        } else {
            return $this->error('Invalid username or password', \Jivoo\Http\Message\Status::FORBIDDEN);
        }
    }
    
    public function get()
    {
        return $this->methodNotAllowed();
    }
}
