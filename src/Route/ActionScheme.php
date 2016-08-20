<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.

/**
 * Implements routing of controller actions.
 */
class ActionScheme implements Jivoo\Http\Route\Scheme
{
    public function fromArray(array $route)
    {
    }

    public function fromString($routeString)
    {
        $route = array(
            'parameters' => array()
        );
        $routeString = Jivoo\Http\Route\RouteBase::stripAttributes($routeString, $route);
        if (preg_match('/^action:(?:([a-z0-9_\\\\]+)::)?([a-z0-9_\\\\]+)$/i', $routeString, $matches) !== 1) {
            throw new InvalidRouteException(tr('Invalid route string for action dispatcher'));
        }
        if ($matches[1] != '') {
            $route['controller'] = $matches[1];
            $route['action'] = $matches[2];
        } else if (ucfirst($matches[2]) === $matches[2]) {
            $route['controller'] = $matches[2];
        } else {
            if (isset($this->m->Routing->route['controller'])) {
                $route['controller'] = $this->m->Routing->route['controller'];
            }
            $route['action'] = $matches[2];
        }
        return $this->fromArray($route);
    }

    public function getKeys()
    {
        return ['controller', 'action'];
    }

    public function getPrefixes()
    {
        return ['action'];
    }
}
