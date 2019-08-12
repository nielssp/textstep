<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Api;

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
        $maxWidth = null;
        $maxHeight = null;
        $size = '';
        if (isset($this->request->query['width'])) {
            $maxWidth = intval($this->request->query['width']);
            $size .= '_W' . $maxWidth;
        }
        if (isset($this->request->query['height'])) {
            $maxHeight = intval($this->request->query['height']);
            $size .= '_H' . $maxWidth;
        }
        $cacheKey = md5($fs->getPath()) . $size;
        $cached = $this->m->files->get('/var/cache/thumbnails/' . $cacheKey . '.png');
        if ($cached->exists()) {
            if ($this->request->hasHeader('If-Modified-Since')) {
                $time = strtotime($this->request->getHeaderLine('If-Modified-Since'));
                if ($time !== false and $time >= $cached->getModified()) {
                    return new Response(Status::NOT_MODIFIED);
                }
            }
            if ($cached->getCreated() >= $fs->getModified()) {
                $path = $cached->getHostPath();
                $mimeType = $cached->getMimeType();
                $response = Response::file($path, $mimeType);
                $response = $response->withHeader('Last-Modified', date('r', $cached->getModified()));
                return $response;
            }
        } else if (!$cached->getParent()->isDirectory()) {
            $cached->getParent()->makeDirectory(true);
        }
        $path = $fs->getHostPath();
        $imgType = getimagesize($path);
        if ($imgType === false) {
            return $this->error('not an image', Status::BAD_REQUEST);
        }
        $width = $imgType[0];
        $height = $imgType[1];
        
        if (!isset($maxWidth)) {
            $maxWidth = $width;
        }
        if (!isset($maxHeight)) {
            $maxHeight = $width;
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
                $created = false;
                $this->m->acl->withAuthentication('thumbnail.generate', $cached, function ($cached) use ($resized, $created) {
                    try {
                        if ($cached->makeFile()) {
                            $cacheOut = $cached->openStream('wb+');
                            $f = $cacheOut->detach();
                            imagepng($resized, $f);
                            fclose($f);
                            $created = true;
                        }
                    } catch (\Blogstep\Files\FileException $e) {
                    }
                });
                if ($created) {
                    $path = $cached->getHostPath();
                    $mimeType = $cached->getMimeType();
                    $response = Response::file($path, $mimeType);
                    $response = $response->withHeader('Last-Modified', date('r', $cached->getModified()));
                    return $response;
                }
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
        $mimeType = $this->m->files->fileNameToMimeType($path);
        $response = Response::file($path, $mimeType);
        $response = $response->withHeader('Last-Modified', date('r', $fs->getModified()));
        return $response;
    }
}
