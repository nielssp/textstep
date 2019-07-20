<?php
// BlogSTEP
// Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile;

/**
 *
 */
class FileContentMap implements ContentMap
{
    private $file;

    private $data;

    public function __construct(\Blogstep\Files\File $file)
    {
        $this->file = $file;
        $this->file->makeFile(true);
        try {
            $this->data = \Jivoo\Json::decode($this->file->getContents());
        } catch (\Jivoo\JsonException $e) {
        }
    }

    public function commit()
    {
        $this->file->putContents(\Jivoo\Json::prettyPrint($this->data));
    }

    public function add($path, $data)
    {
        $this->data[$path] = $data;
    }

    public function get($path, $prefix = '/')
    {
        return new Content\ContentNode($this->file->get($path), $this->data[$path], $prefix);
    }

    public function getAll($prefix = '/', $recursive = true)
    {
        $result = [];
        $prefixLength = strlen($prefix);
        foreach ($this->data as $key => $value) {
            if (strpos($key, $prefix) === 0) {
                if ($recursive or strrpos($key, '/', $prefixLength) === false) {
                    $result[] = new Content\ContentNode($this->file->get($key), $value, $prefix);
                }
            }
        }
        return $result;
    }

    public function remove($path)
    {
        unset($this->data[$path]);
    }
}
