<?php
// BlogSTEP
// Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile;

class FilterSet
{
    private $file = [];

    private $html = [];
    
    private $content = [];

    private $display = [];
    
    private $displayTags = [];

    public function addFilters($path)
    {
        $dir = scandir($path);
        foreach ($dir as $file) {
            if (\Jivoo\Unicode::endsWith($file, '.php')) {
                $name = substr($file, 0, -4);
                $filePath = $path . '/' . $file;
                $filter = require $filePath;
                if ($filter instanceof Filter) {
                    $this->add($filter);
                } else {
                    trigger_error('Not a valid filter: ' . $filterPath, E_USER_WARNING);
                }
            }
        }
    }
    
    public function add(Filter $filter)
    {
        if (isset($filter->html)) {
            $this->html[] = $filter->html;
        }
        if (isset($filter->file)) {
            $this->file[] = $filter->file;
        }
        if (isset($filter->content)) {
            $this->content[] = $filter->content;
        }
        if (isset($filter->display)) {
            $this->display[] = $filter->display;
        }
        foreach ($filter->displayTags as $tag => $handler) {
            if (isset($this->displayTags[$tag])) {
                trigger_error($filter->sourceFile . ': Redefining display tag: ' . $tag, E_USER_WARNING);
            }
            $this->displayTags[$tag] = $handler;
        }
    }
    
    public function applyFileFilters(\Blogstep\Files\File $buildDir, \Blogstep\Files\File $file)
    {
        foreach ($this->file as $handler) {
            $file = $handler($buildDir, $file);
        }
        return $file;
    }
    
    public function applyHtmlFilters(ContentCompiler $cc, \Blogstep\Files\File $file, \Jivoo\Store\Document $metadata, \simple_html_dom $dom)
    {
        foreach ($this->html as $handler) {
            $handler($cc, $file, $metadata, $dom);
        }
    }
    
    public function applyContentFilters(TemplateCompiler $tc, $content, array $parameters)
    {
        foreach ($this->content as $handler) {
            $content = $handler($tc, $content, $parameters);
        }
        return $content;
    }
    
    public function applyDisplayFilters(TemplateCompiler $tc, $content, array $parameters)
    {
        foreach ($this->display as $handler) {
            $content = $handler($tc, $content, $parameters);
        }
        return $content;
    }

    public function applyDisplayTags(TemplateCompiler $tc, $content, array $parameters)
    {
        return preg_replace_callback('/<\?bs\s*([a-z0-9_]+)(?:\s+([^?]+?))?\s*\?>/i', function ($matches) use ($tc, $parameters) {
            $tag = $matches[1];
            $attributes = [];
            if (isset($matches[2])) {
                $attrStrs = explode('&', $matches[2]);
                foreach ($attrStrs as $attrStr) {
                    $keyValue = explode('=', $attrStr);
                    $attributes[urldecode($keyValue[0])] = urldecode($keyValue[1]);
                }
            }
            $enabled = isset($parameters[$tag]);
            $filterParameters = [];
            if ($enabled) {
                $filterParameters = $parameters[$tag];
            }
            if (isset($this->displayTags[$tag])) {
                return call_user_func_array($this->displayTags[$tag], array_merge(
                    [$tc, $attributes, $enabled],
                    $filterParameters
                ));
            } else {
                trigger_error('No handler for display tag: ' . $tag, E_USER_WARNING);
                return View::html($tag, $attributes);
            }
        }, $content);
    }
}
