<?php
// BlogSTEP
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep;

/**
 * BlogSTEP main class.
 */
class Main implements \Psr\Log\LoggerAwareInterface
{

    /**
     * BlogSTEP version.
     */
    const VERSION = '0.10.0';

    /**
     * @var Modules
     */
    private $m;

    /**
     * @var \Blogstep\Config\DirConfig
     */
    private $config;

    public function __construct($distPath, $userPath, $systemPath)
    {
        \Jivoo\Log\ErrorHandler::getInstance()->register();

        $this->m = new Modules();
        $this->m->main = $this;

        $this->m->logger = \Jivoo\Log\ErrorHandler::getInstance()->getLogger();

        $distPath = \Jivoo\Utilities::convertPath($distPath);
        $userPath = \Jivoo\Utilities::convertPath($userPath);
        $systemPath = \Jivoo\Utilities::convertPath($systemPath);
        $this->m->paths = new \Jivoo\Paths(getcwd(), $userPath);
        $this->m->paths->src = dirname(dirname(__FILE__));
        $this->m->paths->dist = $distPath;
        $this->m->paths->user = $userPath;
        $this->m->paths->system = $systemPath;

        $this->m->cache = new \Jivoo\Cache\Cache();

        $this->m->files = new Files\FileSystem();
        $this->m->files->setAcl(new Files\FileAcl($this->p('system/fileacl.php')));

        $this->config = new Config\DirConfig($this->m->files);

        $this->m->router = new BlogstepRouter();
        $this->m->server = new \Jivoo\Http\SapiServer($this->m->router);
        $this->m->router->add(new \Jivoo\Http\Compressor($this->m->server));
        $this->m->server->add(new \Jivoo\Http\EntityTag);
        $this->m->cookies = $this->m->server->getCookies();
    }

    public function __get($property)
    {
        switch ($property) {
            case 'config':
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
        $this->m->router->addScheme($this->m->assets);
        $this->m->router->addScheme(new Route\SnippetScheme($this->m, 'Blogstep'));
        $this->m->router->addScheme(new \Jivoo\Http\Route\UrlScheme());
        $this->m->router->addScheme(new \Jivoo\Http\Route\PathScheme());

        $this->m->router->match('assets/**', 'asset:');
        $this->m->router->root('snippet:Snippets\Workspace');
        $this->m->router->error('snippet:Snippets\NotFound');
        $this->m->router->match('manifest.json', 'snippet:Snippets\Manifest');

        $this->m->router->auto('snippet:Api\Login');
        $this->m->router->auto('snippet:Api\Logout');
        $this->m->router->auto('snippet:Api\ListFiles');
        $this->m->router->auto('snippet:Api\Upload');
        $this->m->router->auto('snippet:Api\Build');
        $this->m->router->auto('snippet:Api\GenerateTestContent');
        $this->m->router->auto('snippet:Api\Download');
        $this->m->router->match('api/download/*', 'snippet:Api\Download');
        $this->m->router->auto('snippet:Api\Thumbnail');
        $this->m->router->auto('snippet:Api\MakeDir');
        $this->m->router->auto('snippet:Api\MakeFile');
        $this->m->router->auto('snippet:Api\Mount');
        $this->m->router->auto('snippet:Api\Unmount');
        $this->m->router->auto('snippet:Api\Delete');
        $this->m->router->auto('snippet:Api\Write');
        $this->m->router->auto('snippet:Api\Append');
        $this->m->router->auto('snippet:Api\Copy');
        $this->m->router->auto('snippet:Api\Move');
        $this->m->router->auto('snippet:Api\ChangeMode');
        $this->m->router->auto('snippet:Api\ChangeGroup');
        $this->m->router->auto('snippet:Api\ChangeOwner');
        $this->m->router->auto('snippet:Api\WhoAmI');
        $this->m->router->auto('snippet:Api\Setup');
        $this->m->router->auto('snippet:Api\GetConf');
        $this->m->router->auto('snippet:Api\SetConf');
        $this->m->router->auto('snippet:Api\Preview');
        $this->m->router->auto('snippet:Api\Storage');
    }

    public function p($ipath)
    {
        return $this->m->paths->p($ipath);
    }

    public function run()
    {
        $exceptionHandler = new ExceptionHandler($this->m);
        $exceptionHandler->register();

        // Force output buffering so that error handlers can clear it.
        ob_start();

        // Mount file systems
        $this->m->mounts = new Files\MountHandler($this->m->files, $this->p('system/mounts.php'));

        $this->m->system = new System\SystemDevice();
        $this->m->files->get('system')->mount($this->m->system);

        $sysConfig = $this->config->getSubconfig('system.config');

        // Set timezone (required by file logger)
        if (!isset($sysConfig['timeZone'])) {
            $defaultTimeZone = 'UTC';
            \Jivoo\Log\ErrorHandler::detect(function () use ($defaultTimeZone) {
                $defaultTimeZone = @date_default_timezone_get();
            });
            $sysConfig['timeZone'] = $defaultTimeZone;
        }
        if (!date_default_timezone_set($sysConfig['timeZone'])) {
            date_default_timezone_set('UTC');
        }

        // Add file logger
        if ($this->m->logger instanceof \Jivoo\Log\Logger) {
            if ($this->m->paths->dirExists('var/log')) {
                $this->m->logger->addHandler(new \Jivoo\Log\FileHandler(
                    $this->p('var/log/system-' . date('Y-m-d') . '.log'),
                    $sysConfig->get('logLevel', \Psr\Log\LogLevel::WARNING)
                ));
            }
        }

        // Initialize authentication system
        $this->m->users = new UserModel($this->m->files, $this->p('system'));

        $this->m->acl = new SystemAcl($this->p('system/sysacl.php'), $this->m->users);

        $this->m->auth = new \Jivoo\Security\Auth($this->m->users);

        $this->m->system->addFile('users.json', new System\UserFile($this->m->users, $this->m->acl));
        $this->m->system->addFile('sessions.json', new System\SessionFile($this->m->users, $this->m->acl));

        if (php_sapi_name() === 'cli') {
            // Open shell if running from CLI
            $this->m->shell = new Shell($this->m);
            $this->m->shell->run();
        } else {
            // Otherwise prepare to handle a request

            // Initialize assets
            $this->m->assets = new \Jivoo\Http\Route\AssetScheme($this->p('dist'), null, true);

            // Initialize view
            $this->m->view = new View(
                $this->m->assets,
                $this->m->router,
                new \Jivoo\Store\Document($sysConfig->getSubconfig('view')->getData()),
                $this->m->logger
            );
            $this->m->view->addTemplateDir($this->p('src/templates'));

            // Initialize routes
            $this->initRoutes();

            $this->m->server->listen();
        }
    }
}
