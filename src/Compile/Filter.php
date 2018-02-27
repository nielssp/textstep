<?php
// BlogSTEP
// Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile;

class Filter implements \ArrayAccess
{
    public $displayTags = [];

    public $file = null;

    public $html = null;
    
    public $display = null;
    
    public function offsetExists($displayTag)
    {
        return isset($this->displayTags[$displayTag]);
    }

    public function offsetGet($displayTag)
    {
        if (isset($this->displayTags[$displayTag])) {
            return $this->displayTags[$displayTag];
        }
        return null;
    }

    public function offsetSet($displayTag, callable $handler)
    {
        $this->displayTags[$displayTag] = $handler;
    }

    public function offsetUnset($displayTag)
    {
        if (isset($this->displayTags[$displayTag])) {
            unset($this->displayTags[$displayTag]);
        }
    }
}
