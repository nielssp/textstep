<?php
// BlogSTEP
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Build;

/**
 * Implements parts of {@see Selectable}.
 */
trait SelectableTrait
{
    
    protected abstract function select();

    public function filter(callable $filter)
    {
        return $this->select()->filter($filter);
    }

    public function where($property, $value, $strict = true)
    {
        return $this->select()->where($property, $value, $strict);
    }
    
    public function orderBy($property)
    {
        return $this->select()->orderBy($property);
    }
    
    public function orderByDescending($property)
    {
        return $this->select()->orderByDescending($property);
    }

    public function limit($limit)
    {
        return $this->select()->limit($limit);
    }

    public function offset($offset)
    {
        return $this->select()->limit($offset);
    }

    public function aggregate($property, $func = 'sum', $alias = null)
    {
        return $this->select()->aggregate($property, $func, $alias);
    }

    public function groupBy($properties)
    {
        return $this->select()->groupBy($properties);
    }

    public function groupByArray($property)
    {
        return $this->select()->groupByArray($property);
    }
}
