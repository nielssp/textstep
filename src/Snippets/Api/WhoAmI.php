<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Snippets\Api;

/**
 * Current user information.
 */
class WhoAmI extends \Blogstep\AuthenticatedSnippet
{
    
    public function get()
    {
        $user = $this->m->auth->user;
        return $this->json([
            'id' => $user->getId(),
            'username' => $user->getUsername(),
            'home' => $user->getHome()->getPath()
        ]);
    }
}
