<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Snippets;

/**
 * File manager test.
 */
class Files extends \Blogstep\AuthenticatedSnippet
{
    
    public function get()
    {
        $path = implode('/', $this->routeParameters);
        $fs = $this->m->files->get($path);
        if (!$fs->isReadable()) {
            while (true) {
                if ($fs->isReadable()) {
                    break;
                }
                if (! count($fs->getPath())) {
                    throw new \Blogstep\UnauthorizedException('Root directory is not readable');
                }
                $fs = $fs->getParent();
            }
            return $this->redirect($fs->getFilesRoute());
        }
        $this->viewData['fs'] = $fs;
        $this->viewData['title'] = $this->viewData['fs']->getPath() . ' – Files';
        return $this->render();
    }
}
