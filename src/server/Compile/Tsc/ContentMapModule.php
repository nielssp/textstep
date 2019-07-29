<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile\Tsc;

class ContentMapModule extends Module
{
    private $contentMap;

    public function __construct(\Blogstep\Compile\ContentMap $contentMap)
    {
        $this->contentMap = $contentMap;
    }

    public function listContent(array $args)
    {
        $prefix = self::parseArg($args, 0, 'string', true, function () { return new StringVal('/'); });
        $options = self::parseArg($args, 1, 'object', true, function () { return new ObjectVal([]); });
        $recursive = !$options->has('recursive') || $option->get('recursive')->isTruthy();
        return new ArrayVal(array_map(function ($node) {
            return Val::from(array_merge($node->metadata, [
                'path' => $node->path,
                'relative_path' => $node->relativePath,
            ]));
        }, $this->contentMap->getAll($prefix->toString(), $recursive)));
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

