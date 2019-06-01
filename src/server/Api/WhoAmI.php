<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Api;

/**
 * Current user information.
 */
class WhoAmI extends \Blogstep\Snippet
{
    
    public function get()
    {
        if (! $this->m->auth->isLoggedIn()) {
            return $this->json(null);
        }
        $this->m->files->setAuthentication($this->m->auth->user);
        $user = $this->m->auth->user;
        return $this->json([
            'username' => $user->getName(),
            'home' => $user->getHome()->getPath(),
            'shell' => 'files',
            'version' => \Blogstep\Main::VERSION
        ]);
    }
}
