<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Build;

use Blogstep\Files\File;
use Jivoo\Unicode;

/**
 * Site compiler.
 */
class Compiler extends \Blogstep\Task\TaskBase
{
    
    /**
     * @var SiteMap
     */
    private $siteMap;
    
    private $buildDir;
    
    public $content = null;
    
    public $config;
    
    private $tasks = [];
    
    private $currentTask = 0;
    
    private $remainingNodes = null;
    
    private $total = 0;
    
    public function __construct(File $buildDir, \Jivoo\Store\Document $config)
    {
        $this->siteMap = new SiteMap($buildDir);
        $this->buildDir = $buildDir;
        $this->config = $config;
    }
    
    public function clean()
    {
        foreach ($this->buildDir as $file) {
            if ($file->getName() !== '.build') {
                $file->delete();
            }
        }
    }
    
    public function createContentTree(File $content, ContentHandler $handler)
    {
        $contentBuildDir = $this->buildDir->get('_content');
        if (!$contentBuildDir->exists()) {
            $contentBuildDir->makeDirectory();
        }
        $this->content = new ContentTree($content, $contentBuildDir, $handler);
    }
    
    public function addTask(Task $task)
    {
        $this->tasks[] = $task;
    }
    
    private function installNode(SiteNode $node, $dest)
    {
        if ($node instanceof DirNode or $node instanceof SiteMap) {
            if (!is_dir($dest)) {
                mkdir($dest);
            }
        } elseif ($node instanceof FileNode) {
            copy($node->getFile()->getRealPath(), $dest);
        }
        foreach ($node->getChildren() as $child) {
            $this->installNode($child, $dest . '/' . $child->getName());
        }
    }
    
    public function install($dest)
    {
        $this->installNode($this->siteMap, $dest);
    }
    
    private function createPathStructure(SiteNode $dir, File $source)
    {
        if ($source->getType() === 'directory') {
            $node = new DirNode($source->getName());
            $dir->append($node);
            foreach ($source as $file) {
                $name = $file->getName();
                if (!Unicode::startsWith($name, '.')) {
                    $this->createPathStructure($node, $file);
                }
            }
        } else {
            $dir->append(new FileNode($source));
        }
    }
    
    public function createStructure(File $source)
    {
        foreach ($source as $file) {
            $name = $file->getName();
            if (!Unicode::startsWith($name, '.') and $name !== 'filters')  { // TODO: ignore system
                $this->createPathStructure($this->siteMap, $file);
            }
        }
    }
    
    public function run(callable $checkTime)
    {
        if (isset($this->remainingNodes) and !count($this->remainingNodes)) {
            $this->currentTask++;
            $this->remainingNodes = null;
        }
        if (!isset($this->tasks[$this->currentTask])) {
            return;
        }
        $task = $this->tasks[$this->currentTask];
        $n = count($this->tasks);
        $this->status(null);
        if (!isset($this->remainingNodes)) {
            $this->remainingNodes = $this->siteMap->flatten();
            $this->total = count($this->remainingNodes);
        }
        while (count($this->remainingNodes)) {
            $node = array_shift($this->remainingNodes);
            $task($node, $this);
            if (!$checkTime()) {
                break;
            }
        }
        $remaining = count($this->remainingNodes);
        $taskProgress = 0;
        if ($this->total > 0) {
            $taskProgress = ($this->total - $remaining) / $this->total * 100 / $n;
        }
        $this->progress(floor($this->currentTask / $n * 100 + $taskProgress));
        $this->status(
            'Running "' . $task->getName() . '" on ' . $remaining  . ' nodes'
        );
    }

    public function getName()
    {
        return 'compiler';
    }

    public function isDone()
    {
        return !isset($this->tasks[$this->currentTask]);
    }

    public function serialize(\Blogstep\Task\Serializer $serializer)
    {
        return $serializer->serialize([
            $this->currentTask,
            $this->remainingNodes,
            $this->total,
            $this->siteMap,
            $this->content
        ]);
    }

    public function unserialize(array $serialized, \Blogstep\Task\Serializer $serializer)
    {
        list(
            $this->currentTask,
            $this->remainingNodes,
            $this->total,
            $this->siteMap,
            $this->content
        ) = $serializer->unserialize($serialized);
    }

}
