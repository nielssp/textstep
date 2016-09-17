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
        if (isset($this->request->query['path'])) {
            $path = $this->request->query['path'];
        }
        $fs = $this->m->files->get($path);
        if (!$fs->isWritable()) {
            return $this->error('not authorized', \Jivoo\Http\Message\Status::UNAUTHORIZED);
        }
        $files = $this->request->getUploadedFiles();
        foreach ($files as $file) {
            $target = $fs->get($file->name);
            $file->moveTo($target->getRealPath());
            $target->set('mode', $fs->getMode());
            $target->set('group', $fs->getGroup());
            $target->set('owner', $this->m->auth->user->getId());
        }
        return $this->response;
    }
    
    public function get()
    {
        return $this->methodNotAllowed();
    }
}
