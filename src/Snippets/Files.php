<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Snippets;

/**
 * File manager test.
 */
class Files extends \Blogstep\Snippet
{
    
    public function get()
    {
        $path = implode('/', $this->routeParameters);
        $this->viewData['fs'] = $this->m->files->get($path);
        return $this->render();
    }
}
