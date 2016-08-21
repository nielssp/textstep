<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Snippets;

/**
 * Description of Login
 */
class Login extends \Blogstep\Snippet
{
    public function get()
    {
        $this->response->getBody()->write('test');
        return $this->response;
    }
}
