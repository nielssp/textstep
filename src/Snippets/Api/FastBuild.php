<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Snippets\Api;

use Blogstep\AuthenticatedSnippet;
use Blogstep\Build\Compiler;
use Blogstep\Build\ContentHandler;
use Blogstep\Build\Task;
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

        $compiler = new Compiler($destination, $this->m->main->config['user']);
        $compiler->addTask(Task::load($this->m->main->p('src/tasks/copyStructure.php')));
        $compiler->addTask(Task::load($this->m->main->p('src/tasks/templateToPhp.php')));
        $compiler->addTask(Task::load($this->m->main->p('src/tasks/copyContentAssets.php')));
        $compiler->addTask(Task::load($this->m->main->p('src/tasks/phpToText.php')));
        $compiler->addTask(Task::load($this->m->main->p('src/tasks/minifyAssets.php')));
        
        $compiler->clean();
        $handler = new ContentHandler();
        
        $id = function ($content) { return $content; };
        $handler->addHandler('html', $id);
        $handler->addHandler('htm', $id);
        $handler->addHandler('md', [new \Parsedown(), 'text']);
        
        $dir = scandir($this->m->main->p('src/filters'));
        foreach ($dir as $file) {
            if (Unicode::endsWith($file, '.php')) {
                $name = substr($file, 0, -4);
                $handler->addFilter($name, require $this->m->main->p('src/filters/' . $file));
            }
        }
        if ($structure->get('filters')->getType() === 'directory') {
            foreach ($structure->get('filters') as $file) {
                if (Unicode::endsWith($file->getName(), '.php')) {
                    $name = substr($file->getName(), 0, -4);
                    $handler->addFilter($name, require $file->getRealPath());
                }
            }
        }        
        $handler->setDefaultFilters(['links']);
        
        $compiler->createContentTree($content, $handler);
        $compiler->createStructure($structure);
        
        while (!$compiler->isDone()) {
            $compiler->run(function () {
                return true;
            });
        }
        
        $target = $this->m->main->config['user']->get('target', $this->m->main->p('target'));
        $compiler->install($target);
        
        return $this->ok();
    }
    
    public function get()
    {
        return $this->methodNotAllowed();
    }
}
