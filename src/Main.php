<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep;

/**
 * BlogSTEP main class.
 * @property-read \Jivoo\Http\SapiServer $server Server.
 */
class Main implements \Psr\Log\LoggerAwareInterface
{
    
    /**
     * BlogSTEP version.
     */
    const VERSION = '0.1.0';
    
    /**
     * @var \Psr\Log\LoggerInterface
     */
    private $logger;
    
    /**
     * @var \Jivoo\Http\SapiServer
     */
    private $server;
    
    /**
     * @var \Jivoo\Http\Router
     */
    private $router;
    
    /**
     * @var \Jivoo\Http\Route\AssetScheme
     */
    private $assets;
    
    /**
     * @var \Jivoo\Paths
     */
    private $paths;
    
    /**
     * @var \Jivoo\Store\Document
     */
    private $config;
    
    /**
     * @var \Jivoo\Cache\Cache
     */
    private $cache;
    
    /**
     * @var \Jivoo\Store\StateMap
     */
    private $state = null;
    
    /**
     * @var \Jivoo\View\View
     */
    private $view = null;
    
    public function __construct($userPath)
    {
        \Jivoo\Log\ErrorHandler::getInstance()->register();
        
        $this->logger = \Jivoo\Log\ErrorHandler::getInstance()->getLogger();
        
        $userPath = \Jivoo\Utilities::convertPath($userPath);
        $this->paths = new \Jivoo\Paths(getcwd(), $userPath);
        $this->paths->src = dirname(__FILE__);
        $this->paths->user = $userPath;
        
        $this->router = new \Jivoo\Http\Router();
        $this->server = new \Jivoo\Http\SapiServer($this->router);
        
        $this->config = new \Jivoo\Store\Document();
        $userConfig = new \Jivoo\Store\PhpStore($this->p('system/config.php'));
        $this->config['user'] = new \Jivoo\Store\Config($userConfig);
        
        $this->cache = new \Jivoo\Cache\Cache();
    }
    
    public function __get($property)
    {
        switch ($property) {
            case 'config':
            case 'server':
            case 'logger':
            case 'router':
            case 'paths':
            case 'cache':
            case 'state':
                return $this->$property;
        }
        throw new \Jivoo\InvalidPropertyException('Undefined property: ' . $property);
    }

    public function setLogger(\Psr\Log\LoggerInterface $logger)
    {
        $this->logger = $logger;
    }
    
    private function initRoutes()
    {
        $this->router->addScheme($this->assets);
        $this->router->addScheme(new \Jivoo\Http\Route\UrlScheme());
        $this->router->addScheme(new \Jivoo\Http\Route\PathScheme());
        
        $this->router->match('assets/**', 'asset:');
    }
    
    public function p($ipath)
    {
        return $this->paths->p($ipath);
    }

   

    public function run()
    {
        $exceptionHandler = new ExceptionHandler($this);
        $exceptionHandler->register();
        
        // Force output buffering so that error handlers can clear it.
        ob_start();
        
        // Set timezone (required by file logger)
        if (!isset($this->config['i18n']['timeZone'])) {
            $defaultTimeZone = 'UTC';
            \Jivoo\Log\ErrorHandler::detect(function() use($defaultTimeZone) {
                $defaultTimeZone = @date_default_timezone_get();
            });
            $this->config['i18n']['timeZone'] = $defaultTimeZone;
        }
        if (!date_default_timezone_set($this->config['i18n']['timeZone'])) {
            date_default_timezone_set('UTC');
        }
        
        // Add file logger
        if ($this->logger instanceof \Jivoo\Log\Logger) {
            $this->logger->addHandler(new \Jivoo\Log\FileHandler(
                $this->p('system/log/blogstep-' . date('Y-m-d') . '.log'), $this->config['system']->get('logLevel', \Psr\Log\LogLevel::WARNING)
            ));
        }
        
        // Initialize cache system
        if ($this->paths->dirExists('system/cache')) {
            $this->cache->setDefaultProvider(function ($pool) {
                $store = new \Jivoo\Store\SerializedStore($this->p('system/cache/' . $pool . '.s'));
                if ($store->touch()) {
                    return new \Jivoo\Cache\StorePool($store);
                }
                return new \Jivoo\Cache\NullPool();
            });
        }
        
        // Initialize application state system
        $this->state = new \Jivoo\Store\StateMap($this->p('system/state'));
        
        // Initialize assets
        $this->assets = new \Jivoo\Http\Route\AssetScheme($this->p('src/assets'));
        
        // Initialize view
        $this->view = new \Jivoo\View\View($this->assets, $this->router, $this->config['view'], $this->logger);
        
        // Initialize routes
        $this->initRoutes();

        $this->server->listen();
    }

}
