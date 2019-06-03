<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Api;

/**
 * File system setup.
 */
class Setup extends \Blogstep\AuthenticatedSnippet
{
    
    private function createOwnedDir(\Blogstep\Files\File $dir, \Blogstep\Group $group, $read, $write, $grant)
    {
        try {
            if (!$dir->exists()) {
                $dir->makeDirectory();
            }
            $dir->revokeAll();
            if ($read) {
                $dir->grant('read', $group->getName());
            }
            if ($write) {
                $dir->grant('write', $group->getName());
            }
            if ($grant) {
                $dir->grant('grant', $group->getName());
            }
        } catch (\Blogstep\Files\FileException $e) {
        }
    }
    
    public function post(array $data)
    {
        $fs = $this->m->files;
        
        $userGroup = $this->m->users->getGroup('users');
        if (!isset($userGroup)) {
            $userGroup = $this->m->users->createGroup('users');
        }
        $systemUser = $this->m->users->getUser('system');
        $systemGroup = $this->m->users->getGroup('system');
        $user = $this->m->auth->user;
        $this->createOwnedDir($fs, $userGroup, true, false, false);
        $this->createOwnedDir($fs->get('build'), $userGroup, true, true, true);
        $this->createOwnedDir($fs->get('content'), $userGroup, true, true, true);
        $this->createOwnedDir($fs->get('site'), $userGroup, true, true, true);
        $this->createOwnedDir($fs->get('home'), $userGroup, true, false, false);
        $this->createOwnedDir($fs->get('system'), $userGroup, true, true, false);
        foreach ($this->m->users->getUsers() as $user) {
            $group = $this->m->users->getGroup($user->getName());
            if (!isset($group)) {
                $group = $this->m->users->createGroup($user->getName());
            }
            $this->createOwnedDir($user->getHome(), $group, true, true, true);
        }
        
        return $this->ok();
    }
    
    public function get()
    {
        return $this->methodNotAllowed();
    }
}
