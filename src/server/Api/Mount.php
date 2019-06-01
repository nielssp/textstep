<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Api;

/**
 * Mount file system.
 */
class Mount extends \Blogstep\AuthenticatedSnippet
{
    
    public function post(array $data)
    {
        if (isset($data['path']) and isset($data['target'])) {
            $path = $data['path'];
            $target = $data['target'];
            $fs = $this->m->files->get($path);
            $this->m->mounts->mount($fs, $target);
        }
        return $this->ok();
    }
    
    public function get()
    {
        return $this->methodNotAllowed();
    }
}
