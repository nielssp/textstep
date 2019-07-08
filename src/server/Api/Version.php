<?php
// TEXTSTEP 
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Api;

class Version extends \Blogstep\Snippet
{

    public function get()
    {
        return $this->json([
            'version' => \Blogstep\Main::VERSION,
        ]);
    }
}

