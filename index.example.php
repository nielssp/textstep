<?php

chdir(dirname(__FILE__));

require 'vendor/autoload.php';

$main = new Blogstep\Main('user');

$main->config['system']['showExceptions'] = true;

$main->run();