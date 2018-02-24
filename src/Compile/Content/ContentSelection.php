<?php
// BlogSTEP
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile\Content;

/**
 * A selection of content.
 */
class ContentSelection implements \IteratorAggregate, Selectable
{
    
    private $source;
    
    private $filters = [];
    
    private $orderings = [];
    
    private $group = null;
    
    private $arrayGroup = null;
    
    private $aggregate = [];
    
    private $nodes = null;
    
    private $limit = null;
    
    private $offset = 0;
    
    public function __construct(Selectable $source)
    {
        $this->source = $source;
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
            $this->nodes = $this->source->getNodes();
            $this->nodes = array_filter($this->nodes, function (ContentNode $node) {
                foreach ($this->filters as $filter) {
                    if (!$filter($node)) {
                        return false;
                    }
                }
                return true;
            });
            if (isset($this->group)) {
                $data = self::sortAll($this->nodes, array_map(function ($property) {
                    return [$property, false];
                }, $this->group));
                $previous = null;
                $this->nodes = [];
                foreach ($data as $node) {
                    if (isset($previous)) {
                        if ($previous->compare($node)) {
                            $previous->add($node);
                            continue;
                        }
                        $previous->finish();
                    }
                    $properties = ContentGroup::getProperties($this->group, $node);
                    $previous = new ContentGroup($properties, $this->aggregate);
                    $previous->add($node);
                    $this->nodes[] = $previous;
                }
                if (isset($previous)) {
                    $previous->finish();
                }
            }
            if (isset($this->arrayGroup)) {
                $groups = [];
                $property = $this->arrayGroup;
                foreach ($this->nodes as $node) {
                    $values = $node->$property;
                    if (isset($values) and is_array($values)) {
                        foreach ($values as $value) {
                            if (!isset($groups[$value])) {
                                $groups[$value] = new ContentGroup(['group' => $value], $this->aggregate);
                            }
                            $groups[$value]->add($node);
                        }
                    }
                }
                foreach ($groups as $group) {
                    $group->finish();
                }
                $this->nodes = $groups;
            }
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

    public function aggregate($property, $func = 'sum', $alias = null)
    {
        $selection = $this->select();
        if (! isset($alias)) {
            $alias = $property . lcfirst($func);
        }
        $selection->aggregate[] = [$property, $func, $alias];
        return $selection;
    }

    public function groupBy($properties)
    {
        $selection = $this->select();
        if (! isset($selection->group)) {
            $selection->group = [];
        }
        if (is_array($properties)) {
            $selection->group = array_merge($selection->group, $properties);
        } else {
            $selection->group[] = $properties;
        }
        return $selection;
    }

    public function groupByArray($property)
    {
        $selection = $this->select();
        $selection->arrayGroup = $property;
        return $selection;
    }

    public function paginate($itemsPerPage, array $pageProperties = [])
    {
        \Jivoo\Assume::that($itemsPerPage > 0);
        $items = $this->getNodes();
        $length = count($items);
        $numPages = max(ceil($length / $itemsPerPage), 1);
        $currentPage = new ContentPage($pageProperties, 1, $numPages, 0, $length);
        $counter = 0;
        $pages = [$currentPage];
        for ($i = 0; $i < $length; $i++) {
            if ($counter >= $itemsPerPage) {
                $currentPage = new ContentPage($pageProperties, $currentPage->page + 1, $numPages, $i, $length);
                $currentPage->finish();
                $pages[] = $currentPage;
                $counter = 0;
            }
            $currentPage->add($items[$i]);
            $counter++;
        }
        $currentPage->finish();
        return $pages;
    }
    
    public function map(callable $function)
    {
        $nodes = [];
        foreach ($this as $node) {
            $nodes[] = $function($node);
        }
        return $nodes;
    }

    public function flatMap(callable $function)
    {
        $nodes = [];
        foreach ($this as $node1) {
            foreach ($function($node1) as $node2) {
                $nodes[] = $node2;
            }
        }
        return $nodes;
    }

}
