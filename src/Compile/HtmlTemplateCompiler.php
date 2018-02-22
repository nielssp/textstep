<?php
// BlogSTEP
// Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile;

use Jivoo\View\InvalidTemplateException;
use SimpleHtmlDom\simple_html_dom;
use SimpleHtmlDom\simple_html_dom_node;

/**
 * Converts HTML templates to PHP templates.
 */
class HtmlTemplateCompiler
{

    /**
     * @var callable[] Map of macro functions.
     */
    private $macros = array();

    /**
     * Add a macro.
     * @param string $name Lowercase macro name.
     * @param callable $function A function accepting two parameters: the target
     * {@see HtmlNode}, and the value of the macro attribute (string or null).
     * @param string $namepsace Macro namespace, default is 'j'.
     */
    public function addMacro($name, $function, $namespace = 'j')
    {
        $this->macros[$namespace . ':' . strtolower($name)] = $function;
    }

    /**
     * Add multiple macros.
     * @param callable[]|Macros $macros Mapping of macro names to functions.
     * @param string $namepsace Macro namespace, default is 'j'.
     */
    public function addMacros($macros, $namespace = 'j')
    {
        if ($macros instanceof \Jivoo\View\Compile\Macros) {
            $this->addMacros($macros->getMacros(), $macros->getNamespace());
            return;
        }
        foreach ($macros as $name => $function) {
            $this->addMacro($name, $function, $namespace);
        }
    }

    /**
     * Compile a template file by reading it, converting the DOM using
     * {@see convert()}, then applying macros using {@see transform()}.
     * @param string $source Template source.
     * @return \Jivoo\View\Compile\InternalNode Template node.
     * @throws InvalidTemplateException If template is inaccessible or invalid.
     */
    public function compile($source)
    {
        $dom = new simple_html_dom();
        if (!$dom->load($source, true, false)) {
            throw new InvalidTemplateExceptionn('Could not parse template');
        }

        $root = new \Jivoo\View\Compile\InternalNode();

        $main = $dom->find('[j:main]', 0);
        if (isset($main)) {
            $root->append($this->convert($main));
        } else {
            foreach ($dom->find('*, text') as $html) {
                if ($html->parent->tag != 'root') {
                    continue;
                }
                $root->append($this->convert($html));
            }
        }
        $this->transform($root);

        return $root;
    }

    /**
     * Convert HTML DOM to a template node.
     * @param \simple_html_dom_node $node DOM node.
     * @return TemplateNode Template node.
     */
    public function convert(simple_html_dom_node $node)
    {
        if ($node->tag === 'text' or $node->tag === 'unknown') {
            return new \Jivoo\View\Compile\TextNode($node->innertext);
        } elseif ($node->tag === 'comment') {
            if (preg_match('/^<!-- *\{(.*)\} *-->$/ms', $node->innertext, $matches) === 1) {
                return new \Jivoo\View\Compile\PhpNode($matches[1], true);
            }
            return new \Jivoo\View\Compile\TextNode('');
        } else {
            $output = new \Jivoo\View\Compile\HtmlNode($node->tag);
            foreach ($node->attr as $name => $value) {
                if (preg_match('/^{(.*)}([\?])?$/', $value, $matches) === 1) {
                    $value = new \Jivoo\View\Compile\PhpNode($matches[1], false, isset($matches[2]) ? $matches[2] : '');
                } elseif ($value !== true) {
                    $value = new \Jivoo\View\Compile\TextNode($value);
                } else {
                    $value = null;
                }
                if (strpos($name, ':') === false) {
                    $output->setAttribute($name, $value);
                } else {
                    //           list($ns, $name) = explode(':', $name, 2);
                    if ($value === true) {
                        $value = null;
                    }
                    $output->addMacro($name, $value);
                }
            }
            foreach ($node->nodes as $child) {
                $output->append($this->convert($child));
            }
            return $output;
        }
    }

    /**
     * Apply macros to a template node.
     * @param TemplateNode $node Node.
     * @throws InvalidMacroException If macro is unknown.
     */
    public function transform(TemplateNode $node)
    {
        if ($node instanceof InternalNode) {
            foreach ($node->getChildren() as $child) {
                $this->transform($child);
            }
        }
        foreach ($node->macros as $macro => $value) {
            if (!$node->hasMacro($macro)) {
                continue;
            }
            if (!isset($this->macros[$macro])) {
                throw new \Jivoo\View\Compile\InvalidMacroException(
                    'Undefined macro "' . $macro
                );
            }
            call_user_func($this->macros[$macro], $node, $value);
            if (!isset($node->parent)) {
                return;
            }
        }
    }
}