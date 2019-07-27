<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile\Tsc;

class Interpreter
{

    private function boolean($boolean)
    {
        return TrueVal::from($boolean);
    }

    public function eval(Node $node, Env $env)
    {
        $method = 'eval' . $node->type;
        if (method_exists($this, $method)) {
            return $this->$method($node, $env);
        }
        throw new \DomainException('unhandled node type: ' . $node->type);
    }

    public function typeError($expectedType, Val $value, Node $node)
    {
        return new TypeError('unexpected value of type ' . $value->getType() . ', expected ' . $expectedType, $node);
    }

    public function evalBlock(Node $node, Env $env)
    {
        $env = $env->openScope();
        $output = '';
        foreach ($node->children as $child) {
            $output .= $this->eval($child, $env)->toString();
        }
        return new StringVal($output);
    }

    public function evalAssign(Node $node, Env $env)
    {
        $value = $this->eval($node->children[1], $env);
        $leftSide = $node->children[0];
        switch ($leftSide->type) {
            case 'Name':
                $env->set($leftSide->value, $value);
                break;
            case 'Dot':
                $object = $this->eval($leftSide->children[0], $env);
                if (!($object instanceof ObjectVal)) {
                    throw $this->typeError('object', $object, $leftSide->children[0]);
                }
                $object->set($leftSide->children[1]->value, $value);
                break;
            case 'Subscript':
                $object = $this->eval($leftSide->children[0], $env);
                $index = $this->eval($leftSide->children[1], $env);
                if ($object instanceof ObjectVal) {
                    $object->set($index->toString(), $value);
                } elseif ($object instanceof ArrayVal) {
                    if (!($index instanceof IntVal)) {
                        throw $this->typeError('int', $index, $leftSide->children[1]);
                    }
                    $object->set($index->getValue(), $value);
                } else {
                    return new TypeError('value of type ' . $object->getType() . ' is not subscriptable', $leftSide->children[0]);
                }
                break;
            default:
                throw new TypeError(
                    'expression of type ' . $leftSide->type
                    . ' cannot be used as the left side of an assignment',
                    $leftSide
                );
        }
        return NilVal::nil();
    }

    public function evalSwitch(Node $node, Env $env)
    {
        $value = $this->eval($node->children[0], $env);
        for ($i = 1; $i < count($node->children); $i++) {
            $case = $node->children[$i];
            if ($case->type === 'Default') {
                return $this->eval($case->children[0], $env);
            }
            $caseValue = $this->eval($case->children[0], $env);
            if ($caseValue->equals($value)) {
                return $this->eval($case->children[1], $env);
            }
        }
        return NilVal::nil();
    }

    public function evalFor(Node $node, Env $env)
    {
        $elements = $this->eval($node->children[1], $env);
        $env = $env->openScope();
        $output = '';
        if (!in_array($elements->getType(), ['object', 'array'])) {
            throw new TypeError('value of type ' . $elements->getType() . ' is not iterable', $node->children[1]);
        }
        if (count($elements->getValues()) === 0) {
            if (count($node->children) > 3) {
                return $this->eval($node->children[3], $env);
            }
            return NilVal::nil();
        } elseif (count($node->children[0]->children) > 1) {
            $keyName = $node->children[0]->children[0]->value;
            $valueName = $node->children[0]->children[1]->value;
            foreach ($elements->getEntries() as $entry) {
                $env->set($keyName, $entry[0]);
                $env->set($valueName, $entry[1]);
                $output .= $this->eval($node->children[2], $env)->toString();
            }
        } else {
            $valueName = $node->children[0]->children[0]->value;
            foreach ($elements->getValues() as $value) {
                $env->set($valueName, $value);
                $output .= $this->eval($node->children[2], $env)->toString();
            }
        }
        return new StringVal($output);
    }

    public function evalIf(Node $node, Env $env)
    {
        $cond = $this->eval($node->children[0], $env);
        if ($cond->isTruthy()) {
            return $this->eval($node->children[1], $env);
        } elseif (count($node->children) > 2) {
            return $this->eval($node->children[2], $env);
        } else {
            return NilVal::nil();
        }
    }

    public function evalFn(Node $node, Env $env)
    {
        $names = [];
        foreach ($node->children[0]->children as $param) {
            $names[] = $param->value;
        }
        $body = $node->children[1];
        return new FuncVal(function (array $args) use ($body, $env, $names) {
            $env = $env->openScope();
            for ($i = 0; $i < count($names); $i++) {
                if ($i < count($args)) {
                    $env->set($names[$i], $args[$i]);
                } else {
                    $env->set($names[$i], NilVal::nil());
                }
            }
            return $this->eval($body, $env);
        });
    }

    public function evalInfix(Node $node, Env $env)
    {
        $left = $this->eval($node->children[0], $env);
        $right = null;
        switch ($node->value) {
            case '+':
                $right = $this->eval($node->children[1], $env);
                if ($left instanceof IntVal) {
                    if ($right instanceof IntVal) {
                        return new IntVal($left->getValue() + $right->getValue());
                    } elseif ($right instanceof FloatVal) {
                        return new FloatVal($left->getValue() + $right->getValue());
                    }
                } elseif ($left instanceof FloatVal) {
                    if ($right instanceof IntVal or $right instanceof FloatVal) {
                        return new FloatVal($left->getValue() + $right->getValue());
                    }
                } elseif ($left instanceof StringVal) {
                    return new StringVal($left->toString() . $right->toString());
                } elseif ($left instanceof ArrayVal) {
                    return new ArrayVal(array_merge($left->getValues(), $right->getValues()));
                } elseif ($left instanceof ObjectVal) {
                    return new ObjectVal(array_merge($left->getValues(), $right->getValues()));
                }
                break;
            case '-':
                $right = $this->eval($node->children[1], $env);
                if ($left instanceof IntVal) {
                    if ($right instanceof IntVal) {
                        return new IntVal($left->getValue() - $right->getValue());
                    } elseif ($right instanceof FloatVal) {
                        return new FloatVal($left->getValue() - $right->getValue());
                    }
                } elseif ($left instanceof FloatVal) {
                    if ($right instanceof IntVal or $right instanceof FloatVal) {
                        return new FloatVal($left->getValue() - $right->getValue());
                    }
                }
                break;
            case '*':
                $right = $this->eval($node->children[1], $env);
                if ($left instanceof IntVal) {
                    if ($right instanceof IntVal) {
                        return new IntVal($left->getValue() * $right->getValue());
                    } elseif ($right instanceof FloatVal) {
                        return new FloatVal($left->getValue() * $right->getValue());
                    }
                } elseif ($left instanceof FloatVal) {
                    if ($right instanceof IntVal or $right instanceof FloatVal) {
                        return new FloatVal($left->getValue() * $right->getValue());
                    }
                }
                break;
            case '/':
                $right = $this->eval($node->children[1], $env);
                if ($left instanceof IntVal) {
                    if ($right instanceof IntVal) {
                        return new IntVal(intval($left->getValue() / $right->getValue()));
                    } elseif ($right instanceof FloatVal) {
                        return new FloatVal($left->getValue() / $right->getValue());
                    }
                } elseif ($left instanceof FloatVal) {
                    if ($right instanceof IntVal or $right instanceof FloatVal) {
                        return new FloatVal($left->getValue() / $right->getValue());
                    }
                }
                break;
            case '%':
                $right = $this->eval($node->children[1], $env);
                if ($left instanceof IntVal and $right instanceof IntVal) {
                    return new IntVal(intval($left->getValue() % $right->getValue()));
                }
                break;
            case '==':
                $right = $this->eval($node->children[1], $env);
                return $this->boolean($left->equals($right));
            case '!=':
                $right = $this->eval($node->children[1], $env);
                return $this->boolean(!$left->equals($right));
            case '<':
                $right = $this->eval($node->children[1], $env);
                if (($left instanceof IntVal or $left instanceof FloatVal) and
                    ($right instanceof IntVal or $right instanceof FloatVal)) {
                    return $this->boolean($left->getValue() < $right->getValue());
                }
                break;
            case '>':
                $right = $this->eval($node->children[1], $env);
                if (($left instanceof IntVal or $left instanceof FloatVal) and
                    ($right instanceof IntVal or $right instanceof FloatVal)) {
                    return $this->boolean($left->getValue() > $right->getValue());
                }
                break;
            case '<=':
                $right = $this->eval($node->children[1], $env);
                if (($left instanceof IntVal or $left instanceof FloatVal) and
                    ($right instanceof IntVal or $right instanceof FloatVal)) {
                    return $this->boolean($left->getValue() <= $right->getValue());
                }
                break;
            case '>=':
                $right = $this->eval($node->children[1], $env);
                if (($left instanceof IntVal or $left instanceof FloatVal) and
                    ($right instanceof IntVal or $right instanceof FloatVal)) {
                    return $this->boolean($left->getValue() >= $right->getValue());
                }
                break;
            case 'and':
                if ($left->isTruthy()) {
                    return $this->eval($node->children[1], $env);
                }
                return $left;
            case 'or':
                if ($left->isTruthy()) {
                    return $left;
                }
                return $this->eval($node->children[1], $env);
            default:
                throw new \DomainException('unhandled operator: ' + $node->value);
        }
        if (isset($right)) {
            throw new TypeError('operator "' . $node->value . '" cannot be applied to operands of type ' . $left->getType() . ' and ' . $right->getType(), $node);
        } else {
            throw new TypeError('operator "' . $node->value . '" cannot be applied to operand of type ' . $left->getType(), $node);
        }
    }

    public function evalPrefix(Node $node, Env $env)
    {
        $operand = $this->eval($node->children[0], $env);
        switch ($node->value) {
            case '-':
                if ($operand instanceof IntVal) {
                    return new IntVal(-$operand->getValue());
                } elseif ($operand instanceof FloatVal) {
                    return new FloatVal(-$operand->getValue());
                }
                break;
            case 'not':
                return $this->boolean(!$operand->isTruthy());
            default:
                throw new \DomainException('unhandled operator: ' + $node->value);
        }
        throw new TypeError('operator "' . $node->value . '" cannot be applied to operand of type ' . $operand->getType(), $node);
    }

    public function evalDot(Node $node, Env $env)
    {
        $object = $this->eval($node->children[0], $env);
        if ($object instanceof ObjectVal) {
            $value = $object->get($node->children[1]->value);
            if (!isset($value)) {
                throw new \RangeException('undefined property: ' . $node->children[1]->value);
            }
            return $value;
        }
        throw $this->typeError('object', $object, $node->children[0]);
    }

    public function evalSubscript(Node $node, Env $env)
    {
        $object = $this->eval($node->children[0], $env);
        $index = $this->eval($node->children[1], $env);
        if ($object instanceof ObjectVal) {
            $value = $object->get($index->toString());
            if (!isset($value)) {
                return NilVal::nil();
            }
            return $value;
        }
        if (!($index instanceof IntVal)) {
            throw $this->typeError('int', $index, $node->children[1]);
        }
        if ($object instanceof ArrayVal) {
            return $object->get($index->getValue());
        }
        if ($object instanceof StringVal) {
            return $object->get($index->getValue());
        }
        return new TypeError('value of type ' . $object->getType() . ' is not subscriptable', $node->children[0]);
    }

    public function evalApply(Node $node, Env $env)
    {
        $func = $this->eval($node->children[0], $env);
        if (!($func instanceof FuncVal)) {
            throw $this->typeError('func', $func, $node->children[0]);
        }
        $args = [];
        foreach ($node->children[1]->children as $argNode) {
            $args[] = $this->eval($argNode, $env);
        }
        try {
            return $func->apply($args, $env);
        } catch (ArgError $e) {
            if (isset($e->index) and $e->index < count($node->children[1]->children)) {
                $arg = $node->children[1]->children[$e->index];
                $e->srcFile = $arg->file;
                $e->srcLine = $arg->line;
                $e->srcColumn = $arg->column;
            } else {
                $e->srcFile = $node->file;
                $e->srcLine = $node->line;
                $e->srcColumn = $node->column;
            }
            throw $e;
        }
    }

    public function evalObject(Node $node, Env $env)
    {
        $object = [];
        foreach ($node->children as $child) {
            if ($child->children[0]->type === 'Name') {
                $key = $child->children[0]->value;
            } else {
                $key = $this->eval($child->children[0], $env)->toString();
            }
            $value = $this->eval($child->children[1], $env);
            $object[$key] = $value;
        }
        return new ObjectVal($object);
    }

    public function evalList(Node $node, Env $env)
    {
        $list = [];
        foreach ($node->children as $child) {
            $value = $this->eval($child, $env);
            $list[] = $value;
        }
        return new ArrayVal($list);
    }

    public function evalString(Node $node, Env $env)
    {
        return new StringVal($node->value);
    }

    public function evalInt(Node $node, Env $env)
    {
        return new IntVal(intval($node->value));
    }

    public function evalFloat(Node $node, Env $env)
    {
        return new FloatVal(floatval($node->value));
    }

    public function evalName(Node $node, Env $env)
    {
        $value = $env->get($node->value);
        if (isset($value)) {
            return $value;
        }
        return NilVal::nil();
    }
}
