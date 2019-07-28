<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile\Tsc;

class TemplateModule extends Module
{
    private $compiler;
    private $uriPrefix;
    private $absPrefix;

    public function __construct(\Blogstep\Compile\TemplateCompiler2 $compiler)
    {
        $this->compiler = $compiler;
        $this->uriPrefix = rtrim($compiler->getConfig()->get('websiteUri', ''), '/');
        $this->absPrefix = rtrim(parse_url($this->uriPrefix, PHP_URL_PATH), '/');
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
        $env = $this->compiler->getEnv()->openScope();
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
        if (\Jivoo\Unicode::endsWith($link, 'index.html')) {
            $link = preg_replace('/\/index.html$/', '', $link);
        }
        $link = $this->absPrefix . '/' . ltrim($link, '/');
        return new StringVal($link);
    }

    public function url(array $args, Env $dynamicEnv)
    {
        $link = self::parseArg($args, 0, 'string', true, function () use ($dynamicEnv) {
            return $dynamicEnv->get('PATH');
        })->toString();
        if (\Jivoo\Unicode::endsWith($link, 'index.html')) {
            $link = preg_replace('/\/index.html$/', '', $link);
        }
        $link = $this->uriPrefix . '/' . ltrim($link, '/');
        return new StringVal($link);
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
}


