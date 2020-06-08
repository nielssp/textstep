<?php
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

chdir(dirname(__FILE__));

require '../vendor/autoload.php';

$main = new Blogstep\Main('.', '../user', '../system');

// Development configuration:
$main->config['log.showExceptions'] = true;
$main->config['log.level'] = \Psr\Log\LogLevel::DEBUG;

$main->init();

trigger_error('test', E_USER_NOTICE);

$main->m->server->add(function (ServerRequestInterface $request, ResponseInterface $response, callable $next) {
    if ($request->getMethod() === 'OPTIONS') {
        $response = $response->withStatus(\Jivoo\Http\Message\Status::NO_CONTENT);
    } else {
        $response = $next($request, $response);
    }
    return $response
        ->withHeader('Access-Control-Allow-Origin', '*')
        ->withHeader('Access-Control-Allow-Credentials', 'true')
        ->withHeader('Access-Control-Allow-Methods', '*')
        ->withHeader('Access-Control-Allow-Headers', '*');
});

$main->run();
