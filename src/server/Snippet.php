<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep;

use Blogstep\Route\SnippetScheme;

/**
 * A loadable snippet.
 */
abstract class Snippet
{
    
    /**
     * @var Modules Module collection.
     */
    protected $m;

    protected $scheme;

    /**
     * @var string[] Names of parameters required by this snippet.
     */
    protected $parameters = array();

    /**
     * @var string Data key.
     */
    protected $dataKey = null;
    
    protected $routeParameters = [];

    /**
     * @var mixed[] Values of required parameters.
     */
    private $parameterValues = array();

    /**
     * @var bool Whether or not to render the layout.
     */
    private $enableLayout = false;

    /**
     * @var array Data for template.
     */
    protected $viewData = array();

    /**
     * @var \Jivoo\Http\ActionRequest
     */
    protected $request = null;
    
    /**
     * @var \Psr\Http\Message\ResponseInterface Current response object.
     */
    protected $response = null;

    protected $tokenAuthentication = null;

    protected $jsonBody = false;

    /**
     * Construct snippet.
     *
     * @param Modules $m Module collection.
     */
    final public function __construct(Modules $m, SnippetScheme $scheme)
    {
        $this->m = $m;
        $this->m->required('assets', 'Jivoo\Http\Route\AssetScheme');
        $this->m->required('router', 'Jivoo\Http\Router');
        $this->m->required('view', 'Blogstep\View');

        $this->scheme = $scheme;

        $this->init();
    }

    /**
     * Snippet initialization, called by constructor.
     */
    protected function init()
    {
        
    }

    /**
     * Get an associated model, helper or data-value (in that order).
     * @param string $name Name of model/helper or key for data-value.
     * @return Model|Helper|mixed Associated value.
     */
    public function __get($name)
    {
        if (array_key_exists($name, $this->parameterValues)) {
            return $this->parameterValues[$name];
        }
        throw new \Jivoo\InvalidPropertyException('Undefined property: ' . $name);
    }

    /**
     * {@inheritdoc}
     */
    public function __isset($name)
    {
        return isset($this->parameterValues[$name]);
    }

    /**
     * Called before invoking.
     * @return \Psr\Http\Message\ResponseInterface|string|null If a response or a string is returned, snippet
     * execution ends.
     */
    public function before()
    {
        return null;
    }

    /**
     * Called after invoking.
     * @param \Psr\Http\Message\ResponseInterface|string $response Respone object.
     * @return \Psr\Http\Message\ResponseInterface|string Response.
     */
    public function after($response)
    {
        return $response;
    }

    /**
     * Respond to a GET request.
     * @return \Psr\Http\Message\ResponseInterface|string A response object or content.
     */
    public function get()
    {
        return $this->render();
    }

    /**
     * Respond to a POST request.
     * @param array $data POST data.
     * @return \Psr\Http\Message\ResponseInterface|string A response object or content.
     */
    public function post(array $data)
    {
        return $this->get();
    }

    /**
     * Respond to a PUT request.
     * @param array $data PUT data.
     * @return \Psr\Http\Message\ResponseInterface|string A response object or content.
     */
    public function put(array $data)
    {
        return $this->get();
    }

    /**
     * Respond to a PATCH request.
     * @param array $data PATCH data.
     * @return \Psr\Http\Message\ResponseInterface|string A response object or content.
     */
    public function patch(array $data)
    {
        return $this->get();
    }

    /**
     * Respond to a GET request.
     * @return \Psr\Http\Message\ResponseInterface|string A response object or content.
     */
    public function delete()
    {
        return $this->get();
    }
    
    protected function query($param, $default = null)
    {
        if (isset($this->request->query[$param]) and is_string($this->request->query[$param])) {
            return $this->request->query[$param];
        }
        return $default;
    }

    /**
     * {@inheritdoc}
     */
    public function __invoke($request, $response, $parameters = array())
    {
        $this->request = $request;
        $this->response = $response;
        $this->routeParameters = $parameters;
        $this->parameterValues = array();
        $this->tokenAuthentication = new TokenAuthentication($this->request);
        $this->m->auth->token = $this->tokenAuthentication;
        $this->m->auth->authenticate(null);
        foreach ($this->parameters as $offset => $name) {
            if (isset($parameters[$name])) {
                $this->parameterValues[$name] = $parameters[$name];
            } elseif (isset($parameters[$offset])) {
                $this->parameterValues[$name] = $parameters[$offset];
            } else {
                $this->parameterValues[$name] = null;
            }
        }
        try {
            $before = $this->before();
            if (isset($before)) {
                return $this->after($before);
            }
            if ($this->request->isGet()) {
                return $this->after($this->get());
            }
            if ($this->jsonBody) {
                $contentType = strtolower($this->request->getHeaderLine('Content-Type'));
                if ($contentType !== 'application/json') {
                    $this->m->logger->info('Invalid content type: {contentType}', ['contentType' => $contentType]);
                    return $this->error('JSON expected', \Jivoo\Http\Message\Status::NOT_ACCEPTABLE);
                }
                try {
                    $length = intval($this->request->getHeaderLine('Content-Length'));
                    $data = \Jivoo\Json::decode($this->request->getBody()->read($length));
                } catch (\Jivoo\JsonException $e) {
                    $this->m->logger->info('Invalid body', ['exception' => $e]);
                    return $this->error('Malformed JSON', \Jivoo\Http\Message\Status::NOT_ACCEPTABLE);
                }
            } else {
                $data = $this->request->data;
            }
            switch ($this->request->method) {
                case 'POST':
                    return $this->after($this->post($data));
                case 'PUT':
                    return $this->after($this->put($data));
                case 'PATCH':
                    return $this->after($this->patch($data));
                case 'DELETE':
                    return $this->after($this->delete());
            }
            return $this->after($this->invalid());
        } catch (RuntimeException $e) {
            $this->m->logger->warning($e->getMessage(), ['exception' => $e]);
            return $this->error($e);
        }
    }

    /**
     * Redirect to a route.
     * @param string|array|\Jivoo\Http\Route\Route|\Jivoo\Http\Route\HasRoute $route A route.
     * @param bool $permanent Whether redirect is permanent.
     * @return \Psr\Http\Message\ResponseInterface A redirect response.
     */
    protected function redirect($route, $permanent = false)
    {
        return $this->m->router->redirect($route, $permanent);
    }

    /**
     * Refresh the current path with optional query data and fragment.
     * @param array $query Associative array of query data.
     * @param string $fragment Fragment of page.
     * @return \Psr\Http\Message\ResponseInterface A refresh response.
     */
    protected function refresh($query = null, $fragment = '')
    {
        return $this->m->router->refresh($query, $fragment);
    }

    /**
     * Set HTTP status code, e.g. 200 for OK or 404 for file not found.
     * @param integer $httpStatus HTTP status code.
     */
    protected function setStatus($httpStatus)
    {
        $this->response->status = $httpStatus;
    }

    /**
     * Get HTTP status code.
     * @return integer HTTP status code.
     */
    public function getStatus()
    {
        return $this->response->status;
    }

    /**
     * Enable layout for snippet. Will be disabled automatically after next call
     * to {@see render()}.
     * @param string $enable Enable layout.
     */
    public function enableLayout($enable = true)
    {
        $this->enableLayout = $enable;
    }

    /**
     * Disable layout for snippet.
     */
    public function disableLayout()
    {
        $this->enableLayout = false;
    }
    
    protected function ok($message = '')
    {
        $response = $this->response;
        $response->getBody()->write($message);
        return $response->withStatus(\Jivoo\Http\Message\Status::OK);
    }
    
    protected function error($message, $status = \Jivoo\Http\Message\Status::BAD_REQUEST)
    {
        if ($message instanceof \Exception) {
            if ($message instanceof RuntimeException) {
                return $this->json($message->toArray())->withStatus($status);
            }
            $message = $message->getMessage();
        }
        $response = $this->response;
        $response->getBody()->write($message);
        return $response->withStatus($status);
    }
    
    protected function methodNotAllowed()
    {
        $response = $this->response;
        return $response->withStatus(\Jivoo\Http\Message\Status::METHOD_NOT_ALLOWED);
    }

    /**
     * Render a template.
     *
     * If $templateName is not set, the path of the template will be computed
     * based on the name of the snippet.
     *
     * @param string $templateName Name of template to render.
     * @return string Rendered template.
     */
    protected function render($templateName = null)
    {
        if (!isset($templateName)) {
            $class = str_replace($this->scheme->getNamespace(), '', get_class($this));
            $type = 'html';
            if (strpos($class, '_') !== false and preg_match('/^(.*)_([a-z0-9]+)$/i', $class, $matches) === 1) {
                $class = $matches[1];
                $type = $matches[2];
            }
            $dirs = array_map(array('Jivoo\Utilities', 'camelCaseToDashes'), explode('\\', $class));
            $templateName = implode('/', $dirs) . '.' . $type;
        }
        // TODO
        $this->response->getBody()->write($this->m->view->render($templateName, $this->viewData));
        return $this->response;
//        $enableLayout = $this->enableLayout;
//        $this->disableLayout();
//        $this->response->template = $templateName;
//        $this->response->data = $this->viewData;
//        $this->response->withLayout = $enableLayout;
//        $response = $this->response;
//        $this->response = new ViewResponse(Http::OK, $this->view);
//        return $response;
    }
    
    protected function json($object)
    {
        $response = $this->response;
        $response = $response->withHeader('Content-Type', 'application/json');
        $response->getBody()->write(\Jivoo\Json::encode($object));
        return $response;
    }

    /**
     * Set cache settings.
     * @param string $public Public or private.
     * @param int|string $expires Time on which cache expires. Can be a UNIX
     * timestamp or a string used with {@see strtotime()}.
     */
    public function cache($public = true, $expires = '+1 year')
    {
        $this->response->cache($public, $expires);
    }
}
