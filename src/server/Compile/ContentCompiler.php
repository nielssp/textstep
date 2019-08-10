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
    private $root;

    /**
     * @var \Blogstep\Compile\ContentHandler
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
    
    /**
     * @var SiteMap
     */
    private $siteMap;

    /**
     * @var FilterSet
     */
    private $filterSet;

    private $timeZone;

    public function __construct(\Blogstep\Files\File $root, SiteMap $siteMap, \Blogstep\Compile\ContentMap $contentMap, FilterSet $filterSet, \Jivoo\Store\Config $config)
    {
        $this->root = $root;
        $this->handler = new \Blogstep\Compile\ContentHandler();
        $this->contentMap = $contentMap;
        $this->siteMap = $siteMap;
        $this->filterSet = $filterSet;
        $this->timeZone = $config->get('timeZone', date_default_timezone_get());
    }

    public function getHandler()
    {
        return $this->handler;
    }

    private function parseHtml($html, \Blogstep\Files\File $htmlFile)
    {
        $dom = new \simple_html_dom();
        $dom->load($html, true, false);
        if (!$dom) {
            throw new \Blogstep\RuntimeException('Could not parse HTML: ' . $htmlFile()->getPath());
        }
        return $dom;
    }

    private function extractMetadataBlock(\simple_html_dom $dom)
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
        $dom = new \simple_html_dom();
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
        $dom = new \simple_html_dom();
        $dom->load($html, true, false);
        $title = $dom->find('h1', 0);
        if (isset($title)) {
            $title->outertext = '';
        }
        return $dom;
    }
    
    public static function displayTag($tag, array $attributes)
    {
        $pairs = [];
        foreach ($attributes as $key => $value) {
            $pairs[] = urlencode($key) . '=' . urlencode($value);
        }
        return '<?bs ' . $tag . ' ' . implode('&', $pairs) . ' ?>';
    }

    private function copyAssets(\Blogstep\Files\File $source, \simple_html_dom $dom)
    {
        foreach ($this->urlAttributes as $attribute) {
            foreach ($dom->find('[' . $attribute . ']') as $element) {
                $url = $element->getAttribute($attribute);
                if (strpos($url, ':') === false and !\Jivoo\Unicode::startsWith($url, '//')) {
                    $file = $source->getParent()->get($url);
                    $path = 'assets/' . $file->getRelativePath($this->root);
                    $this->siteMap->add($path, 'copy', [$file->getPath()]);
                    $element->setAttribute($attribute, 'bs:/' . $path);
                    if ($element->tag === 'img' && $attribute === 'src') {
                        $element->outertext = self::displayTag('img', $element->attr);
                    }
                }
            }
        }
    }

    public function compile(\Blogstep\Files\File $file)
    {
        if ($file->isDirectory()) {
            foreach ($file as $child) {
                $this->compile($child);
            }
            return;
        }
        $type = preg_replace('/^.*?(?:\.([^.]+))?$/', '\\1', $file->getName());
        $handler = $this->handler->getHandler($type);
        if (!isset($handler)) {
            return;
        }
        $contentBuildDir = $this->root->get('build' . $file->getPath());
        if (!$contentBuildDir->makeDirectory(true)) {
            throw new \Blogstep\RuntimeException('Could not create build directory: ' . $contentBuildDir->getPath());
        }
        $html = $handler($file->getContents());
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
            $oldTz = date_default_timezone_get();
            date_default_timezone_set($this->timeZone);
            $metadata['published'] = strtotime($published);
            date_default_timezone_set($oldTz);
        }
        $metadata['modified'] = $file->getModified();
        $metadata['path'] = $file->getPath();
        $metadata['contentFile'] = $htmlFile->getPath();
        $metadata->setDefault('name', preg_replace('/\.[^.]+$/', '', $file->getName()));

        if (!isset($metadata['title'])) {
            $title = $dom->find('h1', 0);
            if (isset($title)) {
                $metadata['title'] = $title->innertext;
            } else {
                $metadata['title'] = $metadata['name'];
            }
        }
        
        $this->filterSet->applyHtmlFilters($this, $file, $metadata, $dom);

        $html = $dom->__toString();
        if (!$htmlFile->putContents($html)) {
            throw new \Blogstep\RuntimeException('Could not write file: ' . $htmlFile->getPath());
        }
        
        $this->contentMap->add($file->getPath(), $metadata->toArray());
    }
}
