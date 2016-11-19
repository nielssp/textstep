<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Task;

/**
 * Keeps track of suspendable objects.
 */
class ObjectContainer implements Suspendable
{
    private $objects = [];
    private $nextId = 0;
    private $waiting = [];
    
    public function add(Suspendable $object)
    {
        $objectId = array_search($object, $this->objects, true);
        if ($objectId !== false) {
            return $objectId;
        }
        $this->objects[$this->nextId] = $object;
        $this->waiting[] = $this->nextId;
        return $this->nextId++;
    }
    
    public function get($objectId)
    {
        return $this->objects[$objectId];
    }
    
    public function addArray(array $objects)
    {
        return array_map(function (Suspendable $object) {
            return $this->add($object);
        }, $objects);
    }
    
    public function getArray(array $objectIds)
    {
        return array_map(function ($objectId) {
            return $this->get($objectId);
        }, $objectIds);
    }
    
    public function resume(array $state, ObjectContainer $objects = null)
    {
        $this->nextId = $state['nextId'];
        $this->waiting = $state['objects'];
        foreach ($state['objects'] as $id => $substate) {
            $class = new \ReflectionClass($substate[0]);
            $this->objects[$id] = $class->newInstanceWithoutConstructor();
            unset($this->waiting[$id]);
        }
        foreach ($state['objects'] as $id => $substate) {
            $this->objects[$id]->resume($substate[1], $this);
        }
    }
    
    public function suspend(ObjectContainer $objects = null)
    {
        $state = ['nextId' => $this->nextId, 'objects' => []];
        $this->waiting = array_keys($this->objects);
        while (count($this->waiting)) {
            $id = array_shift($this->waiting);
            $object = $this->objects[$id];
            $state['objects'][] = [get_class($object), $object->suspend($this)];
        }
        return $state;
    }
}
