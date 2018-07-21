<?php

// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Task;

/**
 * A task. Can be suspended and resumed later. The
 * actual computation happens in {@see run()}.
 */
interface Task extends Serializable
{
    
    public function getName();

    /**
     * Whether or not the task is done.
     * @return bool True if done.
     */
    public function isDone();

    /**
     * Get a status message.
     * @return string|null Status message if available.
     */
    public function getStatus();

    /**
     * Get progress percentage.
     * @return int|null Percentage if available.
     */
    public function getProgress();

    /**
     * Run task for a bit.
     */
    public function run(callable $checkTime);
}
