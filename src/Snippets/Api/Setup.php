<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Snippets\Api;

/**
 * File system setup.
 */
class Setup extends \Blogstep\AuthenticatedSnippet
{
    
    private function createOwnedDir(\Blogstep\Files\File $dir, \Blogstep\User $user, \Blogstep\Group $group, $mode, $recursive = true)
    {
        try {
            if (!$dir->exists()) {
                $dir->makeDirectory();
            }
            $dir->set('owner', $user->getId(), $recursive);
            $dir->set('group', $group->getId(), $recursive);
            $dir->setModeString($mode, $recursive);
        } catch (\Blogstep\UnauthorizedException $e) {
        }
    }
    
    public function post(array $data)
    {
        $fs = $this->m->files;
        
        $userGroup = $this->m->users->findGroup('users');
        if (!isset($userGroup)) {
            $userGroup = $this->m->users->createGroup('users');
        }
        $systemUser = $this->m->users->getUser(0);
        $systemGroup = $this->m->users->getGroup(0);
        $user = $this->m->auth->user;
        $this->createOwnedDir($fs, $user, $userGroup, 'rwr-r-', false);
        $this->createOwnedDir($fs->get('build'), $user, $userGroup, 'rwrwr-');
        $this->createOwnedDir($fs->get('content'), $user, $userGroup, 'rwrwr-');
        $this->createOwnedDir($fs->get('site'), $user, $userGroup, 'rwrwr-');
        $this->createOwnedDir($fs->get('home'), $user, $userGroup, 'rwr-r-', false);
        $this->createOwnedDir($fs->get('system'), $systemUser, $systemGroup, 'rwrw--');
        foreach ($this->m->users->getUsers() as $user) {
            $group = $this->m->users->getGroup($user->getPrimaryGroupId());
            if (!isset($group)) {
                $group = $userGroup;
            }
            $this->createOwnedDir($user->getHome(), $user, $group, 'rw----');
        }
        
        return $this->ok();
    }
    
    public function get()
    {
        return $this->methodNotAllowed();
    }
}
