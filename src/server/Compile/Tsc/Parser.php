<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile\Tsc;

class Parser
{
    private $tokens;

    public function __construct(array $tokens)
    {
        $this->tokens = $tokens;
    }

    private function createNode($type, Token $token = null)
    {
        $node = new Node();
        $node->type = $type;
        if ($token) {
            $node->line = $token->line;
            $node->column = $token->column;
        } elseif (count($this->tokens)) {
            $node->line = $this->tokens[0]->line;
            $node->column = $this->tokens[0]->column;
        }
        return $node;
    }

    private function peek($n = 0)
    {
        if ($n < count($this->tokens)) {
            return $this->tokens[$n];
        }
        return new Token();
    }

    private function peekType($type, $n = 0)
    {
        return $this->peek($n)->type === $type;
    }

    private function peekValue($type, $value, $n = 0)
    {
        $token = $this->peek($n);
        return $token->type === $type and $token->value === $value;
    }

    private function peekValues($type, array $values, $n = 0)
    {
        $token = $this->peek($n);
        return $token->type === $type and in_array($token->value, $values);
    }

    private function pop()
    {
        if (count($this->tokens)) {
            return array_shift($this->tokens);
        }
        return null;
    }

    private function expectType($type)
    {
        $token = $this->pop();
        if ($token and $token->type === $type) {
            return $token;
        }
        if (!$token) {
            throw new SyntaxError('unexpected end of token stream, expected ' . $type, 0, 0);
        }
        throw new SyntaxError('unexpected ' . $token->type . ', expected ' . $type, $token->line, $token->column);
    }

    private function expectValue($type, $value)
    {
        $token = $this->pop();
        if ($token and $token->type === $type and $token->value === $value) {
            return $token;
        }
        if (!$token) {
            throw new SyntaxError('unexpected end of token stream, expected "' . $value . '"', 0, 0);
        }
        if ($token->type === $type) {
            throw new SyntaxError(
                'unexpected "' . $token->value . '", expected "' . $value . '"',
                $token->line,
                $token->column
            );
        }
        throw new SyntaxError(
            'unexpected ' . $token->type . ', expected "' . $value . '"',
            $token->line,
            $token->column
        );
    }

    private function expectEnd(Node $node, $value)
    {
        try {
            $this->expectValue('Keyword', 'end');
            $this->expectValue('Keyword', $value);
        } catch (SyntaxError $e) {
            throw new SyntaxError('missing "end ' . $value . '": ' . $e->getMessage(), $node->line, $node->column);
        }
    }

    public function skipLineFeeds()
    {
        while ($this->peekType('LineFeed')) {
            $this->pop();
        }
    }

    public function skipLineFeedsAndtext()
    {
        $this->skipLineFeeds();
        if ($this->peekValue('Punct', '}')) {
            $this->pop();
            while ($this->peekType('Text')) {
                $this->pop();
            }
            $this->expectValue('Punct', '{');
            $this->skipLineFeeds();
        }
    }

    public function parseName()
    {
        $node = $this->createNode('Name');
        $token = $this->expectType('Name');
        $node->value = $token->value;
        return $node;
    }

    public function parseAtom()
    {
        if ($this->peekType('Int')) {
            $node = $this->createNode('Int');
            $node->value = $this->pop()->value;
            return $node;
        } elseif ($this->peekType('Float')) {
            $node = $this->createNode('Float');
            $node->value = $this->pop()->value;
            return $node;
        } elseif ($this->peekType('String')) {
            $node = $this->createNode('String');
            $node->value = $this->pop()->value;
            return $node;
        } elseif ($this->peekType('Name')) {
            $node = $this->createNode('Name');
            $node->value = $this->pop()->value;
            return $node;
        } else {
            $token = $this->peek();
            throw new SyntaxError('unexpected ' . $token->type . ', expected an atom"', $token->line, $token->column);
        }
    }

    public function parseDelimited()
    {
        if ($this->peekValue('Punct', '[')) {
            $list = $this->createNode('List');
            $this->pop();
            if (!$this->peekValue('Punct', ']')) {
                while (true) {
                    $list->children[] = $this->parseExpression();
                    if (!$this->peekValue('Operator', ',')) {
                        break;
                    }
                    $this->pop();
                    // Allow comma after last element
                    if ($this->peekValue('Punct', ']')) {
                        break;
                    }
                }
            }
            $this->expectValue('Punct', ']');
            return $list;
        } elseif ($this->peekValue('Punct', '(')) {
            $this->pop();
            $expr = $this->parseExpression();
            $this->expectValue('Punct', ')');
            return $expr;
        } elseif ($this->peekValue('Punct', '{')) {
            $object = $this->createNode('Object');
            $this->pop();
            if (!$this->peekValue('Punct', '}')) {
                while (true) {
                    $prop = $this->createNode('Property');
                    $prop->children[] = $this->parseAtom();
                    $this->expectValue('Operator', ':');
                    $prop->children[] = $this->parseExpression();
                    $object->children[] = $prop;
                    if (!$this->peekValue('Operator', ',')) {
                        break;
                    }
                    $this->pop();
                    // Allow comma after last element
                    if ($this->peekValue('Punct', '}')) {
                        break;
                    }
                }
            }
            $this->expectValue('Punct', '}');
            return $object;
        } elseif ($this->peekValue('Keyword', 'do')) {
            $this->pop();
            $node = $this->parseBlock();
            $this->expectEnd($node, 'do');
            return $node;
        } elseif ($this->peekType('StartQuote')) {
            $this->pop();
            $node = $this->parseTemplate();
            $this->expectType('EndQuote');
            return $node;
        } else {
            return $this->parseAtom();
        }
    }

    public function parseApplyDot()
    {
        $expr = $this->parseDelimited();
        while (true) {
            if ($this->peekValue('Punct', '(')) {
                $apply = $this->createNode('Apply');
                $this->pop();
                $apply->children[] = $expr;
                $params = $this->createNode('Actual');
                $apply->children[] = $params;
                if (!$this->peekValue('Punct', ')')) {
                    while (true) {
                        $params->children[] = $this->parseExpression();
                        if (!$this->peekValue('Operator', ',')) {
                            break;
                        }
                        $this->pop();
                        // Allow comma after last element
                        if ($this->peekValue('Punct', ')')) {
                            break;
                        }
                    }
                }
                $this->expectValue('Punct', ')');
                $expr = $apply;
            } elseif ($this->peekValue('Punct', '[')) {
                $subs = $this->createNode('Subscript');
                $this->pop();
                $subs->children[] = $expr;
                $subs->children[] = $this->parseExpression();
                $this->expectValue('Punct', ']');
                $expr = $subs;
            } elseif ($this->peekValue('Operator', '.')) {
                $dot = $this->createNode('Dot');
                $this->pop();
                $dot->children[] = $expr;
                $dot->children[] = $this->parseName();
                $expr = $dot;
            } else {
                break;
            }
        }
        return $expr;
    }

    public function parseNegate()
    {
        if ($this->peekValue('Operator', '-')) {
            $node = $this->createNode('Prefix');
            $node->value = '-';
            $this->pop();
            $node->children[] = $this->parseNegate();
            return $node;
        }
        return $this->parseApplyDot();
    }

    public function parseAddSub()
    {
        $expr = $this->parseNegate();
        while ($this->peekValues('Operator', ['+', '-'])) {
            $infix = $this->createNode('Infix');
            $infix->value = $this->pop()->value;
            $infix->children[] = $expr;
            $infix->children[] = $this->parseNegate();
            $expr = $infix;
        }
        return $expr;
    }

    public function parseMulDiv()
    {
        $expr = $this->parseAddSub();
        while ($this->peekValues('Operator', ['*', '/', '%'])) {
            $infix = $this->createNode('Infix');
            $infix->value = $this->pop()->value;
            $infix->children[] = $expr;
            $infix->children[] = $this->parseAddSub();
            $expr = $infix;
        }
        return $expr;
    }

    public function parseComparison()
    {
        $expr = $this->parseMulDiv();
        while ($this->peekValues('Operator', ['<', '>', '<=', '>=', '==', '!='])) {
            $infix = $this->createNode('Infix');
            $infix->value = $this->pop()->value;
            $infix->children[] = $expr;
            $infix->children[] = $this->parseMulDiv();
            $expr = $infix;
        }
        return $expr;
    }

    public function parseLogicalNot()
    {
        if ($this->peekValue('Keyword', 'not')) {
            $node = $this->createNode('Prefix');
            $node->value = 'not';
            $this->pop();
            $node->children[] = $this->parseLogicalNot();
            return $node;
        }
        return $this->parseComparison();
    }

    public function parseLogicalAnd()
    {
        $expr = $this->parseLogicalNot();
        while ($this->peekValue('Keyword', 'and')) {
            $infix = $this->createNode('Infix');
            $infix->value = 'and';
            $this->pop();
            $infix->children[] = $expr;
            $infix->children[] = $this->parseLogicalNot();
            $expr = $infix;
        }
        return $expr;
    }

    public function parseLogicalOr()
    {
        $expr = $this->parseLogicalAnd();
        while ($this->peekValue('Keyword', 'or')) {
            $infix = $this->createNode('Infix');
            $infix->value = 'or';
            $this->pop();
            $infix->children[] = $expr;
            $infix->children[] = $this->parseLogicalAnd();
            $expr = $infix;
        }
        return $expr;
    }

    public function parsePipeLine()
    {
        $expr = $this->parseLogicalOr();
        while ($this->peekValue('Operator', '|')) {
            $apply = $this->createNode('Apply');
            $this->pop();
            $apply->children[] = $this->parseName();
            $params = $this->createNode('Actual');
            $apply->children[] = $params;
            $params->children[] = $expr;
            if ($this->peekValue('Punct', '(')) {
                $this->pop();
                if (!$this->peekValue('Punct', ')')) {
                    while (true) {
                        $params->children[] = $this->parseExpression();
                        if (!$this->peekValue('Operator', ',')) {
                            break;
                        }
                        $this->pop();
                        // Allow comma after last element
                        if ($this->peekValue('Punct', ')')) {
                            break;
                        }
                    }
                }
                $this->expectValue('Punct', ')');
            }
            $expr = $apply;
        }
        return $expr;
    }

    public function parseFn()
    {
        $node = $this->createNode('Fn');
        $params = $this->createNode('Formal');
        $node->children[] = $params;
        $this->expectValue('Keyword', 'fn');
        if ($this->peekType('Name')) {
            $params->children[] = $this->parseName();
            while ($this->peekValue('Operator', ',')) {
                $this->pop();
                // Allow comma after last element
                if ($this->peekValue('Operator', '->')) {
                    break;
                }
                $params->children[] = $this->parseName();
            }
        }
        $this->expectValue('Operator', '->');
        $node->children[] = $this->parseExpression();
        return $Node;
    }

    public function parsePartialDot()
    {
        $node = $this->createNode('Fn');
        $params = $this->createNode('Formal');
        $node->children[] = $params;
        $param = $this->createNode('Name');
        $param->value = 'o';
        $params->children[] = $param;
        $expr = $param;
        while ($this->peekValue('Operator', '.')) {
            $op = $this->createNode('Dot');
            $this->pop();
            $op->children[] = $expr;
            $op->children[] = $this->parseName();
            $expr = $op;
        }
        $node->children[] = $expr;
        return $node;
    }
    
    public function parseExpression()
    {
        if ($this->peekValue('Keyword', 'fn')) {
            return $this->parseFn();
        } elseif ($this->peekValue('Operator', '.')) {
            return $this->parsePartialDot();
        } else {
            return $this->parsePipeLine();
        }
    }

    public function parseIf()
    {
        $node = $this->createNode('If');
        $this->expectValue('Keyword', 'if');
        $node->children[] = $this->parseExpression();
        $node->children[] = $this->parseBlock();
        while ($this->peekValue('Keyword', 'else')) {
            $this->pop();
            if ($this->peekValue('Keyword', 'if')) {
                $this->pop();
                $new = $this->createNode('If');
                $node->children[] = $new;
                $node = $new;
                $node->children[] = $this->parseExpression();
                $node->children[] = $this->parseBlock();
            } else {
                $node->children[] = $this->parseBlock();
                break;
            }
        }
        $this->expectEnd($node, 'if');
        return $node;
    }

    public function parseFor()
    {
        $node = $this->createNode('For');
        $this->expectValue('Keyword', 'for');
        $params = $this->createNode('Formal');
        $node->children[] = $params;
        $params->children[] = $this->parseName();
        if ($this->peekValue('Operator', ':')) {
            $this->pop();
            $params->children[] = $this->parseName();
        }
        $this->expectValue('Keyword', 'in');
        $node->children[] = $this->parseExpression();
        $node->children[] = $this->parseBlock();
        if ($this->peekValue('Keyword', 'else')) {
            $this->pop();
            $node->children[] = $this->parseBlock();
        }
        $this->expectEnd($node, 'for');
        return $node;
    }

    public function parseSwitch()
    {
        $node = $this->createNode('Switch');
        $this->expectValue('Keyword', 'switch');
        $node->children[] = $this->parseExpression();
        if (!$this->peekType('Text')) {
            $this->expectType('LineFeed');
        }
        $this->skipLineFeedsAndText();
        while ($this->peekValue('Keyword', 'case')) {
            $case = $this->createNode('Case');
            $this->pop();
            $case->children[] = $this->parseExpression();
            $case->children[] = $this->parseBlock();
        }
        if ($this->peekValue('Keyword', 'default')) {
            $case = $this->createNode('Default');
            $this->pop();
            $case->children[] = $this->parseBlock();
        }
        $this->expectEnd($node, 'switch');
        return $node;
    }

    public function parseAssign()
    {
        $node = $this->parseExpression();
        if ($this->peekValues('Operator', ['=', '+=', '-=', '*=', '/='])) {
            $assign = $this->createNode('Assign');
            $op = $this->pop()->value;
            $assign->children[] = $node;
            if (strlen($op) === 2) {
                $infix = $this->createNode('Infix');
                $infix->value = $op[0];
                $infix->children[] = $assign->children[0];
                $infix->children[] = $this->parseExpression();
                $assign->children[] = $infix;
            } else {
                $assign->children[] = $this->parseExpression();
            }
            $node = $assign;
        }
        return $node;
    }

    public function parseStatement()
    {
        if ($this->peekValue('Keyword', 'if')) {
            return $this->parseIf();
        } elseif ($this->peekValue('Keyword', 'for')) {
            return $this->parseFor();
        } elseif ($this->peekValue('Keyword', 'switch')) {
            return $this->parseSwitch();
        }
        return $this->parseAssign();
    }

    public function parseBlock()
    {
        $node = $this->createNode('Block');
        if ($this->peekType('Text')) {
            $text = $this->createNode('String');
            $text->value = $this->pop()->value;
            $node->children[] = $text;
        } else {
            $this->expectType('LineFeed');
        }
        $template = $this->parseTemplate();
        $node->children = array_merge($node->children, $template->children);
        return $node;
    }

    public function parseTemplate()
    {
        $node = $this->createNode('Block');
        while (true) {
            if ($this->peekType('Text')) {
                $text = $this->createNode('String');
                $text->value = $this->pop()->value;
                $node->children[] = $text;
            } elseif ($this->peekValues('Keyword', ['end', 'else', 'case', 'default'])) {
                break;
            } elseif ($this->peekType('Eof') or $this->peekType('EndQuote')) {
                break;
            } elseif (!$this->peekType('LineFeed')) {
                $node->children[] = $this->parseStatement();
                if (!$this->peekType('Text') or $this->peekType('Eof')) {
                    $this->expectType('LineFeed');
                }
            } else {
                $this->pop();
            }
        }
        return $node;
    }

    public function parse()
    {
        $template = $this->parseTemplate();
        $this->expectType('Eof');
        return $template;
    }
}
