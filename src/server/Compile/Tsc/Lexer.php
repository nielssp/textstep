<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile\Tsc;

class Lexer
{
    private $input;

    private $length;

    private $offset = 0;

    private $line = 1;

    private $column = 1;

    private $textMode = true;

    private $nesting = 0;

    private static $keywords = ['if', 'for', 'in', 'switch', 'case', 'default', 'end', 'fn', 'and', 'or', 'not', 'do'];

    public function __construct($input)
    {
        $this->input = $input;
        $this->length = strlen($input);
    }

    private function peek()
    {
        if ($this->offset < $this->length) {
            return $this->input[$this->offset];
        }
        return null;
    }

    private function pop()
    {
        if ($this->offset < $this->length) {
            $c = $this->input[$this->offset];
            $this->offset++;
            if ($c === "\n") {
                $this->line++;
                $this->column = 1;
            } else {
                $this->column++;
            }
            return $c;
        }
        return null;
    }

    private function skipWhiteSpace()
    {
        $c = $this->peek();
        while ($c === ' ' or $c === "\t" or $c === "\r") {
            $this->pop();
            $c = $this->peek();
        }
    }

    private function createToken($type, $value = null)
    {
        $token = new Token();
        $token->type = $type;
        $token->value = $value;
        $token->line = $this->line;
        $token->column = $this->column;
        return $token;
    }

    private function readName()
    {
        $token = $this->createToken('NAME');
        $name = '';
        while (true) {
            $c = $this->peek();
            if ($c === null or !preg_match('/[a-zA-Z0-9_]/', $c)) {
                if ($name === '') {
                    throw new LexerError('invalid character: ' . $c, $this->line, $this->column);
                }
                break;
            }
            $name .= $this->pop();
        }
        if (in_array($name, self::$keywords)) {
            $token->type = 'KEYWORD';
        }
        $token->value = $name;
        return $token;
    }

    private function readOperator()
    {
        $token = $this->createToken('OPERATOR');
        $c = $this->pop();
        $token->value = $c;
        switch ($c) {
            case '-':
                if ($this->peek() === '=' or $this->peek() === '>') {
                    $token->value .= $this->pop();
                }
                break;
            case '+':
            case '*':
            case '/':
            case '<':
            case '>':
            case '=':
            case '!':
                if ($this->peek() === '=') {
                    $token->value .= $this->pop();
                }
                break;
        }
        return $token;
    }

    private function readString()
    {
        $token = $this->createToken('STRING');
        $this->pop();
        $value = '';
        while (true) {
            $c = $this->peek();
            if ($c === null) {
                throw new LexerError('unexpected end of input, expected end of string', $this->line, $this->column);
            } else if ($c === "'") {
                $this->pop();
                break;
            } else if ($c === '\\') {
                $this->pop();
                $c = $this->peek();
                if ($c === null) {
                    throw new LexerError('unexpected end of input', $this->line, $this->column);
                }
                switch ($c) {
                    case '\\':
                    case "'":
                        $value .= $this->pop();
                        break;
                    case 'n':
                        $this->pop();
                        $value .= "\n";
                        break;
                    case 'r':
                        $this->pop();
                        $value .= "\r";
                        break;
                    case 't':
                        $this->pop();
                        $value .= "\t";
                        break;
                    default:
                        throw new LexerError('undefined escape character: ' + $c, $this->line, $this->column);

                }
            } else {
                $value .= $this->pop();
            }
        }
        $token->value = $value;
        return $token;
    }

    private function readNumber()
    {
        $token = $this->createToken('INT');
        $value = '';
        while (true) {
            $c = $this->peek();
            if ($c === null or !preg_match('/[0-9]/', $c)) {
                break;
            }
            $value .= $this->pop();
        }
        if ($this->peek() === '.') {
            $this->pop();
            $value .= '.';
            $token->type = 'FLOAT';
            while (true) {
                $c = $this->peek();
                if ($c === null or !preg_match('/[0-9]/', $c)) {
                    break;
                }
                $value .= $this->pop();
            }
        }
        $token->value = $value;
        return $token;
    }

    public function readNextToken()
    {
        if ($this->peek() === null) {
            return null;
        }
        if ($this->textMode) {
            $token = $this->createToken('TEXT');
            $text = '';
            while (true) {
                $c = $this->peek();
                if ($c === null) {
                    break;
                } else if ($c === '{') {
                    $this->textMode = false;
                    break;
                } else {
                    $text .= $this->pop();
                }
            }
            $token->value = $text;
            return $token;
        } else {
            $this->skipWhiteSpace();
            $c = $this->peek();
            if ($c === null) {
                return null;
            } else if ($c === "\n") {
                $token = $this->createToken('LINE_FEED');
                $this->pop();
                return $token;
            } else if ($c === "'") {
                return $this->readString();
            } else if (strpos('(){}[].,:', $c) !== false) {
                $token = $this->createToken('PUNCT');
                $token->value = $this->pop();
                if ($c === '{') {
                    $this->nesting++;
                } else if ($c === '}') {
                    $this->nesting--;
                    if ($this->nesting <= 0) {
                        $this->textMode = true;
                    }
                }
                return $token;
            } else if (strpos('+-*/%!<>=|', $c) !== false) {
                return $this->readOperator();
            } else if (strpos('0123456789', $c) !== false) {
                return $this->readNumber();
            } else {
                return $this->readName();
            }
        }
    }

    public function readAllTokens()
    {
        $tokens = [];
        while (true) {
            $token = $this->readNextToken();
            if ($token === null) {
                break;
            }
            $tokens[] = $token;
        }
        $tokens[] = $this->createToken('EOF');
        return $tokens;
    }
}
