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
    
    public static function init(SiteMap $root, \Blogstep\Files\FileSystem $fileRoot, array $state)
    {
        $node = new static($fileRoot->get($state['file']), unserialize($state['object']));
        $node->resume($root, $fileRoot, $state);
        return $node;
    }
    
    public function suspend()
    {
        return array_merge(parent::suspend(), [
            'object' => serialize($this->object)
        ]);
    }
    
    public function getObject()
    {
        return $this->object;
    }
}
