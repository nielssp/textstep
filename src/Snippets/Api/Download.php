<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Snippets\Api;

/**
 * Download file.
 */
class Download extends \Blogstep\AuthenticatedSnippet
{
    
    public function get()
    {
        $path = '';
        if (isset($this->request->query['path'])) {
            $path = $this->request->query['path'];
        }
        $fs = $this->m->files->get($path);
        if (! $fs->exists()) {
            return $this->error('file not found', \Jivoo\Http\Message\Status::NOT_FOUND);
        }
        if (!$fs->isReadable()) {
            return $this->error('not authorized', \Jivoo\Http\Message\Status::UNAUTHORIZED);
        }
        $path = $fs->getRealPath();
        $type = $this->m->assets->getMimeType($path);
        return \Jivoo\Http\Message\Response::file($path, $type);
    }
}