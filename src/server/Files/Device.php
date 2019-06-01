<?php
// BlogSTEP 
// Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Files;

use Jivoo\Http\Message\UploadedFile;

/**
 * A file system device.
 */
interface Device
{

    /**
     * List contents of a directory.
     * 
     * @param string $path Directory path.
     * @return string[] List of files in directory.
     * @throws FileException On error.
     */
    public function scan($path);

    /**
     * Gets the size of the given file.
     * 
     * @param string $path File path.
     * @return int File size in bytes.
     * @throws FileException On error.
     */
    public function getSize($path);

    /**
     * Gets the modification time of the given file.
     * 
     * @param string $path File path.
     * @return int File modification time as a UNIX timestamp.
     * @throws FileException On error.
     */
    public function getModified($path);

    /**
     * Gets the creation time of the given file.
     * 
     * @param string $path File path.
     * @return int File creation time as a UNIX timestamp.
     * @throws FileException On error.
     */
    public function getCreated($path);

    /**
     * Returns whether the file or directory is readable.
     * 
     * @param string $path File path.
     * @return bool True if the file exists and is readable, false otherwise.
     * @throws FileException On error.
     */
    public function isReadable($path);

    /**
     * Returns whether the file or directory is writable.
     * 
     * @param string $path File path.
     * @return bool True if the file exists and is writable, false otherwise.
     * @throws FileException On error.
     */
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

    public function openStorage($path, $writeMode);
}
