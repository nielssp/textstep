<?php
// BlogSTEP
// Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Files;

use Jivoo\Http\Message\PhpStream;
use Jivoo\Http\Message\UploadedFile;

/**
 * Host file system.
 */
class HostDevice implements Device
{
    private $rootPath;

    private $fileMode = null;

    private $dirMode = null;

    private $user = null;

    private $group = null;

    public function __construct($rootPath, array $options = [])
    {
        $this->rootPath = $rootPath;
        if (isset($options['fileMode'])) {
            $this->fileMode = intval($options['fileMode']);
        }
        if (isset($options['dirMode'])) {
            $this->dirMode = intval($options['dirMode']);
        }
        if (isset($options['user'])) {
            $this->user = $options['user'];
        }
        if (isset($options['group'])) {
            $this->group = $options['group'];
        }
    }

    public function getHostPath($path)
    {
        return $this->rootPath . $path;
    }

    public function scan($path)
    {
        return scandir($this->rootPath . $path);
    }

    public function getSize($path)
    {
        return (int) filesize($this->rootPath . $path);
    }

    public function getModified($path)
    {
        return (int) filemtime($this->rootPath . $path);
    }

    public function isReadable($path)
    {
        return is_readable($this->rootPath . $path);
    }

    public function isWritable($path)
    {
        return is_writable($this->rootPath . $path);
    }

    public function isDirectory($path)
    {
        return is_dir($this->rootPath . $path);
    }

    public function exists($path)
    {
        return file_exists($this->rootPath . $path);
    }

    public function delete($path)
    {
        $path = $this->rootPath . $path;
        if (is_dir($path)) {
            return rmdir($path);
        } else {
            return unlink($path);
        }
    }

    public function copy($source, $destination)
    {
        return copy($this->rootPath . $source, $this->rootPath . $destination);
    }

    public function move($source, $destination)
    {
        return rename($this->rootPath . $source, $this->rootPath . $destination);
    }

    public function copyFromDevice(Device $device, $source, $destination)
    {
        if ($device instanceof HostDevice) {
            return copy($device->rootPath . $source, $this->rootPath . $destination);
        }
        // TODO: call generic device->device copy utility function
        return false;
    }

    public function moveFromDevice(Device $device, $source, $destination)
    {
        if ($device instanceof HostDevice) {
            return rename($device->rootPath . $source, $this->rootPath . $destination);
        }
        // TODO: call generic device->device copy utility function
        return false;
    }

    public function moveUploadedFile(UploadedFile $file, $destination)
    {
        $file->moveTo($this->rootPath . $destination);
        return true;
    }

    public function setOwnership($path)
    {
        $path = $this->rootPath . $path;
        if (isset($this->dirMode)) {
            chmod($path, $this->dirMode);
        }
        if (isset($this->user)) {
            chown($path, $this->user);
        }
        if (isset($this->group)) {
            chgrp($path, $this->group);
        }
    }

    public function createDirectory($path)
    {
        if (mkdir($this->rootPath . $path)) {
            $this->setOwnership($path);
            return true;
        }
        return false;
    }

    public function createFile($path)
    {
        if (touch($this->rootPath . $path)) {
            $this->setOwnership($path);
            return true;
        }
        return false;
    }

    public function getContents($path)
    {
        return file_get_contents($this->rootPath . $path);
    }

    public function putContents($path, $data)
    {
        // TODO: file_put_contents returns number of bytes (0 if data is empty)
        // or false on error. It should be specified in the interface whether
        // putContents returns an int or a boolean.
        return file_put_contents($this->rootPath . $path, $data) !== false;
    }

    public function open($path, $mode)
    {
        return new PhpStream($this->rootPath . $path, $mode);
    }

    public function openStorage($path, $writeMode)
    {
        return new JsonStorage($this->rootPath . $path, $writeMode);
    }
}
