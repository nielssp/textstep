<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Api;

/**
 * Write file content.
 */
class Write extends \Blogstep\AuthenticatedSnippet
{
    
    public function post(array $data)
    {
        $path = '';
        if (isset($data['path'])) {
            $path = $data['path'];
        }
        $fs = $this->m->files->get($path);
        $fs->putContents($data['data']);
        return $this->response->withStatus(\Jivoo\Http\Message\Status::OK);
    }
    
    public function get()
    {
        return $this->methodNotAllowed();
    }
}
