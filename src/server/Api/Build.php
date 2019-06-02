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
use Blogstep\Compile\SiteAssembler;
use Blogstep\Compile\SiteInstaller;
use Blogstep\Compile\SiteMap;
use Blogstep\Files\File;
use Blogstep\Task\Runner;
use Blogstep\Task\Serializer;
use Blogstep\Task\Service;
use Blogstep\Task\UnitTask;
use Jivoo\Store\JsonStore;
use Jivoo\Unicode;

/**
 * Site builder.
 */
class Build extends AuthenticatedSnippet
{
    private static $targets = ['all', 'content', 'template', 'assemble', 'install'];
    
    public function post(array $data)
    {
        $target = 'all';
        if (isset($data['target']) and in_array($data['target'], self::$targets)) {
            $target = $data['target'];
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

        $assembler = new SiteAssembler($destination, $installMap, $siteMap, $contentTree, $filterSet, $this->m->main->config->getSubconfig('site.site'));

        $installer = new SiteInstaller($this->m->files->get('target'), $installMap);
        
        $serializer = new Serializer();
        
        $runner = new Runner('build');

        if ($target == 'all' or $target == 'content') {
            $runner->add(new UnitTask('cc', function () use ($cc, $content, $siteMap, $contentMap) {
                $cc->compile($content);
                $siteMap->commit();
                $contentMap->commit();
            }, 'Compiling content'));
        }
        if ($target == 'all' or $target == 'template') {
            $runner->add(new UnitTask('tc', function () use ($tc, $structure, $siteMap, $contentMap) {
                $tc->compile($structure);
                $siteMap->commit();
                $contentMap->commit();
            }, 'Compiling templates'));
        }
        if ($target == 'all' or $target == 'assemble') {
            $runner->add(new SiteAssemblerTask($assembler, $installMap, $siteMap), 7);
        }
        if ($target == 'all' or $target == 'install') {
            $runner->add(new UnitTask('install', function () use ($installer, $installMap) {
                foreach ($installMap->getAll('') as $path => $node) {
                    $installer->install($path);
                }
            }, 'Installing'));
        }
        
        $serviceFile = $destination->get('.build-' . $target);
        
        $state = new \Jivoo\Store\SerializedStore($serviceFile->getHostPath());
        $state->touch();

        $this->m->logger->debug('Using state file: ' . $serviceFile->getHostPath());
        
        $service = new Service($this->m->logger, $this->request, $state, $serializer);
        $service->run($runner, function () use ($serviceFile) {
            $this->m->logger->debug('Build done, deleting state');
            $serviceFile->delete();
        });
    }
    
    public function get()
    {
        return $this->methodNotAllowed();
    }
}

class SiteAssemblerTask extends \Blogstep\Task\TaskBase
{
    private $assembler;
    private $installMap;
    private $siteMap;
    private $total = 0;
    private $paths = null;

    public function __construct(SiteAssembler $assembler, SiteMap $installMap, SiteMap $siteMap)
    {
        $this->assembler = $assembler;
        $this->installMap = $installMap;
        $this->siteMap = $siteMap;
    }

    public function run(callable $checkTime)
    {
        if (!isset($this->paths)) {
            $this->paths = [];
            foreach ($this->siteMap->getAll('') as $path => $node) {
                $this->paths[] = $path;
            }
            $this->total = count($this->paths);
        }
        $n = count($this->paths);
        while (count($this->paths)) {
            $path = array_shift($this->paths);
            $this->assembler->assemble($path);
            if (!$checkTime()) {
                break;
            }
        }
        $this->installMap->commit();
        $remaining = count($this->paths);
        $progress = 0;
        if ($this->total > 0) {
            $progress = ($this->total - $remaining) / $this->total * 100;
        }
        $this->progress(floor($progress));
        $this->status(
            'Assembling ' . $n  . ' nodes'
        );
    }

    public function getName()
    {
        return 'assembler';
    }

    public function isDone()
    {
        return is_array($this->paths) and count($this->paths) === 0;
    }

    public function serialize(Serializer $serializer)
    {
        return $serializer->serialize([
            $this->paths,
            $this->total
        ]);
    }

    public function unserialize(array $serialized, Serializer $serializer)
    {
        list(
            $this->paths,
            $this->total
        ) = $serializer->unserialize($serialized);
    }
}
