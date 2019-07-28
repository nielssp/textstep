<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile\Tsc;

class TimeModule extends Module
{
    private $timeZone;

    public function __construct(\DateTimeZone $timeZone)
    {
        $this->timeZone = $timeZone;
    }

    public function now()
    {
        return new TimeVal(time());
    }

    public function time(array $args)
    {
        $arg = self::parseArg($args, 0, ['time', 'string', 'int'], false);
        if ($arg instanceof TimeVal) {
            return $arg;
        } elseif ($arg instanceof IntVal) {
            return new TimeVal($arg->getValue());
        }
        return new TimeVal(strtotime($arg->getValue()));
    }

    public function date(array $args)
    {
        $time = $this->time($args);
        $format = self::parseArg($args, 1, 'string', false)->toString();
        $date = new \DateTime('now', $this->timeZone);
        $date->setTimestamp($time->getValue());
        $flen = strlen($format);
        $result = '';
        for ($i = 0; $i < $flen; $i++) {
            if ($format[$i] === '%') {
                $i++;
                if ($i >= $flen) {
                    $result .= '%';
                    break;
                }
                switch ($format[$i]) {
                    case 'a':
                        $result .= $date->format('D');
                        break;
                    case 'A':
                        $result .= $date->format('l');
                        break;
                    case 'b':
                        $result .= $date->format('M');
                        break;
                    case 'B':
                        $result .= $date->format('F');
                        break;
                    case 'C':
                        $result .= substr($date->format('Y'), 0, 2);
                        break;
                    case 'd':
                        $result .= $date->format('d');
                        break;
                    case 'e':
                        $result .= sprintf('%2d', $date->format('j'));
                        break;
                    case 'F':
                        $result .= $date->format('Y-m-d');
                        break;
                    case 'G':
                        $result .= $date->format('o');
                        break;
                    case 'g':
                        $result .= substr($date->format('o'), 2);
                        break;
                    case 'h':
                        $result .= $date->format('M');
                        break;
                    case 'H':
                        $result .= $date->format('H');
                        break;
                    case 'I':
                        $result .= $date->format('h');
                        break;
                    case 'j':
                        $result .= sprintf('%03d', $date->format('z') + 1);
                        break;
                    case 'k':
                        $result .= sprintf('%2d', $date->format('G'));
                        break;
                    case 'l':
                        $result .= sprintf('%2d', $date->format('g'));
                        break;
                    case 'm':
                        $result .= $date->format('m');
                        break;
                    case 'M':
                        $result .= $date->format('i');
                        break;
                    case 'n':
                        $result .= "\n";
                        break;
                    case 'p':
                        $result .= $date->format('A');
                        break;
                    case 'P':
                        $result .= $date->format('a');
                        break;
                    case 's':
                        $result .= $date->format('U');
                        break;
                    case 'S':
                        $result .= $date->format('s');
                        break;
                    case 't':
                        $result .= "\t";
                        break;
                    case 'T':
                        $result .= $date->format('H:i:s');
                        break;
                    case 'u':
                        $result .= $date->format('N');
                        break;
                    case 'V':
                        $result .= sprintf('%02d', $date->format('W'));
                        break;
                    case 'w':
                        $result .= $date->format('w');
                        break;
                    case 'y':
                        $result .= $date->format('y');
                        break;
                    case 'Y':
                        $result .= $date->format('Y');
                        break;
                    case 'z':
                        $result .= $date->format('O');
                        break;
                    case 'Z':
                        $result .= $date->format('T');
                        break;
                    case '%':
                        $result .= '%';
                        break;
                    default:
                        $result .= '%' . $format[$i];
                        break;
                }
            } else {
                $result .= $format[$i];
            }
        }
        return new StringVal($result);
    }

    public function iso8601(array $args)
    {
        $time = $this->time($args);
        $date = new \DateTime('now', $this->timeZone);
        $date->setTimestamp($time->getValue());
        return new StringVal($date->format('c'));
    }
}

