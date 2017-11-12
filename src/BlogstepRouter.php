<?php
// BlogSTEP
// Copyright (c) 2017 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep;

/**
 * Blogstep router.
 */
class BlogstepRouter extends \Jivoo\Http\Router
{
    protected function buildQuery(array $query)
    {
        return str_replace('%2F', '/', parent::buildQuery($query));
    }
}
