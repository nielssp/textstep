<?php
// BlogSTEP
// Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep\Compile;

/**
 * Compiles a single content node.
 */
class ContentCompiler
{
    
    /**
     * @var \Blogstep\Files\File
     */
    private $buildDir;
    
    /**
     * @var \Blogstep\Build\ContentHandler
     */
    private $handler;
    
    /**
     * @var string[]
     */
    private $urlAttributes = ['src', 'href'];

    /**
     * @var ContentMap
     */
    private $contentMap;
    
    public function __construct(\Blogstep\Files\File $buildDir, \Psr\Log\LoggerInterface $log)
    {
        $this->buildDir = $buildDir;
        $this->handler = new \Blogstep\Build\ContentHandler();
    }
    
    public function getHandler()
    {
        return $this->handler;
    }
    
    private function convertSource(\Blogstep\Files\File $file)
    {
        $handler = $this->handler->getHandler($file->getType());
        if (!isset($handler)) {
            throw new \Blogstep\RuntimeException('No handler found for type: ' . $file->getType());
        }
        $content = $file->getContents();
        return $handler($content);
    }
    
    private function parseHtml($html, \Blogstep\Files\File $htmlFile)
    {
        $dom = new \SimpleHtmlDom\simple_html_dom();
        $dom->load($html, true, false);
        if (!$dom) {
          throw new \Blogstep\RuntimeException('Could not parse HTML: ' . $htmlFile()->getPath());
        }
        return $dom;
    }
    
    private function extractMetadataBlock(\SimpleHtmlDom\simple_html_dom $dom)
    {
        $data = [];
        $matches = [];
        foreach ($dom->find('comment') as $comment) {
            if (preg_match('/^<!-- *(\{.*\}) *-->$/ms', $comment->innertext, $matches) === 1) {
                $json = json_decode($matches[1], true);
                if (is_array($json)) {
                    $data = array_merge($data, $json);
                    $comment->outertext = '';
                }
            }
        }
        return $data;
    }
    
    private function getBrief($html)
    {
        $dom = new \SimpleHtmlDom\simple_html_dom();
        $dom->load($html, true, false);
        $break = $dom->find('.break', 0);
        if (isset($break)) {
            $sibling = $break->nextSibling();
            while (isset($sibling)) {
                $sibling->outertext = '';
                $sibling = $sibling->nextSibling();
            }
        }
        return $dom;
    }
    
    private function removeTitle($html)
    {
        $dom = new \SimpleHtmlDom\simple_html_dom();
        $dom->load($html, true, false);
        $title = $dom->find('h1', 0);
        if (isset($title)) {
            $title->outertext = '';
        }
        return $dom;
    }
    
    private function copyAssets(\Blogstep\Files\File $source, \SimpleHtmlDom\simple_html_dom $dom)
    {
        foreach ($this->urlAttributes as $attribute) {
            foreach ($dom->find('[' . $attribute . ']') as $element) {
                $url = $element->getAttribute($attribute);
                if (strpos($url, ':') === false and !\Jivoo\Unicode::startsWith($url, '//')) {
                    $file = $source->getParent()->get($url);
                    $path = 'assets' . $file->getPath();
                    $destination = $this->buildDir->get($path);
                    $dir = $destination->getParent();
                    if (!$dir->makeDirectory(true)) {
                        throw new \Blogstep\RuntimeException('Could not create build directory: ' . $dir->getPath());
                    }
                    $file->copy($destination);
                    $element->setAttribute($attribute, 'bs:/' . $path);
                    if ($element->tag === 'img' && $attribute === 'src') {
                        $options = [];
                        foreach ($element->attr as $key => $value) {
                            $options[] = urlencode($key) . '=' . urlencode($value);
                        }
                        $element->outertext = '<?bs img?' . implode('&', $options) . ' ?>';
                    }
                }
            }
        }
    }
    
    public function compile(\Blogstep\Files\File $file)
    {
        $contentBuildDir = $this->buildDir->get('.' . $file->getPath());
        if (!$contentBuildDir->makeDirectory(true)) {
            throw new \Blogstep\RuntimeException('Could not create build directory: ' . $contentBuildDir->getPath());
        }
        $html = $this->convertSource($file);
        $htmlFile = $contentBuildDir->get('content.html');
        if (!$htmlFile->putContents($html)) {
            throw new \Blogstep\RuntimeException('Could not write file: ' . $htmlFile->getPath());
        }
        $dom = $this->parseHtml($html, $htmlFile);
        $this->copyAssets($file, $dom);
        $metadata = new \Jivoo\Store\Document($this->extractMetadataBlock($dom));       
        
        $published = $metadata->get('published');
        if (!isset($published)) {
            $metadata['published'] = time();
        } elseif (is_string($published)) {
            $metadata['published'] = strtotime($published);
        }
        $metadata['path'] = $file->getPath();
        $metadata->setDefault('name', preg_replace('/\.[^.]+$/', '', $file->getName()));
        
        if (!isset($metadata['title'])) {
            $title = $dom->find('h1', 0);
            if (isset($title)) {
                $metadata['title'] = $title->innertext;
            } else {
                $metadata['title'] = $metadata['name'];
            }
        }
        
        $metadata['hasBreak'] = $dom->find('.break', 0) !== null;
        
        if ($metadata['hasBreak']) {
            $briefFile = $contentBuildDir->get('brief.html');
            $briefHtml = rtrim($this->getBrief($dom->__toString())->__toString());
            $briefFile->putContents($briefHtml);
            $briefNoTitleFile = $contentBuildDir->get('brief-no-title.html');
            $briefNoTitleFile->putContents(rtrim($this->removeTitle($briefHtml)));
        }

        $this->contentMap->add($file->getPath(), $metadata);
        
        $metadataFile = $contentBuildDir->get('metadata.json');
        $metadataFile->putContents(\Jivoo\Json::prettyPrint($metadata->toArray()));
        
        $html = $dom->__toString();
        if (!$htmlFile->putContents($html)) {
            throw new \Blogstep\RuntimeException('Could not write file: ' . $htmlFile->getPath());
        }
        
        $noTitleFile = $contentBuildDir->get('content-no-title.html');
        $noTitleFile->putContents($this->removeTitle($html)->__toString());
        
    }
}
