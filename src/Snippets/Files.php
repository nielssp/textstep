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
        $this->viewData['title'] = $this->viewData['fs']->getPath() . ' – Files';
        $this->viewData['token'] = $this->m->token->__toString();
        return $this->render();
    }
}
