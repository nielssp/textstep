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

    private $parenStack = [];

    private static $keywords = ['if', 'else', 'for', 'in', 'switch', 'case', 'default', 'end', 'fn', 'and', 'or', 'not', 'do'];

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

    private function skipWhiteSpace($skipLf = false)
    {
        $c = $this->peek();
        while ($c === ' ' or $c === "\t" or $c === "\r" or ($skipLf and $c === "\n")) {
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
        $token = $this->createToken('Name');
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
            $token->type = 'Keyword';
        }
        $token->value = $name;
        return $token;
    }

    private function readOperator()
    {
        $token = $this->createToken('Operator');
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

    private function readEscapeSequence($doubleQuote = false)
    {
        $c = $this->peek();
        if ($c === null) {
            throw new LexerError('unexpected end of input', $this->line, $this->column);
        }
        if ($doubleQuote and $c === '{') {
            return $this->pop();
        }
        switch ($c) {
            case '\\':
            case "'":
                return $this->pop();
            case 'n':
                $this->pop();
                return "\n";
            case 'r':
                $this->pop();
                return "\r";
            case 't':
                $this->pop();
                return "\t";
            default:
                throw new LexerError('undefined escape character: ' + $c, $this->line, $this->column);

        }
    }

    private function readString()
    {
        $token = $this->createToken('String');
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
                $value .= $this->readEscapeSequence();
            } else {
                $value .= $this->pop();
            }
        }
        $token->value = $value;
        return $token;
    }

    private function readNumber()
    {
        $token = $this->createToken('Int');
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
            $token->type = 'Float';
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
        $topParen = null;
        if (count($this->parenStack)) {
            $topParen = $this->parenStack[count($this->parenStack) - 1];
        }
        if (!$topParen or $topParen === '"') {
            $token = $this->createToken('Text');
            $text = '';
            while (true) {
                $c = $this->peek();
                if ($c === null) {
                    break;
                } else if ($c === '{') {
                    $this->pop();
                    if ($this->peek() === '#') {
                        $this->pop();
                        while ($this->peek() !== null) {
                            if ($this->pop() === '#') {
                                if ($this->peek() === '}') {
                                    $this->pop();
                                    break;
                                }
                            }
                        }
                    } else {
                        $this->parenStack[] = '{';
                    }
                    break;
                } else if ($topParen === '"' and $c === '\\') {
                    $this->pop();
                    $text .= $this->readEscapeSequence(true);
                } else if ($topParen === '"' and $c === '"') {
                    array_pop($this->parenStack);
                    $this->parenStack[] = '"(end)';
                    break;
                } else {
                    $text .= $this->pop();
                }
            }
            $token->value = $text;
            return $token;
        } else {
            $isCommand = ($topParen === '{' and (count($this->parenStack) === 1 or (count($this->parenStack) > 1 and $this->parenStack[count($this->parenStack) - 2] === '"')));
            $this->skipWhiteSpace(count($this->parenStack) > 1);
            $c = $this->peek();
            if ($c === null) {
                return null;
            } else if ($c === "\n") {
                $token = $this->createToken('LineFeed');
                $this->pop();
                return $token;
            } else if ($c === '}' and $isCommand) {
                $this->pop();
                array_pop($this->parenStack);
                return $this->readNextToken();
            } else if ($c === "'") {
                return $this->readString();
            } else if ($c === '"' and $topParen === '"(end)') {
                $token = $this->createToken('EndQuote');
                $this->pop();
                array_pop($this->parenStack);
                return $token;
            } else if ($c === '"') {
                $token = $this->createToken('StartQuote');
                $this->pop();
                $this->parenStack[] = '"';
                return $token;
            } else if (strpos('([{', $c) !== false) {
                $token = $this->createToken('Punct');
                $token->value = $this->pop();
                if ($c === '{' and $this->peek() === '#') {
                    $this->pop();
                    while ($this->peek() !== null) {
                        if ($this->pop() === '#') {
                            if ($this->peek() === '}') {
                                $this->pop();
                                break;
                            }
                        }
                    }
                    return $this->readNextToken();
                }
                $this->parenStack[] = $token->value;
                return $token;
            } else if (($i = strpos(')]}', $c)) !== false) {
                if (!count($this->parenStack)) {
                    throw new LexerError('unexpected "' . $c . '"', $this->line, $this->column);
                }
                $expected = array_pop($this->parenStack);
                if ('([{'[$i] !== $expected) {
                    throw new LexerError('unexpected "' . $c . '"', $this->line, $this->column);
                }
                $token = $this->createToken('Punct');
                $token->value = $this->pop();
                return $token;
            } else if (strpos('+-*/%!<>=|.,:', $c) !== false) {
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
        $tokens[] = $this->createToken('Eof');
        return $tokens;
    }
}
