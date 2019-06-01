<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Route;

/**
 * Implements routing of controller actions.
 */
class SnippetScheme implements \Jivoo\Http\Route\Scheme
{
    
    private $m;
    
    private $namespace = '';
    
    public function __construct(\Blogstep\Modules $m, $namespace = '')
    {
        $this->m = $m;
        if ($namespace != '') {
            $this->namespace = ltrim(rtrim($namespace, '\\') . '\\', '\\');
        }
    }
    
    public function getNamespace()
    {
        return $this->namespace;
    }
    
    public function getSnippet($name)
    {
        \Jivoo\Assume::isSubclassOf($name, 'Blogstep\Snippet');
        return new $name($this->m, $this);
    }
    
    public function fromArray(array $route)
    {
        if (class_exists($this->namespace . $route['snippet'])) {
            $route['snippet'] = $this->namespace . $route['snippet'];
        }
        \Jivoo\Assume::isSubclassOf($route['snippet'], 'Blogstep\Snippet');
        return new SnippetRoute($this, $route['snippet'], $route['parameters'], $route['query'], $route['fragment']);
    }

    public function fromString($routeString)
    {
        $route = array(
            'parameters' => [],
            'query' => [],
            'fragment' => ''
        );
        $routeString = \Jivoo\Http\Route\RouteBase::stripAttributes($routeString, $route);
        if (preg_match('/^snippet:([a-z0-9_\\\\]+)$/i', $routeString, $matches) !== 1) {
            throw new \Jivoo\Http\Route\RouteException('Invalid route string for snippet scheme');
        }
        $route['snippet'] = $matches[1];
        return $this->fromArray($route);
    }

    public function getKeys()
    {
        return ['snippet'];
    }

    public function getPrefixes()
    {
        return ['snippet'];
    }
}
