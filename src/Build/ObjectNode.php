<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Build;

use Blogstep\Files\File;

/**
 * An object node.
 */
class ObjectNode extends FileNode
{
    private $object;

    public function __construct(File $template, $object)
    {
        parent::__construct($template);
        $this->object = $object;
    }
    
    public function getObject()
    {
        return $this->object;
    }
}
