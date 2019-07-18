# TEXSTEP Template Compiler

## Token grammar

```
tokenStream ::= {text | comment | command}

command ::= commandStart {token | paren | bracket | brace | lf | comment | skip} commandEnd

commandStart = "{"  -- ignored
commandEnd = "}"  -- ignored

comment ::= "{" "#" {any \ "#" "}"} "#" "}"   -- ignored

lf ::= "\n"
skip ::= " " | "\t" | "\r"    -- ignored
skipLf ::= skip | lf         -- ignored

paren ::= "(" {token | paren | bracket | brace | comment | skipLf} ")"
bracket ::= "[" {token | paren | bracket | brace | comment |  skipLf} "]"
brace ::= "{" {token | paren | bracket | brace | comment | skipLf} "}"

quote ::= '"' {quoteText | command} '"'

text ::= {any \ (commandStart | commandEnd)}
quoteText ::= {any \ (commandStart | commandEnd | '"') | "\\" (commandStart | commandEnd | "n" | "r" | "t" | '"' | "\\")}

token ::= keyword
        | operator
        | int
        | float
        | string
        | name

keyword ::= "if" | "else" | "end" | "for" | "in" | "switch" | "case" | "default"
          | "fn" | "do" | "and" | "or" | "not"

operator ::= "." | "," | ":" | "->"
           | "==" | "!=" | "<=" | ">=" | "<" | ">"
           | "=" | "+=" | "-=" | "*=" | "/="
           | "+" | "-" | "*" | "/" | "%"

name ::= (nameStart {nameFollow}) \ keyword

nameStart ::= "a" | ... | "z"
            | "A" | ... | "z"
            | "_"

nameFollow ::= nameStart | digit

digit ::= "0" | ... | "9"

int ::= digit {digit}

float ::= int "." int

string ::= "'" {(any / ("\\" | "'")) | "\\\\" | "\\'" | "\\n" | "\\r" | "\\t"} "'"
```

## Syntax

```
Template ::= {Statements | text}

Block ::= (lf | text) Template (lf | text)
        | text

Statements ::= {lf} [Statement {lf {lf} Statement}] {lf}

Statement ::= If
            | For
            | Switch
            | Assignment
            | Expression

If ::= "if" Expression Block
       {"else" "if" Expression Block}
       ["else" Block] "end" "if"

For ::= "for" name "in" Expression Block
       ["else" Block] "end" "for"

Switch ::= "switch" Expression (lf | {lf} [text])
           {"case" Expression Block}
           ["default" Block] "end" "switch"

Assignment ::= name ("=" | "+=" | "-=" | "*=" | "/=") Expression

Expression ::= "fn" [name {"," name} [","]] "->" Expression
             | "." name {"." name}
             | PipeLine

PipeLine ::= PipeLine "|" name ["(" [Expression {"," Expression} [","]] ")"]
           | LogicalOr

LogicalOr ::= LogicalOr "or" LogicalAnd
            | LogicalAnd

LogicalAnd ::= Logical "and" LogicalNot
             | LogicalNot

LogicalNot ::= "not" LogicalNot
             | Comparison

Comparison ::= Comparison ("<" | ">" | "<=" | ">=" | "==" | "!=") MulDiv
             | MulDiv

MulDiv ::= MulDiv ("*" | "/" | "%") AddSub
         | AddSub

AddSub ::= AddSub ("+" | "-") Negate
         | Negate

Negate ::= "-" Negate
         | ApplyDot

ApplyDot ::= ApplyDot "(" [Expression {"," Expression} [","]] ")"
           | ApplyDot "." name
           | ApplyDot "[" Expression "]"
           | Atom

Key ::= int
      | float
      | string
      | name

Atom ::= "[" [Expression {"," Expression} [","]] "]"
       | "(" Expression ")"
       | "{" [Key ":" Expression {"," Key ":" Expression} [","]] "}"
       | '"' Template '"'
       | "do" Block "end" "do"
       | int
       | float
       | string
       | name
```

### Syntax transformations

```
"." name_1 {"." name_n}
=>
"fn" newName -> newName "." name_1 {"." name_n}
```

```
PipeLine "|" name ["(" [Expression_1 {"," Expression_n} [","]] ")"]
=>
name "(" PipeLine ["," Expression_1 {"," Expression_n}] ")"
```
