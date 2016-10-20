<?php
// BlogSTEP
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Build;

/**
 * Ignore pattern
 */
class IgnorePattern
{
    
    public function __construct($pattern)
    {
        preg_match_all('/\*/');
    }
    
    public function __invoke($path)
    {
        foreach ($this->patterns as $pattern) {
            
        }
    }
}
