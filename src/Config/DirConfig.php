<?php
// BlogSTEP
// Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.

namespace Blogstep\Config;

/**
 * Configuration directory.
 */
class DirConfig extends Config
{
    /**
     * @var File
     */
    private $dir;
    
    public function __construct(\Blogstep\Files\File $dir)
    {
        parent::__construct();
        $this->dir = $dir;
    }
    
    protected function getRelative($key)
    {
        $subdir = $this->dir->get($key);
        if ($subdir->isDirectory()) {
            $subconf = new DirConfig($subdir);
        } else {
            $confFile = $this->dir->get($key . '.php');
            if (!$confFile->isFile()) {
                $confFile = $this->dir->get($key . '.json');
                if (!$confFile->isFile()) {
                    $confFile = null;
                }
            }
            if (isset($confFile)) {
                $subconf = new FileConfig($confFile);
            } else {
                $subconf = new NullConfig();
            }
        }
        $subconf->root = $this->root;
        $subconf->namespace = $this->namespace . $key . '.';
        return $subconf;
    }

    protected function getValue($key)
    {
        return null;
    }

    protected function setValue($key, $value)
    {
        throw new \DomainException('Configuration is a directory');
    }

    public function getData()
    {
        return [];
    }
}
