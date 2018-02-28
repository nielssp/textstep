<?php
/* 
 * BlogSTEP 
 * Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

use Blogstep\Compile\Filter;
use Blogstep\Compile\TemplateCompiler;
use Blogstep\Files\File;
use Jivoo\Utilities;
use MatthiasMullie\Minify\CSS;
use MatthiasMullie\Minify\JS;

$filter = new Filter();

$filter->file = function(TemplateCompiler $compiler, File $file) {
    $ext = Utilities::getFileExtension($file->getName());
    $destName = preg_replace('/\.[^\.]+$/', '.min.' . $ext, $file->getName());
    $destDir = $compiler->buildDir->get('.' . $file->getParent()->getPath());
    $destDir->makeDirectory(true);
    $destFile = $destDir->get($destName);
    switch ($ext) {
        case 'js':
            $minifier = new JS($file->getHostPath());
            $minifier->minify($destFile->getHostPath());
            return $destFile;
        case 'css':
            $minifier = new CSS($file->getHostPath());
            $minifier->minify($destFile->getHostPath());
            return $destFile;
    }
    return $file;
};

return $filter;