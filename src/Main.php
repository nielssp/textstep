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
    const VERSION = '0.3.0';
    
    /**
     * @var Modules
     */
    private $m;
    
    /**
     * @var \Jivoo\Store\Document
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
        
        $this->config = new \Jivoo\Store\Document();
        $userConfig = new \Jivoo\Store\PhpStore($this->p('system/config.php'));
        $this->config['user'] = new \Jivoo\Store\Config($userConfig);
        
        $this->m->cache = new \Jivoo\Cache\Cache();
        
        $this->m->files = new Files\FileSystem($this->p('user'));
        
        $this->m->router = new \Jivoo\Http\Router($this->config['user']['router']);
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
        $this->m->router->root('snippet:Login');
        $this->m->router->error('snippet:NotFound');
        $this->m->router->auto('snippet:Demo');
        $this->m->router->auto('snippet:ControlPanel');
        $this->m->router->auto('snippet:Builder');
        $this->m->router->auto('snippet:Logout');
        $this->m->router->auto('snippet:Terminal');
        $this->m->router->match('open/**', 'snippet:Open');
        $this->m->router->match('edit/**', 'snippet:Editor');
        $this->m->router->match('view/**', 'snippet:Viewer');
        $this->m->router->match('code-edit/**', 'snippet:CodeEditor');
        $this->m->router->match('files/**', 'snippet:Files');
        
        $this->m->router->auto('snippet:Api\ListFiles');
        $this->m->router->auto('snippet:Api\Upload');
        $this->m->router->auto('snippet:Api\Build');
        $this->m->router->auto('snippet:Api\FastBuild');
        $this->m->router->auto('snippet:Api\GenerateTestContent');
        $this->m->router->auto('snippet:Api\Download');
        $this->m->router->auto('snippet:Api\MakeDir');
        $this->m->router->auto('snippet:Api\MakeFile');
        $this->m->router->auto('snippet:Api\Delete');
        $this->m->router->auto('snippet:Api\Edit');
        $this->m->router->auto('snippet:Api\Copy');
        $this->m->router->auto('snippet:Api\Move');
        $this->m->router->auto('snippet:Api\ChangeMode');
        $this->m->router->auto('snippet:Api\ChangeGroup');
        $this->m->router->auto('snippet:Api\ChangeOwner');
        $this->m->router->auto('snippet:Api\WhoAmI');
        $this->m->router->auto('snippet:Api\Setup');
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
        
        // Set timezone (required by file logger)
        if (!isset($this->config['user']['timeZone'])) {
            $defaultTimeZone = 'UTC';
            \Jivoo\Log\ErrorHandler::detect(function () use ($defaultTimeZone) {
                $defaultTimeZone = @date_default_timezone_get();
            });
            $this->config['user']['timeZone'] = $defaultTimeZone;
        }
        if (!date_default_timezone_set($this->config['user']['timeZone'])) {
            date_default_timezone_set('UTC');
        }
        
        // Add file logger
        if ($this->m->logger instanceof \Jivoo\Log\Logger) {
            $this->m->logger->addHandler(new \Jivoo\Log\FileHandler(
                $this->p('system/log/blogstep-' . date('Y-m-d') . '.log'),
                $this->config['system']->get('logLevel', \Psr\Log\LogLevel::WARNING)
            ));
        }
        
        // Initialize cache system
        if ($this->m->paths->dirExists('system/cache')) {
            $this->m->cache->setDefaultProvider(function ($pool) {
                $store = new \Jivoo\Store\SerializedStore($this->p('system/cache/' . $pool . '.s'));
                if ($store->touch()) {
                    return new \Jivoo\Cache\StorePool($store);
                }
                return new \Jivoo\Cache\NullPool();
            });
        }
        
        // Initialize application state system
        $this->m->state = new \Jivoo\Store\StateMap($this->p('system/state'));
        
        // Initialize session
        $session = new \Jivoo\Store\PhpSessionStore();
        $session->name = 'blogstep_session_id';
        $this->m->session = new \Jivoo\Store\Session($session);
        $this->m->token = \Jivoo\Http\Token::create($this->m->cookies);
        
        // Initialize authentication system
        $this->m->users = new UserModel($this->m->files);
        
        $this->m->auth = new \Jivoo\Security\Auth($this->m->users);
        $this->m->auth->session = new \Jivoo\Security\Authentication\SessionAuthentication($this->m->session);
        $this->m->auth->cookie = new \Jivoo\Security\Authentication\CookieAuthentication($this->m->cookies);
        $this->m->auth->authenticate(null);
        
        // Initialize assets
        $this->m->assets = new \Jivoo\Http\Route\AssetScheme($this->p('src/assets'), null, true);
        
        // Initialize view
        $this->m->view = new \Jivoo\View\View($this->m->assets, $this->m->router, $this->config['user']['view'], $this->m->logger);
        $this->m->view->addTemplateDir($this->p('src/templates'));
        
        $this->m->snippets = new Route\SnippetScheme($this->m, 'Blogstep\Snippets');
        
        // Initialize routes
        $this->initRoutes();

        $this->m->server->listen();
    }
}
