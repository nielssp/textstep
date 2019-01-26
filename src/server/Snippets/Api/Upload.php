<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Snippets\Api;

/**
 * File upload.
 */
class Upload extends \Blogstep\AuthenticatedSnippet
{
    
    public function post(array $data)
    {
        $path = '';
        if (isset($data['path'])) {
            $path = $data['path'];
        }
        $fs = $this->m->files->get($path);
        if (!$fs->isWritable()) {
            return $this->error('not authorized', \Jivoo\Http\Message\Status::FORBIDDEN);
        }
        $files = $this->request->getUploadedFiles();
        foreach ($files as $file) {
            $target = $fs->get($file->name);
            if (!$target->moveHere($file)) {
                return $this->error('could not upload file: ' . $file->name);
            }
        }
        return $this->response;
    }
    
    public function get()
    {
        return $this->methodNotAllowed();
    }
}
