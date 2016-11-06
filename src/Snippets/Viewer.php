<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Snippets;

/**
 * Image viewer.
 */
class Viewer extends \Blogstep\AuthenticatedSnippet
{
    public function get()
    {
        $path = implode('/', $this->routeParameters);
        $dir = $this->m->files->get($path);
        $selection = null;
        if ($dir->getType() !== 'directory') {
            $selection = $dir;
            $dir = $selection->getParent();
        }
        $filtered = [];
        foreach ($dir as $file) {
            if (preg_match('/\.(?:jpe?g|png|gif|ico)$/i', $file->getName()) === 1) {
                if (!isset($selection)) {
                    $selection = $file;
                }
                $filtered[] = $file;
            }
        }
        if (count($filtered) == 0) {
            return $this->redirect(['snippet' => 'Files', 'parameters' => $this->routeParameters]);
        }
        $this->viewData['images'] = $filtered;
        $this->viewData['selection'] = $selection;
        return $this->render();
    }
}
