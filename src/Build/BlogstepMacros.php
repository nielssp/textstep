<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Build;

use Jivoo\View\Compile\ForeachNode;
use Jivoo\View\Compile\HtmlNode;
use Jivoo\View\Compile\Macros;
use Jivoo\View\Compile\PhpNode;
use Jivoo\View\Compile\TemplateNode;
use Jivoo\View\InvalidTemplateException;

/**
 * BlogSTEP template macros.
 */
class BlogstepMacros extends Macros
{
    protected $namespace = 'bs';

    protected $properties = ['path', 'as', 'paginate'];
    
    /**
     * @var SiteNode
     */
    public $siteNode = null;
    
    /**
     * @var Compiler
     */
    public $compiler = null;
    
    private function evaluateExpr(TemplateNode $node)
    {
        if ($node instanceof PhpNode) {
            $content = $this->compiler->content;
            return eval('return ' . $node->code . ';');
        }
        return $node->__toString();
    }

    public function explodeMacro(HtmlNode $node, TemplateNode $value)
    {
        if (isset($this->siteNode) and isset($this->compiler)) {
            $pathFormat = $node->getProperty('bs:path');
            $var = $node->getProperty('bs:as');
            $root = $this->siteNode->parent;
            foreach ($this->evaluateExpr($value) as $node) {
                $path = $node->convertPath($pathFormat) . '.html';
                $node->setName($node->getName() . '.html');
                $root->createDescendant($path)->replaceWith($node);
                $template = $node->getBuildPath()->get($path . '.php');
                $node->setFile($template);
                $code = '<?php ';
                $code .= $var->code . ' = $this->getContent(' . var_export($node->getPath(), true) . ');';
                $data = '[' . var_export(ltrim($var->code, '$'), true) . ' => ' . $var->code . ']';
                $code .= 'echo $this->embed(' . var_export($this->siteNode->getPath(), true) . ', ' . $data . ');';
                $template->putContents($code);
            }
            $this->siteNode->detach();
            $this->siteNode = null;
        }
    }
    
    public function foreachMacro(HtmlNode $node, TemplateNode $value)
    {
        if (!isset($value)) {
            if ($node->prev instanceof ForeachNode) {
                $foreachNode = $node->prev;
                $node->detach();
                $foreachNode->append($node);
                return;
            }
            throw new InvalidTemplateException('Empty foreach-node must folow another foreach-node');
        }
        $var = $node->getProperty('bs:as');
        $paginate = $node->getProperty('bs:paginate');
        if (isset($paginate)) {
            
        }
        $foreachNode = new ForeachNode(PhpNode::expr($value)->code . ' as ' . $var->code);
        $node->replaceWith($foreachNode);
        $foreachNode->append($node);
    }
}
