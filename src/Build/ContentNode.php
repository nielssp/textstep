<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Build;

use Blogstep\Files\File;

/**
 * A content node.
 */
class ContentNode extends FileNode
{
    private $template;
    private $type;
    
    public function __construct(File $file, File $template = null)
    {
        parent::__construct($file);
        $this->template = $template;
        $this->name = preg_replace('/\..+$/', '', $this->name);
        $this->type = $file->getType();
    }
    
    public function getTemplate()
    {
        return $this->template;
    }
    
    public function setTemplate(File $template)
    {
        $this->template = $template;
    }
    
    public function setFile(File $file)
    {
        parent::setFile($file);
        $this->type = $file->getType();
    }
    
    public function getType()
    {
        return $this->type;
    }
    
    public function convertPath($format)
    {
        return preg_replace_callback('/%([a-zA-Z0-9_]+)%/', function ($matches) {
            if ($matches[1] == 'name') {
                return $this->name;
            }
            return $matches[1];
        }, $format);
    }
}
