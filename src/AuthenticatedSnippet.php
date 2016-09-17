<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep;

/**
 * Description of AuthenticatedSnippet
 */
class AuthenticatedSnippet extends Snippet
{
    
    public function before()
    {
        if (! $this->m->auth->isLoggedIn()) {
            return $this->redirect('snippet:Login');
        }
    }
}
