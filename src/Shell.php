<?php
// BlogSTEP
// Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep;

use Jivoo\I18n\I18n;
use Jivoo\Log\CallbackHandler;
use Jivoo\Log\ErrorException;
use Jivoo\Log\ErrorHandler;
use Jivoo\Log\Logger;
use Psr\Log\LogLevel;

/**
 * Command-line interface for BLOGSTEP.
 */
class Shell
{

    /**
     * @var string
     */
    private $name;

    /**
     * @var Exception|null
     */
    private $lastError = null;

    /**
     * @var array
     */
    private $options = array();

    protected $availableOptions = array(
        'help' => false
    );

    protected $shortOptions = array(
        'h' => 'help'
    );

    /**
     * @var Modules
     */
    private $m;

    /**
     * @var Files\File
     */
    private $workingDir;


    public function __construct(Modules $modules)
    {
        $this->m = $modules;
        $this->workingDir = $this->m->files;
    }

    public function parseArguments()
    {
        global $argv;
        $this->name = array_shift($argv);

        $command = array();

        $option = null;

        foreach ($argv as $arg) {
            if (preg_match('/^--(.*)$/', $arg, $matches) === 1) {
                $o = $matches[1];
                if ($o == '') {
                    continue;
                }
                if (! isset($this->availableOptions[$o])) {
                    $this->put(I18n::get('Unknown option: %1', '--' . $o));
                    $this->stop();
                }
                if ($this->availableOptions[$o]) {
                    $option = $o;
                } else {
                    $this->options[$o] = true;
                }
            } elseif (preg_match('/^-(.+)$/', $arg, $matches) === 1) {
                $options = $matches[1];
                while ($options != '') {
                    $o = $options[0];
                    if (! isset($this->shortOptions[$o])) {
                        $this->put(I18n::get('Unknown option: %1', '-' . $o));
                        $this->stop();
                    }
                    $options = substr($options, 1);
                    $o = $this->shortOptions[$o];
                    if ($this->availableOptions[$o]) {
                        if ($options == '') {
                            $option = $o;
                        } else {
                            $this->options[$o] = $options;
                        }
                        break;
                    } else {
                        $this->options[$o] = true;
                    }
                }
            } elseif (isset($option)) {
                $this->options[$option] = $arg;
                $option = null;
            } else {
                $command[] = $arg;
            }
        }
        if (isset($this->options['help'])) {
            $this->showHelp();
            exit();
        }
        if (count($command)) {
            $this->evalCommand($command);
            $this->stop();
        }
    }

    public function evalCommand($command)
    {
        if (is_string($command)) {
            $parameters = explode(' ', $command); // TODO: use regex
        } else {
            $parameters = $command;
        }
        $command = array_shift($parameters);
        switch ($command) {
            case 'exit':
                $this->stop();
                break;
            case 'ls':
                foreach ($this->workingDir as $file) {
                    $this->put($file->getName());
                }
                break;
            case 'cd':
                if (count($parameters)) {
                    $this->workingDir = $this->workingDir->get($parameters[0]);
                }
                break;
            case 'pwd':
                $this->put($this->workingDir->getPath());
                break;
            case 'cc':
                $contentMap = new Compile\FileContentMap($this->m->files->get('build/content.json'));
                $siteMap = new Compile\FileSiteMap($this->m->files->get('build/sitemap.json'));
                $filterSet = new Compile\FilterSet();
                $filterSet->addFilters($this->m->main->p('src/filters'));
                $filterSet->addFilters($this->m->files->get('site/filters')->getHostPath());
                $compiler = new Compile\ContentCompiler($this->m->files->get('build'), $siteMap, $contentMap, $filterSet);
                $id = function ($content) { return $content; };
                $compiler->getHandler()->addHandler('html', $id);
                $compiler->getHandler()->addHandler('htm', $id);
                $compiler->getHandler()->addHandler('md', [new \Parsedown(), 'text']);
                $compiler->compile($this->workingDir->get($parameters[0]));
                break;
            case 'tc':
                $contentMap = new Compile\FileContentMap($this->m->files->get('build/content.json'));
                $siteMap = new Compile\FileSiteMap($this->m->files->get('build/sitemap.json'));
                $filterSet = new Compile\FilterSet();
                $filterSet->addFilters($this->m->main->p('src/filters'));
                $filterSet->addFilters($this->m->files->get('site/filters')->getHostPath());
                $compiler = new Compile\TemplateCompiler($this->m->files->get('build'), $siteMap, $contentMap, $filterSet);
                $compiler->compile($this->workingDir->get($parameters[0]));
                break;
            case 'sa':
                $contentMap = new Compile\FileContentMap($this->m->files->get('build/content.json'));
                $siteMap = new Compile\FileSiteMap($this->m->files->get('build/sitemap.json'));
                $contentTree = new \Blogstep\Compile\Content\ContentTree($contentMap, '/content/');
                $filterSet = new Compile\FilterSet();
                $filterSet->addFilters($this->m->main->p('src/filters'));
                $filterSet->addFilters($this->m->files->get('site/filters')->getHostPath());
                $assembler = new Compile\SiteAssembler($this->m->files->get('build'), $siteMap, $contentTree, $filterSet, $this->m->main->config->getSubconfig('system.config'));
                $assembler->assemble($parameters[0]);
                break;
            case 'si':
                $siteMap = new Compile\FileSiteMap($this->m->files->get('build/sitemap.json'));
                $installer = new Compile\SiteInstaller($this->m->files->get('target'), $siteMap);
                $installer->install($parameters[0]);
                break;
            default:
                $this->error('command not found: ' . $command);
        }
    }

    public function autoComplete($command)
    {
        $length = strlen($command);
        $results = array();
        foreach ($this->workingDir as $file) {
            $name = $file->getName();
            if (strncasecmp($command, $name, $length) == 0) {
                $results[] = $name;
            }
        }
        return $results;
    }

    public function showTrace()
    {
        if (! isset($this->lastError)) {
            return;
        }
        self::dumpException($this->lastError);
    }

    public static function dumpException($exception, $stream = STDERR)
    {
        if ($exception instanceof ErrorException) {
            $title = 'Fatal error (' . ErrorHandler::toString($exception->getSeverity()) . ')';
        } else {
            $title = get_class($exception);
        }
        fwrite(
            $stream,
            $title . ': ' . $exception->getMessage()
                . ' in ' . $exception->getFile() . ':'
                . $exception->getLine() . PHP_EOL . PHP_EOL
        );
        fwrite($stream, 'Stack trace:' . PHP_EOL);
        $trace = $exception->getTrace();
        foreach ($trace as $i => $call) {
            $message = '  ' . sprintf('% 2d', $i) . '. ';
            if (isset($call['file'])) {
                $message .= $call['file'] . ':';
                $message .= $call['line'] . ' ';
            }
            if (isset($call['class'])) {
                $message .= $call['class'] . '::';
            }
            $message .= $call['function'] . '(';
            $arglist = array();
            if (isset($call['args'])) {
                foreach ($call['args'] as $arg) {
                    $arglist[] = (is_scalar($arg) ? var_export($arg, true) : gettype($arg));
                }
                $message .= implode(', ', $arglist);
            }
            $message .= ')' . PHP_EOL;
            fwrite($stream, $message);
        }
        $previous = $exception->getPrevious();
        if (isset($previous)) {
            fwrite($stream, 'Caused by:' . PHP_EOL);
            self::dumpException($previous);
        }
        fflush($stream);
    }

    public function handleException(\Exception $exception)
    {
        $this->lastError = $exception;
        if (isset($this->options['trace'])) {
            $this->error(I18n::get('Uncaught exception'));
            self::dumpException($exception);
        } else {
            $this->error(I18n::get('Uncaught %1: %2', get_class($exception), $exception->getMessage()));
            $this->put();
            $this->put(I18n::get('Call "trace" or run script with the "--trace" option to show stack trace'));
        }
    }

    /**
     * Create a string representation of any PHP value.
     *
     * @param mixed $value
     *            Any value.
     * @return string String representation.
     */
    public function dump($value)
    {
        if (is_object($value)) {
            return get_class($value);
        }
        if (is_resource($value)) {
            return get_resource_type($value);
        }
        return var_export($value, true);
    }

    /**
     * Print a line of text to standard error.
     *
     * @param string $line
     *            Line.
     * @param string $eol
     *            Line ending, set to '' to prevent line break.
     */
    public function error($line, $eol = PHP_EOL)
    {
        fwrite(STDERR, $line . $eol);
        fflush(STDERR);
    }

    /**
     * Print a line of text to standard output.
     *
     * @param string $line
     *            Line.
     * @param string $eol
     *            Line ending, set to '' to prevent line break.
     */
    public function put($line = '', $eol = PHP_EOL)
    {
        echo $line . $eol;
        flush();
        fflush(STDOUT);
    }

    /**
     * Read a line of user input from standard input.
     * Uses {@see readline} if
     * available.
     *
     * @param string $prompt
     *            Optional prompt.
     * @return string User input.
     */
    public function get($prompt = '')
    {
        if (function_exists('readline')) {
            $line = readline($prompt);
            readline_add_history($line);
            return $line;
        }
        $this->put($prompt, '');
        return trim(fgets(STDIN));
    }

    /**
     * Ask for confirmation.
     *
     * @param string $prompt
     *            Question.
     * @param boolean|null $default
     *            Default choice or null for no default.
     * @return boolean True for "yes", false for "no".
     */
    public function confirm($prompt, $default = null)
    {
        $prompt .= ' [';
        $prompt .= $default === true ? 'Y' : 'y';
        $prompt .= '/';
        $prompt .= $default === false ? 'N' : 'n';
        $prompt .= '] ';
        while (true) {
            $input = $this->get(':: ' . $prompt);
            if (! is_string($input)) {
                return false;
            }
            if ($input == '') {
                if (is_bool($default)) {
                    return $default;
                }
                continue;
            }
            $input = strtolower($input);
            if ($input == 'yes' or $input == 'y') {
                return true;
            }
            return false;
        }
    }

    /**
     * Stop shell.
     *
     * @param int $status
     *            Status code, 0 for success.
     */
    public function stop($status = 0)
    {
        exit($status);
    }

    public function run()
    {
        $level = LogLevel::INFO;
        if (isset($this->options['debug'])) {
            $level = LogLevel::DEBUG;
        }
        $this->m->logger->addHandler(new CallbackHandler(function (array $record) {
            $message = Logger::interpolate($record['message'], $record['context']);
            if ($record['level'] != LogLevel::INFO) {
                $message = '[' . $record['level'] . '] ' . $message;
            }
            if (Logger::compare($record['level'], LogLevel::ERROR) >= 0) {
                $this->error($message);
            } else {
                $this->put($message);
            }
        }, $level));
        while (ob_get_level() > 0) {
            ob_end_clean();
        }
        $this->parseArguments();
        if (function_exists('readline_completion_function')) {
            readline_completion_function(array(
                $this,
                'autoComplete'
            ));
        }
        while (true) {
            try {
                $prompt = 'cli ' . $this->workingDir->getPath() . '> ';
                $line = $this->get($prompt);
                if (! is_string($line)) {
                    $this->stop();
                    return;
                }
                if ($line === '') {
                    continue;
                }
                if ($line[0] == '!') {
                    $command = substr($line, 1);
                    if ($command == '') {
                        continue;
                    }
                    if ($command[0] == '=') {
                        $command = substr($command, 1);
                        $this->put(' => ' . $this->dump(eval('return ' . $command . ';')));
                    } else {
                        eval($command);
                    }
                } elseif ($line[0] == '$') {
                    $this->put(' => ' . $this->dump(eval('return ' . $line . ';')));
                } else {
                    $this->evalCommand($line);
                }
            } catch (\Exception $e) {
                $this->handleException($e);
            }
        }
    }
}
