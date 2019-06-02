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

    public function __construct(\Jivoo\Log\Logger $logger)
    {
        parent::__construct(null);
        $this->on('dispatch', function ($event) use ($logger) {
            $logger->info('Dispatch {method} {uri}', ['method' => $event->request->method, 'uri' => $event->request->getUri()]);
        });
    }

    protected function buildQuery(array $query)
    {
        return str_replace('%2F', '/', parent::buildQuery($query));
    }
}
