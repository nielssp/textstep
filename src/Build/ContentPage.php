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
    
    private function expRange($start, $end, $n)
    {
        if ($n == 1) {
            return [$start];
        }
        $nums = [];
        if ($end < $start) {
            $base = pow($start - $end + 1, 1 / ($n - 1));
            for ($i = 0; $i < $n; $i++) {
                $nums[] = max(floor($start + 1 - pow($base, $i)), $end);
            }
        } else {
            $base = pow($end - $start + 1, 1 / ($n - 1));
            for ($i = 0; $i < $n; $i++) {
                $nums[] = min(ceil($start - 1 + pow($base, $i)), $end);
            }
        }
        return $nums;
    }
    
    public function listPages($n = 11)
    {
        if ($this->pages <= $n) {
            return range(1, $this->pages);
        }
        if ($this->page == 1) {
            return $this->expRange(1, $this->pages, $n);
        } else if ($this->page == $this->pages) {
            return array_reverse($this->expRange($this->pages, 1, $n));
        }
        $middle = min(ceil($n / 2) - 1, $this->page - 1);
        $right = $n - $middle - 1;
        if ($right > $this->pages - $this->page) {
            $right = $this->pages - $this->page;
            $middle = $n - $right - 1;
        }
        return array_merge(
            $middle > 0 ? array_reverse($this->expRange($this->page - 1, 1, $middle)) : [],
            [$this->page],
            $right > 0 ? $this->expRange($this->page + 1, $this->pages, $right) : []
        );
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
