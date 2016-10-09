<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Build;

/**
 * 
 */
class SiteMap extends SiteNode
{
    private $buildPath;
    
    public function __construct(\Blogstep\Files\File $buildPath)
    {
        parent::__construct('');
        $this->buildPath = $buildPath;
    }
    
    public function createFile($path)
    {
        $path = explode('/', $path);
        $node = $this;
        foreach ($path as $component) {
            if ($component != '') {
            }
        }
    }
    
    public function getBuildPath()
    {
        return $this->buildPath;
    }
}
