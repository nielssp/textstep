<?php
/* 
 * BlogSTEP 
 * Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

use Blogstep\Compile\View;

$filter = new \Blogstep\Compile\Filter();

$filter['img'] = function(View $view, $attr, $enabled, $maxWidth = 640, $maxHeight = 480, $quality = 100, $linkFull = true) {
    if (!$enabled) {
        return View::html('img', $attr);
    }
    if (!extension_loaded('gd')) {
        trigger_error('img: missing extension: gd', E_USER_WARNING);
        return;
    }
    $reloadDom = false;
    $src = $attr['src'];
    if (Jivoo\Unicode::startsWith($src, 'bs:')) {
        $path = preg_replace('/^bs:\/?/', '', $src);
        $siteNode = $view->assembler->getSiteMap()->get($path);
        if ($siteNode['handler'] === 'copy') {
            $file = $view->assembler->getBuildDir()->get($siteNode['data'][0]);
        }
    }
    if (!isset($file)) {
        trigger_error('img: could not find: ' . $src, E_USER_NOTICE);
        return;
    }
    $src = $file->getHostPath();
    $type = getimagesize($src);
    if ($type === false) {
        trigger_error('img: could not read: ' . $src, E_USER_NOTICE);
    }
    $width = $type[0];
    $height = $type[1];
    $prefix = '';
    $suffix = '';
    if ($width > $maxWidth or $height > $maxHeight or isset($attr['width']) or isset($attr['height'])) {
        if (isset($attr['width']) and isset($attr['height'])) {
            $requestedWidth = $attr['width'];
            $requestedHeight = $attr['height'];
        } elseif (isset($attr['width'])) {
            $requestedWidth = $attr['width'];
            $requestedHeight = floor($requestedWidth * $height / $width);
        } elseif (isset($attr['height'])) {
            $requestedHeight = $attr['height'];
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
        $destName = preg_replace('/\.[^\.]+$/', '.' . $targetWidth . 'x' . $targetHeight . 'q' . $quality . '.' . $destType, $file->getName());
        $destDir = $view->assembler->getBuildDir()->get('.' . $file->getParent()->getPath());
        $destDir->makeDirectory(true);
        $destFile = $destDir->get($destName);
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
                $func($resized, $destFile->getHostPath());
                imagedestroy($resized);
                imagedestroy($image);
            } elseif ($image === false) {
                trigger_error('img: could not read: ' . $src, E_USER_NOTICE);
            }
        }
        if ($destFile->exists() and $destFile->getSize() <= $file->getSize()) {
            $newPath = preg_replace('/\/[^\/]+$/', '/' . $destName, $path);
            $view->assembler->getSiteMap()->add($newPath, 'copy', [$destFile->getPath()]);
            $attr['src'] = 'bs:' . $newPath;
        }
        $attr['width'] = $targetWidth;
        $attr['height'] = $targetHeight;
        if ($linkFull) {
            $prefix = '<a href="bs:' . \Jivoo\View\Html::h($path) . '">';
            $suffix = '</a>';
            $reloadDom = true;
        }
    } else {
        $attr['width'] = $width;
        $attr['height'] = $height;
    }
    return $prefix . View::html('img', $attr) . $suffix;
};

return $filter;
