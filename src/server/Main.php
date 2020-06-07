<?php
// TEXTSTEP
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep;

/**
 * TEXTSTEP main class.
 */
class Main implements \Psr\Log\LoggerAwareInterface
{

    /**
     * TEXTSTEP version.
     */
    const VERSION = '0.12.0';

    /**
     * @var Modules
     */
    private $m;

    /**
     * @var \Blogstep\Config\DirConfig
     */
    private $config;

    private $initialized = false;

    public function __construct($distPath, $userPath, $systemPath)
    {
        \Jivoo\Log\ErrorHandler::getInstance()->register();

        $this->m = new Modules();
        $this->m->main = $this;

        $distPath = \Jivoo\Utilities::convertPath($distPath);
        $userPath = \Jivoo\Utilities::convertPath($userPath);
        $systemPath = \Jivoo\Utilities::convertPath($systemPath);
        $this->m->paths = new \Jivoo\Paths(getcwd(), $userPath);
        $this->m->paths->src = dirname(dirname(__FILE__));
        $this->m->paths->dist = $distPath;
        $this->m->paths->user = $userPath;
        $this->m->paths->system = $systemPath;

        $this->config = new \Jivoo\Store\Document();
        $this->config['log'] = new \Jivoo\Store\Config(new \Jivoo\Store\PhpStore($this->p('system/log.php')));
        $this->config['log']->setDefault('showExceptions', false);
    }

    public function __get($property)
    {
        switch ($property) {
            case 'config':
            case 'm':
                return $this->$property;
        }
        throw new \Jivoo\InvalidPropertyException('Undefined property: ' . $property);
    }

    public function setLogger(\Psr\Log\LoggerInterface $logger)
    {
        $this->m->logger = $logger;
    }

    private function initRoutes()
    {
        $this->m->router->addScheme(new Route\SnippetScheme($this->m, 'Blogstep\Api'));

        $this->m->router->root('snippet:Version');
        $this->m->router->error('snippet:NotFound');

        $this->m->router->auto('snippet:Session');
        $this->m->router->auto('snippet:WhoAmI');

        $this->m->router->auto('snippet:File');
        $this->m->router->auto('snippet:Content');
        $this->m->router->match('content/*', 'snippet:Content');
        $this->m->router->auto('snippet:Delete');
        $this->m->router->auto('snippet:Copy');
        $this->m->router->auto('snippet:Move');
        $this->m->router->auto('snippet:Storage');
        $this->m->router->auto('snippet:Thumbnail');

        $this->m->router->auto('snippet:Build');
        $this->m->router->auto('snippet:Preview');

        $this->m->router->auto('snippet:Setup');
        $this->m->router->auto('snippet:GenerateTestContent');
    }

    public function p($ipath)
    {
        return $this->m->paths->p($ipath);
    }

    public function init()
    {
        if ($this->initialized) {
            return;
        }

        // Force output buffering so that error handlers can clear it.
        ob_start();

        $this->m->logger = \Jivoo\Log\ErrorHandler::getInstance()->getLogger();
        $exceptionHandler = new ExceptionHandler($this->m);
        $exceptionHandler->register();

        $logConfig = $this->config['log'];
        // Set timezone (required by file logger)
        if (!isset($logConfig['timeZone'])) {
            $defaultTimeZone = 'UTC';
            \Jivoo\Log\ErrorHandler::detect(function () use ($defaultTimeZone) {
                $defaultTimeZone = @date_default_timezone_get();
            });
            $logConfig['timeZone'] = $defaultTimeZone;
        }
        if (!date_default_timezone_set($logConfig['timeZone'])) {
            date_default_timezone_set('UTC');
        }

        // Add file logger
        if ($this->m->logger instanceof \Jivoo\Log\Logger) {
            if ($this->m->paths->dirExists('var/log')) {
                $format = $logConfig->get('fileSuffix', '-Y-m-d');
                $this->m->logger->addHandler(new \Jivoo\Log\FileHandler(
                    $this->p('var/log/system' . date($format) . '.log'),
                    $logConfig->get('level', \Psr\Log\LogLevel::WARNING)
                ));
            }
        }

        $this->m->files = new Files\FileSystem();
        $this->m->files->setAcl(new Files\FileAcl($this->p('system/fileacl.php')));

        // Mount root file system
        $this->m->files->mount(new Files\HostDevice($this->p('user')));

        // Initialize and mount system file system
        $this->m->system = new System\SystemDevice();
        $this->m->files->get('system')->mount($this->m->system);

        // Mount dist file system
        $this->m->files->get('dist')->mount(new Files\HostDevice($this->p('dist')));

        // Mount user-defined file systems
        $this->m->mounts = new Files\MountHandler($this->m->files, $this->p('system/mounts.php'));

        // Initialize authentication system
        $this->m->users = new UserModel($this->m->files, $this->p('system'));

        $this->m->acl = new SystemAcl($this->p('system/sysacl.php'), $this->m->users);

        // Create virtual system files
        $this->m->system->addFile('log.json', new System\ConfigFile($this->p('system/log.php'), $logConfig, 'config.system', $this->m->acl));
        $this->m->system->addFile('users.json', new System\UserFile($this->m->users, $this->m->acl));
        $this->m->system->addFile('groups.json', new System\GroupFile($this->m->users, $this->m->acl));
        $this->m->system->addFile('sessions.json', new System\SessionFile($this->m->users, $this->m->acl));
        $this->m->system->addFile('sysacl.json', new System\SysAclFile($this->m->acl));
        $this->m->system->addFile('timezones.json', new System\TimeZoneFile($this->m->acl));

        $this->m->shell = new Shell($this->m);

        $this->m->router = new BlogstepRouter($this->m->logger);
        $this->m->server = new \Jivoo\Http\SapiServer($this->m->router);
        $this->m->router->add(new \Jivoo\Http\Compressor($this->m->server));
        $this->m->server->add(new \Jivoo\Http\EntityTag);

        // Initialize routes
        $this->initRoutes();

        $this->initialized = true;
    }

    public function run()
    {
        $this->init();
        if (php_sapi_name() === 'cli') {
            // Open shell if running from CLI
            $this->m->shell->run();
        } else {
            // Otherwise prepare to handle a request
            $this->m->server->listen();
        }
    }
}
