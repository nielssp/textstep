<?php
// TEXTSTEP 
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Api;

class Storage extends \Blogstep\AuthenticatedSnippet
{
    protected $jsonBody = true;

    public function get()
    {
        $file = $this->getRequestedFile();
        $storage = $file->openStorage(false);
        if (isset($this->request->query['key'])) {
            $key = $this->request->query['key'];
            $document = $storage->getDocument($key);
        } else if (isset($this->request->query['filter']) and is_array($this->request->query['filter'])) {
            $document = $storage->getDocuments($this->request->query['filter']);
        } else {
            $document = $storage->getDocuments();
        }
        $storage->close();
        return $this->json($document);
    }

    public function put($data)
    {
        $file = $this->getRequestedFile();
        if (!isset($this->request->query['key'])) {
            return $this->error('Missing parameter: "key"');
        }
        $key = $this->request->query['key'];
        $storage = $file->openStorage(true);
        $storage->updateDocument($key, $data);
        $document = $storage->getDocument($key);
        $storage->close();
        return $this->json($document);
    }

    public function post($data)
    {
        $file = $this->getRequestedFile();
        if (!isset($this->request->query['key'])) {
            return $this->error('Missing parameter: "key"');
        }
        $key = $this->request->query['key'];
        $storage = $file->openStorage(true);
        $storage->createDocument($key, $data);
        $document = $storage->getDocument($key);
        $storage->close();
        return $this->json($document);
    }

    public function delete()
    {
        $file = $this->getRequestedFile();
        if (!isset($this->request->query['key'])) {
            return $this->error('Missing parameter: "key"');
        }
        $key = $this->request->query['key'];
        $storage = $file->openStorage(true);
        $storage->deleteDocument($key);
        $storage->close();
        return $this->ok();
    }
}
