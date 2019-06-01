<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\System;

use Blogstep\Files\Device;
use Blogstep\Files\FileException;
use Jivoo\Json;
use Jivoo\Http\Message\UploadedFile;
use Blogstep\User;

class SystemDevice implements Device {
    private $files = [];

    private $user = null;

    public function setAuthentication(User $user = null)
    {
        $this->user = $user;
    }

    public function addFile($path, SystemFile $file)
    {
        $this->files['/' . ltrim($path, '/')] = $file;
    }

    public function scan($path)
    {
        $names = [];
        if ($path === '/') {
            foreach ($this->files as $p => $file) {
                $names[] = ltrim($p, '/');
            }
        }
        return $names;
    }

    public function getSize($path)
    {
        return 0;
    }

    public function getModified($path)
    {
        if (isset($this->files[$path])) {
            return $this->files[$path]->getModified();
        }
        return 0;
    }

    public function getCreated($path)
    {
        if (isset($this->files[$path])) {
            return $this->files[$path]->getCreated();
        }
        return 0;
    }

    public function isReadable($path)
    {
        return $path === '/' or isset($this->files[$path]);
    }

    public function isWritable($path)
    {
        return isset($this->files[$path]);
    }

    public function isDirectory($path)
    {
        return $path === '/';
    }

    public function exists($path)
    {
        return isset($this->files[$path]);
    }

    public function delete($path)
    {
        throw new FileException(FileException::NOT_ALLOWED, 'Not allowed');
    }

    public function copy($source, $destination)
    {
        throw new FileException(FileException::NOT_ALLOWED, 'Not allowed');
    }

    public function move($source, $destination)
    {
        throw new FileException(FileException::NOT_ALLOWED, 'Not allowed');
    }

    public function copyFromDevice(Device $device, $source, $destination)
    {
        throw new FileException(FileException::NOT_ALLOWED, 'Not allowed');
    }

    public function moveFromDevice(Device $device, $source, $destination)
    {
        throw new FileException(FileException::NOT_ALLOWED, 'Not allowed');
    }

    public function moveUploadedFile(UploadedFile $file, $destination)
    {
        throw new FileException(FileException::NOT_ALLOWED, 'Not allowed');
    }

    public function createDirectory($path)
    {
        throw new FileException(FileException::NOT_ALLOWED, 'Not allowed');
    }

    public function createFile($path)
    {
        throw new FileException(FileException::NOT_ALLOWED, 'Not allowed');
    }

    public function getContents($path)
    {
        if (isset($this->files[$path])) {
            $this->files[$path]->setUser($this->user);
            return Json::prettyPrint($this->files[$path]->getDocuments());
        }
        return null;
    }

    public function putContents($path, $data)
    {
        if (isset($this->files[$path])) {
            $this->files[$path]->setUser($this->user);
            try {
                $this->files[$path]->updateDocuments(Json::decode($data));
            } catch (\Jivoo\JsonException $e) {
                throw new FileException(FileException::SYNTAX_ERROR, $e->getMessage());
            }
        }
    }

    public function open($path, $mode)
    {
        if ($mode === 'rb') {
            $this->files[$path]->setUser($this->user);
            return new \Jivoo\Http\Message\StringStream($this->getContents($path), false);
        }
        throw new FileException(FileException::NOT_ALLOWED, 'Not allowed');
    }

    public function openStorage($path, $writeMode)
    {
        if (! isset($this->files[$path])) {
            return null;
        }
        $this->files[$path]->setUser($this->user);
        return $this->files[$path];
    }
}
