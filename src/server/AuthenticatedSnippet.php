<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep;

/**
 * Description of AuthenticatedSnippet
 */
class AuthenticatedSnippet extends Snippet
{
    protected $sessionId = null;

    protected $user = null;

    protected function unauthorizedError($error)
    {
        return $this->error($error, \Jivoo\Http\Message\Status::UNAUTHORIZED);
    }

    public function before()
    {
        if ($this->request->hasHeader('X-Auth-Token')) {
            $sessionId = $this->request->getHeaderLine('X-Auth-Token');
        } else if (isset($this->request->query['access_token'])) {
            $sessionId = $this->request->query['access_token'];
        } else {
            return $this->unauthorizedError('Missing authentication header');
        }
        $user = $this->m->users->openSession($sessionId);
        if (!$user) {
            return $this->unauthorizedError('Invalid session');
        }
        $this->sessionId = $sessionId;
        $this->user = $user;
        $this->m->files->setAuthentication($this->user);
        $this->m->system->setAuthentication($this->user);
    }
}
