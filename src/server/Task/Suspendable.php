<?php

// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Task;

/**
 */
interface Suspendable
{
    
    public function resume(array $state, ObjectContainer $objects);
    
    public function suspend(ObjectContainer $objects);
}
