<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile\Tsc;

class TemplateModule extends Module
{
    private $compiler;

    public function __construct(\Blogstep\Compile\TemplateCompiler $compiler)
    {
        $this->compiler = $compiler;
    }

    public function embed(array $args, Env $dynamicEnv)
    {
        $template = self::parseArg($args, 0, 'string', false)->toString();
        $data = self::parseArg($args, 1, 'object', true, function () { return new ObjectVal([]); });
        $templateFile = $this->compiler->getBuildDir()
                             ->get($dynamicEnv->get('TEMPLATE')->toString())
                             ->getParent()
                             ->get($template);
        if (!$templateFile->exists()) {
            throw new ArgError('template not found: ' . $template, 0);
        }
        $parsed = $this->compiler->getTemplate($templateFile->getPath());
        $env = $dynamicEnv->openScope();
        foreach ($data->getValue() as $key => $value) {
            $env->let($key, $value);
        }
        $env->let('TEMPLATE', new StringVal($templateFile->getPath()));
        return $this->compiler->getInterpreter()->eval($parsed, $env);
    }

    public function link(array $args, Env $dynamicEnv)
    {
        $link = self::parseArg($args, 0, 'string', true, function () use ($dynamicEnv) {
            return $dynamicEnv->get('PATH');
        })->toString();
        return new StringVal($this->compiler->getLink($link));
    }

    public function url(array $args, Env $dynamicEnv)
    {
        $link = self::parseArg($args, 0, 'string', true, function () use ($dynamicEnv) {
            return $dynamicEnv->get('PATH');
        })->toString();
        return new StringVal($this->compiler->getUrl($link));
    }

    public function read(array $args, Env $dynamicEnv)
    {
        $file = self::parseArg($args, 0, 'string', false)->toString();
        $node = $this->compiler->getSiteMap()->get($file);
        if (!isset($node)) {
            $node = $this->compiler->getInstallMap()->get($file);
        }
        if ($node['handler'] !== 'copy') {
            throw new ArgError('file not found: ' . $file, 0);
        }
        $resource = $this->compiler->getBuildDir()->get($node['data'][0]);
        return new StringVal($resource->getContents());
    }

    private static function expRange($start, $end, $n)
    {
        if ($n == 1) {
            return [$start];
        }
        $nums = [];
        $previous = -1;
        if ($end < $start) {
            $base = pow($start - $end + 1, 1 / ($n - 1));
            for ($i = 0; $i < $n; $i++) {
                $num = max(intval(floor($start + 1 - pow($base, $i))), $end);
                if ($num == $previous) {
                    $num -= 1;
                }
                $nums[] = $num;
                $previous = $num;
            }
        } else {
            $base = pow($end - $start + 1, 1 / ($n - 1));
            for ($i = 0; $i < $n; $i++) {
                $num = min(intval(ceil($start - 1 + pow($base, $i))), $end);
                if ($num == $previous) {
                    $num += 1;
                }
                $nums[] = $num;
                $previous = $num;
            }
        }
        return $nums;
    }

    public function pageList(array $args, Env $dynamicEnv)
    {
        $n = self::parseArg($args, 0, 'int', false)->getValue();
        $page = self::parseArg($args, 1, 'int', true, function () use ($dynamicEnv) {
            return $dynamicEnv->get('PAGE')->get('page');
        })->getValue();
        $pages = self::parseArg($args, 2, 'int', true, function () use ($dynamicEnv) {
            return $dynamicEnv->get('PAGE')->get('pages');
        })->getValue();
        $numbers = [];
        if ($pages <= $n) {
            $numbers = range(1, $pages);
        } elseif ($page === 1) {
            $numbers = self::expRange(1, $pages, $n);
        } elseif ($page === $pages) {
            $numbers = array_reverse(self::expRange($pages, 1, $n));
        } else {
            $middle = min(ceil($n / 2) - 1, $page - 1);
            $right = $n - $middle - 1;
            if ($right > $pages - $page) {
                $right = $pages - $page;
                $middle = $n - $right - 1;
            }
            $numbers = array_merge(
                $middle > 0 ? array_reverse(self::expRange($page - 1, 1, $middle)) : [],
                [$page],
                $right > 0 ? self::expRange($page + 1, $pages, $right) : []
            );
        }
        return Val::from($numbers);
    }

    public function pageLink(array $args, Env $dynamicEnv)
    {
        $page = self::parseArg($args, 0, 'int', false)->getValue();
        $path = self::parseArg($args, 1, 'string', true, function () use ($dynamicEnv) {
            return $dynamicEnv->get('PAGE')->get('path');
        })->toString();
        if ($page === 1) {
            $path = str_replace('%page%', '', $path);
        } else {
            $path = str_replace('%page%', '/page' . $page, $path);
        }
        return new StringVal($this->compiler->getLink($path));
    }

    public function filterContent(array $args, Env $dynamicEnv)
    {
        $object = self::parseArg($args, 0, 'object', false);
        $filters = self::parseArg($args, 1, 'array', true, function () { return new ArrayVal([]); })->getValues();
        $path = $object->get('contentFile')->toString();
        $file = $this->compiler->getBuildDir()->get($path);
        $parameters = [];
        foreach ($filters as $name) {
            $name = $name->toString();
            $paramStart = strpos($name, '(');
            $param = [];
            if ($paramStart !== false) {
                $param = substr($name, $paramStart + 1, -1);
                $name = substr($name, 0, $paramStart);
                $param = \Jivoo\Json::decode('[' . $param . ']');
            }
            $parameters[$name] = $param;
        }
        $content = $file->getContents();
        $content = $this->compiler->getFilterSet()->applyContentFilters($this->compiler, $content, $parameters);
        $content = $this->compiler->getFilterSet()->applyDisplayTags($this->compiler, $content, $parameters);
        return new StringVal($this->compiler->getFilterSet()->applyDisplayFilters($this->compiler, $content, $parameters));
    }
}


