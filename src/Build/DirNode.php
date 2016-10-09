<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Build;

/**
 * A directory node.
 */
class DirNode extends SiteNode
{
    public function __construct($name)
    {
        parent::__construct($name);
    }
}
