<?php

chdir(dirname(__FILE__));

require 'vendor/autoload.php';

$main = new Blogstep\Main('dist', 'user', 'system');

// Development configuration:
//$main->config['log.showExceptions'] = true;
//$main->config['log.level'] = \Psr\Log\LogLevel::DEBUG;

$main->run();
