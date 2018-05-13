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
use Jivoo\Unicode;

/**
 * Site builder.
 */
class FastBuild extends AuthenticatedSnippet
{
    public function post(array $data)
    {
        $content = $this->m->files->get('content');
        $structure = $this->m->files->get('site');
        $destination = $this->m->files->get('build');

        $contentMap = new FileContentMap($this->m->files->get('build/content.json'));
        $siteMap = new FileSiteMap($this->m->files->get('build/sitemap.json'));

        $filterSet = new FilterSet();
        $filterSet->addFilters($this->m->main->p('src/filters'));
        $filterSet->addFilters($this->m->files->get('site/filters')->getHostPath());

        $cc = new ContentCompiler($destination, $siteMap, $contentMap, $filterSet);
        $id = function ($content) { return $content; };
        $cc->getHandler()->addHandler('html', $id);
        $cc->getHandler()->addHandler('htm', $id);
        $cc->getHandler()->addHandler('md', [new \Parsedown(), 'text']);
        $cc->compile($content);
        $siteMap->commit();
        $contentMap->commit();

        $tc = new TemplateCompiler($destination, $siteMap, $contentMap, $filterSet);
        $tc->compile($structure);
        $siteMap->commit();
        $contentMap->commit();

        $contentTree = new \Blogstep\Compile\Content\ContentTree($contentMap, '/content/');

        $assembler = new SiteAssembler($destination, $siteMap, $contentTree, $filterSet, $this->m->main->config->getSubconfig('system.config'));
        foreach ($siteMap->getAll('') as $path => $node) {
          $assembler->assemble($path);
        }
        $siteMap->commit();

        $installer = new SiteInstaller($this->m->files->get('target'), $siteMap);
        foreach ($siteMap->getAll('') as $path => $node) {
          $installer->install($path);
        }

        return $this->ok();
    }

    public function get()
    {
      return $this->methodNotAllowed();
    }
}
