<?php
// Jivoo
// Copyright (c) 2015 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep;

/**
 * Template system.
 * @method string link(array|Linkable|string|null $route = null) Alias for
 * {@see Routing::getLink}.
 * @method string url(array|Linkable|string|null $route = null) Alias for
 * {@see Routing::getUrl}.
 * @method bool isCurrent(array|Linkable|string|null $route = null)
 *  Alias for {@see Routing::isCurrent}.
 * @method array mergeRoutes(array|Linkable|string|null $route = null,
 *       array $mergeWith = array()) Alias for {@see Routing::mergeRoutes}.
 * @method string file(string $file) Alias for {@see Assets::getAsset}.
 * @method icon(string $icon) Alias for {@see ViewBlocks::icon}.
 * @method meta(string $name, string $content) Alias for {@see ViewBlocks::meta}.
 * @method relation(string $rel, string $type, string $href) Alias for {@see ViewBlocks::relation}.
 * @method string block(string $name, string $default = '') Alias for {@see ViewBlocks::block}.
 * @method bool isEmpty(string $block) Alias for {@see ViewBlocks::isEmpty}.
 * @method provide(string $resource, string $location, string[] $dependencies = array(), string $condition = null)
 *  Alias for {@see ViewResources::provide}.
 * @method import(string $resource, string $resources,...) Alias for {@see ViewResources::import}.
 * @method openFrame() Alias for {@see ViewResources::openFrame}.
 * @method closeFrame() Alias for {@see ViewResources::closeFrame}.
 * @method importConditional(string $resource, string $condition)
 *  Alias for {@see ViewResources::importConditional}.
 * @method string resourceBlock() Alias for {@see ViewResources::resourceBlock}.
 * @method ViewExtension[] extensions(string $hook = null, string $type = 'ViewExtension')
 *  Alias for {@see ViewExtensions::extensions}.
 */
class Template
{

    /**
     * @var string Name of capturing block.
     */
    private $currentBlock = null;

    /**
     * @var string Mode of block capturing, 'assign', 'prepend' or 'append'.
     */
    private $blockMode = null;

    /**
     * @var string Content for parent template or layout.
     */
    private $content = '';

    /**
     * @var string Name of parent template.
     */
    private $extend = null;

    /**
     * @var string Name of layout template.
     */
    private $layout = null;

    /**
     * @var string[] Stack of embedded templates.
     */
    private $templateStack = array();

    /**
     * @var bool Whether current template is the layout.
     */
    private $isLayout = false;

    /**
     * @var bool Whether or not to ignore extends.
     */
    private $ignoreExtend = false;

    /**
     * @var View View.
     */
    private $view;

    /**
     * @var ViewData View data.
     */
    protected $data;

    /**
     * Construct template handler.
     * @param View $view The view.
     */
    public function __construct(View $view)
    {
        $this->view = $view;
        $this->data = $view->data;
    }

    /**
     * Set whether or not to ignore extends.
     * @param bool $ignore Ignore extends.
     */
    public function ignoreExtend($ignore)
    {
        $this->ignoreExtend = $ignore;
    }

    /**
     * Get name of current template if any.
     * @return string|null Name of current template, or null if not in a template.
     */
    public function getCurrent()
    {
        if (isset($this->templateStack[0])) {
            return $this->templateStack[0];
        }
        return null;
    }

    /**
     * Whether the current template is the layout.
     * @return boolean True if layout.
     */
    public function isLayout()
    {
        return $this->isLayout;
    }

    /**
     * Set layout.
     * @param string|null|false $template Template name. Use null for default, or
     * false for no layout.
     */
    public function layout($template)
    {
        $this->layout = $template;
    }

    /**
     * Disable layout.
     */
    public function disableLayout()
    {
        $this->layout = false;
    }

    /**
     * Extend another template, i.e. set parent template.
     * @param string $template Template name.
     */
    public function extend($template)
    {
        $this->extend = $template;
    }

    /**
     * Embed another template into the current template.
     * @param string $_template Name of template.
     * @param array $_data Additional data for template.
     * @throws InvalidTemplateException If template could not be found.
     */
    protected function embed($_template, $_data = array())
    {
        \Jivoo\Assume::isString($_template);
        extract($_data, EXTR_SKIP);
        extract($this->view->data->toArray(), EXTR_SKIP);
        extract($this->view->data[$_template]->toArray(), EXTR_SKIP);
        $_templateInfo = $this->view->findTemplate($_template);
        if (!isset($_templateInfo)) {
            throw new InvalidTemplateException('Template not found: ' . $_template);
        }
        if (isset($_templateInfo['init']) and ! $_templateInfo['init']) {
            $_init = $this->view->getInitFile($_templateInfo['path']);
            if (isset($_init)) {
                $this->embed($_init);
            }
        }
        array_unshift($this->templateStack, $_template);
        require $_templateInfo['file'];
        array_shift($this->templateStack);
        if (isset($this->extend)) {
            $this->view->data[$this->extend] = $this->view->data[$_template];
        }
    }

    /**
     * Render template.
     * @param string $template Template name.
     * @param array $data Additional data for template.
     * @param bool $withLayout Whether or not to render the layout.
     * @return string Rendered template, e.g. HTML code for HTML templates.
     */
    public function render($template, $data = array(), $withLayout = true)
    {
        ob_start();
        $extend = $this->extend;
        $this->extend = null;
        $this->content = '';
        $this->embed($template, $data);
        if (isset($this->extend)) {
            $template = $this->extend;
            $this->extend = null;
            if (!$this->ignoreExtend) {
                $this->content .= ob_get_clean();
                $this->view->blocks->assign('content', $this->content);
                $this->openFrame();
                $content = $this->render($template, $data, $withLayout);
                $this->closeFrame();
                return $content;
            }
        }
        $this->extend = $extend;
        if ($withLayout and $this->layout !== false) {
            // TODO maybe check for '<!DOCTYPE' in content?
            if (!isset($this->layout)) {
                $this->layout = $this->view->findLayout($template);
            }
            if (isset($this->layout)) {
                $this->content .= ob_get_clean();
                $this->view->blocks->assign('content', $this->content);
                $this->openFrame();
                $this->isLayout = true;
                $content = $this->render($this->layout, $data, false);
                $this->isLayout = false;
                return $content;
            }
        }
        return $this->content . ob_get_clean();
    }

    /**
     * Call a view function.
     * @param string $function View function name.
     * @param array $parameters Parameters for function.
     * @return mixed Output of function.
     */
    public function __call($function, $parameters)
    {
        return $this->view->__call($function, $parameters);
    }

    /**
     * Begin capturing output for block.
     * @param string $block Block name.
     */
    public function begin($block)
    {
        $this->blockMode = 'assign';
        $this->content .= ob_get_clean();
        $this->currentBlock = $block;
        ob_start();
    }

    /**
     * Begin capturing output for block, append mode.
     * @param string $block Block name.
     */
    public function append($block)
    {
        $this->blockMode = 'append';
        $this->content .= ob_get_clean();
        $this->currentBlock = $block;
        ob_start();
    }

    /**
     * Begin capturing output for block, prepend mode.
     * @param string $block Block name.
     */
    public function prepend($block)
    {
        $this->blockMode = 'prepend';
        $this->content .= ob_get_clean();
        $this->currentBlock = $block;
        ob_start();
    }

    /**
     * End a capturing block.
     */
    public function end()
    {
        if (isset($this->currentBlock)) {
            if (!isset($this->blocks[$this->currentBlock])) {
                $this->blocks[$this->currentBlock] = '';
            }
            call_user_func(
                array($this->view->blocks, $this->blockMode),
                $this->currentBlock,
                ob_get_clean()
            );
            $this->currentBlock = null;
            ob_start();
        }
    }
}
