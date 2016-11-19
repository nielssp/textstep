<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Snippets;

/**
 * Build tool.
 */
class Builder extends \Blogstep\AuthenticatedSnippet
{
    public function get()
    {
        if ($this->m->files->get('build/.build.json')->exists()) {
            $this->viewData['inProgress'] = true;
        }
        return $this->render();
    }
}
