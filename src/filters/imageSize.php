<?php
/* 
 * BlogSTEP 
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

use Blogstep\Build\ContentNode;
use Blogstep\Build\View;
use SimpleHtmlDom\simple_html_dom;

return function (View $view, ContentNode $contentNode, simple_html_dom $dom, $maxWidth = 640, $maxHeight = 480, $quality = 100, $linkFull = true) {
    if (!extension_loaded('gd')) {
        trigger_error('imageSize: missing extension: gd', E_USER_WARNING);
        return;
    }
    $reloadDom = false;
    foreach ($dom->find('img') as $element) {
        $src = $element->getAttribute('src');
        if (Jivoo\Unicode::startsWith($src, 'bs:')) {
            $path = preg_replace('/^bs:/', '', $src);
            $link = $view->currentNode->root->get($path);
        } else {
            if (!($view->currentNode instanceof Blogstep\Build\DirNode)) {
                $src = '../' . $src;
            }
            $link = $view->currentNode->get($src);
        }
        if (!isset($link)) {
            trigger_error('imageSize: could not find: ' . $src, E_USER_NOTICE);
            continue;
        }
        $src = $link->getFile()->getRealPath();
        $type = getimagesize($src);
        if ($type === false) {
            trigger_error('imageSize: could not read: ' . $src, E_USER_NOTICE);
        }
        $width = $type[0];
        $height = $type[1];
        if ($width > $maxWidth or $height > $maxHeight) {
            if (isset($element->width) and isset($element->height)) {
                $requestedWidth = $element->width;
                $requestedHeight = $element->height;
            } elseif (isset($element->width)) {
                $requestedWidth = $element->width;
                $requestedHeight = floor($requestedWidth * $height / $width);
            } elseif (isset($element->height)) {
                $requestedHeight = $element->height;
                $requestedWidth = floor($requestedHeight * $width / $height);
            } else {
                $requestedWidth = $width;
                $requestedHeight = $height;
            }
            $ratio = $requestedWidth / $requestedHeight;
            if ($ratio < $maxWidth / $maxHeight) {
                $targetHeight = min($requestedHeight, $maxHeight);
                $targetWidth = floor($targetHeight * $ratio);
            } else {
                $targetWidth = min($requestedWidth, $maxWidth);
                $targetHeight = floor($targetWidth / $ratio);
            }
            $destType = $quality == 100 ? 'png' : 'jpeg';
            $destName = preg_replace('/\.[^\.]+$/', '.' . $targetWidth . 'x' . $targetHeight . 'q' . $quality . '.' . $destType, $link->getName());
            $destFile = $link->getFile()->getParent()->get($destName);
            if (!$destFile->exists()) {
                $image = null;
                switch ($type[2]) {
                    case IMAGETYPE_JPEG:
                        $image = imagecreatefromjpeg($src);
                        break;
                    case IMAGETYPE_PNG:
                        $image = imagecreatefrompng($src);
                        break;
                    case IMAGETYPE_GIF:
                        break;
                    default:
                        trigger_error('imageSize: unsupported format: ' . $src . ' (' . $type[2] . ')', E_USER_NOTICE);
                        break;
                }
                if (isset($image) and $image !== false) {
                    $resized = imagecreatetruecolor($targetWidth, $targetHeight);
                    imagecopyresampled($resized, $image, 0, 0, 0, 0, $targetWidth, $targetHeight, $width, $height);
                    $func = 'image' . $destType;
                    $func($resized, $destFile->getRealPath());
                    imagedestroy($resized);
                    imagedestroy($image);
                } elseif ($image === false) {
                    trigger_error('imageSize: could not read: ' . $src, E_USER_NOTICE);
                }
            }
            if ($destFile->exists() and $destFile->getSize() <= $link->getFile()->getSize()) {
                $destNode = new \Blogstep\Build\FileNode($destFile);
                $link->after($destNode);
                $element->setAttribute('src', 'bs:' . $destNode->getPath());
            }
            $element->setAttribute('width', $targetWidth);
            $element->setAttribute('height', $targetHeight);
            if ($linkFull) {
                $element->outertext = '<a href="bs:' . \Jivoo\View\Html::h($link->getPath()) . '">'
                    . $element->outertext . '</a>';
                $reloadDom = true;
            }
        } else {
            $element->setAttribute('width', $width);
            $element->setAttribute('height', $height);
        }
    }
    if ($reloadDom) {
        $dom->load($dom->__toString(), true, false);
    }
};