<?php

// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep;

/**
 * BlogSTEP module collection.
 * @property \Jivoo\Log\Logger $logger
 * @property Main $main
 * @property \Jivoo\Http\SapiServer $server
 * @property \Jivoo\Paths $paths
 * @property \Jivoo\Http\Router $router
 * @property \Jivoo\Http\Token $token
 * @property Files\FileSystem $files
 * @property Files\MountHandler $mounts
 * @property UserModel $users
 * @property SystemAcl $acl
 * @property System\SystemDevice $system
 */
class Modules extends \Jivoo\Modules
{
    protected $types = [
        'logger' => 'Jivoo\Log\Logger',
        'main' => 'Blogstep\Main',
        'server' => 'Jivoo\Http\SapiServer',
        'paths' => 'Jivoo\Paths',
        'router' => 'Jivoo\Http\Router',
        'token' => 'Jivoo\Http\Token',
        'files' => 'Blogstep\Files\FileSystem',
        'mounts' => 'Blogstep\Files\MountHandler',
        'users' => 'Blogstep\UserModel',
        'acl' => 'Blogstep\SystemAcl',
        'system' => 'Blogstep\System\SystemDevice',
    ];
}
