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
    
    public function getIterator()
    {
        $nodes = $this->map->getNodes();
        $nodes = array_filter($nodes, function (ContentNode $node) {
            foreach ($this->filters as $filter) {
                if (!$filter($node)) {
                    return false;
                }
            }
            return true;
        });
        $nodes = self::sortAll($nodes, $this->orderings, false);
        return new \ArrayIterator($nodes);
    }

    public function filter(callable $filter)
    {
        $selection = clone $this;
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
        $selection = clone $this;
        $selection->orderings[] = [$property, false];
        return $selection;
    }

    public function orderByDescending($property)
    {
        $selection = clone $this;
        $selection->orderings[] = [$property, true];
        return $selection;
    }
}
