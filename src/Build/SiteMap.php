<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Build;

/**
 * 
 */
class SiteMap
{
    private $nodes = [];
    
    public function addNode($path)
    {
        $this->nodes[$path] = new SiteNode();
    }
    
    public function toArray()
    {
        return $this->nodes;
    }
}
