<?php
// BlogSTEP 
// Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Api;

/**
 * Write configuration.
 */
class SetConf extends \Blogstep\AuthenticatedSnippet
{
    
    public function post(array $data)
    {
        $result = [];
        if (isset($data['data']) and is_array($data['data'])) {
            $user = $this->m->files->getAuthentication();
            foreach ($data['data'] as $key => $value) {
                if ($this->m->acl->check('config.' . $key . '.update', $user)) {
                    $this->m->main->config->set($key, $value);
                    $result[] = $key;
                }
            }
            $this->m->main->config->commit();
        }
        return $this->json($result);
    }
    
    public function get()
    {
        return $this->methodNotAllowed();
    }
}
