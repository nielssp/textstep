<?php
// BlogSTEP
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Build;

/**
 * A selection of content.
 */
class ContentSelection implements \IteratorAggregate, Selectable
{
    
    private $map;
    
    private $filters = [];
    
    private $orderings = [];
    
    private $nodes = null;
    
    private $limit = null;
    
    private $offset = 0;
    
    public function __construct(ContentTree $map)
    {
        $this->map = $map;
    }

    public static function sortAll(array $data, array $orderings)
    {
        if (! count($orderings)) {
            return $data;
        }
        usort($data, function ($a, $b) use ($orderings) {
            foreach ($orderings as $ordering) {
                list($property, $descending) = $ordering;
                if ($a->$property == $b->$property) {
                    continue;
                }
                if ($descending) {
                    if (is_numeric($a->$property)) {
                        return $b->$property - $a->$property;
                    }
                    return strcmp($b->$property, $a->$property);
                } else {
                    if (is_numeric($a->$property)) {
                        return $a->$property - $b->$property;
                    }
                    return strcmp($a->$property, $b->$property);
                }
            }
        });
        return $data;
    }
    
    public function getNodes()
    {
        if (!isset($this->nodes)) {
            $this->nodes = $this->map->getNodes();
            $this->nodes = array_filter($this->nodes, function (ContentNode $node) {
                foreach ($this->filters as $filter) {
                    if (!$filter($node)) {
                        return false;
                    }
                }
                return true;
            });
            $this->nodes = self::sortAll($this->nodes, $this->orderings, false);
            if (isset($this->limit)) {
                $this->nodes = array_slice($this->nodes, $this->offset, $this->limit);
            }
        }
        return $this->nodes;
    }
    
    public function getIterator()
    {
        return new \ArrayIterator($this->getNodes());
    }
    
    protected function select()
    {
        $selection = clone $this;
        $selection->nodes = null;
        return $selection;
    }

    public function filter(callable $filter)
    {
        $selection = $this->select();
        $selection->filters[] = $filter;
        return $selection;
    }

    public function where($property, $value, $strict = true)
    {
        return $this->filter(function (ContentNode $node) use ($property, $value, $strict) {
            return $strict ? $node->$property === $value : $node->property == $value;
        });
    }

    public function orderBy($property)
    {
        $selection = $this->select();
        $selection->orderings[] = [$property, false];
        return $selection;
    }

    public function orderByDescending($property)
    {
        $selection = $this->select();
        $selection->orderings[] = [$property, true];
        return $selection;
    }

    public function count()
    {
        return count($this->getNodes());
    }

    public function limit($limit)
    {
        $selection = $this->select();
        $selection->limit = $limit;
        return $selection;
    }

    public function offset($offset)
    {
        $selection = $this->select();
        $selection->offset = $offset;
        return $selection;
    }
}
