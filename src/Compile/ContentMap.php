<?php
// BlogSTEP
// Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile;

/**
 * Content map.
 */
interface ContentMap
{

  public function add($path, $data);

  public function get($path);

  public function remove($path);

  public function getAll($prefix = '/', $recursive = true);

  public function commit();
}
