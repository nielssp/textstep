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
class Compiler
{
    
    /**
     * @var SiteMap
     */
    private $siteMap;
    
    private $buildDir;
    
    public $content;
    
    private $tasks = [];
    
    public function __construct(File $buildDir, File $content)
    {
        $this->siteMap = new SiteMap($buildDir);
        $this->buildDir = $buildDir;
        $this->content = new ContentTree($content);
    }
    
    public function clean()
    {
        foreach ($this->buildDir as $file) {
            $file->delete();
        }
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
            if (!Unicode::startsWith($name, '.')) {
                $this->createPathStructure($this->siteMap, $file);
            }
        }
    }
    
    public function run()
    {
        foreach ($this->tasks as $task) {
            $this->siteMap->accept($task, $this);
//            echo $task->getName() . ':' . PHP_EOL;
//            echo $this->tree($this->siteMap) . PHP_EOL;
        }
    }
}
