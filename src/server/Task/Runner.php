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
    
    protected $weights = [];
    
    protected $ratios = null;
    
    private $currentTask = 0;
    
    private $message = null;
    
    public function __construct($name)
    {
        $this->name = $name;
    }
    
    public function add(Task $task, $weight = 1.0)
    {
        $this->tasks[] = $task;
        $this->weights[] = $weight;
    }
    
    public function getName()
    {
        return $this->name;
    }
    
    public function getProgress()
    {
        if (!isset($this->ratios)) {
            $sum = array_sum($this->weights);
            $this->ratios = [];
            foreach ($this->weights as $weight) {
                $this->ratios[] = $weight / $sum;
            }
        }
        $n = count($this->tasks);
        if ($n === 0 || $this->currentTask >= $n) {
            return 100;
        }
        $task = $this->tasks[$this->currentTask];
        $taskProgress = $task->getProgress();
        if (isset($taskProgress)) {
            $taskProgress *= $this->ratios[$this->currentTask];
        } else {
            $taskProgress = 0;
        }
        $progress = 0;
        for ($i = 0; $i < $this->currentTask; $i++) {
            $progress += $this->ratios[$i];
        }
        return floor($progress * 100 + $taskProgress);
    }

    public function getStatus()
    {
        return $this->message;
    }

    public function isDone()
    {
        return !isset($this->tasks[$this->currentTask]);
    }

    public function run(callable $checkTime)
    {
        $this->message = null;
        if (!isset($this->tasks[$this->currentTask])) {
            return;
        }
        if ($this->tasks[$this->currentTask]->isDone()) {
            $this->currentTask++;
        } else {
            $this->tasks[$this->currentTask]->run($checkTime);
            $this->message = $this->tasks[$this->currentTask]->getStatus();
            if ($this->tasks[$this->currentTask]->isDone()) {
                $this->currentTask++;
            }
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
