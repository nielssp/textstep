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

    private $namespace;

    public function __construct(File $path, array $metadata, $namespace = '')
    {
        $this->path = $path;
        $this->metadata = $metadata;
        $this->namespace = '/^' . preg_quote(rtrim($namespace, '/'), '/') . '/';
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
            case 'relativePath':
                return preg_replace($this->namespace, '', $this->path->getParent()->getPath());
            case 'path':
                return $this->path->getPath();
            case 'namespace':
                return $this->$property;
        }
        if (isset($this->metadata[$property])) {
            return $this->metadata[$property];
        }
        return null;
    }

    public function path($format)
    {
        return rtrim(preg_replace_callback('/%([a-zA-Z0-9_]+)%/', function ($matches) {
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
