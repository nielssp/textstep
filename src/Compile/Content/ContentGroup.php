<?php
// BlogSTEP
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Build;

/**
 * A group of content nodes.
 */
class ContentGroup implements \IteratorAggregate, Selectable
{
    use SelectableTrait;
    
    private $nodes = [];
    
    private $properties;
    
    private $calculatedProperties;
    
    public function __construct(array $properties, array $calculatedProperties)
    {
        $this->properties = $properties;
        $this->calculatedProperties = $calculatedProperties;
    }
    
    public function __get($property)
    {
        if (isset($this->properties[$property])) {
            return $this->properties[$property];
        }
        throw new \Jivoo\InvalidPropertyException('Undefined property: ' . $property);
    }
    
    public function add(ContentNode $node)
    {
        $this->nodes[] = $node;
        foreach ($this->calculatedProperties as $calculatedProperty) {
            list($property, $function, $alias) = $calculatedProperty;
            if (! isset($this->properties[$alias])) {
                switch ($function) {
                    case 'sum':
                    case 'average':
                    case 'count':
                        $this->properties[$alias] = 0;
                        break;
                }
            } else {
                switch ($function) {
                    case 'sum':
                    case 'average':
                        $this->properties[$alias] += $node->$property;
                        break;
                    case 'count':
                        $this->properties[$alias]++;
                        break;
                }
            }
        }
    }
    
    public function finish()
    {
        $size = count($this->nodes);
        if ($size == 0) {
            return;
        }
        foreach ($this->calculatedProperties as $calculatedProperty) {
            list($property, $function, $alias) = $calculatedProperty;
            switch ($function) {
                case 'average':
                    $this->properties[$alias] /= $size;
                    break;
            }
        }
    }
    
    public function addProperty($property, $value)
    {
        $this->properties[$property] = $value;
    }
    
    protected function select()
    {
        return new ContentSelection($this);
    }

    public function count()
    {
        return count($this->getNodes());
    }

    public function getNodes()
    {
        return $this->nodes;
    }

    public function getIterator()
    {
        return new \ArrayIterator($this->getNodes());
    }
    
    public function compare(ContentNode $node)
    {
        foreach ($this->properties as $property => $value) {
            if ($node->$property !== $value) {
                return false;
            }
        }
        return true;
    }
    
    public static function getProperties($propertyNames, ContentNode $node)
    {
        $properties = [];
        foreach ($propertyNames as $property) {
            $properties[$property] = $node->$property;
        }
        return $properties;
    }
}
