<?php
// BlogSTEP 
// Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Snippets\Api;

/**
 * Read configuration.
 */
class GetConf extends \Blogstep\AuthenticatedSnippet
{
    
    public function get()
    {
        $keys = [];
        if (isset($this->request->query['key'])) {
            $keys = [$this->request->query['key']];
        } else if (isset($this->request->query['keys'])) {
            $keys = $this->request->query['keys'];
        }
        $result = [];
        $user = $this->m->files->getAuthentication();
        foreach ($keys as $key) {
            if ($this->m->acl->check('config.get.' . $key, $user)) {
                $result[$key] = $this->m->main->config->get($key);
            } else {
                $result[$key] = null;
            }
        }
        return $this->json($result);
    }
}
