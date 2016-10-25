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
    public function __construct($page, $pages, $offset, $total)
    {
        parent::__construct([
            'page' => $page,
            'pages' => $pages,
            'offset' => $offset,
            'totalItems' => $total
        ], [['*', 'count', 'itemsOnPage']]);
    }
}
