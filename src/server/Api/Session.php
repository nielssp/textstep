<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Api;

class Session extends \Blogstep\Snippet
{
    
    public function post(array $data)
    {
        if (!isset($data['username'])) {
            return $this->error('Missing data: "username"');
        }
        if (!isset($data['password'])) {
            return $this->error('Missing data: "password"');
        }
        $user = $this->m->users->getUser($data['username']);
        if (isset($user)) {
            if ($this->m->users->verifyPassword($user, $data['password'])) {
                $sessionId = $this->m->users->createSession($user, time() + 36000);
                $this->m->logger->info('User authenticated: {user}', ['user' => $user->getName()]);
                return $this->json([
                    'sessionId' => $sessionId
                ]);
            }
        }
        return $this->error('Invalid username or password', \Jivoo\Http\Message\Status::FORBIDDEN);
    }
    
    public function delete()
    {
        if ($this->request->hasHeader('X-Auth-Token')) {
            $sessionId = $this->request->getHeaderLine('X-Auth-Token');
        } else if (isset($this->request->query['access_token'])) {
            $sessionId = $this->request->query['access_token'];
        } else {
            return $this->error('Missing authentication header');
        }
        $this->m->users->deleteSession($sessionId);
        return $this->ok();
    }
    
    public function get()
    {
        return $this->methodNotAllowed();
    }
}
