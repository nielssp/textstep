<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Snippets;

/**
 * Markdown editor.
 */
class Editor extends \Blogstep\AuthenticatedSnippet
{
    public function get()
    {
        $path = implode('/', $this->routeParameters);
        $this->viewData['fs'] = $this->m->files->get($path);
        $this->viewData['content'] = file_get_contents($this->viewData['fs']->getRealPath());
        return $this->render();
    }
}
