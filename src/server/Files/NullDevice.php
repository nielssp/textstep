<?php
// BlogSTEP 
// Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Files;

use Jivoo\Http\Message\UploadedFile;
use Blogstep\User;

/**
 * Null file system device.
 */
class NullDevice implements Device
{

    public function scan($path)
    {
        return [];
    }

    public function getSize($path)
    {
        throw new FileException('Null device not readable', FileException::NOT_READABLE);
    }

    public function getModified($path)
    {
        throw new FileException('Null device not readable', FileException::NOT_READABLE);
    }

    public function getCreated($path)
    {
        throw new FileException('Null device not readable', FileException::NOT_READABLE);
    }

    public function isReadable($path)
    {
        return false;
    }

    public function isWritable($path)
    {
        return false;
    }

    public function isDirectory($path)
    {
        return false;
    }

    public function exists($path)
    {
        return false;
    }

    public function delete($path)
    {
        throw new FileException('Null device not writable', FileException::NOT_WRITABLE);
    }

    public function copy($source, $destination)
    {
        throw new FileException('Null device not writable', FileException::NOT_WRITABLE);
    }

    public function move($source, $destination)
    {
        throw new FileException('Null device not writable', FileException::NOT_WRITABLE);
    }

    public function copyFromDevice(Device $device, $source, $destination)
    {
        throw new FileException('Null device not writable', FileException::NOT_WRITABLE);
    }

    public function moveFromDevice(Device $device, $source, $destination)
    {
        throw new FileException('Null device not writable', FileException::NOT_WRITABLE);
    }

    public function moveUploadedFile(UploadedFile $file, $destination)
    {
        throw new FileException('Null device not writable', FileException::NOT_WRITABLE);
    }

    public function createDirectory($path)
    {
        throw new FileException('Null device not writable', FileException::NOT_WRITABLE);
    }

    public function createFile($path)
    {
        throw new FileException('Null device not writable', FileException::NOT_WRITABLE);
    }

    public function getContents($path)
    {
        throw new FileException('Null device not readable', FileException::NOT_READABLE);
    }

    public function putContents($path, $data)
    {
        throw new FileException('Null device not writable', FileException::NOT_WRITABLE);
    }

    public function open($path, $mode)
    {
        throw new FileException('Null device not writable', FileException::NOT_WRITABLE);
    }

    public function openStorage($path, $writeMode, User $user = null)
    {
        throw new FileException('Null device not writable', FileException::NOT_WRITABLE);
    }
}
