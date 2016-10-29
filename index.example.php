<?php

chdir(dirname(__FILE__));

require 'vendor/autoload.php';

$main = new Blogstep\Main('user');

// Development configuration:
// $main->config['system']['showExceptions'] = true;
// $main->config['system']['logLevel'] = Psr\Log\LogLevel::DEBUG;

$main->run();