<?php
// BlogSTEP 
// Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile\Content;

use Blogstep\Files\File;

/**
 * A content node.
 */
class ContentNode
{
    private $path;

    private $metadata;
    
    public function __construct(File $path, array $metadata)
    {
        $this->path = $path;
        $this->metadata = $metadata;
    }

    public function __get($property)
    {
        switch ($property) {
            case 'year':
                return date('Y', $this->published);
            case 'month':
                return date('m', $this->published);
            case 'monthName':
                return \Jivoo\I18n\I18n::date('F', $this->published);
        }
        if (isset($this->metadata[$property])) {
            return $this->metadata[$property];
        }
        return null;
    }
    
    public function path($format)
    {
        return trim(preg_replace_callback('/%([a-zA-Z0-9_]+)%/', function ($matches) {
            $property = $matches[1];
            $value = $this->__get($property);
            if (isset($value)) {
                return $value;
            }
            return $property;
        }, $format), '/');
    }
    
    public function __toString()
    {
        return $this->path->get('content.html')->getContents();
    }
}
