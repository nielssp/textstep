<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Build;

use Jivoo\View\Compile\InternalNode;

/**
 * 
 */
abstract class SiteNode extends InternalNode
{
    protected $nodes = [];
    
    protected $name;

    public function __construct($name)
    {
        parent::__construct();
        $this->name = $name;
    }
    
    public function append(\Jivoo\View\Compile\TemplateNode $node)
    {
        parent::append($node);
    }
    
    public function prepend(\Jivoo\View\Compile\TemplateNode $node)
    {
        parent::prepend($node);
    }
    
    public function remove(\Jivoo\View\Compile\TemplateNode $node)
    {
        parent::remove($node);
    }
    
    public function insert(TemplateNode $node, TemplateNode $next)
    {
        parent::insert($node, $next);
    }
    
    public function replace(TemplateNode $node, TemplateNode $replacement)
    {
        parent::replace($node, $replacement);
    }
    
    public function clear()
    {
        
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
