<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Api;

use Blogstep\RuntimeException;

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
                    'sessionId' => $sessionId,
                    'user' => [
                        'username' => $user->getName(),
                        'home' => $user->getHome()->getPath(),
                        'shell' => 'files',
                        'version' => \Blogstep\Main::VERSION,
                        'groups' => $user->getGroups(),
                        'system' => $user->isSystem(),
                        'permissions' => $this->m->acl->getPermissions($user)
                    ]
                ]);
            }
        }
        throw new RuntimeException(RuntimeException::INVALID_CREDENTIALS, 'Invalid username or password');
    }
    
    public function delete()
    {
        if ($this->request->hasHeader('X-Auth-Token')) {
            $sessionId = $this->request->getHeaderLine('X-Auth-Token');
        } elseif (isset($this->request->query['access_token'])) {
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
