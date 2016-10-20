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
    
    private $content = [];
    
    private function evaluate($_code, $_statement = false)
    {
        extract($this->context, EXTR_SKIP);
        if ($_statement) {
            eval($_code);
            $_ret = null;
        } else {
            $_ret = eval('return ' . $_code . ';');
        }
        $this->context = get_defined_vars();
        return $_ret;
    }

    public function explodeMacro(HtmlNode $node, TemplateNode $value)
    {
        if (isset($this->siteNode) and isset($this->compiler)) {
            $pathFormat = $node->getProperty('bs:path');
            $var = $node->getProperty('bs:as');
            $varName = ltrim($var->code, '$');
            $this->context = [
                'content' => $this->compiler->content
            ];
            $root = $this->siteNode->parent;
            foreach ($this->evaluate($value->code) as $node) {
                $this->context[$varName] = $node;
                $path = $this->evaluate($pathFormat->code) . '.html';
                $template = $root->getBuildPath()->get($path . '.php');
                if ($node instanceof ContentNode) {
                    $node->setName($node->getName() . '.html');
                    $node->setFile($template);
                } else {
                    $node = new ObjectNode($template, $node);
                    $node->setName(preg_replace('/\.php$/', '', $node->getName()));
                }
                $root->createDescendant($path)->replaceWith($node);
                $code = '<?php ';
                $code .= '$node = $this->getContent(' . var_export($node->getPath(), true) . ');';
                if ($node instanceof ObjectNode) {
                    $code .= $var->code . ' = $node->getObject();';
                } else {
                    $code .= $var->code . ' = $node;';
                }
                $data = '[' . var_export($varName, true) . ' => ' . $var->code . ']';
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
