<?php
// TEXTSTEP 
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Snippets;

class Manifest extends \Blogstep\Snippet
{
    
    public function get()
    {
        return $this->render('manifest.json');
    }
}
