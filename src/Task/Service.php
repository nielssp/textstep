<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Task;

/**
 * Task runner service.
 */
class Service
{
    /**
     * @var \Psr\Log\LoggerInterface
     */
    private $logger;
    
    /**
     * @var \Jivoo\Http\ActionRequest
     */
    private $request;
    
    /**
     * @var \Jivoo\Store\Store
     */
    private $store;
    
    public function __construct(\Psr\Log\LoggerInterface $logger, \Jivoo\Http\ActionRequest $request, \Jivoo\Store\Store $store)
    {
        $this->logger = $logger;
        $this->request = $request;
        $this->store = $store;
    }

    public function run(SuspendableTask $task)
    {
        $state = new \Jivoo\Store\State($this->store, true);
        if (isset($state[$task->getName()])) {
            $task->resume($state->get($task->getName(), []));
        }
        $max = 1;
        $server = $this->request->getServerParams();
        $start = $server['REQUEST_TIME'];
        $end = $start + $max;
        header('Content-Type: text/plain');
        header('Cache-Control: no-cache');
        if ($task->isDone()) {
            echo 'status: ' . \Jivoo\I18n\I18n::get('Done!') . "\n";
            echo "done:\n";
            $state->close();
            exit;
        }
        while (true) {
            try {
                $task->run();
            } catch (\Exception $e) {
                $this->logger->error(
                    \Jivoo\I18n\I18n::get('Task failed: %1', $e->getMessage()), array('exception' => $e)
                );
                echo 'error: ' . $e->getMessage() . "\n";
                break;
            }
            $status = $task->getStatus();
            if (isset($status)) {
                echo 'status: ' . $status . "\n";
            }
            $progress = $task->getProgress();
            if (isset($progress)) {
                echo 'progress: ' . intval($progress) . "\n";
            }
            if ($task->isDone()) {
                echo 'status: ' . \Jivoo\I18n\I18n::get('Done!') . "\n";
                echo "done:\n";
                break;
            }
            if (time() >= $end) {
                break;
            }
            ob_flush();
            flush();
        }
        $state[$task->getName()] = $task->suspend();
        $state->close();
        exit;
    }

}
