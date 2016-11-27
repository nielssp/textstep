<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Snippets;

/**
 * Video player.
 */
class Player extends \Blogstep\AuthenticatedSnippet
{
    public function get()
    {
        $path = implode('/', $this->routeParameters);
        $this->viewData['video'] = $this->m->files->get($path);
        return $this->render();
    }
}
