<?php
// BlogSTEP 
// Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Files;

use Blogstep\UnauthorizedException;
use Jivoo\Assume;
use Jivoo\Http\Message\PhpStream;
use Jivoo\Http\Message\UploadedFile;
use Jivoo\Http\Route\HasRoute;
use Jivoo\I18n\I18n;
use Jivoo\InvalidArgumentException;
use Jivoo\Store\Config;
use Jivoo\Store\JsonStore;
use Jivoo\Utilities;

/**
 * A file system device.
 */
interface Device
{

    public function scanDir($path);

    public function getSize($path);

    public function getModified($path);

    public function getCreated($path);

    public function isReadable($path);

    public function isWritable($path);

    public function isDirectory($path);

    public function exists($path);

    public function delete($path);

    public function copy($source, $destination);

    public function move($source, $destination);

    public function copyFromDevice(Device $device, $source, $destination);

    public function moveFromDevice(Device $device, $source, $destination);

    public function moveUploadedFile(UploadedFile $file, $destination);

    public function createDirectory($path);

    public function createFile($path);

    public function getContents($path);

    public function putContents($path, $data);

    public function open($path, $mode);
}
