<?php

chdir(dirname(__FILE__));

require 'vendor/autoload.php';

$main = new Blogstep\Main('user');

// Development configuration:
//$main->config['debug.showExceptions'] = true;
//$main->config['debug.logLevel'] = \Psr\Log\LogLevel::DEBUG;

$main->run();