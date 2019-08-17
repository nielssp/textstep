<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep;

/**
 * A runtime exception.
 */
class RuntimeException extends \RuntimeException
{
    const INVALID_QUERY = 'INVALID_QUERY';
    const INVALID_BODY = 'INVALID_BODY';
    const INVALID_CREDENTIALS = 'INVALID_CREDENTIALS';

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
