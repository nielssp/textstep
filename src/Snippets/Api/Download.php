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
            return $this->error('not authorized', \Jivoo\Http\Message\Status::FORBIDDEN);
        }
        if ($fs->getType() == 'directory') {
            if (extension_loaded('zip')) {
                // TODO: create zip file as a stream
                return $this->error('not implemented');
            }
            return $this->error('extension not loaded: zip');
        }
        $path = $fs->getRealPath();
        $type = $this->m->assets->getMimeType($path);
        if (!isset($type)) {
            $type = 'application/octet-stream';
        }
        $response = \Jivoo\Http\Message\Response::file($path, $type);
        if (isset($this->request->query['force'])) {
//            $type = 'application/octet-stream';
            $response = $response->withHeader('Content-Disposition', 'attachment');
        }
        return $response;
    }
}
