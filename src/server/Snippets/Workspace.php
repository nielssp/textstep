<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Snippets;

/**
 * Workspace test.
 */
class Workspace extends \Blogstep\Snippet
{
    
    public function get()
    {
        $this->viewData['run'] = \Blogstep\Html::h(implode('/', $this->routeParameters));
        $this->viewData['args'] = \Blogstep\Html::h(\Jivoo\Json::encode($this->request->query));
        return $this->render();
    }
}
