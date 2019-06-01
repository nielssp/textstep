<?php
// TEXTSTEP 
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Api;

class Storage extends \Blogstep\AuthenticatedSnippet
{
    public function get()
    {
        if (!isset($this->request->query['path'])) {
            return $this->error('Missing parameter: "path"');
        }
        $path = $this->request->query['path'];
        $fs = $this->m->files->get($path);
        $storage = $fs->openStorage(false);
        if (isset($this->request->query['key'])) {
            $key = $this->request->query['key'];
            $document = $storage->getDocument($key);
        } else {
            $document = $storage->getDocuments();
        }
        $storage->close();
        return $this->json($document);
    }

    public function put($data)
    {
        if (!isset($this->request->query['path'])) {
            return $this->error('Missing parameter: "path"');
        }
        if (!isset($this->request->query['key'])) {
            return $this->error('Missing parameter: "key"');
        }
        $path = $this->request->query['path'];
        $key = $this->request->query['key'];
        $fs = $this->m->files->get($path);
        $storage = $fs->openStorage(true);
        $storage->updateDocument($key, $data);
        $document = $storage->getDocument($key);
        $storage->close();
        return $this->json($document);
    }

    public function post($data)
    {
        return $this->put($data);
    }

    public function delete($data)
    {
        if (!isset($this->request->query['path'])) {
            return $this->error('Missing parameter: "path"');
        }
        if (!isset($this->request->query['key'])) {
            return $this->error('Missing parameter: "key"');
        }
        $path = $this->request->query['path'];
        $key = $this->request->query['key'];
        $fs = $this->m->files->get($path);
        $storage = $fs->openStorage(true);
        $storage->deleteDocument($key);
        $storage->close();
        return $this->ok();
    }
}
