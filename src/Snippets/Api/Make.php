<?php
// BlogSTEP
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Snippets\Api;

use Blogstep\AuthenticatedSnippet;
use Blogstep\Compile\Content\ContentTree;
use Blogstep\Compile\ContentCompiler;
use Blogstep\Compile\FileContentMap;
use Blogstep\Compile\FileSiteMap;
use Blogstep\Compile\FilterSet;
use Blogstep\Compile\SiteAssembler;
use Blogstep\Compile\SiteInstaller;
use Blogstep\Compile\TemplateCompiler;
use Parsedown;

/**
 * Site builder. (temporary)
 */
class Make extends AuthenticatedSnippet
{
    public function post(array $data)
    {
        $contentMap = new FileContentMap($this->m->files->get('build/content.json'));
        $siteMap = new FileSiteMap($this->m->files->get('build/sitemap.json'));
        $filterSet = new FilterSet();
        $filterSet->addFilters($this->m->main->p('src/filters'));
        $filterSet->addFilters($this->m->files->get('site/filters')->getHostPath());
        $cc = new ContentCompiler($this->m->files->get('build'), $siteMap, $contentMap, $filterSet);
        $id = function ($content) { return $content; };
        $cc->getHandler()->addHandler('html', $id);
        $cc->getHandler()->addHandler('htm', $id);
        $cc->getHandler()->addHandler('md', [new Parsedown(), 'text']);
        $cc->compile($this->m->files->get('/content'));

        $tc = new TemplateCompiler($this->m->files->get('build'), $siteMap, $contentMap, $filterSet);
        $tc->compile($this->m->files->get('/site'));

        $contentTree = new ContentTree($contentMap, '/content/');
        $assembler = new SiteAssembler($this->m->files->get('build'), $siteMap, $contentTree, $filterSet, $this->m->main->config->getSubconfig('system.config'));
        foreach ($siteMap->getAll() as $path => $node) {
            $assembler->assemble($path);
        }

        $installer = new SiteInstaller($this->m->files->get('target'), $siteMap);
        foreach ($siteMap->getAll() as $path => $node) {
            $installer->install($path);
        }

        $siteMap->commit();
        $contentMap->commit();

        return $this->ok();
    }

    public function get()
    {
        return $this->methodNotAllowed();
    }
}
