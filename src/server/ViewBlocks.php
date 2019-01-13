<?php
// Jivoo
// Copyright (c) 2015 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep;

/**
 * Collection of view blocks.
 */
class ViewBlocks
{

    /**
     * @var string[] Associative array of block names and content.
     */
    private $blocks = [];

    /**
     * @var View View.
     */
    private $view;

    /**
     * Construct collection of view blocks.
     * @param View $view The view.
     */
    public function __construct(View $view)
    {
        $this->view = $view;
    }
    
    public function clear()
    {
        $this->blocks = [];
    }

    /**
     * Get the value of a block.
     * @param string $block Block name.
     * @param string $default Value to return if block is undefined.
     * @return string Content of block.
     */
    public function block($block, $default = '')
    {
        if (isset($this->blocks[$block])) {
            $output = '';
            foreach ($this->blocks[$block] as $content) {
                if (is_string($content)) {
                    $output .= $content;
                } else {
                    $output .= $content();
                }
            }
            return $output;
        }
        return $default;
    }

    /**
     * Whether or not a block is undefined.
     * @param string $block Block name.
     * @return boolean True if undefined, false otherwise.
     */
    public function isEmpty($block)
    {
        return !isset($this->blocks[$block]);
    }

    /**
     * Assign the content of a block.
     * @param string $block Block name.
     * @param string $value Content.
     */
    public function assign($block, $value)
    {
        $this->blocks[$block] = array($value);
    }

    /**
     * Append content to a block.
     * @param string $block Block name.
     * @param string $value Content.
     */
    public function append($block, $value)
    {
        if (!isset($this->blocks[$block])) {
            $this->blocks[$block] = array();
        }
        $this->blocks[$block][] = $value;
    }

    /**
     * Prepend content to a block.
     * @param string $block Block name.
     * @param string $value Content.
     */
    public function prepend($block, $value)
    {
        if (!isset($this->blocks[$block])) {
            $this->blocks[$block] = array();
        }
        $this->blocks[$block] = array_merge($this->blocks[$block], array($value));
    }

    /**
     * Insert shortcut icon into meta block, will look for file in 'assets/img'.
     * @param string $icon Icon name, e.g. 'icon.ico'.
     */
    public function icon($icon)
    {
        $this->relation('shortcut icon', null, $this->view->file('img/' . $icon));
    }

    /**
     * Insert a meta tag into the meta block.
     * @param string $name Meta name.
     * @param string $content Meta content.
     */
    public function meta($name, $content)
    {
        $this->append(
            'meta',
            '<meta name="' . Html::h($name) . '" content="' . Html::h($content) . '" />' . PHP_EOL
        );
    }

    /**
     * Insert relation (e.g. stylesheet or RSS) link into the meta block.
     * @param string $rel Relationship, e.g. 'stylesheet' or 'alternate'.
     * @param string $type Resource MIME type or null for no type.
     * @param string $href Resource URL.
     */
    public function relation($rel, $type, $href)
    {
        if (isset($type)) {
            $this->append(
                'meta',
                '<link rel="' . Html::h($rel) . '" type="' . Html::h($type)
                . '" href="' . $href . '" />' . PHP_EOL
            );
        } else {
            $this->append(
                'meta',
                '<link rel="' . Html::h($rel) . '" href="' . $href . '" />' . PHP_EOL
            );
        }
    }
}
