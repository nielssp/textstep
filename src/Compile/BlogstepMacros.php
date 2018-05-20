<?php
// BlogSTEP
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile;

use Jivoo\View\Compile\ForeachNode;
use Jivoo\View\Compile\HtmlNode;
use Jivoo\View\Compile\PhpNode;
use Jivoo\View\Compile\TemplateNode;
use Jivoo\View\InvalidTemplateException;

/**
 * BlogSTEP template macros.
 */
class BlogstepMacros extends \Jivoo\View\Compile\DefaultMacros
{
    protected $namespace = 'bs';

    protected $properties = ['data', 'path', 'as'];

    private $context = [];

    private $siteMap;

    private $contentMap;

    private $contentTree;

    public $currentPath = null;

    public $targetTemplate = null;

    public function __construct(SiteMap $siteMap, ContentMap $contentMap)
    {
        $this->siteMap = $siteMap;
        $this->contentMap = $contentMap;
        $this->contentTree = new \Blogstep\Compile\Content\ContentTree($this->contentMap, '/content/');
    }

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

    public function forkMacro(HtmlNode $node, TemplateNode $value)
    {
        $pathFormat = $node->getProperty('bs:path');
        $var = $node->getProperty('bs:as');
        $varName = ltrim($var->code, '$');
        $this->context = [
            'content' => $this->contentTree
        ];
        $this->siteMap->remove($this->currentPath);
        $i = 0;
        $listType = null;
        foreach ($this->evaluate($value->code) as $item) {
            $this->context[$varName] = $item;
            $path = ltrim($this->evaluate($pathFormat->code), '/');
            $template = $this->targetTemplate;

            if ($item instanceof Content\ContentNode) {
                $type = 'content';
                $arg = $item->path;
                $metadata = $item->metadata;
                $metadata['link'] = $path;
                $this->contentMap->add($arg, $metadata);
//            } else if ($item instanceof Content\ContentPage) {
            } else {
                $type = 'element';
                $arg = $i;
            }
            if (!isset($listType)) {
                $listType = $type;
            } else if ($listType !== $type) {
                throw new \Blogstep\RuntimeException('Inconsistent list type');
            }
            $this->siteMap->add($path, 'eval', [$template, $type, $arg]);
            $i++;
        }
        switch ($listType) {
            case 'content':
                $code = $var->code . ' = $content->get($evalArgs[1]);';
                break;
            case 'element':
                $code = '$_elements = ' . $value->code . ';';
                $code .= $var->code . ' = $_elements[$evalArgs[1]];';
                break;
            default:
                return;
        }
        $node->before(new PhpNode($code, true));
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
        $foreachNode = new ForeachNode(PhpNode::expr($value)->code . ' as ' . $var->code);
        $node->replaceWith($foreachNode);
        $foreachNode->append($node);
    }
    
    public function embedMacro(HtmlNode $node, TemplateNode $value)
    {
        $embedNode = new PhpNode('$this->embedResource(' . PhpNode::expr($value)->code . ')');
        $node->replaceWith($embedNode);
    }
}
