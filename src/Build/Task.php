<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Build;

/**
 * A build task.
 */
class Task
{
    private $function;
    
    private function __construct()
    {
    }
    
    private function read($path)
    {
        $this->function = require $path;
        \Jivoo\Assume::that(is_callable($this->function));
    }
    
    public function __invoke(SiteNode $siteNode, Compiler $compiler, callable $visitChildren)
    {
        call_user_func($this->function, $siteNode, $compiler, $visitChildren);
    }

    public static function load($path)
    {
        $name = basename($path, '.php');
        $task = new self();
        $task->read($path);
        return $task;
    }
}
