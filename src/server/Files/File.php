<?php
// BlogSTEP
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Files;

use Jivoo\Assume;
use Jivoo\Http\Message\UploadedFile;
use Jivoo\Http\Route\HasRoute;
use Jivoo\InvalidArgumentException;
use Jivoo\Utilities;

/**
 * A file system node.
 */
class File implements \IteratorAggregate, HasRoute
{

    /**
     * @var FileSystem
     */
    private $system;

    /**
     * @var Device
     */
    private $device;

    /**
     * @var string
     */
    private $devicePath;

    /**
     * @var string[]
     */
    private $path;

    /**
     * @var string
     */
    private $type;

    /**
     * @var File
     */
    private $parent;

    /**
     * @var File[]
     */
    private $cache = [];

    /**
     * @var string[]
     */
    private $virtual = [];

    /**
     * @var bool
     */
    private $valid = true;

    protected function __construct(FileSystem $system, array $path, $type)
    {
        $this->system = $system;
        $this->path = $path;
        $this->type = $type;
        $this->parent = $this;
    }

    private function addVirtual($name)
    {
        $this->virtual[$name] = $name;
        if ($this->parent !== $this) {
            $this->parent->addVirtual($this->getName());
        }
    }

    public function mount(Device $device)
    {
        if (!$this->isSystem()) {
            throw new FileException(
                FileException::NOT_ALLOWED,
                'Not allowed to mount'
            );
        }
        $this->device = $device;
        $this->devicePath = '/';
        foreach ($this->cache as $name => $file) {
          if (!isset($this->virtual[$name])) {
            unset($this->cache[$name]);
          }
        }
        $this->type = 'directory';
        if ($this->parent !== $this) {
            $this->parent->addVirtual($this->getName());
        }
    }

    public function getHostPath()
    {
        if (!($this->device instanceof HostDevice)) {
            // TODO:
            throw new FileException(FileException::NOT_SUPPORTED, 'Operation not supported');
        }
        return $this->device->getHostPath($this->devicePath);
    }

    public function getIterator()
    {
        $this->assumeReadable();
        $names = [];
        if ($this->isDirectory()) {
            $names = $this->device->scan($this->devicePath);
        }
        $files = [];
        foreach ($this->virtual as $name) {
            $files[] = $this->get($name);
        }
        foreach ($names as $name) {
            if ($name == '.' or $name == '..') {
                continue;
            }
            if (!isset($this->virtual[$name])) {
                $files[] = $this->get($name);
            }
        }
        return new \ArrayIterator($files);
    }

    public function getPath()
    {
        return '/' . implode('/', $this->path);
    }

    public function getName()
    {
        if (count($this->path)) {
            return $this->path[count($this->path) - 1];
        }
        return '';
    }

    public function getSize()
    {
        return $this->device->getSize($this->devicePath);
    }

    public function getModified()
    {
        return $this->device->getModified($this->devicePath);
    }

    private function isSystem()
    {
        return ! isset($this->system->user) or $this->system->user->isSystem();
    }

    public function getPermissions()
    {
        return $this->system->acl->getRecord($this->path);
    }

    public function grant($capability, $group)
    {
        if (!$this->system->acl->check($this->path, 'grant', $this->system->user)) {
            return false;
        }
        $this->system->acl->grant($this->path, $capability, $group);
        return true;
    }

    public function revoke($capability, $group)
    {
        if (!$this->system->acl->check($this->path, 'grant', $this->system->user)) {
            return false;
        }
        $this->system->acl->revoke($this->path, $capability, $group);
        return true;
    }

    public function revokeAll()
    {
        if (!$this->system->acl->check($this->path, 'grant', $this->system->user)) {
            return false;
        }
        $this->system->acl->revokeAll($this->path);
        return true;
    }

    public function setPermissions(array $permissions, $recursive = false)
    {
        if (!$this->system->acl->check($this->path, 'grant', $this->system->user)) {
            return false;
        }
        $this->system->acl->revokeAll($this->path);
        $this->system->acl->grantAll($this->path, $permissions);
        if ($recursive) {
            foreach ($this as $file) {
                $file->resetPermissions(true);
            }
        }
    }

    public function resetPermissions($recursive = false)
    {
        if (!$this->system->acl->check($this->path, 'grant', $this->system->user)) {
            return false;
        }
        $this->system->acl->reset($this->path);
        if ($recursive) {
            foreach ($this as $file) {
                $file->resetPermissions(true);
            }
        }
        return true;
    }

    private function assumeReadable()
    {
        if (!$this->isReadable()) {
            throw new FileException(
                FileException::NOT_READABLE,
                'File is not readable: {path}',
                ['path' => $this->getPath()]
            );
        }
    }

    private function assumeWritable()
    {
        if (!$this->isWritable()) {
            throw new FileException(
                FileException::NOT_WRITABLE,
                'File is not writable: {path}',
                ['path' => $this->getPath()]
            );
        }
    }

    public function isReadable()
    {
        if ($this->isSystem()) {
            return $this->device->isReadable($this->devicePath);
        }
        return $this->system->acl->check($this->path, 'read', $this->system->user);
    }

    public function isWritable()
    {
        if ($this->isSystem()) {
            if ($this->device->exists($this->devicePath)) {
                return $this->device->isWritable($this->devicePath);
            } elseif ($this->parent !== $this) {
                return $this->parent->isWritable();
            }
            return false;
        }
        return $this->system->acl->check($this->path, 'write', $this->system->user);
    }

    public function getBrief($iso8601 = false)
    {
        return [
            'name' => $this->getName(),
            'path' => $this->getPath(),
            'type' => $this->getType(),
            'modified' => $iso8601 ? date('c', $this->getModified()) : $this->getModified(),
            'permissions' => $this->getPermissions(),
            'read' => $this->isReadable(),
            'write' => $this->isWritable(),
            'size' => $this->getSize(),
        ];
    }

    public function getDetailed($iso8601 = false)
    {
        $brief = $this->getBrief($iso8601);
        $brief['files'] = [];
        foreach ($this as $file) {
            $brief['files'][] = $file->getBrief($iso8601);
        }
        return $brief;
    }

    public function getRoute()
    {
        return [
            'snippet' => 'Open',
            'query' => ['path' => $this->getPath()]
        ];
    }

    public function getFilesRoute()
    {
        return [
            'snippet' => 'Files',
            'query' => ['path' => $this->getPath()]
        ];
    }

    public function getType()
    {
        if ($this->type === 'unknown') {
            if ($this->device->exists($this->devicePath)) {
                if ($this->device->isDirectory($this->devicePath)) {
                    $this->type = 'directory';
                } else {
                    $this->type = 'file';
                }
            }
        }
        return $this->type;
    }

    public function getMimeType()
    {
        return $this->system->mimeTypes->getMimeType(Utilities::getFileExtension($this->getName()));
    }

    public function isDirectory()
    {
        return $this->getType() === 'directory';
    }

    public function isFile()
    {
        if ($this->type === 'unknown') {
            if ($this->device->exists($this->devicePath)) {
                if ($this->device->isDirectory($this->devicePath)) {
                    $this->type = 'directory';
                } else {
                    $this->type = 'file';
                    return true;
                }
            }
            return false;
        } else {
            return $this->type !== 'directory';
        }
    }

    public function exists()
    {
        return $this->device->exists($this->devicePath);
    }

    public function isInside(File $dir)
    {
        return \Jivoo\Unicode::startsWith($this->getPath(), $dir->getPath());
    }

    public function getRelativePath(File $source)
    {
        $path = $this->path;
        $other = $source->path;
        while (true) {
            if (!isset($path[0]) or !isset($other[0]) or $path[0] !== $other[0]) {
                break;
            }
            array_shift($path);
            array_shift($other);
        }
        $relative = '';
        $ups = count($other) - 1;
        for ($i = 0; $i < $ups; $i++) {
            $relative .= '../';
        }
        $relative .= implode('/', $path);
        if ($relative == '') {
            return '.';
        }
        return $relative;
    }

    public function copy(File $destination)
    {
        $this->assumeReadable();
        $destination->assumeWritable();
        if ($this->isDirectory()) {
            if ($destination->isInside($this)) {
                throw new FileException(
                    FileException::DEST_INSIDE_SRC,
                    'Cannot copy directory into itself: {path}',
                    ['path' => $this->getPath()]
                );
            }
            $destination->makeDirectory();
            foreach ($this as $file) {
                $file->copy($destination->get($file->getName()));
            }
        } else {
            $result = false;
            if ($this->device === $destination->device) {
                $result = $this->device->copy($this->devicePath, $destination->devicePath);
            } else {
                $result = $destination->device->copyFromDevice($this->device, $this->devicePath, $destination->devicePath);
            }
            if (!$result) {
                if ($destination->exists()) {
                    throw new FileException(
                        FileException::DEST_EXISTS,
                        'Destination exists: {path}',
                        ['path' => $destination->getPath()]
                    );
                } elseif (!$destination->getParent()->isDirectory()) {
                    throw new FileException(
                        FileException::NOT_A_DIRECTORY,
                        'Destination is not a directory: {path}',
                        ['path' => $destination->getParent()->getPath()]
                    );
                }
                throw new FileException(
                    FileException::COPY_FAILED,
                    'Could not copy file to destination: {path}',
                    ['path' => $destination->getPath()]
                );
            }
        }
        return true;
    }

    public function move(File $destination)
    {
        $this->assumeReadable();
        $this->assumeWritable();
        $destination->assumeWritable();
        if ($this->isDirectory()) {
            if ($destination->isInside($this)) {
                throw new FileException(
                    FileException::DEST_INSIDE_SRC,
                    'Cannot move directory into itself: {path}',
                    ['path' => $this->getPath()]
                );
            }
            $destination->makeDirectory();
            foreach ($this as $file) {
                $file->move($destination->get($file->getName()));
            }
            $this->invalidate();
            return $this->delete();
        } else {
            if ($this->device === $destination->device) {
                if ($this->device->move($this->devicePath, $destination->devicePath)) {
                    $this->invalidate();
                    return true;
                }
            } elseif ($destination->device->moveFromDevice($this->device, $this->devicePath, $destination->devicePath)) {
                $this->invalidate();
                return true;
            }
        }
        if ($destination->exists()) {
            throw new FileException(
                FileException::DEST_EXISTS,
                'Destination exists: {path}',
                ['path' => $destination->getPath()]
            );
        } elseif (!$destination->getParent()->isDirectory()) {
            throw new FileException(
                FileException::NOT_A_DIRECTORY,
                'Destination is not a directory: {path}',
                ['path' => $destination->getParent()->getPath()]
            );
        }
        throw new FileException(
            FileException::MOVE_ERROR,
            'Could not move file to destination: {path}',
            ['path' => $destination->getPath()]
        );
    }

    public function moveHere(UploadedFile $file)
    {
        if ($this->exists()) {
            return false;
        }
        $this->assumeWritable();
        $this->device->moveUploadedFile($file, $this->devicePath);
        $this->type = Utilities::getFileExtension($this->getName());
        return true;
    }

    public function makeDirectory($recursive = false)
    {
        if ($this->exists()) {
            return $this->isDirectory();
        }
        if ($recursive && $this->parent !== $this) {
            if (!$this->parent->makeDirectory(true)) {
                return false;
            }
        }
        $this->assumeWritable();
        if ($this->device->createDirectory($this->devicePath)) {
            $this->type = 'directory';
            return true;
        }
        return false;
    }

    public function makeFile($recursive = false)
    {
        if ($this->exists()) {
            return $this->isFile();
        }
        if ($recursive && $this->parent !== $this) {
            if (!$this->parent->makeDirectory(true)) {
                return false;
            }
        }
        $this->assumeWritable();
        if ($this->device->createFile($this->devicePath)) {
            $this->type = Utilities::getFileExtension($this->getName());
            return true;
        }
        return false;
    }

    public function getContents()
    {
        $this->assumeReadable();
        return $this->device->getContents($this->devicePath);
    }

    public function putContents($data)
    {
        $this->assumeWritable();
        if (!$this->exists()) {
            if (!$this->makeFile()) {
                return false;
            }
        }
        return $this->device->putContents($this->devicePath, $data);
    }

    public function openStream($mode = 'rb')
    {
        switch ($mode) {
            case 'r':
            case 'rb':
                $this->assumeReadable();
                break;
            case 'w':
            case 'wb':
            case 'a':
            case 'ab':
                $this->assumeWritable();
                break;
            case 'r+':
            case 'r+b':
            case 'rb+':
            case 'w+':
            case 'w+b':
            case 'wb+':
            case 'a+':
            case 'a+b':
            case 'ab+':
                $this->assumeReadable();
                $this->assumeWritable();
                break;
            case 'x':
            case 'xb':
            case 'c':
            case 'cb':
                // TODO: check parent permissions etc.
                throw new \Exception('not implemented');
                break;
            case 'x+':
            case 'x+b':
            case 'xb+':
            case 'c+':
            case 'c+b':
            case 'cb+':
                // TODO: check parent permissions etc.
                throw new \Exception('not implemented');
                break;
            default:
                throw new InvalidArgumentException('undefined file mode: ' . $mode);
        }
        return $this->device->open($this->devicePath, $mode);
    }

    public function openStorage($writeMode = false)
    {
        $this->assumeReadable();
        if ($writeMode) {
            $this->assumeWritable();
        }
        return $this->device->openStorage($this->devicePath, $writeMode);
    }

    public function delete($recursive = true)
    {
        if ($recursive) {
            foreach ($this as $file) {
                $file->delete(true);
            }
        }
        $this->assumeWritable();
        if (!$this->device->delete($this->devicePath)) {
            if ($this->isDirectory()) {
                if (!$this->exists()) {
                    throw new FileException(
                        FileException::NOT_FOUND,
                        'Directory does not exist: {path}',
                        ['path' => $this->getPath()]
                    );
                }
                if (iterator_count($this->getIterator()) > 0) {
                    throw new FileException(
                        FileException::NOT_EMPTY,
                        'Directory is not empty: {path}',
                        ['path' => $this->getPath()]
                    );
                }
                    throw new FileException(
                        FileException::DELETE_FAILED,
                        'Could not delete directory: {path}',
                        ['path' => $this->getPath()]
                    );
            } else {
                if (!$this->exists()) {
                    throw new FileException(
                        FileException::NOT_FOUND,
                        'File does not exist: {path}',
                        ['path' => $this->getPath()]
                    );
                }
                throw new FileException(
                    FileException::DELETE_FAILED,
                    'Could not delete file: {path}',
                    ['path' => $this->getPath()]
                );
            }
        }
        $this->invalidate();
        return true;
    }

    protected function invalidate()
    {
        $this->system->acl->reset($this->path);
        $this->valid = false;
        $parent = $this->getParent();
        $name = $this->getName();
        if (isset($parent->cache[$name])) {
            unset($parent->cache[$name]);
        }
    }

    public function getParent()
    {
        if (isset($this->parent)) {
            return $this->parent;
        }
        return $this;
    }

    private function getRelative(array $path)
    {
        if (! count($path)) {
            return $this;
        }
        $name = array_shift($path);
        if ($name == '.' or $name == '') {
            return $this->getRelative($path);
        } elseif ($name == '..') {
            return $this->getParent()->getRelative($path);
        } else {
            if (! isset($this->cache[$name])) {
                $type = 'unknown';
                $this->cache[$name] = new self($this->system, array_merge($this->path, [$name]), $type);
                $this->cache[$name]->device = $this->device;
                if ($this->devicePath == '/') {
                    $this->cache[$name]->devicePath ='/' . $name;
                } else {
                    $this->cache[$name]->devicePath = $this->devicePath . '/' . $name;
                }
                $this->cache[$name]->parent = $this;
            }
            return $this->cache[$name]->getRelative($path);
        }
    }

    public function get($relativePath)
    {
        if ($relativePath == '') {
            return $this;
        }
        if ($relativePath[0] == '/') {
            return $this->system->getRelative(explode('/', $relativePath));
        }
        if ($relativePath[0] == '~') {
            $relativePath = explode('/', $relativePath);
            array_shift($relativePath);
            return $this->system->user->getHome()->getRelative($relativePath);
        }
        return $this->getRelative(explode('/', $relativePath));
    }
}
