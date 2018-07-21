<?php
// BlogSTEP
// Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile;

/**
 *
 */
class FileSiteMap implements SiteMap
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

    public function add($path, $handler, array $data)
    {
        $this->data[$path] = [
            'handler' => $handler,
            'data' => $data
        ];
    }

    public function get($path)
    {
        if (isset($this->data[$path])) {
            return $this->data[$path];
        }
        return null;
    }

    public function getAll($prefix = '', $recursive = true)
    {
        $result = [];
        $prefixLength = strlen($prefix);
        foreach ($this->data as $key => $value) {
            if ($prefix === '' or strpos($key, $prefix) === 0) {
                if ($recursive or strrpos($key, '/', $prefixLength) === false) {
                    $result[$key] = $value;
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
