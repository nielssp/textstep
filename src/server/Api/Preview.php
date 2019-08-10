<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Api;

use Blogstep\AuthenticatedSnippet;
use Blogstep\Compile\FileContentMap;
use Blogstep\Compile\FileSiteMap;
use Blogstep\Compile\FilterSet;
use Blogstep\Compile\ContentCompiler;
use Blogstep\Compile\TemplateCompiler;
use Blogstep\Compile\SiteInstaller;
use Blogstep\Compile\ContentMap;
use Blogstep\Compile\SiteMap;
use Blogstep\Task\Runner;
use Blogstep\Task\Serializer;
use Blogstep\Task\Service;
use Blogstep\Task\UnitTask;

/**
 * Site preview.
 */
class Preview extends AuthenticatedSnippet
{
    public function get()
    {
        $path = '';
        if (isset($this->request->query['path'])) {
            $path = $this->request->query['path'];
        }
        $content = $this->m->files->get('content');
        $destination = $this->m->files->get('build');

        $contentMap = new FileContentMap($this->m->files->get('build/content.json'));
        $siteMap = new FileSiteMap($this->m->files->get('build/sitemap.json'));
        $installMap = new FileSiteMap($this->m->files->get('build/install.json'));

        $filterSet = new FilterSet();
        $filterSet->addFilters($this->m->main->p('src/filters'));
        $filterSet->addFilters($this->m->files->get('site/filters')->getHostPath());

        $config = new \Jivoo\Store\Config(new \Jivoo\Store\JsonStore($this->m->files->get('site/site.json')->getHostPath()));

        $cc = new ContentCompiler($destination, $siteMap, $contentMap, $filterSet, $config);
        $id = function ($content) {
            return $content;
        };
        $cc->getHandler()->addHandler('html', $id);
        $cc->getHandler()->addHandler('htm', $id);
        $cc->getHandler()->addHandler('md', [new \Parsedown(), 'text']);

        // TODO: generate temporary auth token
        $tc = new PreviewTemplateCompiler($destination, $installMap, $siteMap, $contentMap, $filterSet, $config, $this->sessionId);

        $node = $siteMap->get($path);
        if (!isset($node)) {
            $node = $siteMap->get(trim($path . '/index.html', '/'));
            if (!isset($node)) {
                $node = $installMap->get($path);
                if (!isset($node)) {
                    $node = $siteMap->get(trim($path . '/index.html', '/'));
                    if (!isset($node)) {
                        return $this->error('Not found', \Jivoo\Http\Message\Status::NOT_FOUND);
                    }
                }
            }
        }
        switch ($node['handler']) {
            case 'copy':
                $args = $node['data'];
                $type = $this->m->files->fileNameToMimeType($node['data'][0]);
                $this->response = \Jivoo\Http\Message\Response::file($this->m->files->get($node['data'][0])->getHostPath(), $type);
                return $this->response;
            case 'tsc':
                $tc->getEnv()->let('PATH', new \Blogstep\Compile\Tsc\StringVal($path));
                $data = $node['data'];
                $compiled = $tc->compileTemplate($data['TEMPLATE'], $data);
                $this->response->getBody()->write($compiled);
                $installMap->commit();
                return $this->response;
        }
        return $this->error('Not implemented');
    }
}

class PreviewTemplateCompiler extends TemplateCompiler
{
    private $token;

    public function __construct(\Blogstep\Files\File $buildDir, SiteMap $installMap, SiteMap $siteMap, ContentMap $contentMap, FilterSet $filterSet, \Jivoo\Store\Config $config, $token)
    {
        parent::__construct($buildDir, $installMap, $siteMap, $contentMap, $filterSet, $config);
        $this->token = $token;
    }

    public function getLink($link = null)
    {
        if (\Jivoo\Unicode::endsWith($link, 'index.html')) {
            $link = preg_replace('/\/index.html$/', '', $link);
        }
        return 'preview?path=' . ltrim($link, '/') . '&access_token=' . $this->token;
    }
}
