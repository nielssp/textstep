<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Files;

/**
 * Abstract key/value storage.
 */
interface Storage
{
    public function close();

    public function getDocuments($filter = null);

    public function updateDocuments($documents);

    public function createDocument($key, $document);

    public function getDocument($key);

    public function updateDocument($key, $document);

    public function deleteDocument($key);
}
