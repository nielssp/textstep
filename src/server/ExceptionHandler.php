<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep;

use Jivoo\Http\Message\Response;
use Jivoo\Http\Message\Status;
use Jivoo\Log\ErrorException;
use Jivoo\Log\ErrorHandler;
use Jivoo\Log\Logger;
use Jivoo\Utilities;

/**
 * Handles uncaught exceptions and fatal errors.
 */
class ExceptionHandler
{

    /**
     * @var Modules
     */
    private $m;

    public function __construct(Modules $m)
    {
        $this->m = $m;
        $this->m->required('main');
        $this->m->required('logger');
    }

    /**
     * Output a crash report based on an exception.
     *
     * @param \Exception $exception Exception to create report for.
     * @return string
     */
    public function crashReport($exception)
    {
        $report = '';
        while (isset($exception)) {
            if ($exception instanceof \ErrorException) {
                $report .= 'Fatal error (' . ErrorHandler::toString($exception->getSeverity()) . ')';
            } else {
                $report .= 'Uncaught ' . get_class($exception);
            }
            $report .= sprintf(' in %s:%d: %s', $exception->getFile(), $exception->getLine(), $exception->getMessage());
            $report .= PHP_EOL . 'Stack trace:' . PHP_EOL;
            foreach ($exception->getTrace() as $call) {
                $report .= '    ';
                if (isset($call['file'])) {
                    $report .= $call['file'];
                    if (isset($call['line'])) {
                        $report .= ':' . $call['line'];
                    }
                    $report .= ': ';
                }
                if (isset($call['class'])) {
                    $report .= $call['class'] . '::';
                }
                if (isset($call['function'])) {
                    $report .= $call['function'];
                }
                if (isset($call['args'])) {
                    $report .= '(';
                    foreach ($call['args'] as $j => $arg) {
                        if ($j > 0) {
                            $report .= ', ';
                        }
                        if (is_scalar($arg)) {
                            $report .= substr(var_export($arg, true), 0, 15);
                        } else if (is_object($arg)) {
                            $report .= get_class($arg);
                        } else if (is_array($arg)) {
                            $report .= 'array(' . count($arg) . ')';
                        } else {
                            $report .= gettype($arg);
                        }
                    }
                    $report .= ')';
                }
                $report .= PHP_EOL;
            }
            $exception = $exception->getPrevious();
            if (isset($exception)) {
                $report .= 'Caused by: ';
            }
        }
        $report .= PHP_EOL . 'Log:' . PHP_EOL;
        foreach ($this->m->logger->getLog() as $record) {
            $seconds = (int) $record['time'];
            $millis = floor(($record['time'] - $seconds) * 1000);
            $report .= '    ';
            $report .= date('Y-m-d H:i:s', $seconds) . sprintf('.%03d ', $millis) . date('P');
            $report .= ' [' . $record['level'] . '] ';
            $report .= \Jivoo\Log\Logger::interpolate($record['message'], $record['context']);
            if (isset($record['file'])) {
                $report .= ' in ' . $record['file'];
                if (isset($record['line'])) {
                    $report .= ':' . $record['line'];
                }
            }
            $report .= PHP_EOL;
        }
        return $report;
    }

    /**
     * Handler for uncaught exceptions.
     * @param \Exception $exception The exception.
     * @param bool Whether the exception was generated by a fatal PHP error.
     */
    public function handleError($exception, $fatal = false)
    {
        $this->m->logger->critical(
            'Uncaught exception: ' . $exception->getMessage() . ' in ' . $exception->getFile() . ':' . $exception->getLine(),
            ['exception' => $exception]
        );
        if (headers_sent()) {
            echo 'Uncaught exception: ' . $exception->getMessage();
            exit;
        }
        // Clean the view
        while (ob_get_level() > 0) {
            ob_end_clean();
        }
        if (php_sapi_name() === 'cli') {
            Shell::dumpException($exception);
            exit;
        }
        header('HTTP/1.1 500 Internal Server Error');
        header('Content-Type: text/plain');
        if ($this->m->main->config['system.log.showExceptions']) {
            echo $this->crashReport($exception);
        } else {
            echo 'Internal server error';
        }
        exit;
    }

    /**
     * Handle a fatal PHP error in the same way as uncaught exceptions: By logging
     * the error and presenting an error page.
     */
    public function handleFatalError()
    {
        $error = error_get_last();
        if ($error) {
            switch ($error['type']) {
                case E_ERROR:
                case E_PARSE:
                case E_CORE_ERROR:
                case E_COMPILE_ERROR:
                case E_USER_ERROR:
                    $this->handleError(new ErrorException(
                        $error['message'],
                        0,
                        $error['type'],
                        $error['file'],
                        $error['line']
                    ), true);
            }
        }
    }
    
    public function register()
    {
        set_exception_handler(array($this, 'handleError'));
        register_shutdown_function(array($this, 'handleFatalError'));
    }
}
