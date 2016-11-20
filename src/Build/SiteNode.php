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
        if (isset($this->nodes[$node->name])) {
            unset($this->nodes[$node->name]);
        }
        $this->nodes[$replacement->name] = $replacement;
    }
    
    public function clear()
    {
        parent::clear();
        $this->nodes = [];
    }
    
    public function get($path)
    {
        \Jivoo\Assume::isString($path);
        $path = explode('/', $path);
        $node = $this;
        foreach ($path as $component) {
            if ($component == '..') {
                if (isset($node->parent)) {
                    $node = $node->parent;
                }
            } elseif ($component != '' and $component != '.') {
                if (!isset($node->nodes[$component])) {
                    return null;
                }
                $node = $node->nodes[$component];
            }
        }
        return $node;
    }
    
    public function getName()
    {
        return $this->name;
    }
    
    public function setName($name)
    {
        $this->name = $name;
    }
    
    public function getPath()
    {
        if (! isset($this->parent)) {
            return '';
        }
        return ltrim($this->parent->getPath() . '/', '/') . $this->name;
    }
    
    public function getRelativePath(SiteNode $source)
    {
        $path = explode('/', $this->getPath());
        $other = explode('/', $source->getPath());
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
                if (!isset($node->nodes[$component])) {
                    $dir = new DirNode($component);
                    $node->append($dir);
                    $this->getBuildPath()->get($dir->getPath())->makeDirectory();
                }
                $node = $node->nodes[$component];
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
    
    private function flattenTo(&$array)
    {
        $array[] = $this;
        foreach ($this->getChildren() as $child) {
            if ($child instanceof SiteNode) {
                $child->flattenTo($array);
            }
        }
    }
    
    public function flatten()
    {
        $array = [];
        $this->flattenTo($array);
        return $array;
    }
    
    public function tree($prefix = '')
    {
        $out = $this->getName();
        $children = $this->getChildren();
        $n = count($children);
        for ($i = 0; $i < $n; $i++) {
            $out .= PHP_EOL . $prefix;
            $node = $children[$i];
            if ($i == $n - 1) {
                $out .= '└── ';
                $out .= $node->tree($prefix . '    ');
            } else {
                $out .= '├── ';
                $out .= $node->tree($prefix . '│   ');
            }
        }
        return $out;
    }
}
