<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Build;

use Jivoo\View\Compile\HtmlNode;
use Jivoo\View\Compile\Macros;
use Jivoo\View\Compile\TemplateNode;

/**
 * BlogSTEP template macros.
 */
class BlogstepMacros extends Macros
{
    protected $namespace = 'bs';

    protected $properties = ['path', 'as'];
    
    /**
     * @var SiteNode
     */
    public $siteNode = null;
    
    /**
     * @var Compiler
     */
    public $compiler = null;

    public function explodeMacro(HtmlNode $node, TemplateNode $value = null)
    {
        if (isset($this->siteNode) and isset($this->compiler)) {
            $pathFormat = $node->getProperty('bs:path');
            $var = $node->getProperty('bs:as');
            $root = $this->siteNode->parent;
            foreach ($this->compiler->content->get($value->__toString()) as $content) {
                $node = new ContentNode($content);
                $path = $node->convertPath($pathFormat);
                $root->createDescendant($path)->replaceWith($node);
                $template = $node->getBuildPath()->get($node->getPath() . '.html.php');
                $node->setTemplate($template);
                $code = '<?php ';
                $code .= $var->code . ' = $this->content->get(' . var_export($content->getPath(), true) . ');';
                $data = '[' . var_export(ltrim($var->code, '$'), true) . ' => ' . $var->code . ']';
                $code .= 'echo $this->embed(' . var_export($this->siteNode->getPath(), true) . ', ' . $data . ');';
                $template->putContents($code);
            }
            $this->siteNode->detach();
            $this->siteNode = null;
        }
    }
}
