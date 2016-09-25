<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Snippets\Api;

/**
 * Move file/directory.
 */
class Move extends \Blogstep\AuthenticatedSnippet
{
    
    public function post(array $data)
    {
        if (!isset($data['path']) or !isset($data['destination'])) {
            return $this->error('Expected data: path, destination');
        }
        $fs = $this->m->files->get($data['path']);
        $dest = $this->m->files->get($data['destination']);
        if ($fs->move($dest)) {
            return $this->ok();
        }
        return $this->error('File could not be copied');
    }
    
    public function get()
    {
        return $this->methodNotAllowed();
    }
}
