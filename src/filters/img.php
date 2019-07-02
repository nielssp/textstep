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
    $useImageMagick = false;
    if (isset($view->data->config['useImageMagick']) and $view->data->config['useImageMagick']) {
      $useImageMagick = false;
    } else  if (!extension_loaded('gd')) {
        trigger_error('img: missing extension: gd', E_USER_WARNING);
        return;
    }
    $usePngcrush = (isset($view->data->config['usePngcrush']) and $view->data->config['usePngcrush']);
    $preserveLossless = (isset($view->data->config['preserveLossless']) and $view->data->config['preserveLossless']);
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
        if ($preserveLossless or $quality == 100) {
            switch ($type[2]) {
                case IMAGETYPE_JPEG:
                    $destType = 'jeg';
                    break;
                case IMAGETYPE_GIF:
                    $destType = 'gif';
                    break;
                default:
                    $destType = 'png';
                    break;
            }
        } else {
            $destType = 'jpg';
        }
        $destName = preg_replace('/\.[^\.]+$/', '.' . $targetWidth . 'x' . $targetHeight . 'q' . $quality . '.' . $destType, $file->getName());
        $destDir = $view->assembler->getBuildDir()->get('.' . $file->getParent()->getPath());
        $destDir->makeDirectory(true);
        $destFile = $destDir->get($destName);
        if (!$destFile->exists()) {
            if (!$useImageMagick) {
                $image = null;
                switch ($type[2]) {
                    case IMAGETYPE_JPEG:
                        $image = imagecreatefromjpeg($src);
                        break;
                    case IMAGETYPE_PNG:
                        $image = imagecreatefrompng($src);
                        break;
                    case IMAGETYPE_GIF:
                        $image = imagecreatefromgif($src);
                        break;
                    default:
                        trigger_error('img: unsupported format: ' . $src . ' (' . $type[2] . ')', E_USER_NOTICE);
                        break;
                }
                if (isset($image) and $image !== false) {
                    $resized = imagecreatetruecolor($targetWidth, $targetHeight);
                    imagecopyresampled($resized, $image, 0, 0, 0, 0, $targetWidth, $targetHeight, $width, $height);
                    switch ($destType) {
                        case 'jpg':
                            imagejpeg($resized, $destFile->getHostPath(), $quality);
                            break;
                        case 'png':
                            imagepng($resized, $destFile->getHostPath(), 9);
                            break;
                        case 'gif':
                            imagegif($resized, $destFile->getHostPath());
                            break;
                    }
                    imagedestroy($resized);
                    imagedestroy($image);
                } elseif ($image === false) {
                    trigger_error('img: could not read: ' . $src, E_USER_NOTICE);
                }
            } else {
                exec(sprintf(
                    'convert %s -resize %dx%d -quality %d %s',
                    escapeshellarg($src),
                    $targetWidth,
                    $targetHeight,
                    $quality,
                    escapeshellarg($destFile->getHostPath())
                ), $output, $status);
                if ($status !== 0 ) {
                    trigger_error('img: ImageMagick convert failed with status ' . $status . ' for: ' . $src, E_USER_WARNING);
                }
            }
        }
        if ($destFile->exists()) {
            if ($usePngcrush and $destType == 'png') {
                $outName = preg_replace('/\.png$/i', '.c.png', $destFile->getName());
                $crushOut = $destDir->get($outName);
                exec(sprintf(
                    'pngcrush %s %s',
                    escapeshellarg($destFile->getHostPath()),
                    escapeshellarg($crushOut->getHostPath())
                ), $output, $status);
                if ($status === 0 and $crushOut->exists()) {
                    $destFile = $crushOut;
                } else {
                    trigger_error('img: pngcrush failed with status ' . $status . ' for: ' . $destFile->getHostPath(), E_USER_WARNING);
                }
            }
            if ($destFile->getSize() <= $file->getSize()) {
                $newPath = preg_replace('/\/[^\/]+$/', '/' . $destFile->getName(), $path);
                $view->assembler->getInstallMap()->add($newPath, 'copy', [$destFile->getPath()]);
                $attr['src'] = 'bs:' . $newPath;
            }
        }
        $attr['width'] = $targetWidth;
        $attr['height'] = $targetHeight;
        if ($linkFull) {
            $prefix = '<a href="bs:' . \Jivoo\View\Html::h($path) . '">';
            $suffix = '</a>';
        }
    } else {
        $attr['width'] = $width;
        $attr['height'] = $height;
        if ($usePngcrush and $type[2] === IMAGETYPE_PNG) {
            $destName = preg_replace('/\.png$/i', '.c.png', $file->getName());
            $destDir = $view->assembler->getBuildDir()->get('.' . $file->getParent()->getPath());
            $destDir->makeDirectory(true);
            $destFile = $destDir->get($destName);
            if (!$destFile->exists()) {
                exec(sprintf(
                    'pngcrush %s %s',
                    escapeshellarg($src),
                    escapeshellarg($destFile->getHostPath())
                ), $output, $status);
                if ($status !== 0 or !$destFile->exists()) {
                    trigger_error('img: pngcrush failed with status ' . $status . ' for: ' . $src, E_USER_WARNING);
                }
            }
            $newPath = preg_replace('/\/[^\/]+$/', '/' . $file->getName(), $path);
            $view->assembler->getInstallMap()->add($newPath, 'copy', [$destFile->getPath()]);
            $attr['src'] = 'bs:' . $newPath;
        }
    }
    return $prefix . View::html('img', $attr) . $suffix;
};

return $filter;
