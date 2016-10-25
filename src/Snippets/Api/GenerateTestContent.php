<?php
// BlogSTEP 
// Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Snippets\Api;

/**
 * Test content generator.
 */
class GenerateTestContent extends \Blogstep\AuthenticatedSnippet
{
    public function post(array $data)
    {
        $content = $this->m->files->get('content/published');
        
        $num = 20;
        if (isset($data['num'])) {
            $num = intval($data['num']);
        }
        $lipsum = new \Badcow\LoremIpsum\Generator();
        $lipsum->setParagraphMean(2);
        for ($i = 0; $i < $num; $i++) {
            $file = $content->get('test' . $i . '.md');
            $title = implode(' ', $lipsum->getRandomWords(4));
            $data = '# ' . $title . PHP_EOL . implode("\n\n", $lipsum->getParagraphs(3)) . PHP_EOL;
            $published = mt_rand(strtotime('2014-01-01'), time());
            $metadata = [
                'published' => date('Y-m-d H:i:s', $published),
                'tags' => ['test']
            ];
            $data .= '<!--' . \Jivoo\Json::prettyPrint($metadata) . '-->';
            $file->putContents($data);
        }


        return $this->ok();
    }
    
    public function get()
    {
        return $this->methodNotAllowed();
    }
}
