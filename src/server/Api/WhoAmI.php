<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Api;

/**
 * Current user information.
 */
class WhoAmI extends \Blogstep\AuthenticatedSnippet
{

    protected function unauthorizedError($error)
    {
        return $this->json(null);
    }
    
    public function get()
    {
        return $this->json([
            'username' => $this->user->getName(),
            'home' => $this->user->getHome()->getPath(),
            'shell' => 'files',
            'version' => \Blogstep\Main::VERSION,
            'groups' => $this->user->getGroups(),
            'system' => $this->user->isSystem(),
            'permissions' => $this->m->acl->getPermissions($this->user)
        ]);
    }
}
