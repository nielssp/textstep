<?php
// BlogSTEP
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Build;

interface Selectable extends \Traversable
{
    public function getNodes();
    
    public function where($property, $value, $strict = true);
    
    public function filter(callable $filter);
    
    public function orderBy($property);
    
    public function orderByDescending($property);
    
    public function groupBy($properties);
    
    public function groupByArray($property);
    
    public function aggregate($property, $func = 'sum', $alias = null);
    
    public function limit($limit);
    
    public function offset($offset);
    
    public function count();
}
