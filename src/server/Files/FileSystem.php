<?php
// BlogSTEP
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Files;

/**
 * Root file system
 */
class FileSystem extends File implements \Psr\Log\LoggerAwareInterface
{
    /**
     * @var \Blogstep\User
     */
    protected $user;
    
    /**
     * @var \Psr\Log\LoggerInterface
     */
    protected $logger;
    
    /**
     * @var FileAcl
     */
    protected $acl;

    /**
     * @var \Mimey\MimeTypes
     */
    protected $mimeTypes;
    
    public function __construct(\Blogstep\User $user = null)
    {
        parent::__construct($this, [], 'directory');
        $this->mount(new NullDevice());
        $this->user = $user;
        $this->logger = new \Psr\Log\NullLogger();
        $this->mimeTypes = new \Mimey\MimeTypes();
    }

    public function fileNameToMimeType($name)
    {
        return $this->mimeTypes->getMimeType(Utilities::getFileExtension($name));
    }
    
    public function getAuthentication()
    {
        return $this->user;
    }
    
    public function setAuthentication(\Blogstep\User $user)
    {
        $this->user = $user;
    }
    
    public function setAcl(FileAcl $acl)
    {
        $this->acl = $acl;
    }

    public function setLogger(\Psr\Log\LoggerInterface $logger)
    {
        $this->logger = $logger;
    }
}
