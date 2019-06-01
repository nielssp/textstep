<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Files;

use Jivoo\Json;
use Jivoo\JsonException;

class JsonStorage implements Storage {
    private $file;

    private $handle;

    private $writeMode;

    private $dirty = false;

    private $data = null;

    public function __construct($file, $writeMode)
    {
        $this->file = $file;
        $this->handle = @fopen($file, $writeMode ? 'c+' : 'r');
        if (! $this->handle) {
            throw new FileException('Could not open file');
        }
        flock($this->handle, $writeMode ? LOCK_EX : LOCK_SH);
        $this->writeMode = $writeMode;
    }

    public function close()
    {
        if (! isset($this->handle)) {
            return;
        }
        if ($this->dirty) {
            $this->writeData();
        }
        flock($this->handle, LOCK_UN);
        fclose($this->handle);
        $this->handle = null;
    }

    public function getDocuments()
    {
        if (! $this->data) {
            if (! isset($this->handle)) {
                throw new FileException('Invalid handle');
            }
            $content = fread($this->handle, filesize($this->file));
            try {
                $this->data = Json::decode($content);
            } catch (JsonException $e) {
                // TODO log;
                $this->data = [];
            }
        }
        return $this->data;
    }

    private function writeData()
    {
        ftruncate($this->handle, 0);
        rewind($this->handle);
        fwrite($this->handle, Json::prettyPrint($this->data));
        fflush($this->handle);
        $this->dirty = false;
    }

    public function updateDocuments($documents)
    {
        if (! $this->writeMode) {
            throw new FileException('Invalid mode');
        }
        $this->data = $documents;
        $this->dirty = true;
    }

    public function createDocument($key, $document)
    {
        if (! $this->writeMode) {
            throw new FileException('Invalid mode');
        }
        if (! $this->data) {
            $this->getDocuments();
        }
        $this->data[$key] = $document;
        $this->dirty = true;
    }

    public function getDocument($key)
    {
        if (! $this->data) {
            $this->getDocuments();
        }
        if (array_key_exists($key, $this->data)) {
            return $this->data[$key];
        }
        return null;
    }

    public function updateDocument($key, $document)
    {
        $this->createDocument($key, $document);
    }

    public function deleteDocument($key)
    {
        if (! $this->data) {
            $this->getDocuments();
        }
        if (array_key_exists($key, $this->data)) {
            unset($this->data[$key]);
            $this->dirty = true;
        }
    }
}


