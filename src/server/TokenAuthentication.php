<?php
// TEXTSTEP
// Copyright (c) 2019 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep;

/**
 * Token authentication.
 */
class TokenAuthentication implements \Jivoo\Security\Authentication
{
    
    /**
     * @var \Psr\Http\Message\ServerRequestInterface
     */
    private $request;
    
    /**
     * Name of header.
     *
     * @var string
     */
    public $header = 'X-Auth-Token';

    /**
     * Name of query parameter.
     *
     * @var string
     */
    public $query = 'access_token';
    
    /**
     * @var string
     */
    private $sessionId = null;
    
    /**
     * Construct session authentication object.
     *
     * @param \Psr\Http\Message\ServerRequestInterface $request Request.
     */
    public function __construct(\Psr\Http\Message\ServerRequestInterface $request)
    {
        $this->request = $request;
    }
    
    /**
     * {@inheritdoc}
     */
    public function authenticate($data, \Jivoo\Security\UserModel $userModel)
    {
        if ($this->request->hasHeader($this->header)) {
            $sessionId = $this->request->getHeaderLine($this->header);
        } elseif (array_key_exists($this->query, $this->request->getQueryParams())) {
            $sessionId = $this->request->getQueryParams()[$this->query];
        } else {
            return null;
        }
        $user = $userModel->openSession($sessionId);
        if ($user) {
            $this->sessionId = $sessionId;
            return $user;
        }
        return null;
    }

    public function getSessionId()
    {
        return $this->sessionId;
    }

    /**
     * {@inheritdoc}
     */
    public function deauthenticate($userData, \Jivoo\Security\UserModel $userModel)
    {
        $userModel->deleteSession($this->sessionId);
    }
    
    /**
     * {@inheritdoc}
     */
    public function create($user, \Jivoo\Security\UserModel $userModel)
    {
        return false;
    }
}
