<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Build;

use Blogstep\Files\File;
use Jivoo\InvalidPropertyException;

/**
 * A content node.
 */
class ContentNode extends FileNode
{
    private $contentFile;
    private $type;
    
    public function __construct(File $content, File $template = null)
    {
        parent::__construct(isset($template) ? $template : $content);
        $this->contentFile = $content;
        $this->name = preg_replace('/\..+$/', '', $content->getName());
        $this->type = $content->getType();
    }
    
    public function __get($property)
    {
        switch ($property) {
            case 'published':
                return $this->contentFile->getCreated();
        }
        try {
            return parent::__get($property);
        } catch (InvalidPropertyException $e) {
            return null;
        }
    }
    
    public function getContent()
    {
        return $this->contentFile;
    }
    
    public function setContent(File $content)
    {
        $this->contentFile = $content;
        $this->type = $content->getType();
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
    
    public function __toString()
    {
        return $this->getContent()->getContents();
    }
}
