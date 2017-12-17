<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Snippets\Api;

use Blogstep\AuthenticatedSnippet;
use Jivoo\Http\Message\PhpStream;
use Jivoo\Http\Message\Response;
use Jivoo\Http\Message\Status;

/**
 * Download thumbnail.
 */
class Thumbnail extends AuthenticatedSnippet
{
    
    public function get()
    {
        $path = '';
        if (isset($this->request->query['path'])) {
            $path = $this->request->query['path'];
        }
        $fs = $this->m->files->get($path);
        if (! $fs->exists()) {
            return $this->error('file not found', Status::NOT_FOUND);
        }
        if (!$fs->isReadable()) {
            return $this->error('not authorized', Status::FORBIDDEN);
        }
        if ($fs->getType() == 'directory') {
            return $this->error('not a file', Status::BAD_REQUEST);
        }
        $path = $fs->getRealPath();
        $imgType = getimagesize($path);
        if ($imgType === false) {
            return $this->error('not an image', Status::BAD_REQUEST);
        }
        $width = $imgType[0];
        $height = $imgType[1];
        
        $maxWidth = $width;
        $maxHeight = $height;
        if (isset($this->request->query['width'])) {
            $maxWidth = intval($this->request->query['width']);
        }
        if (isset($this->request->query['height'])) {
            $maxHeight = intval($this->request->query['height']);
        }
        
        if ($width > $maxWidth or $height > $maxHeight) {
            $ratio = $width / $height;
            if ($ratio < $maxWidth / $maxHeight) {
                $targetHeight = min($height, $maxHeight);
                $targetWidth = floor($targetHeight * $ratio);
            } else {
                $targetWidth = min($width, $maxWidth);
                $targetHeight = floor($targetWidth / $ratio);
            }
        
            $source = null;
            switch ($imgType[2]) {
                case IMAGETYPE_JPEG:
                    $source = imagecreatefromjpeg($path);
                    break;
                case IMAGETYPE_PNG:
                    $source = imagecreatefrompng($path);
                    break;
            }
            if (isset($source) and $source !== false) {
                $resized = imagecreatetruecolor($targetWidth, $targetHeight);
                imagecopyresampled($resized, $source, 0, 0, 0, 0, $targetWidth, $targetHeight, $width, $height);
                $stream = fopen('php://memory', 'wb+');
                if ($stream) {
                    imagepng($resized, $stream);
                    $response = new Response(Status::OK, new PhpStream($stream));
                    imagedestroy($resized);
                    imagedestroy($source);
                    return $response->withHeader('Content-Type', 'image/png');
                }
            }
        }
        $mimeType = $this->m->assets->getMimeType($path);
        $response = Response::file($path, $mimeType);
        return $response;
    }
}
