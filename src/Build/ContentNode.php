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
    private $relativePath;
    private $type;
    private $dom = null;
    private $originalFile;
    private $metadata;
    private $propertyDefinitions;
    
    public function __construct(File $content, $relativePath, array $properties, File $template = null)
    {
        parent::__construct(isset($template) ? $template : $content);
        $this->originalFile = $content;
        $this->metadata = $content->getMetadata()->toArray();
        $this->relativePath = $relativePath;
        $this->contentFile = $content;
        $this->propertyDefinitions = $properties;
        $this->name = preg_replace('/\..+$/', '', $content->getName());
        $this->type = $content->getType();
    }
    
    public function __get($property)
    {
        if (isset($this->propertyDefinitions[$property])) {
            return call_user_func($this->propertyDefinitions[$property], $this);
        }
        switch ($property) {
            case 'title':
                $dom = $this->getDom();
                $title = $dom->find('h1', 0);
                if (isset($title)) {
                    return $title->innertext;
                }
                return '';
            case 'contentWithoutTitle':
                $dom = $this->getDom();
                $title = $dom->find('h1', 0);
                if (isset($title)) {
                    $title->outertext = '';
                }
                return $dom->__toString();
            case 'published':
                return $this->originalFile->getCreated();
            case 'year':
                return date('Y', $this->published);
            case 'month':
                return date('m', $this->published);
            case 'metadata':
            case 'relativePath':
            case 'name':
            case 'originalFile':
                return $this->$property;
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
    
    /**
     * 
     * @return \SimpleHtmlDom\simple_html_dom
     * @throws \Blogstep\RuntimeException
     */
    public function getDom()
    {
        if (!isset($this->dom)) {
            $this->dom = new \SimpleHtmlDom\simple_html_dom();
            $file = $this->getContent()->getContents();
            if (!$this->dom->load($file, true, false)) {
                throw new \Blogstep\RuntimeException('Could not parse content: ' . $this->getContent()->getPath());
            }
        }
        return $this->dom;
    }
    
    public function convertPath($format)
    {
        return trim(preg_replace_callback('/%([a-zA-Z0-9_]+)%/', function ($matches) {
            $property = $matches[1];
            $value = $this->$property;
            if (isset($value)) {
                return $value;
            }
            return $property;
        }, $format), '/');
    }
    
    public function __toString()
    {
        return $this->getDom()->__toString();
    }
}
