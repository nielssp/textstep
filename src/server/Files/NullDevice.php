<?php
// BlogSTEP 
// Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Files;

use Jivoo\Http\Message\UploadedFile;

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
        throw new FileException(FileException::NOT_READABLE, 'Null device is not readable');
    }

    public function getModified($path)
    {
        throw new FileException(FileException::NOT_READABLE, 'Null device is not readable');
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
        throw new FileException(FileException::NOT_WRITABLE, 'Null device is not writable');
    }

    public function copy($source, $destination)
    {
        throw new FileException(FileException::NOT_WRITABLE, 'Null device is not writable');
    }

    public function move($source, $destination)
    {
        throw new FileException(FileException::NOT_WRITABLE, 'Null device is not writable');
    }

    public function copyFromDevice(Device $device, $source, $destination)
    {
        throw new FileException(FileException::NOT_WRITABLE, 'Null device is not writable');
    }

    public function moveFromDevice(Device $device, $source, $destination)
    {
        throw new FileException(FileException::NOT_WRITABLE, 'Null device is not writable');
    }

    public function moveUploadedFile(UploadedFile $file, $destination)
    {
        throw new FileException(FileException::NOT_WRITABLE, 'Null device is not writable');
    }

    public function createDirectory($path)
    {
        throw new FileException(FileException::NOT_WRITABLE, 'Null device is not writable');
    }

    public function createFile($path)
    {
        throw new FileException(FileException::NOT_WRITABLE, 'Null device is not writable');
    }

    public function getContents($path)
    {
        throw new FileException(FileException::NOT_READABLE, 'Null device is not readable');
    }

    public function putContents($path, $data)
    {
        throw new FileException(FileException::NOT_WRITABLE, 'Null device is not writable');
    }

    public function open($path, $mode)
    {
        throw new FileException(FileException::NOT_WRITABLE, 'Null device is not writable');
    }

    public function openStorage($path, $writeMode)
    {
        throw new FileException(FileException::NOT_WRITABLE, 'Null device is not writable');
    }
}
