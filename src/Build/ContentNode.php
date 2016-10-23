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
    private $origin;
    private $dom = null;
    private $metadata = null;
    private $propertyDefinitions;
    
    public function __construct(File $origin, File $content, $relativePath, array $properties, File $template = null)
    {
        parent::__construct($content);
        $this->origin = $origin;
        $this->relativePath = $relativePath;
        $this->contentFile = $content;
        $this->propertyDefinitions = $properties;
        $this->name = preg_replace('/\..+$/', '', $content->getName());
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
            case 'hasBreak':
                return $this->getDom()->find('.break', 0) !== null;
            case 'published':
                $published = $this->getMetadata()->get('published');
                if (!isset($published)) {
                    return time();
                } elseif (is_string($published)) {
                    return strtotime($published);
                }
                return $published;
            case 'year':
                return date('Y', $this->published);
            case 'month':
                return date('m', $this->published);
            case 'monthName':
                return \Jivoo\I18n\I18n::date('F', $this->published);
            case 'metadata':
                return $this->getMetadata();
            case 'relativePath':
            case 'name':
            case 'originalFile':
                return $this->$property;
        }
        if (isset($this->getMetadata()[$property])) {
            return $this->getMetadata()->get($property);
        }
        try {
            return parent::__get($property);
        } catch (InvalidPropertyException $e) {
            return null;
        }
    }
    
    public function getMetadata()
    {
        if (!isset($this->metadata)) {
            $dom = $this->getDom();
            $data = [];
            foreach ($dom->find('comment') as $comment) {
                if (preg_match('/^<!-- *(\{.*\}) *-->$/ms', $comment->innertext, $matches) === 1) {
                    $json = json_decode($matches[1], true);
                    if (is_array($json)) {
                        $data = array_merge($data, $json);
                        $comment->outertext = '';
                    }
                }
            }
            $this->metadata = new \Jivoo\Store\Document($data);
        }
        return $this->metadata;
    }
    
    public function getContent()
    {
        return $this->contentFile;
    }
    
    public function setContent(File $content)
    {
        $this->contentFile = $content;
    }
    
    public function getOrigin()
    {
        return $this->origin;
    }
    
    /**
     * 
     * @return \SimpleHtmlDom\simple_html_dom
     * @throws \Blogstep\RuntimeException
     */
    public function getDom()
    {
        if (!isset($this->dom)) {
            $this->dom = $this->createDom();
        }
        return $this->dom;
    }
    
    public function createDom()
    {
        $dom = new \SimpleHtmlDom\simple_html_dom();
        if (isset($this->dom)) {
            $dom = $dom->load($this->dom->__toString(), true, false);
        } else {
            $file = $this->getContent()->getContents();
            $dom->load($file, true, false);
        }
        if (!$dom) {
          throw new \Blogstep\RuntimeException('Could not parse content: ' . $this->getContent()->getPath());
        }
        return $dom;
    }
    
    public function path($format)
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
