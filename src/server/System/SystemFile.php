<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\System;

abstract class SystemFile implements \Blogstep\Files\Storage {

    protected $user = null;

    public function close()
    {
        $this->unlock();
    }

    public function setUser(\Blogstep\User $user)
    {
        $this->user = $user;
    }

    public abstract function lock();

    public abstract function unlock();

    public abstract function getModified();

    public abstract function getCreated();
}
