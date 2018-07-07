<?php
/* 
 * BlogSTEP 
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

use Blogstep\Compile\ContentCompiler;
use Blogstep\Compile\Filter;
use Blogstep\Files\File;
use SimpleHtmlDom\simple_html_dom;
use Jivoo\Store\Document;

$filter = new Filter();

$filter->html = function (ContentCompiler $cc, File $file, Document $metadata, simple_html_dom $dom) {
    $toc = $dom->find('.toc', 0);
    if (isset($toc)) {
        $fragments = [];
        if ($toc->hasAttribute('data-headings')) {
            $headings = $dom->find($toc->getAttribute('data-headings'));
        } else {
            $headings = $dom->find('h2, h3, h4, h5, h6');
        }
        $f = function ($f, &$headings, &$fragments, $prefix) {
            if (!count($headings)) {
                return;
            }
            $output = '<ol>';
            $i = 1;
            do {
                $heading = array_shift($headings);
                $level = intval($heading->tag[1]);
                $number = $prefix . $i;
                $i++;
                $title = $heading->innertext;
                $baseFragment = preg_replace('/[^-a-z0-9.]/i', '_', $title);
                $fragment = $baseFragment;
                $j = 2;
                while (isset($fragments[$fragment])) {
                    $fragment = $baseFragment . '-' . $j;
                    $j++;
                }
                $fragments[$fragment] = true;
                $heading->id = $fragment;
                $heading->innertext = $number . ' ' . $heading->innertext;
                $output .= '<li>';
                $output .= '<a href="#' . $fragment . '">';
//                $output .= '<span class="toc-number">' . $number . '</span>';
//                $output .= '<span class="toc-heading">' . $title . '</span>';
                $output .= $title;
                $output .= '</a>';
                if (count($headings)) {
                    $nextLevel = intval($headings[0]->tag[1]);
                    if ($nextLevel > $level) {
                        $output .= $f($f, $headings, $fragments, $number . '.');
                        if (count($headings)) {
                            $nextLevel = intval($headings[0]->tag[1]);
                        }
                    }
                    if ($nextLevel < $level) {
                        $output .= '</li>';
                        break;
                    }
                }
                $output .= '</li>';
            } while (count($headings));
            return $output . '</ol>';
        };
        $output = $f($f, $headings, $fragments, '');
        $toc->innertext = '<h2>Contents</h2>' . $output;
    }
};

return $filter;
