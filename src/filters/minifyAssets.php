<?php
/* 
 * BlogSTEP 
 * Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

use Blogstep\Compile\TemplateCompiler;
use Blogstep\Files\File;
use Jivoo\Utilities;

$filter = new Filter();

$filter->file = function(File $file, TemplateCompiler $compiler) {
    $ext = Utilities::getFileExtension($file->getName());
    $destName = preg_replace('/\.[^\.]+$/', '.min.' . $ext, $file->getName());
    $destFile = $file->getParent()->get($destName);
    switch ($ext) {
        case 'js':
            $minifier = new MatthiasMullie\Minify\JS($file->getHostPath());
            $minifier->minify($destFile->getHostPath());
            return $destFile;
        case 'css':
            $minifier = new MatthiasMullie\Minify\CSS($file->getHostPath());
            $minifier->minify($destFile->getHostPath());
            Return $destFile;
    }
    return $file;
};

return $filter;