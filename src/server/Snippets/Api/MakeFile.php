<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Snippets\Api;

/**
 * Create file.
 */
class MakeFile extends \Blogstep\AuthenticatedSnippet
{
    
    public function post(array $data)
    {
        $path = '';
        if (isset($data['path'])) {
            $path = $data['path'];
        }
        $fs = $this->m->files->get($path);
        if ($fs->makeFile()) {
            return $this->json($fs->getBrief());
        }
        return $this->error('File exists or can not be created');
    }
    
    public function get()
    {
        return $this->methodNotAllowed();
    }
}
