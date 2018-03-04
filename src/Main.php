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
    const VERSION = '0.7.0';

    /**
     * @var Modules
     */
    private $m;

    /**
     * @var \Blogstep\Config\DirConfig
     */
    private $config;

    public function __construct($userPath)
    {
        \Jivoo\Log\ErrorHandler::getInstance()->register();

        $this->m = new Modules();
        $this->m->main = $this;

        $this->m->logger = \Jivoo\Log\ErrorHandler::getInstance()->getLogger();

        $userPath = \Jivoo\Utilities::convertPath($userPath);
        $this->m->paths = new \Jivoo\Paths(getcwd(), $userPath);
        $this->m->paths->src = dirname(__FILE__);
        $this->m->paths->user = $userPath;

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
        $this->m->router->addScheme($this->m->snippets);
        $this->m->router->addScheme(new \Jivoo\Http\Route\UrlScheme());
        $this->m->router->addScheme(new \Jivoo\Http\Route\PathScheme());

        $this->m->router->match('assets/**', 'asset:');
        $this->m->router->root('snippet:Workspace');
        $this->m->router->error('snippet:NotFound');
        $this->m->router->match('app/**', 'snippet:Workspace');

        $this->m->router->auto('snippet:Api\Login');
        $this->m->router->auto('snippet:Api\Logout');
        $this->m->router->auto('snippet:Api\ListFiles');
        $this->m->router->auto('snippet:Api\Upload');
        $this->m->router->auto('snippet:Api\Build');
        $this->m->router->auto('snippet:Api\FastBuild');
        $this->m->router->auto('snippet:Api\GenerateTestContent');
        $this->m->router->auto('snippet:Api\Download');
        $this->m->router->match('api/download/*', 'snippet:Api\Download');
        $this->m->router->auto('snippet:Api\Thumbnail');
        $this->m->router->auto('snippet:Api\Load');
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
        $this->m->router->auto('snippet:Api\Make');
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
            $this->m->logger->addHandler(new \Jivoo\Log\FileHandler(
                $this->p('system/log/blogstep-' . date('Y-m-d') . '.log'),
                $sysConfig->get('logLevel', \Psr\Log\LogLevel::WARNING)
            ));
        }

        // Initialize cache system
        if ($this->m->paths->dirExists('system/cache')) {
            $this->m->cache->setDefaultProvider(function ($pool) {
                $store = new \Jivoo\Store\SerializedStore($this->p('system/cache/' . $pool . '.s'));
                if ($store->touch()) {
                    return new \Jivoo\Cache\StorePool($store);
                }
                $this->m->logger->warning('Unable to access cache pool "{pool}" in {dir}', ['pool' => $pool, 'dir' => $this->p('system/cache')]);
                return new \Jivoo\Cache\NullPool();
            });
        }

        // Initialize session
        $session = new \Jivoo\Store\PhpSessionStore();
        $session->name = 'blogstep_session_id';
        $this->m->session = new \Jivoo\Store\Session($session);
        $this->m->token = \Jivoo\Http\Token::create($this->m->session);

        // Initialize authentication system
        $this->m->users = new UserModel($this->m->files, $this->p('system'));

        $this->m->acl = new SystemAcl($this->p('system/sysacl.php'), $this->m->users);

        $this->m->auth = new \Jivoo\Security\Auth($this->m->users);
        $this->m->auth->session = new \Jivoo\Security\Authentication\SessionAuthentication($this->m->session);
        $this->m->auth->cookie = new \Jivoo\Security\Authentication\CookieAuthentication($this->m->cookies);
        $this->m->auth->authenticate(null);

        if (php_sapi_name() === 'cli') {
            // Open shell if running from CLI
            $this->m->shell = new Shell($this->m);
            $this->m->shell->run();
        } else {
            // Otherwise prepare to handle a request

            // Initialize assets
            $this->m->assets = new \Jivoo\Http\Route\AssetScheme($this->p('src/assets'), null, true);

            // Initialize view
            $this->m->view = new \Jivoo\View\View(
                $this->m->assets,
                $this->m->router,
                new \Jivoo\Store\Document($sysConfig->getSubconfig('view')->getData()),
                $this->m->logger
            );
            $this->m->view->addTemplateDir($this->p('src/templates'));

            $this->m->snippets = new Route\SnippetScheme($this->m, 'Blogstep\Snippets');

            // Initialize routes
            $this->initRoutes();

            $this->m->server->listen();
        }
    }
}
