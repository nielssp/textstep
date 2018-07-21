<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Snippets\Api;

/**
 * Change file mode.
 */
class ChangeMode extends \Blogstep\AuthenticatedSnippet
{
    
    public function post(array $data)
    {
        $path = '';
        if (isset($data['path'])) {
            $path = $data['path'];
        }
        if (isset($data['mode'])) {
            $fs = $this->m->files->get($path);
            $recursive = isset($data['recursive']) && $data['recursive'] == 'true';
            if (is_numeric($data['mode'])) {
                if (!$fs->set('mode', intval($data['mode']), $recursive)) {
                    return $this->error('Could not set mode');
                }
            } else {
                if (!$fs->setModeString($data['mode'], $recursive)) {
                    return $this->error('Could not set mode');
                }
            }
        }
        return $this->response;
    }
    
    public function get()
    {
        return $this->methodNotAllowed();
    }
}
