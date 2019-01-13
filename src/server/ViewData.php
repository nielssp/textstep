<?php
// Jivoo
// Copyright (c) 2015 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep;

use ArrayAccess;
use Jivoo\Assume;

/**
 * Collection of view data for templates.
 */
class ViewData implements ArrayAccess
{

    /**
     * @var array Associative array of data.
     */
    private $data = array();

    /**
     * @var ViewData[] View data for specific templates.
     */
    private $templateData = array();

    /**
     * Get value of view variable.
     * @param string $property Variable name.
     * @return mixed Value ofvVariable.
     */
    public function __get($property)
    {
        return $this->data[$property];
    }

    /**
     * Set value of view variable.
     * @param string $property Variable name.
     * @param mixed $value Value of variable.
     */
    public function __set($property, $value)
    {
        $this->data[$property] = $value;
    }

    /**
     * Unset a view variable.
     * @param string $property Variable name.
     */
    public function __unset($property)
    {
        unset($this->data[$property]);
    }

    /**
     * Whether or not a view variable exists.
     * @param string $property Variable name.
     * @return bool True if variable exists and is set.
     */
    public function __isset($property)
    {
        return isset($this->data[$property]);
    }

    /**
     * Get view data as an associative array.
     * @return array Associative array.
     */
    public function toArray()
    {
        return $this->data;
    }

    /**
     * @param string $template
     * @return true
     */
    public function offsetExists($template)
    {
        return true;
    }

    /**
     * Get view data for a specific template
     * @param string $template Template name.
     * @return ViewData The view data object for that template.
     */
    public function offsetGet($template)
    {
        if (!isset($this->templateData[$template])) {
            $this->templateData[$template] = new ViewData();
        }
        return $this->templateData[$template];
    }

    /**
     * Set view data for a specific template.
     * @param string $template Template name.
     * @param ViewData|array $data The data.
     */
    public function offsetSet($template, $data)
    {
        if (!isset($this->templateData[$template])) {
            if (is_array($data)) {
                $this->templateData[$template] = new ViewData();
                $this->templateData[$template]->data = $data;
            } else {
                Assume::that($data instanceof ViewData);
                $this->templateData[$template] = $data;
            }
        } else {
            if (!is_array($data)) {
                Assume::that($data instanceof ViewData);
                $data = $data->toArray();
            }
            $this->templateData[$template]->data = array_merge(
                $this->templateData[$template]->data,
                $data
            );
        }
    }

    /**
     * Reset view data for a specific template.
     * @param string $template Template name.
     */
    public function offsetUnset($template)
    {
        unset($this->templateData[$template]);
    }
}
