<?php
// BlogSTEP
// Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile;

/**
 * Installs a single site node.
 */
class SiteInstaller
{

    /**
     * @var \Blogstep\Files\File
     */
    private $targetDir;

    /**
     * @var SiteMap
     */
    private $siteMap;

    public function __construct(\Blogstep\Files\File $targetDir, SiteMap $siteMap)
    {
        $this->targetDir = $targetDir;
        $this->siteMap = $siteMap;
    }

    public function install($path)
    {
        $node = $this->siteMap->get($path);
        if (!isset($node)) {
            trigger_error('Site node not found: ' . $path, E_USER_WARNING);
            return;
        }
        $target = $this->targetDir->get($path);
        switch ($node['handler']) {
            case 'copy':
                $target->getParent()->makeDirectory(true);
                $target->get($node['data'][0])->copy($target);
                break;
            default:
                throw new \Blogstep\RuntimeException('Undefined site node handler: ' . $node['handler']);
        }
    }
}
