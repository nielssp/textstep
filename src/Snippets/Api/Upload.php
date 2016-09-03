<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Snippets\Api;

/**
 * File upload.
 */
class Upload extends \Blogstep\Snippet
{
    
    public function post($data)
    {
        $path = '';
        if (isset($this->request->query['path'])) {
            $path = $this->request->query['path'];
        }
        $fs = $this->m->files->get($path);
        $files = $this->request->getUploadedFiles();
        foreach ($files as $file) {
            $target = $fs->get($file->name);
            $file->moveTo($target->getRealPath());
        }
        return $this->response->withStatus(\Jivoo\Http\Message\Status::OK);
    }
    
    public function get()
    {
        $e = new \Jivoo\Http\ClientException('Method not allowed');
        $e->statusCode = \Jivoo\Http\Message\Status::METHOD_NOT_ALLOWED;
        throw $e;
    }
}
