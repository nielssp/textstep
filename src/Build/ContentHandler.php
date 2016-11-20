<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Build;

/**
 * Description of ContentHandler
 */
class ContentHandler
{
    
    private $filters = [];
    
    private $defaultFilters = [];
    
    private $handlers = [];
    
    private $properties = [];
    
    
    public function addHandler($type, callable $handler)
    {
        $this->handlers[$type] = $handler;
    }
    
    public function hasHandler($type)
    {
        return isset($this->handlers[$type]);
    }
    
    public function getHandler($type)
    {
        return $this->handlers[$type];
    }
    
    public function addFilter($name, callable $filter)
    {
        $this->filters[$name] = $filter;
    }

    public function getFilters()
    {
        return $this->filters;
    }
    
    public function getDefaultFilters()
    {
        return $this->defaultFilters;
    }
    
    public function setDefaultFilters($filters)
    {
        $this->defaultFilters = $filters;
    }
    
    public function addProperty($name, callable $getter)
    {
        $this->properties[$name] = $getter;
    }
}
