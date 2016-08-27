<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Route;

/**
 * 
 */
class SnippetRoute extends \Jivoo\Http\Route\RouteBase
{
    private $scheme;
    
    private $name;
    
    public function __construct(SnippetScheme $snippets, $name, $parameters, $query, $fragment)
    {
        $this->scheme = $snippets;
        $this->name = $name;
        $this->parameters = $parameters;
        $this->query = $query;
        $this->fragment = $fragment;
    }
    
    public function __toString()
    {
        return 'snippet:' . $this->name;
    }

    public function auto(\Jivoo\Http\Route\Matcher $matcher, $resource = false)
    {
        $namespace = $this->scheme->getNamespace();
        $name = $this->name;
        if (\Jivoo\Unicode::startsWith($name, $namespace)) {
            $name = substr($name, strlen($namespace));
        }
        $dirs = explode('\\', $name);
        $dirs = array_map(array('Jivoo\Utilities', 'camelCaseToDashes'), $dirs);
        $pattern = 'ANY ' . str_replace('_', '.', implode('/', $dirs));
        $matcher->match($pattern, $this);
        return $pattern;

    }

    public function dispatch(\Jivoo\Http\ActionRequest $request, \Psr\Http\Message\ResponseInterface $response)
    {
        $snippet = $this->scheme->getSnippet($this->name);
        return $snippet($request, $response, $this->parameters);
    }

    public function getPath($pattern)
    {
        return \Jivoo\Http\Route\RouteBase::insertParameters($pattern, $this->parameters);
    }

}
