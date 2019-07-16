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
        } else if (count($this->tokens)) {
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
            throw new SyntaxError('unexpected "' . $token->value . '", expected "' . $value . '"', $token->line, $token->column);
        }
        throw new SyntaxError('unexpected ' . $token->type . ', expected "' . $value . '"', $token->line, $token->column);
    }

    public function skipLineFeeds()
    {
        while ($this->peekType('LINE_FEED')) {
            $this->pop();
        }
    }

    public function skipLineFeedsAndtext()
    {
        $this->skipLineFeeds();
        if ($this->peekValue('PUNCT', '}')) {
            $this->pop();
            while ($this->peekType('TEXT')) {
                $this->pop();
            }
            $this->expectValue('PUNCT', '{');
            $this->skipLineFeeds();
        }
    }

    public function parseName()
    {
        $node = $this->createNode('NAME');
        $token = $this->expectType('NAME');
        $node->value = $token->value;
        return $node;
    }

    public function parseAtom()
    {
        if ($this->peekType('INT')) {
            $node = $this->createNode('INT');
            $node->value = $this->pop()->value;
            return $node;
        } else if ($this->peekType('FLOAT')) {
            $node = $this->createNode('FLOAT');
            $node->value = $this->pop()->value;
            return $node;
        } else if ($this->peekType('STRING')) {
            $node = $this->createNode('STRING');
            $node->value = $this->pop()->value;
            return $node;
        } else if ($this->peekType('NAME')) {
            $node = $this->createNode('NAME');
            $node->value = $this->pop()->value;
            return $node;
        } else {
            $token = $this->peek();
            throw new SyntaxError('unexpected ' . $token->type . ', expected an atom"', $token->line, $token->column);
        }
    }

    public function parseList()
    {
        if ($this->peekValue('PUNCT', '[')) {
            $list = $this->createNode('LIST');
            $this->pop();
            $this->skipLineFeeds();
            if (!$this->peekValue('PUNCT', ']')) {
                while (true) {
                    $list->children[] = $this->parseExpression();
                    $this->skipLineFeeds();
                    if (!$this->peekValue('PUNCT', ',')) {
                        break;
                    }
                    $this->pop();
                    $this->skipLineFeeds();
                }
            }
            $this->expectValue('PUNCT', ']');
            return $list;
        } else if ($this->peekValue('PUNCT', '(')) {
            $this->pop();
            $this->skipLineFeeds();
            $expr = $this->parseExpression();
            $this->skipLineFeeds();
            $this->expectValue('PUNCT', ')');
            return $expr;
        } else if ($this->peekValue('PUNCT', '{')) {
            $object = $this->createNode('OBJECT');
            $this->pop();
            $this->skipLineFeeds();
            if (!$this->peekValue('PUNCT', '}')) {
                while (true) {
                    $prop = $this->createNode('PROPERTY');
                    $prop->children[] = $this->parseAtom();
                    $this->skipLineFeeds();
                    $this->expectValue('PUNCT', ':');
                    $this->skipLineFeeds();
                    $prop->children[] = $this->parseExpression();
                    $object->children[] = $prop;
                    $this->skipLineFeeds();
                    if (!$this->peekValue('PUNCT', ',')) {
                        break;
                    }
                    $this->pop();
                    $this->skipLineFeeds();
                }
            }
            $this->expectValue('PUNCT', '}');
            return $object;
        } else if ($this->peekValue('KEYWORD', 'do')) {
            $this->pop();
            $node = $this->parseBlock();
            $this->expectValue('KEYWORD', 'end');
            $this->expectValue('KEYWORD', 'do');
            return $node;
        } else {
            return $this->parseAtom();
        }
    }

    public function parseApplyDot()
    {
        $expr = $this->parseList();
        while (true) {
            if ($this->peekValue('PUNCT', '(')) {
                $apply = $this->createNode('APPLY');
                $this->pop();
                $apply->children[] = $expr;
                $params = $this->createNode('ACTUAL');
                $apply->children[] = $params;
                if (!$this->peekValue('PUNCT', ')')) {
                    while (true) {
                        $params->children[] = $this->parseExpression();
                        if (!$this->peekValue('PUNCT', ',')) {
                            break;
                        }
                        $this->pop();
                    }
                }
                $this->expectValue('PUNCT', ')');
                $expr = $apply;
            } else if ($this->peekValue('PUNCT', '[')) {
                $subs = $this->createNode('SUBSCRIPT');
                $this->pop();
                $subs->children[] = $expr;
                $subs->children[] = $this->parseExpression();
                $this->expectValue('PUNCT', ']');
                $expr = $subs;
            } else if ($this->peekValue('PUNCT', '.')) {
                $dot = $this->createNode('DOT');
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
        if ($this->peekValue('OPERATOR', '-')) {
            $node = $this->createNode('PREFIX');
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
        while ($this->peekValues('OPERATOR', ['+', '-'])) {
            $infix = $this->createNode('INFIX');
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
        while ($this->peekValues('OPERATOR', ['*', '/', '%'])) {
            $infix = $this->createNode('INFIX');
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
        while ($this->peekValues('OPERATOR', ['<', '>', '<=', '>=', '==', '!='])) {
            $infix = $this->createNode('INFIX');
            $infix->value = $this->pop()->value;
            $infix->children[] = $expr;
            $infix->children[] = $this->parseMulDiv();
            $expr = $infix;
        }
        return $expr;
    }

    public function parseLogicalNot()
    {
        if ($this->peekValue('KEYWORD', 'not')) {
            $node = $this->createNode('PREFIX');
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
        while ($this->peekValue('KEYWORD', 'and')) {
            $infix = $this->createNode('INFIX');
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
        while ($this->peekValue('KEYWORD', 'or')) {
            $infix = $this->createNode('INFIX');
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
        while ($this->peekValue('OPERATOR', '|')) {
            $apply = $this->createNode('APPLY');
            $this->pop();
            $apply->children[] = $this->parseName();
            $params = $this->createNode('ACTUAL');
            $apply->children[] = $params;
            $params->children[] = $expr;
            if ($this->peekValue('PUNCT', '(')) {
                $this->pop();
                if (!$this->peekValue('PUNCT', ')')) {
                    while (true) {
                        $params->children[] = $this->parseExpression();
                        if (!$this->peekValue('PUNCT', ',')) {
                            break;
                        }
                        $this->pop();
                    }
                }
                $this->expectValue('PUNCT', ')');
            }
            $expr = $apply;
        }
        return $expr;
    }

    public function parseFn()
    {
        $node = $this->createNode('FN');
        $params = $this->createNode('FORMAL');
        $node->children[] = $params;
        $this->expectValue('KEYWORD', 'fn');
        if ($this->peekType('NAME')) {
            $params->children[] = $this->parseName();
            while ($this->peekValue('PUNCT', ',')) {
                $params->children[] = $this->parseName();
            }
        }
        $this->expectValue('OPERATOR', '->');
        $node->children[] = $this->parseExpression();
        return $Node;
    }

    public function parsePartialDot()
    {
        $node = $this->createNode('FN');
        $params = $this->createNode('FORMAL');
        $node->children[] = $params;
        $param = $this->createNode('NAME');
        $param->value = 'o';
        $params->children[] = $param;
        $expr = $param;
        while ($this->peekValue('PUNCT', '.')) {
            $op = $this->createNode('DOT');
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
        if ($this->peekValue('KEYWORD', 'fn')) {
            return $this->parseFn();
        } else if ($this->peekValue('PUNCT', '.')) {
            return $this->parsePartialDot();
        } else {
            return $this->parsePipeLine();
        }
    }

    public function parseIf()
    {
        $node = $this->createNode('IF');
        $this->expectValue('KEYWORD', 'if');
        $node->children[] = $this->parseExpression();
        $node->children[] = $this->parseBlock();
        while ($this->peekValue('KEYWORD', 'else')) {
            $this->pop();
            if ($this->peekValue('KEYWORD', 'if')) {
                $this->pop();
                $new = $this->createNode('IF');
                $node->children[] = $new;
                $node = $new;
                $node->children[] = $this->parseExpression();
                $node->children[] = $this->parseBlock();
            } else {
                $node->children[] = $this->parseBlock();
                break;
            }
        }
        $this->expectValue('KEYWORD', 'end');
        $this->expectValue('KEYWORD', 'if');
        return $node;
    }

    public function parseFor()
    {
        $node = $this->createNode('FOR');
        $this->expectValue('KEYWORD', 'for');
        $node->children[] = $this->parseName();
        $this->expectValue('KEYWORD', 'in');
        $node->children[] = $this->parseExpression();
        $node->children[] = $this->parseBlock();
        $this->expectValue('KEYWORD', 'end');
        $this->expectValue('KEYWORD', 'for');
        return $node;
    }

    public function parseSwitch()
    {
        $node = $this->createNode('SWITCH');
        $this->expectValue('KEYWORD', 'switch');
        $node->children[] = $this->parseExpression();
        $this->skipLineFeedsAndText();
        while ($this->peekValue('KEYWORD', 'case')) {
            $case = $this->createNode('CASE');
            $this->pop();
            $case->children[] = $this->parseExpression();
            $case->children[] = $this->parseBlock();
        }
        if ($this->peekValue('KEYWORD', 'default')) {
            $case = $this->createNode('DEFAULT');
            $this->pop();
            $case->children[] = $this->parseBlock();
        }
        $this->expectValue('KEYWORD', 'end');
        $this->expectValue('KEYWORD', 'switch');
        return $node;
    }

    public function parseAssign()
    {
        $node = $this->createNode('ASSIGN');
        $node->children[] = $this->parseName();
        $op = $this->expectType('OPERATOR')->value;
        if (strlen($op) === 2) {
            $infix = $this->createNode('INFIX');
            $infix->value = $op[0];
            $infix->children[] = $node->children[0];
            $infix->children[] = $this->parseExpression();
            $node->children[] = $infix;
        } else {
            $node->children[] = $this->parseExpression();
        }
        return $node;
    }

    public function parseStatement()
    {
        if ($this->peekValue('KEYWORD', 'if')) {
            return $this->parseIf();
        } else if ($this->peekValue('KEYWORD', 'for')) {
            return $this->parseFor();
        } else if ($this->peekValue('KEYWORD', 'switch')) {
            return $this->parseSwitch();
        } else if ($this->peekType('NAME')) {
            $next = $this->peek(1);
            if ($next->type === 'OPERATOR') {
                switch ($next->value) {
                    case '=':
                    case '+=':
                    case '-=':
                    case '*=':
                    case '/=':
                        return $this->parseAssign();
                }
            }
        }
        return $this->parseExpression();
    }

    public function parseBlock()
    {
        $this->skipLineFeeds();
        if ($this->peekValue('PUNCT', '}')) {
            $this->pop();
            $node = $this->parseTemplate();
            $this->expectValue('PUNCT', '{');
            return $node;
        } else {
            $node = $this->createNode('BLOCK');
            while (true) {
                $token = $this->peek();
                if ($token->type === 'KEYWORD' and in_array($token->value, ['end', 'else', 'case', 'default'])) {
                    break;
                }
                $node->children[] = $this->parseStatement();
                $this->skipLineFeeds();
            }
            return $node;
        }
    }

    public function parseTemplate()
    {
        $node = $this->createNode('BLOCK');
        while (true) {
            $token = $this->peek();
            if ($token->type === 'TEXT') {
                $this->pop();
                $textNode = $this->createNode('TEXT', $token);
                $textNode->value = $token->value;
                $node->children[] = $textNode;
            } else if ($token->type === 'PUNCT' and $token->value === '{') {
                $next = $this->peek(1);
                if ($next->type === 'KEYWORD' and in_array($next->value, ['end', 'else', 'case', 'default'])) {
                    break;
                }
                $this->pop();
                $this->skipLineFeeds();
                do {
                    $node->children[] = $this->parseStatement();
                    $this->skipLineFeeds();
                } while (!$this->peekValue('PUNCT', '}'));
                $this->expectValue('PUNCT', '}');
            } else {
                break;
            }
        }
        return $node;
    }

    public function parse()
    {
        $template = $this->parseTemplate();
        $this->expectType('EOF');
        return $template;
    }
}
