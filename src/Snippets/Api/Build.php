<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Snippets\Api;

use Blogstep\AuthenticatedSnippet;
use Blogstep\Build\Compiler;
use Blogstep\Build\Task;
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
    public function post(array $data)
    {
        $content = $this->m->files->get('content');
        $structure = $this->m->files->get('site');
        $destination = $this->m->files->get('build');
        
        $serializer = new Serializer();
        $serializer->set('files', $this->m->files);
        $serializer->addSerializer('Blogstep\Files\File', function (File $file, Serializer $serializer) {
            return ['path' => $file->getPath()];
        });
        $serializer->addInitializer('Blogstep\Files\File', function (array $serialized, Serializer $serializer) {
            return $this->m->files->get($serialized['path']);
        });
        
        $compiler = new Compiler($destination, $this->m->main->config['user']);
        $compiler->addTask(Task::load($this->m->main->p('src/tasks/copyStructure.php')));
        $compiler->addTask(Task::load($this->m->main->p('src/tasks/templateToPhp.php')));
        $compiler->addTask(Task::load($this->m->main->p('src/tasks/copyContentAssets.php')));
        $compiler->addTask(Task::load($this->m->main->p('src/tasks/phpToText.php')));
        $compiler->addTask(Task::load($this->m->main->p('src/tasks/minifyAssets.php')));
        
        $runner = new Runner('build');
        
        $runner->add(new UnitTask('clean', [$compiler, 'clean'], 'Cleaning'), function () use ($compiler, $content, $structure) {
            $compiler->createContentTree($content);
            
            $id = function ($content) { return $content; };
            $compiler->content->addHandler('html', $id);
            $compiler->content->addHandler('htm', $id);
            $compiler->content->addHandler('md', [new \Parsedown(), 'text']);
        
        
            $dir = scandir($this->m->main->p('src/filters'));
            foreach ($dir as $file) {
                if (Unicode::endsWith($file, '.php')) {
                    $name = substr($file, 0, -4);
                    $compiler->content->addFilter($name, require $this->m->main->p('src/filters/' . $file));
                }
            }
            if ($structure->get('filters')->getType() === 'directory') {
                foreach ($structure->get('filters') as $file) {
                    if (Unicode::endsWith($file->getName(), '.php')) {
                        $name = substr($file->getName(), 0, -4);
                        $compiler->content->addFilter($name, require $file->getRealPath());
                    }
                }
            }

            $compiler->content->setDefaultFilters(['links']);
        });
        $runner->add(new UnitTask('structure', function () use ($compiler, $structure) {
            $compiler->createStructure($structure);
        }, 'Creating structure'));
        $runner->add($compiler);
        $runner->add(new UnitTask('install', function () use ($compiler) {
            $target = $this->m->main->config['user']->get('target', $this->m->main->p('target'));
            $compiler->install($target);
        }, 'Installing'));
        
        $state = new JsonStore($this->m->files->get('build/.build.json')->getRealPath());
        $state->touch();
        
        $service = new Service($this->m->logger, $this->request, $state, $serializer);
        $service->run($runner, function () {
            $this->m->files->get('build/.build.json')->delete();
        });
    }
    
    public function get()
    {
        return $this->methodNotAllowed();
    }
}
