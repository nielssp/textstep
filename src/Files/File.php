<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Files;

/**
 * A file system node.
 */
class File implements \IteratorAggregate, \Jivoo\Http\Route\HasRoute
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
     * @var \Jivoo\Store\Config
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
            if ($name == '.' or $name == '..') {
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
        return $this->system->root . '/system/metadata' . '/' . implode('.dir/', $this->path);
    }
    
    /**
     * 
     * @return \Jivoo\Store\Config
     */
    public function getMetadata()
    {
        if (! isset($this->metadata)) {
            if (preg_match('/^\/system\/metadata/', $this->getPath()) === 1) {
                $this->metadata = new \Jivoo\Store\Config();
                $this->metadata['owner'] = 0;
                $this->metadata['group'] = 0;
                $this->metadata['mode'] = 0;
            } elseif ($this->getType() !== 'unknown') {
                if ($this->type === 'directory') {
                    \Jivoo\Utilities::dirExists(
                        $this->getMetadataPath() . '.dir',
                        true,
                        true
                    );
                }
                $store = new \Jivoo\Store\JsonStore($this->getMetadataPath() . '.json');
                $store->touch();
                $this->metadata = new \Jivoo\Store\Config($store);
            } elseif (isset($this->parent)) {
                return $this->parent->getMetadata();
            } else {
                return new \Jivoo\Store\Config();
            }
        }
        return $this->metadata;
    }
    
    private function isSystem()
    {
        return ! isset($this->system->user) or $this->system->user->getId() === 0 or
            $this->system->user->isMemberOf(0);
    }
    
    public function setMultiple($values, $recursive = false)
    {
        if ($recursive) {
            foreach ($this as $file) {
                $file->setMultiple($values, $recursive);
            }
        }
        $this->assumeWritable();
        $metadata = $this->getMetadata();
        $metadata->set($values);
        return $metadata->save();
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
    
    private function assumeReadable()
    {
        if (!$this->isReadable()) {
            throw new \Blogstep\UnauthorizedException('File is not readable: ' . $this->getPath());
        }
    }
    
    private function assumeWritable()
    {
        if (!$this->isWritable()) {
            throw new \Blogstep\UnauthorizedException('File is not writable: ' . $this->getPath());
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
        if ($this->system->user->getId() === $this->getOwner()) {
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
        if ($this->system->user->getId() === $this->getOwner()) {
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
                    $this->type = \Jivoo\Utilities::getFileExtension($real);
                }
            }
        }
        return $this->type;
    }
    
    public function exists()
    {
        return file_exists($this->getRealPath());
    }
    
    public function copy(File $destination)
    {
        $this->assumeReadable();
        $destination->assumeWritable();
        if ($this->getType() == 'directory') {
            $destination->makeDirectory();
            foreach ($this as $file) {
                $file->copy($destination->get($file->getName()));
            }
        } elseif (!copy($this->getRealPath(), $destination->getRealPath())) {
            return false;
        }
        $meta1 = $this->getMetadata();
        $meta2 = $destination->getMetadata();
        $meta2->override = $meta1;
        if (isset($this->system->user)) {
            $meta2['owner'] = $this->system->user->getId();
        }
        $parent = $destination->getParent();
        $meta2['group'] = $parent->getGroup();
        $meta2['mode'] = $parent->getMode();
        $meta2->save();
        return true;
    }
    
    public function move(File $destination)
    {
        $this->assumeReadable();
        $this->assumeWritable();
        $destination->assumeWritable();
        if ($this->getType() == 'directory') {
            $destination->makeDirectory();
            foreach ($this as $file) {
                $file->move($destination->get($file->getName()));
            }
            $meta1 = $this->getMetadata();
            $meta2 = $destination->getMetadata();
            $meta2->override = $meta1;
            $meta2->save();
            $this->invalidate();
            return $this->delete();
        } elseif (rename($this->getRealPath(), $destination->getRealPath())) {
            if (file_exists($this->getMetadataPath() . '.json')) {
                rename($this->getMetadataPath() . '.json', $destination->getMetadataPath() . '.json');
            }
            $this->invalidate();
            return true;
        }
        return false;
    }
    
    public function moveHere(\Jivoo\Http\Message\UploadedFile $file)
    {
        if ($this->exists()) {
            return false;
        }
        $this->assumeWritable();
        $file->moveTo($this->getRealPath());
        $this->type = \Jivoo\Utilities::getFileExtension($this->getName());
        $metadata = $this->getMetadata();
        if (isset($this->system->user)) {
            $metadata['owner'] = $this->system->user->getId();
        }
        $parent = $this->getParent();
        $metadata['group'] = $parent->getGroup();
        $metadata['mode'] = $parent->getMode();
        if ($metadata->save()) {
            return true;
        }
        $this->type = 'unknown';
        unlink($this->getRealPath());
        return false;
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
                $metadata['owner'] = $this->system->user->getId();
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
            $this->type = \Jivoo\Utilities::getFileExtension($this->getName());
            $metadata = $this->getMetadata();
            if (isset($this->system->user)) {
                $metadata['owner'] = $this->system->user->getId();
            }
            $parent = $this->getParent();
            $metadata['group'] = $parent->getGroup();
            $metadata['mode'] = $parent->getMode();
            if ($metadata->save()) {
                return true;
            }
            $this->type = 'unknown';
            unlink($this->getRealPath());
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
        if ($this->getType() == 'directory') {
            if (!rmdir($this->getRealPath())) {
                return false;
            }
            if (is_dir($this->getMetadataPath() . '.dir')) {
                rmdir($this->getMetadataPath() . '.dir');
            }
        } elseif (!unlink($this->getRealPath())) {
            return false;
        }
        if (file_exists($this->getMetadataPath() . '.json')) {
            unlink($this->getMetadataPath() . '.json');
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
