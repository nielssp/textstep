<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Build;

/**
 * A file node.
 */
class FileNode extends SiteNode
{
    private $file;
    
    public function __construct(\Blogstep\Files\File $file)
    {
        parent::__construct($file->getName());
        $this->file = $file;
    }
    
    public function setFile(\Blogstep\Files\File $file)
    {
        $this->file = $file;
    }
    
    /**
     * 
     * @return \Blogstep\Files\File
     */
    public function getFile()
    {
        return $this->file;
    }
    
    public function getRelativePath(SiteNode $source)
    {
        $relative = parent::getRelativePath($source);
        if ($relative == '.') {
            return $this->getName();
        }
        return $relative;
    }
}
