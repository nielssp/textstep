<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile\Tsc;

class SiteMapModule extends Module
{
    private $siteMap;
    private $filterSet;
    private $root;

    public function __construct(\Blogstep\Compile\SiteMap $siteMap, \Blogstep\Compile\FilterSet $filterSet, \Blogstep\Files\File $root)
    {
        $this->siteMap = $siteMap;
        $this->filterSet = $filterSet;
        $this->root = $root;
    }

    public function addPage(array $args)
    {
        $path = self::parseArg($args, 0, 'string', false)->toString();
        $template = self::parseArg($args, 1, 'string', false)->toString();
        $data = self::parseArg($args, 2, 'object', true, function () { return new ObjectVal([]); });
        $templateFile = $this->root->get($template);
        if (!$templateFile->exists()) {
            throw new ArgError('template not found: ' . $template, 1);
        }
        $this->siteMap->add($path, 'tsc', array_merge($data->encode(), [
            'TEMPLATE' => $templateFile->getPath()
        ]));
        return NilVal::nil();
    }

    private function addStaticFiles(\Blogstep\Files\File $file)
    {
        if ($file->isDirectory()) {
            foreach ($file as $child) {
                $this->addStaticFiles($child);
            }
            return;
        } else if (!$file->exists()) {
            return;
        }
        $path = $file->getRelativePath($this->root);
        $file = $this->filterSet->applyFileFilters($this->siteMap->getFile()->getParent(), $file);
        $this->siteMap->add($path, 'copy', [$file->getPath()]);
    }

    public function addStatic(array $args)
    {
        $path = self::parseArg($args, 0, 'string', false);
        $this->addStaticFiles($this->root->get($path->toString()));
        return NilVal::nil();
    }

    private function addItemPage($path, $template, array $page, $data)
    {
        if ($page['page'] === 1) {
            $path = str_replace('%page%', '', $path);
        } else {
            $path = str_replace('%page%', '/page' . $page['page'], $path);
        }
        $page['count'] = count($page['items']);
        $this->siteMap->add($path, 'tsc', array_merge($data, [
            'TEMPLATE' => $template,
            'PAGE' => $page
        ]));
    }

    public function paginate(array $args)
    {
        $items = self::parseArg($args, 0, 'array', false)->encode();
        $perPage = self::parseArg($args, 1, 'int', false)->getValue();
        $path = self::parseArg($args, 2, 'string', false)->toString();
        $template = self::parseArg($args, 3, 'string', false)->toString();
        $data = self::parseArg($args, 4, 'object', true, function () { return new ObjectVal([]); })->encode();
        $templateFile = $this->root->get($template);
        if (!$templateFile->exists()) {
            throw new ArgError('template not found: ' . $template, 1);
        }
        $template = $templateFile->getPath();
        $length = count($items);
        $numPages = intval(max(ceil($length / $perPage), 1));
        $page = [
            'items' => [],
            'total' => $length,
            'page' => 1,
            'pages' => $numPages,
            'offset' => 0,
            'path' => $path
        ];
        $counter = 0;
        for ($i = 0; $i < $length; $i++) {
            if ($counter >= $perPage) {
                $this->addItemPage($path, $template, $page, $data);
                $page = [
                    'items' => [],
                    'total' => $length,
                    'page' => $page['page'] + 1,
                    'pages' => $numPages,
                    'offset' => $i,
                    'path' => $path
                ];
                $counter = 0;
            }
            $page['items'][] = $items[$i];
            $counter++;
        }
        $this->addItemPage($path, $template, $page, $data);
        return NilVal::nil();
    }
}


