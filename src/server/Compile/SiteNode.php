<?php
// BlogSTEP
// Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile;

/**
 * A site node.
 */
class SiteNode
{
    private $path;

    private $handler;

    private $args;

    public function __construct($path, $handler, array $args)
    {
        $this->path = $path;
        $this->handler = $handler;
        $this->args = $args;
    }

    public function __get($property)
    {
        switch ($property) {
            case 'path':
            case 'handler':
            case 'args':
                return $this->$property;
        }
        return null;
    }
}
