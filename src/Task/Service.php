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
    
    /**
     * @var Serializer
     */
    private $serializer;
    
    private $start = 0;
    
    private $max = 5;
    
    private $end = 0;
    
    public function __construct(\Psr\Log\LoggerInterface $logger, \Jivoo\Http\ActionRequest $request, \Jivoo\Store\Store $store, \Blogstep\Task\Serializer $serializer)
    {
        $this->logger = $logger;
        $this->request = $request;
        $this->store = $store;
        $this->serializer = $serializer;
    }
    
    public function checkTime()
    {
        return time() < $this->end;
    }
    
    private function put($line)
    {
        echo $line;
        flush();
    }
    
    private function putLine($line)
    {
        $this->put($line . "\n");
    }

    public function run(Task $task, callable $finally = null)
    {
        $state = new \Jivoo\Store\State($this->store, true);
        if (isset($state['_serializer'])) {
            $this->serializer->unserializeAll($state->get('_serializer', []));
        }
        if (isset($state[$task->getName()])) {
            $task->unserialize($state->get($task->getName(), []), $this->serializer);
        }
        $this->serializer->clear();
        $server = $this->request->getServerParams();
        $this->start = $server['REQUEST_TIME'];
        $this->end = $this->start + $this->max;
        header('Content-Type: text/plain');
        header('Cache-Control: no-cache');
        @ini_set('zlib.output_compression', 0);
        @ini_set('implicit_flush', 1);
        while (ob_get_level()) {
            ob_end_clean();
        }
        ob_implicit_flush(true);
        flush();
        if ($task->isDone()) {
            $this->putLine('status: ' . \Jivoo\I18n\I18n::get('Done!'));
            $this->putLine('done:');
            $state->close();
            if (isset($finally)) {
                call_user_func($finally);
            }
            exit;
        }
        while (true) {
            try {
                $task->run([$this, 'checkTime']);
            } catch (\Exception $e) {
                $this->logger->error(
                    \Jivoo\I18n\I18n::get('Task failed: %1', $e->getMessage()), array('exception' => $e)
                );
                $this->putLine('error: ' . $e->getMessage());
                break;
            }
            $status = $task->getStatus();
            if (isset($status)) {
                $this->putLine('status: ' . $status);
            }
            $progress = $task->getProgress();
            if (isset($progress)) {
                $this->putLine('progress: ' . intval($progress));
            }
            if ($task->isDone()) {
                $this->putLine('status: ' . \Jivoo\I18n\I18n::get('Done!'));
                $this->putLine('done:');
                break;
            }
            if (!$this->checkTime()) {
                break;
            }
            flush();
        }
        $state[$task->getName()] = $task->serialize($this->serializer);
        $state['_serializer'] = $this->serializer->serializeAll();
        $state->close();
        if ($task->isDone() and isset($finally)) {
            call_user_func($finally);
        }
        exit;
    }

}
