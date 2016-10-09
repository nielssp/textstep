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
            foreach ($this->compiler->content->get($value) as $file) {
                
            }
            $this->siteNode->detach();
            foreach ($this->siteNode->siteMap->content->get($value->__toString()) as $element) {
                $node = $this->siteNode->siteMap->addNode($element->getPath($pathFormat));
                $node->target = dirname($this->siteNode->target) . $node->path . '.php';
                $code = '<?php echo $this->embed(' . var_export($this->siteNode->target, true) . ');';
                file_put_contents($node->target, $code);
                $node->content = $element;
            }
            $this->siteNode->delete();
        }
    }
}
