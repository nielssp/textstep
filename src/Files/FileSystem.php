<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Files;

/**
 * A file system node.
 */
class FileSystem implements \IteratorAggregate, \Jivoo\Http\Route\HasRoute
{
    
    private $root;
    
    private $path;
    
    private $type;
    
    private $metadata = null;
    
    /**
     * @var \Blogstep\User
     */
    private $authentication;
    
    private function __construct(array $path, $root, $type, \Blogstep\User $authentication = null)
    {
        $this->root = $root;
        $this->path = $path;
        $this->type = $type;
        $this->authentication = $authentication;
    }
    
    public static function open($rootPath, \Blogstep\User $authentication = null)
    {
        \Jivoo\Assume::that(is_dir($rootPath));
        return new self([], rtrim($rootPath, '/'), 'dir', $authentication);
    }
    
    public function setAuthentication(\Blogstep\User $user)
    {
        $this->authentication = $user;
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
            if ($name == '.' or $name == '..') {
                continue;
            }
            $files[] = $this->get($name);
        }
        return new \ArrayIterator($files);
    }
    
    public function getRealPath()
    {
        return $this->root . $this->getPath();
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
    
    public function getModified()
    {
        return (int) filemtime($this->getRealPath());
    }
    
    public function getCreated()
    {
        return (int) filectime($this->getRealPath());
    }
    
    public function getMetadataPath() {
        if ($this->type === 'directory') {
            return $this->root . '/system/metadata' . $this->getPath() . '/.json';
        }
        return $this->root . '/system/metadata' . $this->getPath() . '.json';
    }
    
    public function getMetadata()
    {
        if (! isset($this->metadata)) {
            if (preg_match('/^\/system\/metadata/', $this->getPath()) === 1) {
                $this->metadata = new \Jivoo\Store\Config();
                $this->metadata['owner'] = 0;
                $this->metadata['group'] = 0;
                $this->metadata['mode'] = 0;
            } else {
                if ($this->type === 'directory') {
                    \Jivoo\Utilities::dirExists(
                        $this->root . '/system/metadata' . $this->getPath(),
                        true,
                        true
                    );
                }
                $store = new \Jivoo\Store\JsonStore($this->getMetadataPath());
                $store->touch();
                $this->metadata = new \Jivoo\Store\Config($store);
            }
        }
        return $this->metadata;
    }
    
    private function isSystem()
    {
        return ! isset($this->authentication) or $this->authentication->getId() === 0 or
            $this->authentication->isMemberOf(0);
    }
    
    public function set($name, $value, $recursive = false)
    {
        if ($recursive) {
            foreach ($this as $file) {
                $file->set($name, $value, $recursive);
            }
        }
        $this->assumeWritable();
        $metadata = $this->getMetadata();
        $metadata->set($name, $value);
        return $metadata->save();
    }
    
    public function getOwner()
    {
        return $this->getMetadata()->get('owner', 0);
    }
    
    public function getGroup()
    {
        return $this->getMetadata()->get('group', 0);
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
        \Jivoo\Assume::that(strlen($str) === 6);
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
    
    private function assumeReadable() {
        if (!$this->isReadable()) {
            throw new \Blogstep\UnauthorizedException('File is not readable');
        }
    }
    
    private function assumeWritable() {
        if (!$this->isWritable()) {
            throw new \Blogstep\UnauthorizedException('File is not writable');
        }
    }
    
    public function isReadable()
    {
        if ($this->isSystem()) {
            return is_readable($this->getRealPath());
        }
        $mode = $this->getAllMode();
        if ($this->authentication->isMemberOf($this->getGroup())) {
            $mode |= $this->getGroupMode();
        }
        if ($this->authentication->getId() === $this->getOwner()) {
            $mode |= $this->getUserMode();
        }
        return ($mode & 0x2) !== 0;
    }
    
    public function isWritable()
    {
        if ($this->isSystem()) {
            return is_writable($this->getRealPath());
        }
        $mode = $this->getAllMode();
        if ($this->authentication->isMemberOf($this->getGroup())) {
            $mode |= $this->getGroupMode();
        }
        if ($this->authentication->getId() === $this->getOwner()) {
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
        return $this->type;
    }
    
    public function getParent()
    {
        if (count($this->path)) {
            return new FileSystem(array_slice($this->path, 0, -1), $this->root, 'directory', $this->authentication);
        }
        return $this;
    }
    
    public function exists()
    {
        return file_exists($this->getRealPath());
    }
    
    public function rename(FileSystem $destination)
    {
        $this->assumeWritable();
        return rename($this->getRealPath(), $destination->getRealPath());
    }
    
    public function makeDirectory()
    {
        if ($this->exists()) {
            return false;
        }
        $parent = $this->getParent();
        $parent->assumeWritable();
        if (mkdir($this->getRealPath())) {
            $metadata = $this->getMetadata();
            $metadata['owner'] = $parent->getOwner();
            $metadata['group'] = $parent->getGroup();
            $metadata['mode'] = $parent->getMode();
            if ($metadata->save()) {
                return true;
            }
            rmdir($this->getRealPath());
        }
        return false;
    }
    
    public function makeFile()
    {
        if ($this->exists()) {
            return false;
        }
        $parent = $this->getParent();
        $parent->assumeWritable();
        if (touch($this->getRealPath())) {
            $metadata = $this->getMetadata();
            $metadata['owner'] = $parent->getOwner();
            $metadata['group'] = $parent->getGroup();
            $metadata['mode'] = $parent->getMode();
            if ($metadata->save()) {
                return true;
            }
            unlink($this->getRealPath());
        }
        return false;
    }
    
    public function getContents()
    {
        $this->assumeReadable();
        return file_get_contents($this->getRealPath());
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
                throw new \Jivoo\InvalidArgumentException('undefined file mode: ' + $mode);
        }
        return new \Jivoo\Http\Message\PhpStream($this->getRealPath(), $mode);
    }
    
    public function delete($recursive = true)
    {
        if ($recursive) {
            foreach ($this as $file) {
                $file->delete(true);
            }
        }
        $this->assumeWritable();
        if (file_exists($this->getMetadataPath())) {
            unlink($this->getMetadataPath());
        }
        if ($this->type == 'directory') {
            return rmdir($this->getRealPath());
        }
        return unlink($this->getRealPath());
    }
    
    public function get($relativePath)
    {
        if ($relativePath == '') {
            return $this;
        }
        $path = $this->path;
        if ($relativePath[0] == '/') {
            $path = [];
        }
        $relativePath = explode('/', $relativePath);
        foreach ($relativePath as $component) {
            if ($component == '.') {
                continue;
            } elseif ($component == '..') {
                array_pop($path);
            } else if ($component != '') {
                array_push($path, $component);
            }
        }
        $type = 'unknown';
        $real = $this->root . '/' . implode('/', $path);
        if (is_dir($real)) {
            $type = 'directory';
        } else {
            $type = \Jivoo\Utilities::getFileExtension($real);
        } 
        return new self($path, $this->root, $type, $this->authentication);
    }

}
