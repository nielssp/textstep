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

    private $display = [];
    
    private $displayTags = [];
    
    public function add(Filter $filter)
    {
        if (isset($filter->html)) {
            $this->html[] = $filter->html;
        }
        if (isset($filter->file)) {
            $this->file[] = $filter->file;
        }
        if (isset($filter->display)) {
            $this->display[] = $filter->display;
        }
        foreach ($filter->displayTags as $tag => $handler) {
            if (!isset($this->displayTags[$tag])) {
                $this->displayTags[$tag] = [];
            }
            $this->displayTags[$tag][] = $handler;
        }
    }
    
    public function applyFileFilters(TemplateCompiler $tc, \Blogstep\Files\File $file)
    {
        foreach ($this->file as $handler) {
            $file = $handler($tc, $file);
        }
        return $file;
    }
    
    public function applyHtmlFilters(ContentCompiler $cc, \Blogstep\Files\File $file, \SimpleHtmlDom\simple_html_dom $dom)
    {
        foreach ($this->html as $handler) {
            $handler($cc, $file, $dom);
        }
    }
    
    public function applyDisplayFilters(View $view, $content)
    {
        foreach ($this->display as $handler) {
            $content = $handler($view, $content);
        }
        return $content;
    }
}
