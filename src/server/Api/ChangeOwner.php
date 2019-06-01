<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Api;

/**
 * Change file owner.
 */
class ChangeOwner extends \Blogstep\AuthenticatedSnippet
{
    
    public function post(array $data)
    {
        $path = '';
        if (isset($data['path'])) {
            $path = $data['path'];
        }
        if (isset($data['owner'])) {
            $fs = $this->m->files->get($path);
            $recursive = isset($data['recursive']) && $data['recursive'] == 'true';
            if (!$fs->set('owner', intval($data['owner']), $recursive)) {
                return $this->error('Could not set owner');
            }
        }
        return $this->response;
    }
    
    public function get()
    {
        return $this->methodNotAllowed();
    }
}
