<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Api;

/**
 * Move file/directory.
 */
class Move extends \Blogstep\AuthenticatedSnippet
{
    
    public function post(array $data)
    {
        if (isset($data['paths'])) {
            $paths = $data['paths'];
        } elseif (isset($data['path']) and isset($data['destination'])) {
            $paths = [$data['path'] => $data['destination']];
        } else {
            return $this->error('Expected data: path, destination');
        }
        foreach ($paths as $path => $destination) {
            $fs = $this->m->files->get($path);
            $dest = $this->m->files->get($destination);
            if (!$fs->move($dest)) {
                return $this->error('File could not be moved');
            }
        }
        return $this->ok();
    }
    
    public function get()
    {
        return $this->methodNotAllowed();
    }
}
