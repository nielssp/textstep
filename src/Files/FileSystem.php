<?php
// BlogSTEP
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Files;

/**
 * Description of FileSystemRoot
 */
class FileSystem extends File implements \Psr\Log\LoggerAwareInterface
{
    /**
     * @var \Blogstep\User
     */
    protected $user;
    
    /**
     * @var string
     */
    protected $root;
    
    /**
     * @var \Psr\Log\LoggerInterface
     */
    protected $logger;
    
    /**
     * @var FileAcl
     */
    protected $acl;
    
    public function __construct($rootPath, \Blogstep\User $user = null)
    {
        parent::__construct($this, [], 'directory');
        \Jivoo\Assume::that(is_dir($rootPath));
        $this->root = rtrim($rootPath, '/');
        $this->user = $user;
        $this->logger = new \Psr\Log\NullLogger();
        $this->acl = new FileAcl($this->get('system/fileacl.php')->getRealPath());
    }
    
    public function getAuthentication()
    {
        return $this->user;
    }
    
    public function setAuthentication(\Blogstep\User $user)
    {
        $this->user = $user;
    }

    public function setLogger(\Psr\Log\LoggerInterface $logger)
    {
        $this->logger = $logger;
    }

}
