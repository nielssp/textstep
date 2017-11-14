<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
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
 * A file system node.
 */
class File implements \IteratorAggregate, HasRoute
{
    
    /**
     * @var FileSystem
     */
    private $system;
    
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
     * @var bool
     */
    private $valid = true;
    
    /**
     * @var Config
     */
    private $metadata = null;
    
    protected function __construct(FileSystem $system, array $path, $type)
    {
        $this->system = $system;
        $this->path = $path;
        $this->type = $type;
        $this->parent = $this;
    }

    public function getIterator()
    {
        $this->assumeReadable();
        $names = [];
        $path = $this->getRealPath();
        if (is_dir($path)) {
            $names = scandir($path);
        }
        $files = [];
        foreach ($names as $name) {
            if ($name == '.' or $name == '..' or $name == '.metadata.json') {
                continue;
            }
            $files[] = $this->get($name);
        }
        return new \ArrayIterator($files);
    }
    
    public function getRealPath()
    {
        return $this->system->root . $this->getPath();
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
        return (int) filesize($this->getRealPath());
    }
    
    public function getModified()
    {
        return (int) filemtime($this->getRealPath());
    }
    
    public function getCreated()
    {
        return (int) filectime($this->getRealPath());
    }
    
    private function isSystem()
    {
        return ! isset($this->system->user) or $this->system->user->getName() === 'system' or
            $this->system->user->isMemberOf('system');
    }
    
    public function set($key, $value)
    {
        $this->assumeWritable();
        $this->system->acl->set($this->path, $key, $value);
    }
    
    public function getOwner()
    {
        return $this->system->acl->getOwner($this->path);
    }
    
    public function getGroup()
    {
        return $this->system->acl->getGroup($this->path);
    }
    
    public function getMode()
    {
        return $this->system->acl->getMode($this->path);
    }
    
    public function getModeString()
    {
        $mode = $this->getMode();
        $str = ($mode & 0x20 ? 'r' : '-');
        $str .= ($mode & 0x10 ? 'w' : '-');
        $str .= ($mode & 0x08 ? 'r' : '-');
        $str .= ($mode & 0x04 ? 'w' : '-');
        $str .= ($mode & 0x02 ? 'r' : '-');
        $str .= ($mode & 0x01 ? 'w' : '-');
        return $str;
    }
    
    public function setModeString($str)
    {
        $mode = 0;
        Assume::that(strlen($str) === 6);
        for ($i = 0; $i < 6; $i++) {
            if ($str[$i] !== '-') {
                $mode |= 0x20 >> $i;
            }
        }
        return $this->set('mode', $mode);
    }
    
    public function getUserMode()
    {
        return ($this->getMode() & 0x30) >> 4;
    }
    
    public function getGroupMode()
    {
        return ($this->getMode() & 0xC) >> 2;
    }
    
    public function getAllMode()
    {
        return $this->getMode() & 0x3;
    }
    
    private function assumeReadable()
    {
        if (!$this->isReadable()) {
            $dir = $this->isDirectory() ? $this : $this->parent;
            throw new FileException(
                I18n::get('Directory is not readable: %1', $dir->getPath()),
                FileException::NOT_READABLE
            );
        }
    }
    
    private function assumeWritable()
    {
        if (!$this->isWritable()) {
            $dir = $this->isDirectory() ? $this : $this->parent;
            throw new FileException(
                I18n::get('Directory is not writable: %1', $dir->getPath()),
                FileException::NOT_WRITABLE
            );
        }
    }
    
    public function isReadable()
    {
        if ($this->isSystem()) {
            return is_readable($this->getRealPath());
        }
        $mode = $this->getAllMode();
        if ($this->system->user->isMemberOf($this->getGroup())) {
            $mode |= $this->getGroupMode();
        }
        if ($this->system->user->getName() === $this->getOwner()) {
            $mode |= $this->getUserMode();
        }
        return ($mode & 0x2) !== 0;
    }
    
    public function isWritable()
    {
        if ($this->isSystem()) {
            if (file_exists($this->getRealPath())) {
                return is_writable($this->getRealPath());
            } elseif ($this->parent !== $this) {
                return is_writable($this->parent->getRealPath());
            }
            return false;            
        }
        $mode = $this->getAllMode();
        if ($this->system->user->isMemberOf($this->getGroup())) {
            $mode |= $this->getGroupMode();
        }
        if ($this->system->user->getName() === $this->getOwner()) {
            $mode |= $this->getUserMode();
        }
        return ($mode & 0x1) !== 0;
    }
    
    public function getBrief()
    {
        return [
            'name' => $this->getName(),
            'path' => $this->getPath(),
            'type' => $this->getType(),
            'modified' => $this->getModified(),
            'created' => $this->getCreated(),
            'owner' => $this->getOwner(),
            'group' => $this->getGroup(),
            'mode' => $this->getMode(),
            'modeString' => $this->getModeString(),
            'read' => $this->isReadable(),
            'write' => $this->isWritable(),
        ];
    }
    
    public function getDetailed()
    {
        $brief = $this->getBrief();
        $brief['files'] = [];
        foreach ($this as $file) {
            $brief['files'][] = $file->getBrief();
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
            $real = $this->getRealPath();
            if (file_exists($real)) {
                if (is_dir($real)) {
                    $this->type = 'directory';
                } else {
                    $this->type = Utilities::getFileExtension($real);
                }
            }
        }
        return $this->type;
    }
    
    public function isDirectory()
    {
        return $this->getType() === 'directory';
    }
    
    public function exists()
    {
        return file_exists($this->getRealPath());
    }
    
    public function isInside(File $dir)
    {
        return \Jivoo\Unicode::startsWith($this->getPath(), $dir->getPath());
    }
    
    public function copy(File $destination)
    {
        $this->assumeReadable();
        $destination->assumeWritable();
        if ($this->isDirectory()) {
            if ($destination->isInside($this)) {
                throw new FileException(
                    I18n::get('Cannot copy directory into itself: %1', $this->getPath()),
                    FileException::DESTINATION_INSIDE_SOURCE
                );
            }
            $destination->makeDirectory();
            foreach ($this as $file) {
                $file->copy($destination->get($file->getName()));
            }
        } elseif (!copy($this->getRealPath(), $destination->getRealPath())) {
            if ($destination->exists()) {
                throw new FileException(
                    I18n::get('Destination exists: %1', $destination->getPath()),
                    FileException::DESTINATION_EXISTS
                );
            } elseif (!$destination->getParent()->isDirectory()) {
                throw new FileException(
                    I18n::get('Destination is not a directory: %1', $destination->getParent()->getPath()),
                    FileException::NOT_A_DIRECTORY
                );
            }
            throw new FileException(
                I18n::get('Could not copy to destination: %1', $destination->getPath()),
                FileException::COPY_ERROR
            );
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
                    I18n::get('Cannot move directory into itself: %1', $this->getPath()),
                    FileException::DESTINATION_INSIDE_SOURCE
                );
            }
            $destination->makeDirectory();
            foreach ($this as $file) {
                $file->move($destination->get($file->getName()));
            }
            $this->invalidate();
            return $this->delete();
        } elseif (rename($this->getRealPath(), $destination->getRealPath())) {
            $this->invalidate();
            return true;
        }
        if ($destination->exists()) {
            throw new FileException(
                I18n::get('Destination exists: %1', $destination->getPath()),
                FileException::DESTINATION_EXISTS
            );
        } elseif (!$destination->getParent()->isDirectory()) {
            throw new FileException(
                I18n::get('Destination is not a directory: %1', $destination->getParent()->getPath()),
                FileException::NOT_A_DIRECTORY
            );
        }
        throw new FileException(
            I18n::get('Could not move to destination: %1', $destination->getPath()),
            FileException::MOVE_ERROR
        );
    }
    
    public function moveHere(UploadedFile $file)
    {
        if ($this->exists()) {
            return false;
        }
        $this->assumeWritable();
        $file->moveTo($this->getRealPath());
        $this->type = Utilities::getFileExtension($this->getName());
        return true;
    }
    
    public function makeDirectory()
    {
        if ($this->exists()) {
            return false;
        }
        $this->assumeWritable();
        if (mkdir($this->getRealPath())) {
            $this->type = 'directory';
            return true;
        }
        return false;
    }
    
    public function makeFile()
    {
        if ($this->exists()) {
            return false;
        }
        $this->assumeWritable();
        if (touch($this->getRealPath())) {
            $this->type = Utilities::getFileExtension($this->getName());
            return true;
        }
        return false;
    }
    
    public function getContents()
    {
        $this->assumeReadable();
        return file_get_contents($this->getRealPath());
    }
    
    public function putContents($data)
    {
        $this->assumeWritable();
        if (!$this->exists()) {
            if (!$this->makeFile()) {
                return false;
            }
        }
        return file_put_contents($this->getRealPath(), $data);
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
            case 'w+':
            case 'w+b':
            case 'a+':
            case 'a+b':
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
            case 'c+':
            case 'c+b':
                // TODO: check parent permissions etc.
                throw new \Exception('not implemented');
                break;
            default:
                throw new InvalidArgumentException('undefined file mode: ' + $mode);
        }
        return new PhpStream($this->getRealPath(), $mode);
    }
    
    public function delete($recursive = true)
    {
        if ($recursive) {
            foreach ($this as $file) {
                $file->delete(true);
            }
        }
        $this->assumeWritable();
        if ($this->isDirectory()) {
            if (!rmdir($this->getRealPath())) {
                if (!$this->exists()) {
                    throw new FileException(
                        I18n::get('Directory does not exist: %1', $this->getPath()),
                        FileException::NOT_FOUND
                    );
                }
                if (iterator_count($this->getIterator()) > 0) {
                    throw new FileException(
                        I18n::get('Directory is not empty: %1', $this->getPath()),
                        FileException::NOT_EMPTY
                    );
                }
                throw new FileException(
                    I18n::get('Could not delete directory: %1', $this->getPath()),
                    FileException::DELETE_ERROR
                );
            }
        } elseif (!unlink($this->getRealPath())) {
            if (!$this->exists()) {
                throw new FileException(
                    I18n::get('File does not exist: %1', $this->getPath()),
                    FileException::NOT_FOUND
                );
            }
            throw new FileException(
                I18n::get('Could not delete file: %1', $this->getPath()),
                FileException::DELETE_ERROR
            );
        }
        $this->invalidate();
        return true;
    }
    
    protected function invalidate()
    {
        $this->system->acl->remove($this->path);
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
