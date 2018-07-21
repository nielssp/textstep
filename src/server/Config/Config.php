<?php
// BlogSTEP 
// Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.

namespace Blogstep\Config;

/**
 * Configuration object.
 */
abstract class Config implements \ArrayAccess
{

    /**
     * @var Config
     */
    protected $root;
    
    /**
     * @var string
     */
    protected $namespace = '';
    
    /**
     * @var Config[]
     */
    protected $cache = [];
    
    public function __construct()
    {
        $this->root = $this;
    }

    /**
     * Retrieve value of a configuration key. Returns the default value if
     * the key is not found or if the type of the found value does not match the
     * type of the default value.
     * @param string $key Document key.
     * @param mixed $default Optional default value.
     * @return mixed Content of document key.
     */
    public function get($key, $default = null)
    {
        $dot = strrpos($key, '.');
        if ($dot !== false) {
            $value = $this->getSubconfig(substr($key, 0, $dot))
                ->getValue(substr($key, $dot + 1));
        } else {
            $value = $this->getValue($key);
        }
        if (isset($default)) {
            if (!isset($value)) {
                return $default;
            } else if (gettype($default) !== gettype($value)) {
                return $default;
            }
        }
        return $value;
    }
    
    public function set($key, $value) {
        $dot = strrpos($key, '.');
        if ($dot !== false) {
            $this->getSubconfig(substr($key, 0, $dot))
                ->setValue(substr($key, $dot + 1), $value);
        } else {
            $this->setValue($key, $value);
        }
    }
    
    public abstract function getData();
    
    protected abstract function getValue($key);
    
    protected abstract function setValue($key, $value);
    
    protected abstract function getRelative($key);
    
    public function commit()
    {
        foreach ($this->cache as $key => $subconfig) {
            $subconfig->commit();
        }
    }

    public function getSubconfig($path)
    {
        if ($path == '') {
            return $this;
        }
        $path = explode('.', $path);
        $conf = $this;
        foreach ($path as $key) {
            if (!isset($conf->cache[$key])) {
                $conf->cache[$key] = $conf->getRelative($key);
            }
            $conf = $conf->cache[$key];
        }
        return $conf;
    }
    
    /**
     * Whether or not a key exists.
     *
     * @param string $key
     *            Key
     * @return bool True if it does, false otherwise
     */
    public function offsetExists($key)
    {
        return $this->get($key) !== null;
    }

    /**
     * Get a value
     *
     * @param string $key
     *            Key
     * @return mixed Value
     */
    public function offsetGet($key)
    {
        return $this->get($key);
    }

    /**
     * Associate a value with a key
     *
     * @param string $key
     *            Key
     * @param mixed $value
     *            Value
     */
    public function offsetSet($key, $value)
    {
        if (is_null($key)) {
        } else {
            $this->set($key, $value);
        }
    }

    /**
     * Delete a key
     *
     * @param string $key
     *            Key
     */
    public function offsetUnset($key)
    {
        $this->set($key, null);
    }

    /**
     * {@inheritdoc}
     */
    public function getIterator()
    {
        return new \Jivoo\MapIterator($this->getData());
    }
}
