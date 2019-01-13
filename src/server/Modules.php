<?php

// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep;

/**
 * BlogSTEP module collection.
 * @property \Jivoo\Http\Route\AssetScheme $assets
 * @property View $view
 * @property \Jivoo\Log\Logger $logger
 * @property Route\SnippetScheme $snippets
 * @property Main $main
 * @property \Jivoo\Http\SapiServer $server
 * @property \Jivoo\Paths $paths
 * @property \Jivoo\Cache\Cache $cache
 * @property \Jivoo\Http\Router $router
 * @property \Jivoo\Store\Session $session
 * @property \Jivoo\Http\Token $token
 * @property Files\FileSystem $files
 * @property Files\MountHandler $mounts
 * @property \Jivoo\Http\Cookie\CookiePool $cookies
 * @property \Jivoo\Security\Auth $auth
 * @property UserModel $users
 * @property SystemAcl $acl
 */
class Modules extends \Jivoo\Modules
{
    protected $types = [
        'assets' => 'Jivoo\Http\Route\AssetScheme',
        'view' => 'Blogstep\View',
        'logger' => 'Jivoo\Log\Logger',
        'snippets' => 'Blogstep\Route\SnippetScheme',
        'main' => 'Blogstep\Main',
        'server' => 'Jivoo\Http\SapiServer',
        'paths' => 'Jivoo\Paths',
        'cache' => 'Jivoo\Cache\Cache',
        'router' => 'Jivoo\Http\Router',
        'session' => 'Jivoo\Store\Session',
        'token' => 'Jivoo\Http\Token',
        'files' => 'Blogstep\Files\FileSystem',
        'mounts' => 'Blogstep\Files\MountHandler',
        'cookies' => 'Jivoo\Http\Cookie\CookiePool',
        'auth' => 'Jivoo\Security\Auth',
        'users' => 'Blogstep\UserModel',
        'acl' => 'Blogstep\SystemAcl',
    ];
}
