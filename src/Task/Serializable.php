<?php

// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Task;

/**
 */
interface Serializable
{
    public function unserialize(array $serialized, Serializer $serializer);
    
    public function serialize(Serializer $serializer);
}
