<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Snippets\Api;

/**
 * Load program.
 */
class Load extends \Blogstep\AuthenticatedSnippet
{
    
    public function get()
    {
        if (!isset($this->request->query['name'])) {
            return $this->error('program name missing', \Jivoo\Http\Message\Status::BAD_REQUEST);
        }
        switch ($this->request->query['name']) {
            case 'files':
                return $this->render('app/files.html');
            case 'editor':
                return $this->render('app/editor.html');
            case 'test':
                return $this->render('app/test.html');
            default:
                return $this->error('program not found', \Jivoo\Http\Message\Status::NOT_FOUND);
        }
    }
}
