<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Snippets\Api;

/**
 * File listing.
 */
class ListFiles extends \Blogstep\AuthenticatedSnippet
{
    
    public function get()
    {
        $path = '';
        if (isset($this->request->query['path'])) {
            $path = $this->request->query['path'];
        }
        $fs = $this->m->files->get($path);
        sleep(1);
        if ($fs->isReadable()) {
            return $this->json($fs->getDetailed());
        }
        return $this->json($fs->getBrief());
    }
}
