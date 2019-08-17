<?php
// TEXTSTEP 
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Api;

/**
 * Delete multiple files/directories.
 */
class Delete extends \Blogstep\AuthenticatedSnippet
{
    
    public function post(array $data)
    {
        if (isset($data['paths'])) {
            $paths = $data['paths'];
        } elseif (isset($data['path'])) {
            $paths = [$data['path']];
        } else {
            return $this->error('Expected data: "path" or "paths"');
        }
        foreach ($paths as $path) {
            $fs = $this->m->files->get($path);
            if (!$fs->delete()) {
                return $this->error('File could not be deleted');
            }
        }
        return $this->ok();
    }
    
    public function get()
    {
        return $this->methodNotAllowed();
    }
}
