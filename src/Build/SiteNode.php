<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Build;

use Jivoo\View\Compile\InternalNode;
use Jivoo\View\Compile\TemplateNode;

/**
 * 
 */
class SiteNode extends InternalNode
{
    protected $nodes = [];
    
    protected $name;

    public function __construct($name)
    {
        parent::__construct();
        $this->name = $name;
    }
    
    public function append(TemplateNode $node)
    {
        parent::append($node);
        \Jivoo\Assume::that($node instanceof SiteNode);
        $this->nodes[$node->name] = $node;
    }
    
    public function prepend(TemplateNode $node)
    {
        parent::prepend($node);
        \Jivoo\Assume::that($node instanceof SiteNode);
        $this->nodes[$node->name] = $node;
    }
    
    public function remove(TemplateNode $node)
    {
        parent::remove($node);
        \Jivoo\Assume::that($node instanceof SiteNode);
        if (isset($this->nodes[$node->name])) {
            unset($this->nodes[$node->name]);
        }
    }
    
    public function insert(TemplateNode $node, TemplateNode $next)
    {
        parent::insert($node, $next);
        \Jivoo\Assume::that($node instanceof SiteNode);
        $this->nodes[$node->name] = $node;
    }
    
    public function replace(TemplateNode $node, TemplateNode $replacement)
    {
        parent::replace($node, $replacement);
        \Jivoo\Assume::that($node instanceof SiteNode);
        \Jivoo\Assume::that($replacement instanceof SiteNode);
        $this->nodes[$replacement->name] = $replacement;
        if (isset($this->nodes[$node->name])) {
            unset($this->nodes[$node->name]);
        }
    }
    
    public function clear()
    {
        parent::clear();
        $this->nodes = [];
    }
    
    public function get($name)
    {
        if (isset($this->nodes[$name])) {
            return $this->nodes[$name];
        }
        return null;
    }
    
    public function getName()
    {
        return $this->name;
    }
    
    public function getPath()
    {
        if (! isset($this->parent)) {
            return '';
        }
        return ltrim($this->parent->getPath() . '/', '/') . $this->name;
    }
    
    public function createDescendant($path)
    {
        $path = explode('/', $path);
        if (!count($path)) {
            return null;
        }
        $node = $this;
        $last = array_pop($path);
        foreach ($path as $component) {
            if ($component != '') {
                if ($node->get($component) === null) {
                    $dir = new DirNode($component);
                    $node->append($dir);
                    $this->getBuildPath()->get($dir->getPath())->makeDirectory();
                }
                $node = $node->get($component);
            }
        }
        $last = new SiteNode($last);
        $node->append($last);
        return $last;
    }
    
    public function getBuildPath()
    {
        if (isset($this->root)) {
            return $this->root->getBuildPath();
        }
        return null;
    }
    
    public function accept(callable $visitor, Compiler $compiler)
    {
        $visitor($this, $compiler, function () use ($visitor, $compiler) {
            foreach ($this->getChildren() as $child) {
                if ($child instanceof SiteNode) {
                    $child->accept($visitor, $compiler);
                }
            }
        });
    }
}
