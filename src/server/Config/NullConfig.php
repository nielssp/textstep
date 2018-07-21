<?php
// BlogSTEP
// Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.

namespace Blogstep\Config;

/**
 * Empty configuration.
 */
class NullConfig extends Config
{
    /**
     * @var array
     */
    private $data = [];
    
    protected function getRelative($key)
    {
        return new self();
    }

    protected function getValue($key)
    {
        if (isset($this->data[$key])) {
            return $this->data[$key];
        }
        return null;
    }

    protected function setValue($key, $value)
    {
        $this->data[$key] = $value;
    }

    public function getData()
    {
        return $this->data;
    }
}
