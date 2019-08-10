<?php
// TEXTSTEP 
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Api;

/**
 * Read/write file content.
 */
class Content extends \Blogstep\AuthenticatedSnippet
{
    protected $parseBody = false;
    
    public function get()
    {
        $file = $this->getRequestedFile();
        if (! $file->exists()) {
            return $this->error('File not found', \Jivoo\Http\Message\Status::NOT_FOUND);
        }
        if (!$file->isReadable()) {
            return $this->error('Not authorized', \Jivoo\Http\Message\Status::FORBIDDEN);
        }
        if ($file->getType() == 'directory') {
            if (extension_loaded('zip')) {
                // TODO: create zip file as a stream
                return $this->error('Not implemented');
            }
            return $this->error('Extension not loaded: zip');
        }
        $type = $file->getMimeType();
        if (!isset($type)) {
            $type = 'application/octet-stream';
        }
        $stream = $file->openStream('rb');
        $response = new \Jivoo\Http\Message\Response(\Jivoo\Http\Message\Status::OK, $stream);
        $response = $response->withHeader('Content-Type', $type);
        if (isset($this->request->query['force']) and $this->request->query['force'] === 'true') {
            $response = $response->withHeader('Content-Disposition', 'attachment');
        }
        return $response;
    }

    public function post(array $data)
    {
        $file = $this->getRequestedFile();
        if (!$file->isWritable()) {
            return $this->error('Permission denied', \Jivoo\Http\Message\Status::FORBIDDEN);
        }
        $files = $this->request->getUploadedFiles();
        if (!isset($files['files']) or !is_array($files['files'])) {
            return $this->error('Missing data: "files[]"');
        }
        foreach ($files['files'] as $src) {
            $target = $file->get($src->name);
            if (!$target->moveHere($src)) {
                return $this->error('Could not upload file: ' . $src->name);
            }
        }
        return $this->ok();
    }

    public function put(array $data)
    {
        $file = $this->getRequestedFile();
        $contentType = strtolower($this->request->getHeaderLine('Content-Type'));
        $data = $this->request->getBody()->getContents();
        if (isset($this->request->query['append']) and $this->request->query['append'] === 'true') {
            $stream = $fs->openStream('ab');
            $stream->write($data);
            $stream->close();
        } else {
            $file->putContents($data);
        }
        return $this->ok();
    }

    public function delete()
    {
        $file = $this->getRequestedFile();
        $file->putContents('');
        return $this->ok();
    }
}
