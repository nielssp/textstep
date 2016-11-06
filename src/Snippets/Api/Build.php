<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Snippets\Api;

/**
 * Site builder.
 */
class Build extends \Blogstep\AuthenticatedSnippet
{
    public function post(array $data)
    {
        $content = $this->m->files->get('content');
        $structure = $this->m->files->get('site');
        $destination = $this->m->files->get('build');
        
        $runner = new \Blogstep\Task\Runner('build');
        
        $compiler = new \Blogstep\Build\Compiler($destination, $this->m->main->config['user']);
        $compiler->addTask(\Blogstep\Build\Task::load($this->m->main->p('src/tasks/copyStructure.php')));
        $compiler->addTask(\Blogstep\Build\Task::load($this->m->main->p('src/tasks/templateToPhp.php')));
        $compiler->addTask(\Blogstep\Build\Task::load($this->m->main->p('src/tasks/copyContentAssets.php')));
        $compiler->addTask(\Blogstep\Build\Task::load($this->m->main->p('src/tasks/phpToText.php')));
        $compiler->addTask(\Blogstep\Build\Task::load($this->m->main->p('src/tasks/minifyAssets.php')));
        
        $runner->add(
            new \Blogstep\Task\UnitTask('clean', [$compiler, 'clean'], 'Emptying build directory'),
            function () use($compiler, $content, $structure) {
                $compiler->createContentTree($content);

                $id = function ($content) { return $content; };
                $compiler->content->addHandler('html', $id);
                $compiler->content->addHandler('htm', $id);
                $compiler->content->addHandler('md', [new \Parsedown(), 'text']);

                $dir = scandir($this->m->main->p('src/filters'));
                foreach ($dir as $file) {
                    if (\Jivoo\Unicode::endsWith($file, '.php')) {
                        $name = substr($file, 0, -4);
                        $compiler->content->addFilter($name, require $this->m->main->p('src/filters/' . $file));
                    }
                }
                if ($structure->get('filters')->getType() === 'directory') {
                    foreach ($structure->get('filters') as $file) {
                        if (\Jivoo\Unicode::endsWith($file->getName(), '.php')) {
                            $name = substr($file->getName(), 0, -4);
                            $compiler->content->addFilter($name, require $file->getRealPath());
                        }
                    }
                }
                $compiler->content->setDefaultFilters(['links']);
            }
        );
        $runner->add(new \Blogstep\Task\UnitTask('structure', [$compiler, 'createStructure'], 'Creating initial site map'));
        $runner->add($compiler);
        $runner->add(new \Blogstep\Task\UnitTask('install', function () use ($compiler) {
            $target = $this->m->main->config['user']->get('target', $this->m->main->p('target'));
            $compiler->install($target);
        }, 'Installing'));
        
        $store = new \Jivoo\Store\SerializedStore($this->p('state/build.php'));
        
        $service = new \Blogstep\Task\Service($this->m->logger, $this->request, $store);
        
        $service->run($runner);
    }
    
    public function get()
    {
        return $this->methodNotAllowed();
    }
}
