<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Files;

use Blogstep\RuntimeException;

/**
 * File handling runtime errors.
 */
class FileException extends RuntimeException
{
    const AUTH_ERROR = 100;
    const NOT_READABLE = 101;
    const NOT_WRITABLE = 102;
    
    const COPY_ERROR = 200;
    const MOVE_ERROR = 201;
    const DELETE_ERROR = 202;
    const DESTINATION_EXISTS = 203;
    const NOT_FOUND = 204;
    const NOT_A_DIRECTORY = 205;
    const NOT_EMPTY = 206;
    const DESTINATION_INSIDE_SOURCE = 207;
}
