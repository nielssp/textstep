<?php
// BlogSTEP
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Build;

/**
 * A page of content nodes.
 */
class ContentPage extends ContentGroup
{
    private $base = '';
    
    public function __construct($properties, $page, $pages, $offset, $total)
    {
        parent::__construct(array_merge($properties, [
            'page' => $page,
            'pages' => $pages,
            'offset' => $offset,
            'totalItems' => $total
        ]), [['*', 'count', 'itemsOnPage']]);
    }
    
    public function path($base = null)
    {
        return $this->link($this->page, $base);
    }
    
    public function isFirst()
    {
        return $this->page == 1;
    }
    
    public function isLast()
    {
        return $this->page == $this->pages;
    }
    
    /**
     * Create a list of pages, useful for page selectors.
     *
     * @param int $middle Number of pages around the current page.
     * @param int $start Number of pages at the start.
     * @param int $end Number of pages at the end.
     * @return int[] List of pages.
     */
    public function pageList($middle = 5, $start = 1, $end = 1)
    {
        $pages = array();
        for ($i = 1; $i <= $start and $i <= $this->pages; $i++) {
            $pages[] = $i;
        }
        $i = max($i, $this->page - $middle + min(ceil($middle / 2), $this->pages - $this->page));
        for ($j = 1; $j <= $middle and $i <= $this->pages; $j++, $i++) {
            $pages[] = $i;
        }
        $i = max($i, $this->pages - $end + 1);
        for (; $i <= $this->pages; $i++) {
            $pages[] = $i;
        }
        return $pages;
    }
    
    public function expPageList($n = 4, $base = 2)
    {
        $before = [];
        $after = [];
        for ($i = 0; $i < $n; $i++) {
            $pageBefore = $this->page - pow($base, $i);
            $pageAfter = $this->page + pow($base, $i);
            if ($pageBefore > 1) {
                array_unshift($before, $pageBefore);
            }
            if ($pageAfter < $this->pages) {
                $after[] = $pageAfter;
            }
        }
        if ($this->pages > 0) {
            array_unshift($before, 1);
        }
        if ($this->pages > 2) {
            $after[] = $this->pages;
        }
        if ($this->page > 1 and $this->page < $this->pages) {
            $before[] = $this->page;
        }
        return array_merge($before, $after);
    }

    public function link($page, $base = null)
    {
        if (isset($base)) {
            $this->base = $base;
        }
        if ($page === 1) {
            return $this->base . '/index.html';
        }
        return rtrim($this->base, '/') . '/page' . $page . '/index.html';
    }
}
