<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Task;

/**
 * 
 */
class Serializer
{
    private $objects = [];
    private $named = [];
    private $names = [];
    private $waiting = [];
    
    private $initializing = false;
    
    private $serializers = [];
    private $initializers = [];
    private $unserializers = [];
    
    public function addSerializer($class, callable $serializer)
    {
        $this->serializers[$class] = $serializer;
    }
    
    public function addInitializer($class, callable $initializer, $defaultUnserializer = false)
    {
        $this->initializers[$class] = $initializer;
        if (!$defaultUnserializer && !isset($this->unserializers[$class])) {
            $this->unserializers[$class] = function () {};
        }
    }
    
    public function addUnserializer($class, callable $unserializer)
    {
        $this->unserializers[$class] = $unserializer;
    }
    
    public function serialize($value)
    {
        switch (gettype($value)) {
            case 'boolean':
            case 'integer':
            case 'double':
            case 'string':
                return ['s', $value];
            case 'NULL':
                return ['n'];
            case 'array':
                return ['a', array_map([$this, 'serialize'], $value)];
            case 'object':
                return ['r', $this->add($value)];
            default:
                throw new \Jivoo\InvalidArgumentException('Unserializable value: ' . gettype($value));
        }
    }
    
    public function serializeObject($object)
    {
        $class = get_class($object);
        if (isset($this->serializers[$class])) {
            return ['o', $class, call_user_func($this->serializers[$class], $object, $this)];
        }
        if ($object instanceof Serializable) {
            return ['o', $class, $object->serialize($this)];
        }
        return ['o', $class, $this->serializeProperties($object)];
    }
    
    public function serializeProperties($object, $skipProperties = [])
    {
        $properties = [];
        foreach ($this->getProperties($object) as $property) {
            $name = $property->getName();
            if (!in_array($name, $skipProperties)) {
                if ($property->isPublic()) {
                    $properties[$name] = $this->serialize($property->getvalue($object));
                } else {
                    $property->setAccessible(true);
                    $properties[$name] = $this->serialize($property->getvalue($object));
                    $property->setAccessible(false);
                }
            }
        }
        return $properties;
    }
    
    public function unserialize(array $serialized)
    {
        switch ($serialized[0]) {
            case 's':
                return $serialized[1];
            case 'n':
                return null;
            case 'a':
                return array_map([$this, 'unserialize'], $serialized[1]);
            case 'r':
                return $this->get($serialized[1]);
            case 'o':
                return $this->unserializeObject($serialized);
        }
    }
    
    public function initializeObjecT(array $serialized)
    {
        if (isset($this->initializers[$serialized[1]])) {
            return call_user_func($this->initializers[$serialized[1]], $serialized[2], $this);
        }
        $class = new \ReflectionClass($serialized[1]);
        return $class->newInstanceWithoutConstructor();
    }
    
    public function unserializeObject(array $serialized, $object = null)
    {
        if (! isset($object)) {
            $object = $this->initializeObjecT($serialized);
        }
        $class = get_class($object);
        if (isset($this->unserializers[$class])) {
            call_user_func($this->unserializers[$class], $object, $serialized[2], $this);
        } else if ($object instanceof Serializable) {
            $object->unserialize($serialized[2], $this);
        } else {
            $this->unserializePropreties($object, $serialized[2]);
        }
        return $object;
    }
    
    public function unserializePropreties($object, array $properties)
    {
        foreach ($this->getProperties($object) as $property) {
            if (array_key_exists($property->getName(), $properties)) {
                if ($property->isPublic()) {
                    $property->setValue($object, $this->unserialize($properties[$property->getName()]));
                } else {
                    $property->setAccessible(true);
                    $property->setValue($object, $this->unserialize($properties[$property->getName()]));
                    $property->setAccessible(false);
                }
            }
        }
    }
    
    private function getProperties($object)
    {
        $reflect = new \ReflectionObject($object);
        $properties = [];
        while ($reflect) {
            foreach ($reflect->getProperties() as $property) {
                $properties[$property->getName()] = $property;
            }
            $reflect = $reflect->getParentClass();
        }
        return $properties;
    }
    
    public function set($name, $object)
    {
        $this->named[$name] = $object;
        $this->names[spl_object_hasH($object)] = $name;
    }
    
    public function add($object)
    {
        $id = spl_object_hash($object);
        if (isset($this->names[$id])) {
            return $this->names[$id];
        }
        if (!isset($this->objects[$id])) {
            $this->objects[$id] = $object;
            $this->waiting[] = $id;
        }
        return $id;
    }
    
    public function get($id)
    {
        if (isset($this->named[$id])) {
            return $this->named[$id];
        }
        if ($this->initializing) {
            throw new \Jivoo\InvalidArgumentException('Cannot get object while initializing: ' . $id);
        }
        if (!isset($this->objects[$id])) {
            throw new \Jivoo\InvalidArgumentException('Undefined reference: ' . $id);
        }
        return $this->objects[$id];
    }
    
    public function clear()
    {
        $this->objects = [];
    }
    
    public function serializeAll()
    {
        $serialized = ['objects' => []];
        $this->waiting = array_keys($this->objects);
        while (count($this->waiting)) {
            $id = array_shift($this->waiting);
            $object = $this->objects[$id];
            $serialized['objects'][$id] = $this->serializeObject($object);
        }
        return $serialized;
    }
    
    public function unserializeAll(array $serialized)
    {
        $this->initializing = true;
        foreach ($serialized['objects'] as $id => $object) {
            $this->objects[$id] = $this->initializeObjecT($object);
        }
        $this->initializing = false;
        foreach ($serialized['objects'] as $id => $object) {
            $this->unserializeObject($object, $this->objects[$id]);
        }
    }
    
}
