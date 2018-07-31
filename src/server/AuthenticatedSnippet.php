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
            if ($this->request->isAjax()) {
                return $this->error('Not logged in', \Jivoo\Http\Message\Status::UNAUTHORIZED);
            }
            echo $_SERVER['HTTP_X_REQUESTED_WITH'];exit;
            $this->m->session['loginReturnPath'] = $this->request->path;
            $this->m->session['loginReturnQuery'] = $this->request->query;
            return $this->redirect('snippet:Workspace');
        }
        $this->m->files->setAuthentication($this->m->auth->user);
        $this->viewData['user'] = $this->m->auth->user;
    }
}
