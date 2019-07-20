<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Task;

/**
 * A simple task consisting of a single function call.
 */
class UnitTask implements Task
{
    private $name;
    
    private $callable;
    
    private $message;
    
    private $done;
    
    public function __construct($name, callable $callable, $message = null)
    {
        $this->name = $name;
        $this->callable = $callable;
        $this->message = $message;
    }
    
    public function getName()
    {
        return $this->name;
    }

    public function getProgress()
    {
        return $this->done ? 100 : 0;
    }

    public function getStatus()
    {
        return $this->message;
    }

    public function isDone()
    {
        return $this->done;
    }

    public function run(callable $checkTime)
    {
        if ($this->done) {
            $this->message = null;
            return;
        }
        call_user_func($this->callable);
        $this->done = true;
    }

    public function serialize(Serializer $serializer)
    {
        return ['done' => $this->done];
    }

    public function unserialize(array $serialized, Serializer $serializer)
    {
        $this->done = $serialized['done'];
    }
}
