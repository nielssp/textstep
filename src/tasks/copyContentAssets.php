<?php
/* 
 * BlogSTEP 
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

use Blogstep\Build\Compiler;
use Blogstep\Build\SiteNode;

$attributes = ['src', 'href'];

return function (SiteNode $node, Compiler $compiler, callable $visitChildren) use ($attributes) {
    if ($node instanceof Blogstep\Build\ContentNode) {
        $origin = $node->getOrigin();
        $dom = $node->getDom();
        foreach ($attributes as $attribute) {
            foreach ($dom->find('[' . $attribute . ']') as $element) {
                if (strpos($element->getAttribute($attribute), ':') === false) {
                    $file = $origin->getParent()->get($element->getAttribute($attribute));
                    $path = 'assets/' . $file->getPath();
                    $assetNode = $node->root->get($path);
                    if (!isset($assetNode)) {
                        $assetNode = new Blogstep\Build\FileNode($file);
                        $node->root->createDescendant($path)->replaceWith($assetNode);
                        $dest = $node->root->getBuildPath()->get($assetNode->getPath());
                        $assetNode->getFile()->copy($dest);
                        $assetNode->setFile($dest);
                    }
                    $element->setAttribute($attribute, 'bs:' . $assetNode->getPath());
                }
            }
        }
    }
    $visitChildren();
};