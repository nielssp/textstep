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
    
    private $objectPath = null;
    
    public function __construct(File $template, $object)
    {
        parent::__construct($template);
        $this->object = $object;
    }
    
    public static function init(SiteMap $root, \Blogstep\Files\FileSystem $fileRoot, array $state)
    {
        if (is_array($state['object'])) {
            $node = new static($fileRoot->get($state['file']), null);
            $node->objectPath = $state['object'][0];
        } else {
            $node = new static($fileRoot->get($state['file']), unserialize($state['object']));
        }
        $node->resume($root, $fileRoot, $state);
        return $node;
    }
    
    public function suspend()
    {
        return array_merge(parent::suspend(), [
            'object' => $this->object instanceof SiteNode
                ? [$this->object->getPath()]
                : serialize($this->object)
        ]);
    }
    
    public function getObject()
    {
        if (isset($this->objectPath)) {
            $this->object = $this->root->get($this->objectPath);
            $this->objectPath = null;
        }
        return $this->object;
    }
}
