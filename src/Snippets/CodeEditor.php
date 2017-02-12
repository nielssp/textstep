<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Snippets;

/**
 * Code editor.
 */
class CodeEditor extends \Blogstep\AuthenticatedSnippet
{
    public function get()
    {
        $path = $this->query('path', '/');
        $this->viewData['fs'] = $this->m->files->get($path);
        $this->viewData['content'] = $this->viewData['fs']->getContents();
        return $this->render();
    }
}
