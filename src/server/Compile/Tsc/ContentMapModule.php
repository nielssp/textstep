<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile\Tsc;

class ContentMapModule extends Module
{
    private $contentMap;
    private $root;

    public function __construct(\Blogstep\Compile\ContentMap $contentMap, \Blogstep\Files\File $root)
    {
        $this->contentMap = $contentMap;
        $this->root = $root;
    }

    public function listContent(array $args)
    {
        $path = self::parseArg($args, 0, 'string', true, function () { return new StringVal('.'); });
        $options = self::parseArg($args, 1, 'object', true, function () { return new ObjectVal([]); });
        $recursive = !$options->has('recursive') || $option->get('recursive')->isTruthy();
        $suffix = '';
        if ($options->has('suffix')) {
            $suffix = $options->get('suffix')->toString();
        }
        $contentRoot = $this->root->get($path->toString());
        if (!$contentRoot->exists()) {
            throw new ArgError('content root not found: ' . $path->toString(), 0);
        }
        return new ArrayVal(array_map(function ($node) {
            return Val::from(array_merge($node->metadata, [
                'path' => $node->path,
                'relative_path' => $node->relativePath,
            ]));
        }, $this->contentMap->getAll($contentRoot->getPath(), $recursive, $suffix)));
    }

    public function saveContent(array $args)
    {
        $object = self::parseArg($args, 0, 'object', false);
        $path = $object->get('path')->toString();
        $node = $this->contentMap->get($path);
        if (!isset($node)) {
            throw new ArgError('content not found by path: ' . $path, 0);
        }
        $this->contentMap->add($path, $object->encode());
        return NilVal::nil();
    }
}

