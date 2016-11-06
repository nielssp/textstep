<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Snippets;

/**
 * File opener
 */
class Open extends \Blogstep\AuthenticatedSnippet
{
    public function get()
    {
        $path = implode('/', $this->routeParameters);
        $fs = $this->m->files->get($path);
        if ($fs->getType() == 'directory') {
            return $this->redirect(['snippet' => 'Files', 'parameters' => $this->routeParameters]);
        }
        if (preg_match('/\.md$/i', $fs->getName()) === 1) {
            return $this->redirect(['snippet' => 'Editor', 'parameters' => $this->routeParameters]);
        }
        if (preg_match('/\.(?:jpe?g|png|gif|ico)$/i', $fs->getName()) === 1) {
            return $this->redirect(['snippet' => 'Viewer', 'parameters' => $this->routeParameters]);
        }
        // TODO: file associations
        return $this->redirect(['snippet' => 'CodeEditor', 'parameters' => $this->routeParameters]);
    }
}
