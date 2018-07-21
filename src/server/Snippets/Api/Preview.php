<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Snippets\Api;

use Blogstep\AuthenticatedSnippet;
use Blogstep\Compile\FileContentMap;
use Blogstep\Compile\FileSiteMap;
use Blogstep\Compile\FilterSet;
use Blogstep\Compile\ContentCompiler;
use Blogstep\Compile\TemplateCompiler;
use Blogstep\Compile\SiteAssembler;
use Blogstep\Compile\SiteInstaller;
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
        $structure = $this->m->files->get('site');
        $destination = $this->m->files->get('build');

        $contentMap = new FileContentMap($this->m->files->get('build/content.json'));
        $siteMap = new FileSiteMap($this->m->files->get('build/sitemap.json'));
        $installMap = new FileSiteMap($this->m->files->get('build/install.json'));

        $filterSet = new FilterSet();
        $filterSet->addFilters($this->m->main->p('src/filters'));
        $filterSet->addFilters($this->m->files->get('site/filters')->getHostPath());

        $cc = new ContentCompiler($destination, $siteMap, $contentMap, $filterSet);
        $id = function ($content) { return $content; };
        $cc->getHandler()->addHandler('html', $id);
        $cc->getHandler()->addHandler('htm', $id);
        $cc->getHandler()->addHandler('md', [new \Parsedown(), 'text']);

        $tc = new TemplateCompiler($destination, $siteMap, $contentMap, $filterSet);

        $contentTree = new \Blogstep\Compile\Content\ContentTree($contentMap, '/content/');

        $assembler = new SiteAssembler($destination, $installMap, $siteMap, $contentTree, $filterSet, $this->m->main->config->getSubconfig('system.config'));

        $view = new PreviewView($assembler);
        $view->addTemplateDir($destination->get('site')->getHostPath());
        $view->addTemplateDir($destination->get('/site')->getHostPath());
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
                $type = $assembler->getAssetScheme()->getMimeType($node['data'][0]);
                $this->response = \Jivoo\Http\Message\Response::file($this->m->files->get($node['data'][0])->getHostPath(), $type);
                return $this->response;
            case 'eval':
                $args = $node['data'];
                $template = array_shift($args);
                $view->currentPath = $path;
                $view->data->evalArgs = $args;
                $this->response->getBody()->write($view->render($template));
                return $this->response;
        }
        return $this->error('Not implemented');
    }
}

class PreviewView extends \Blogstep\Compile\View
{
    public function link($link = null, $absolute = false)
    {
        if (!isset($link)) {
            $link = $this->currentPath;
        }
        if ($link instanceof \Blogstep\Compile\Content\ContentNode) {
            $content = $link;
            $link = $content->link;
            if (!isset($link)) {
                return '#not-found' . $content->path;
            }
        }
        if (\Jivoo\Unicode::endsWith($link, 'index.html')) {
            $link = preg_replace('/\/index.html$/', '', $link);
        }
        return 'preview?path=' . ltrim($link, '/');
    }
}
