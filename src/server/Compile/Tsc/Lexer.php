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

    private $file;

    private $offset = 0;

    private $line = 1;

    private $column = 1;

    private $parenStack = [];

    private static $keywords = ['if', 'else', 'for', 'in', 'switch', 'case', 'default', 'end', 'fn', 'and', 'or', 'not', 'do'];

    public function __construct($input, $file)
    {
        $this->input = $input;
        $this->length = strlen($input);
        $this->file = $file;
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

    private static function utf8Encode($codePoint)
    {
        if ($codePoint < 0x80) {
            return chr($codePoint);
        }
        if ($codePoint > 0x10FFFF) {
            throw new \RangeException('Out of range');
        }
        $bytes = chr(0x80 | ($codePoint & 0x3F));
        $codePoint >>= 6;
        if ($codePoint < 0x20) {
            return chr(0xC0 | $codePoint) . $bytes;
        }
        $bytes = chr(0x80 | ($codePoint & 0x3F)) . $bytes;
        $codePoint >>= 6;
        if ($codePoint < 0x10) {
            return chr(0xE0 | $codePoint) . $bytes;
        }
        $bytes = chr(0x80 | ($codePoint & 0x3F)) . $bytes;
        $codePoint >>= 6;
        return chr(0xF0 | $codePoint) . $bytes;
    }

    private function readEscapeSequence($doubleQuote = false)
    {
        $c = $this->peek();
        if ($c === null) {
            throw new LexerError('unexpected end of input', $this->line, $this->column);
        }
        if ($doubleQuote and ($c === '{' or $c === '}')) {
            return $this->pop();
        }
        switch ($c) {
            case '"':
            case "'":
            case '\\':
            case '/':
                return $this->pop();
            case 'b':
                $this->pop();
                return "\x08";
            case 'f':
                $this->pop();
                return "\f";
            case 'n':
                $this->pop();
                return "\n";
            case 'r':
                $this->pop();
                return "\r";
            case 't':
                $this->pop();
                return "\t";
            case 'x':
                $this->pop();
                $sequence = $this->pop() . $this->pop();
                if (!preg_match('/^[a-fA-F0-9]{2}$/', $sequence)) {
                    throw new LexerError('invalid hexadecimal escape sequence: \x' . $sequence, $this->line, $this->column);
                }
                return chr(hexdec($sequence));
            case 'u':
                $this->pop();
                $sequence = $this->pop() . $this->pop() . $this->pop() . $this->pop();
                if (!preg_match('/^[a-fA-F0-9]{4}$/', $sequence)) {
                    throw new LexerError('invalid unicode escape sequence: \u' . $sequence, $this->line, $this->column);
                }
                return self::utf8Encode(hexdec($sequence));
            case 'U':
                $this->pop();
                $sequence = $this->pop() . $this->pop() . $this->pop() . $this->pop() . $this->pop() . $this->pop() . $this->pop() . $this->pop();
                if (!preg_match('/^[a-fA-F0-9]{8}$/', $sequence)) {
                    throw new LexerError('invalid unicode escape sequence: \U' . $sequence, $this->line, $this->column);
                }
                try {
                return self::utf8Encode(hexdec($sequence));
                } catch (\RangeException $e) {
                    throw new LexerError('unicode codepoint out of range: \U' . $sequence, $this->line, $this->column);
                }
            default:
                throw new LexerError('undefined escape character: ' . $c, $this->line, $this->column);
        }
    }

    private function readVerbatim()
    {
        $token = $this->createToken('String');
        $this->pop();
        $this->pop();
        $this->pop();
        $value = '';
        while (true) {
            $c = $this->peek();
            if ($c === null) {
                throw new LexerError('missing end of string literal, string literal started on line ' . $token->line . ':' . $token->column, $this->line, $this->column);
            } elseif ($c === '"' and substr_compare($this->input, '"""', $this->offset, 3) === 0) {
                $this->pop();
                $this->pop();
                $this->pop();
                break;
            }
            $value .= $this->pop();
        }
        $token->value = $value;
        return $token;
    }

    private function readString()
    {
        $token = $this->createToken('String');
        $this->pop();
        $value = '';
        while (true) {
            $c = $this->peek();
            if ($c === null) {
                throw new LexerError('missing end of string literal, string literal started on line ' . $token->line . ':' . $token->column, $this->line, $this->column);
            } elseif ($c === "'") {
                $this->pop();
                break;
            } elseif ($c === '\\') {
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
        if (in_array($this->peek(), ['.', 'e', 'E'])) {
            $token->type = 'Float';
            if ($this->peek() === '.') {
                $value .= $this->pop();
                while (true) {
                    $c = $this->peek();
                    if ($c === null or !preg_match('/[0-9]/', $c)) {
                        break;
                    }
                    $value .= $this->pop();
                }
            }
            if ($this->peek() !== '.') {
                $value .= $this->pop();
                if (in_array($this->peek(), ['+', '-'])) {
                    $value .= $this->pop();
                }
                while (true) {
                    $c = $this->peek();
                    if ($c === null or !preg_match('/[0-9]/', $c)) {
                        break;
                    }
                    $value .= $this->pop();
                }
            }
            $token->value = floatval($value);
        } else {
            $token->value = intval($value);
        }
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
                } elseif ($c === '{') {
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
                } elseif ($topParen === '"' and $c === '\\') {
                    $this->pop();
                    $text .= $this->readEscapeSequence(true);
                } elseif ($topParen === '"' and $c === '"') {
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
            } elseif ($c === "\n") {
                $token = $this->createToken('LineFeed');
                $this->pop();
                return $token;
            } elseif ($c === '}' and $isCommand) {
                $this->pop();
                array_pop($this->parenStack);
                return $this->readNextToken();
            } elseif ($c === "'") {
                return $this->readString();
            } elseif ($c === '"' and $topParen === '"(end)') {
                $token = $this->createToken('EndQuote');
                $this->pop();
                array_pop($this->parenStack);
                return $token;
            } elseif ($c === '"') {
                if (substr_compare($this->input, '"""', $this->offset, 3) === 0) {
                    return $this->readVerbatim();
                } else {
                    $token = $this->createToken('StartQuote');
                    $this->pop();
                    $this->parenStack[] = '"';
                    return $token;
                }
            } elseif (strpos('([{', $c) !== false) {
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
            } elseif (($i = strpos(')]}', $c)) !== false) {
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
            } elseif (strpos('+-*/%!<>=|.,:', $c) !== false) {
                return $this->readOperator();
            } elseif (strpos('0123456789', $c) !== false) {
                return $this->readNumber();
            } else {
                return $this->readName();
            }
        }
    }

    public function readAllTokens($template = true)
    {
        try {
            $tokens = [];
            if ($template) {
                $this->parenStack = [];
            } else {
                $this->parenStack = ['{'];
            }
            while (true) {
                $token = $this->readNextToken();
                if ($token === null) {
                    break;
                }
                $tokens[] = $token;
            }
            $tokens[] = $this->createToken('Eof');
        } catch (LexerError $e) {
            $e->srcFile = $this->file;
            throw $e;
        }
        return $tokens;
    }
}
