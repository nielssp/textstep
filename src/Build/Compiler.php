<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Build;

use Blogstep\Files\File;

/**
 * Site compiler.
 */
class Compiler
{
    
    private $siteMap;
    
    private $buildDir;
    
    public function __construct(File $buildDir)
    {
        $this->siteMap = new SiteMap();
        $this->buildDir = $buildDir;
    }
    
    public function clean()
    {
        foreach ($this->buildDir as $file) {
            $file->delete();
        }
    }
    
    public function install($path)
    {
        
    }
    
    private function createPathStructure($path, File $source)
    {
        if ($source->getType() === 'directory') {
            foreach ($source as $file) {
                $name = $file->getName();
                if (!\Jivoo\Unicode::startsWith($name, '.')) {
                    $this->createPathStructure($path . '/' . $name, $file);
                }
            }
        } else {
            $this->siteMap->addNode($path);
        }
    }
    
    public function createStructure(File $source)
    {
        $this->createPathStructure('', $source);
        var_dump($this->siteMap);exit;
    }
}
