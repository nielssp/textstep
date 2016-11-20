<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Task;

/**
 * Suspendable task runner.
 */
class Runner implements Task
{
    private $name;

    protected $tasks = [];
    
    protected $callbacks = [];
    
    private $currentTask = 0;
    
    private $message = null;
    
    public function __construct($name)
    {
        $this->name = $name;
    }
    
    public function add(Task $task, callable $callback = null)
    {
        $this->tasks[] = $task;
        if (isset($callback)) {
            $this->callbacks[count($this->tasks) - 1] = $callback;
        }
    }
    
    public function getName()
    {
        return $this->name;
    }
    
    public function getProgress()
    {
        $n = count($this->tasks);
        if ($n === 0 || $this->currentTask >= $n) {
            return 100;
        }
        $task = $this->tasks[$this->currentTask];
        $taskProgress = $task->getProgress();
        if (isset($taskProgress)) {
            $taskProgress /= $n;
        } else {
            $taskProgress = 0;
        }
        return floor($this->currentTask / $n * 100 + $taskProgress);
    }

    public function getStatus()
    {
        return $this->message;
    }

    public function isDone()
    {
        return !isset($this->tasks[$this->currentTask]);
    }

    public function run()
    {
        $this->message = null;
        if (!isset($this->tasks[$this->currentTask])) {
            return;
        }
        for ($i = 0; $i < $this->currentTask; $i++) {
            if (isset($this->callbacks[$i])) {
                call_user_func($this->callbacks[$i]);
            }
        }
        if ($this->tasks[$this->currentTask]->isDone()) {
            $this->currentTask++;
        } else {
            $this->tasks[$this->currentTask]->run();
            $this->message = $this->tasks[$this->currentTask]->getStatus();
        }
    }

    public function serialize(Serializer $serializer)
    {
        $state = [
            'currentTask' => $this->currentTask,
            'tasks' => []
        ];
        foreach ($this->tasks as $key => $task) {
            $state['tasks'][$key] = $task->serialize($serializer);
        }
        return $state;
    }

    public function unserialize(array $serialized, Serializer $serializer)
    {
        foreach ($serialized['tasks'] as $key => $taskState) {
            $this->tasks[$key]->unserialize($taskState, $serializer);
        }
        $this->currentTask = $serialized['currentTask'];
    }

}
