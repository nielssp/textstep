<?php
// BlogSTEP 
// Copyright (c) 2017 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Snippets\Api;

/**
 * Append file content.
 */
class Append extends \Blogstep\AuthenticatedSnippet
{
    
    public function post(array $data)
    {
        $path = '';
        if (isset($data['path'])) {
            $path = $data['path'];
        }
        $fs = $this->m->files->get($path);
        $stream = $fs->openStream('ab');
        $stream->write($data['data']);
        $stream->close();
        return $this->response->withStatus(\Jivoo\Http\Message\Status::OK);
    }
    
    public function get()
    {
        return $this->methodNotAllowed();
    }
}
