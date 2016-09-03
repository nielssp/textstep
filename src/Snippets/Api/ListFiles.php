<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Snippets\Api;

/**
 * File listing.
 */
class ListFiles extends \Blogstep\Snippet
{
    
    public function get()
    {
        $path = '';
        if (isset($this->request->query['path'])) {
            $path = $this->request->query['path'];
        }
        $fs = $this->m->files->get($path);
        $object = [
            'name' => $fs->getName(),
            'path' => $fs->getPath(),
            'type' => $fs->getType(),
            'files' => []
        ];
        foreach ($fs as $file) {
            $object['files'][] = [
                'name' => $file->getName(),
                'path' => $file->getPath(),
                'type' => $file->getType()
            ];
        }
        $response = $this->response;
        $response = $response->withHeader('Content-Type', 'application/json');
        $response->getBody()->write(\Jivoo\Json::encode($object));
        return $response;
    }
}
