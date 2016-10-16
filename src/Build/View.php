<?php
// BlogSTEP
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Build;

/**
 * Description of View
 */
class View extends \Jivoo\View\View
{
    private $siteMap;
    
    public $currentNode = null;

    public function __construct(SiteMap $siteMap, $uriPrefix)
    {
        parent::__construct(
            new \Jivoo\Http\Route\AssetScheme($siteMap->getBuildPath()->getRealPath()),
            new \Jivoo\Http\Router()
        );
        $this->siteMap = $siteMap;
        $this->addTemplateDir($siteMap->getBuildPath()->getRealPath());
        $this->addFunction('getContent', function ($name) use ($siteMap) {
            return $siteMap->get($name);
        });
        $this->addFunction('isCurrent', function ($link) {
            return false;
        });
        $this->addFunction('link', function ($link) {
            if (!($link instanceof SiteNode)) {
                $link = $this->siteMap->get($link);
            }
            if (!isset($link)) {
                return '#not-found';
            }
            return $link->getRelativePath($this->currentNode);
        });
        $this->addFunction('url', function ($link) use ($uriPrefix) {
            if (!($link instanceof SiteNode)) {
                $link = $this->siteMap->get($link);
            }
            if (!isset($link)) {
                return '#not-found';
            }
            return $uriPrefix . $link->getPath();
        });
    }
}
