<?php
// TEXTSTEP 
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Api;

/**
 * File listing.
 */
class File extends \Blogstep\AuthenticatedSnippet
{
    protected $jsonBody = true;
    
    public function get()
    {
        $file = $this->getRequestedFile();
        if ($this->getFlag('list') and $file->isReadable()) {
            return $this->json($file->getDetailed(true));
        }
        return $this->json($file->getBrief(true));
    }

    public function post(array $data)
    {
        $file = $this->getRequestedFile();
        $type = 'file';
        if (isset($data['type'])) {
            $type = $data['type'];
        }
        $recursive = isset($data['recursive']) && $data['recursive'] == 'true';
        if ($type === 'file') {
            if ($file->makeFile($recursive)) {
                return $this->json($file->getBrief());
            }
            return $this->error('File could not be created');
        } elseif ($type === 'directory') {
            if ($file->makeDirectory($recursive)) {
                return $this->json($file->getBrief());
            }
            return $this->error('Directory could not be created');
        } else {
            return $this->error('Invalid file type');
        }
    }

    public function put(array $data)
    {
        $file = $this->getRequestedFile();
        $recursive = isset($data['recursive']) && $data['recursive'] == 'true';
        if (isset($data['permissions']) and is_array($data['permissions'])) {
            $file->setPermissions($data['permissions'], $recursive);
        }
        return $this->json($file->getBrief(true));
    }

    public function delete()
    {
        foreach ($this->getRequestedFiles() as $file) {
            if (!$file->delete()) {
                return $this->error('File could not be deleted: ' . $file->getPath(), \Jivoo\Http\Message\Status::BAD_REQUEST);
            }
        }
        return $this->ok();
    }
}
