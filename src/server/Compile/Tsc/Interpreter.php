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
        if ($boolean) {
            return True::true();
        }
        return NilVal::nil();
    }

    public function eval(Node $node, Env $env)
    {
        $method = 'eval' . $node->type;
        if (method_exists($this, $method)) {
            return $this->$method($node, $env);
        }
        throw new \DomainException('unhandled node type: ' . $node->type);
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
                    throw \DomainException('expected object');
                }
                $object->set($leftSide->children[1]->value, $value);
                break;
            case 'Subscript':
                $object = $this->eval($leftSide->children[0], $env);
                $index = $this->eval($leftSide->children[1], $env);
                if ($object instanceof ObjectVal) {
                    $object->set($index->toString(), $value);
                } else if ($object instanceof ArrayVal) {
                    if (!($index instanceof Int)) {
                        throw \DomainException('expected int');
                    }
                    $object->set($index->getValue(), $value);
                } else {
                    throw \DomainException('not indexable');
                }
                break;
            default:
                throw \RangeException('expression of type ' . $leftSide->type . ' cannot be used as the left side of an assignment');
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
        if (count($elements->getValues()) === 0) {
            if (count($node->children) > 3) {
                return $this->eval($node->children[3], $env);
            }
            return NilVal::nil();
        } else if (count($node->children[0]->children) > 1) {
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
        } else if (count($node->children) > 2) {
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
        return new Func(function (array $args) use ($body, $env, $names) {
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
        switch ($node->value) {
            case '+':
                $right = $this->eval($node->children[1], $env);
                if ($left instanceof IntVal) {
                    if ($right instanceof IntVal) {
                        return new IntVal($left->getValue() + $right->getValue());
                    } else if ($right instanceof FloatVal) {
                        return new FloatVal($left->getValue() + $right->getValue());
                    }
                } else if ($left instanceof FloatVal) {
                    if ($right instanceof IntVal or $right instanceof FloatVal) {
                        return new FloatVal($left->getValue() + $right->getValue());
                    }
                } else if ($left instanceof StringVal) {
                    return new StringVal($left->toString() . $right->toString());
                }
                break;
            case '-':
                $right = $this->eval($node->children[1], $env);
                if ($left instanceof IntVal) {
                    if ($right instanceof IntVal) {
                        return new IntVal($left->getValue() - $right->getValue());
                    } else if ($right instanceof FloatVal) {
                        return new FloatVal($left->getValue() - $right->getValue());
                    }
                } else if ($left instanceof FloatVal) {
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
                    } else if ($right instanceof FloatVal) {
                        return new FloatVal($left->getValue() * $right->getValue());
                    }
                } else if ($left instanceof FloatVal) {
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
                    } else if ($right instanceof FloatVal) {
                        return new FloatVal($left->getValue() / $right->getValue());
                    }
                } else if ($left instanceof FloatVal) {
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
        return \RangeException('invalid operand types');
    }

    public function evalPrefix(Node $node, Env $env)
    {
        $operand = $this->eval($node->children[0], $env);
        switch ($node->value) {
            case '-':
                if ($operand instanceof IntVal) {
                    return new IntVal(-$operand->getValue());
                } else if ($operand instanceof FloatVal) {
                    return new FloatVal(-$operand->getValue());
                }
                break;
            case 'not':
                return $this->boolean(!$operand->isTruthy());
            default:
                throw new \DomainException('unhandled operator: ' + $node->value);
        }
        return \RangeException('invalid operand types');
    }

    public function evalDot(Node $node, Env $env)
    {
        $object = $this->eval($node->children[0], $env);
        if ($object instanceof ObjectVal) {
            $value = $object->get($node->children[1]->value);
            if (!isset($value)) {
                \RangeException('undefined property: ' . $node->children[1]->value);
            }
            return $value;
        }
        return \RangeException('not an object');
    }

    public function evalSubscript(Node $node, Env $env)
    {
        $object = $this->eval($node->children[0], $env);
        $index = $this->eval($node->children[1], $env);
        if ($object instanceof ObjectVal) {
            $value = $object->get($index->toString());
            if (!isset($value)) {
                \RangeException('undefined property: ' . $index->toString());
            }
            return $value;
        }
        if ($object instanceof ArrayVal) {
            if (!($index instanceof IntVal)) {
                return \RangeException('index must be an int');
            } 
            return $object->get($index->getValue());
        }
        return \RangeException('not indexable');
    }

    public function evalApply(Node $node, Env $env)
    {
        $func = $this->eval($node->children[0], $env);
        if (!($func instanceof FuncVal)) {
            throw new \RangeException('not a function');
        }
        $args = [];
        foreach ($node->children[1]->children as $argNode) {
            $args[] = $this->eval($argNode, $env);
        }
        return $func->apply($args, $env);
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
        throw new \RangeException('undefined name: ' . $node->value);
    }
}

