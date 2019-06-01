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
    const NOT_ALLOWED = 'NOT_ALLOWED';
    const NOT_SUPPORTED = 'NOT_SUPPORTED';
    const NOT_READABLE = 'NOT_READABLE';
    const NOT_WRITABLE = 'NOT_WRITABLE';
    const DEST_INSIDE_SRC = 'DEST_INSIDE_SRC';
    const DEST_EXISTS = 'DEST_EXISTS';
    const NOT_A_DIRECTORY = 'NOT_A_DIRECTORY';
    const COPY_FAILED = 'COPY_FAILED';
    const MOVE_FAILED = 'MOVE_FAILED';
    const NOT_FOUND = 'NOT_FOUND';
    const NOT_EMPTY = 'NOT_EMPTY';
    const DELETE_FAILED = 'DELETE_FAILED';
    const READ_FAILED = 'READ_FAILED';
    const SYNTAX_ERROR = 'SYNTAX_ERROR';

    protected $errorType;

    protected $context;

    public function __construct($errorType, $message, array $context = [])
    {
        parent::__construct(\Jivoo\Log\Logger::interpolate($message, $context));
        $this->errorType = $errorType;
        $this->context = $context;
    }

    public function getErrorType()
    {
        return $this->errorType;
    }

    public function getContext()
    {
        return $this->context;
    }

    public function toArray()
    {
        return [
            'errorType' => $this->getErrorType(),
            'message' => $this->getMessage(),
            'context' => $this->getContext(),
        ];
    }
}
