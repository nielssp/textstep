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
    
    private function getMetadataPath()
    {
        return $this->getRealPath() . '/.metadata.json';
    }
    
    /**
     * 
     * @return Config
     */
    public function getMetadata()
    {
        if (! isset($this->metadata)) {
            if ($this->isDirectory()) {
                $store = new JsonStore($this->getMetadataPath());
                if ($store->touch()) {
                    $this->metadata = new Config($store);
                } else {
                    $this->metadata = new Config();
                    $this->metadata['mode'] = 0x00;
                    if (is_readable($this->getRealPath())) {
                        $this->metadata['mode'] = 0x2A;
                    }
                }
            } elseif (isset($this->parent)) {
                return $this->parent->getMetadata();
            } else {
                return new Config();
            }
        }
        return $this->metadata;
    }
    
    private function isSystem()
    {
        return ! isset($this->system->user) or $this->system->user->getName() === 'system' or
            $this->system->user->isMemberOf('system');
    }
    
    public function setMultiple($values, $recursive = false)
    {
        if (!$this->isDirectory()) {
            return false;
        }
        if ($recursive) {
            foreach ($this as $file) {
                try {
                    $file->setMultiple($values, $recursive);
                } catch (UnauthorizedException $e) {
                }
            }
        }
        $this->assumeWritable();
        $metadata = $this->getMetadata();
        $metadata->set($values);
        return $metadata->save();
    }
    
    public function set($name, $value, $recursive = false)
    {
        if (!$this->isDirectory()) {
            return false;
        }
        if ($recursive) {
            foreach ($this as $file) {
                try {
                    $file->set($name, $value, $recursive);
                } catch (UnauthorizedException $e) {
                }
            }
        }
        $this->assumeWritable();
        $metadata = $this->getMetadata();
        $metadata->set($name, $value);
        return $metadata->save();
    }
    
    public function getOwner()
    {
        return $this->getMetadata()->get('owner', 'system');
    }
    
    public function getGroup()
    {
        return $this->getMetadata()->get('group', 'system');
    }
    
    public function getMode()
    {
        return $this->getMetadata()->get('mode', 0x3A);
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
    
    public function setModeString($str, $recursive = false)
    {
        $mode = 0;
        Assume::that(strlen($str) === 6);
        for ($i = 0; $i < 6; $i++) {
            if ($str[$i] !== '-') {
                $mode |= 0x20 >> $i;
            }
        }
        return $this->set('mode', $mode, $recursive);
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
            'parameters' => $this->path
        ];
    }
    
    public function getFilesRoute()
    {
        return [
            'snippet' => 'Files',
            'parameters' => $this->path
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
            $meta1 = $this->getMetadata();
            $meta2 = $destination->getMetadata();
            $meta2->override = $meta1;
            if (isset($this->system->user)) {
                $meta2['owner'] = $this->system->user->getName();
            }
            $parent = $destination->getParent();
            $meta2['group'] = $parent->getGroup();
            $meta2['mode'] = $parent->getMode();
            $meta2->save();
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
            $meta1 = $this->getMetadata();
            $meta2 = $destination->getMetadata();
            $meta2->override = $meta1;
            $meta2->save();
            $this->invalidate();
            if (file_exists($this->getMetadataPath())) {
                unlink($this->getMetadataPath());
            }
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
            $metadata = $this->getMetadata();
            if (isset($this->system->user)) {
                $metadata['owner'] = $this->system->user->getName();
            }
            $parent = $this->getParent();
            $metadata['group'] = $parent->getGroup();
            $metadata['mode'] = $parent->getMode();
            if ($metadata->save()) {
                return true;
            }
            $this->type = 'unknown';
            rmdir($this->getRealPath());
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
            if (file_exists($this->getMetadataPath())) {
                unlink($this->getMetadataPath());
            }
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
        return $this->getRelative(explode('/', $relativePath));
    }
}
