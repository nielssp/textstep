<?php
// Jivoo
// Copyright (c) 2015 Niels Sonnich Poulsen (http://nielssp.dk)
// Licensed under the MIT license.
// See the LICENSE file or http://opensource.org/licenses/MIT for more information.
namespace Blogstep;

use Jivoo\Http\Route\AssetScheme;
use Jivoo\Http\Router;
use Jivoo\Utilities;

/**
 * Collection of scripts and stylesheets to be included into the template.
 */
class ViewResources
{

    /**
     * @var array Associative array of providers.
     */
    private $providers = array();

    /**
     * @var string[] Script and style import blocks.
     */
    private $blocks = array(
        'script' => '',
        'style' => ''
    );

    /**
     * @var (string|null)[] Script and style import conditions.
     */
    private $resCondition = array(
        'script' => null,
        'style' => null
    );

    /**
     * @var bool[] Associative array of emitted resources.
     */
    private $emitted = array();

    /**
     * @var string[][] Import frame stack. Each frame is an associative array
     * with keys 'script' and 'style', mapped to lists of script and style
     * imports.
     */
    private $importFrames = array(
        0 => array(),
    );

    /**
     * @var int Index of current frame.
     */
    private $framePointer = 0;

    /**
     * @var AssetScheme Assets module.
     */
    private $assets;
    
    /**
     * @var Router
     */
    private $router;

    /**
     * Cnstruct collection of view resources.
     * @param Assets $assets Assets module.
     */
    public function __construct(AssetScheme $assets, Router $router)
    {
        $this->assets = $assets;
        $this->router = $router;
    }

    /**
     * Type of file extension.
     * @param string $resource Resource name.
     * @throws ResourceTypeException If unknown type.
     * @return string Type.
     */
    private function type($resource)
    {
        $type = Utilities::getFileExtension($resource);
        switch ($type) {
            case 'js':
                return 'script';
            case 'css':
                return 'style';
            default:
                throw new ResourceTypeException('Unknown type of resource: ' . $type);
        }
    }

    /**
     * Find a resource.
     * @param string $resource Resource name.
     * @throws ResourceTypeException If unknown type of resource.
     * @return array Description of resource and dependencies.
     */
    private function find($resource)
    {
        if (isset($this->providers[$resource])) {
            return $this->providers[$resource];
        }
        $type = Utilities::getFileExtension($resource);
        switch ($type) {
            case 'js':
                $type = 'script';
                break;
            case 'css':
                $type = 'style';
                break;
            default:
                throw new ResourceTypeException('Unknown type of resource: ' . $type);
        }
        if ($this->assets->find($resource) !== null) {
            $location = $this->router->getUri('asset:' . $resource);
        } else {
            $location = 'resource-is-missing/' . $resource;
        }
        return array(
            'location' => $location,
            'type' => $type,
            'dependencies' => array(),
            'condition' => null
        );
    }

    /**
     * Provide a named resource.
     * @param string $resource Resource name, e.g. 'jquery.js'.
     * @param string $location Location of resource (relative to docroot).
     * @param string[] $dependencies List resource dependencies.
     * @param string $condition Condition for resource.
     */
    public function provide($resource, $location, $dependencies = array(), $condition = null)
    {
        $this->providers[$resource] = array(
            'location' => $location,
            'type' => $this->type($resource),
            'dependencies' => $dependencies,
            'condition' => $condition
        );
    }

    /**
     * Import conditional resource.
     * @param string $resource Resource name.
     * @param string $condition Condition.
     */
    public function importConditional($resource, $condition)
    {
        if (isset($this->imported[$resource])) {
            return;
        }
        $resInfo = $this->find($resource);
        $resInfo['condition'] = $condition;
        $this->providers[$resource] = $resInfo;
        $this->import($resource);
    }

    /**
     * Import a resource and its dependencies.
     * @param string $resource Resource name.
     * @param string $resources,... Additional resources to import.
     */
    public function import($resource)
    {
        if (is_array($resource)) {
            $args = $resource;
        } else {
            $args = func_get_args();
        }
        foreach ($args as $resource) {
            if (strpos($resource, ';') !== false) {
                $this->import(explode(';', $resource));
            } else {
                $this->importFrames[$this->framePointer][] = $resource;
            }
        }
    }

    /**
     * Open a new resource frame on top of the current one.
     */
    public function openFrame()
    {
        $this->framePointer++;
        $this->importFrames[$this->framePointer] = array();
    }

    /**
     * Close the top resource frame.
     */
    public function closeFrame()
    {
        if ($this->framePointer < 1) {
            return;
        }
        $this->framePointer--;
        $frame = array_pop($this->importFrames);
        $this->importFrames[$this->framePointer] = array_merge(
            $frame,
            $this->importFrames[$this->framePointer]
        );
    }

    /**
     * Emit HTML for a resource.
     * @param string $resource Resource identifier.
     */
    private function emitResource($resource)
    {
        if (isset($this->emitted[$resource])) {
            return;
        }
        $resInfo = $this->find($resource);
        if (!empty($resInfo['dependencies'])) {
            foreach ($resInfo['dependencies'] as $dependency) {
                $this->emitResource($dependency);
            }
        }
        $html = '';
        if (isset($resInfo['condition'])) {
            if ($this->resCondition[$resInfo['type']] !== $resInfo['condition']) {
                if (isset($this->resCondition[$resInfo['type']])) {
                    $html .= '<![endif]-->' . PHP_EOL;
                }
                $this->resCondition[$resInfo['type']] = $resInfo['condition'];
                $html .= '<!--[if (' . $resInfo['condition'] . ')]>' . PHP_EOL;
            }
        } elseif (isset($this->resCondition[$resInfo['type']])) {
            $html .= '<![endif]-->' . PHP_EOL;
            $this->resCondition[$resInfo['type']] = null;
        }
        if ($resInfo['type'] == 'script') {
            $html .= '<script type="text/javascript" src="'
                . Html::h($resInfo['location']) . '"></script>' . PHP_EOL;
        } elseif ($resInfo['type'] == 'style') {
            $html .= '<link rel="stylesheet" type="text/css" href="'
                . Html::h($resInfo['location']) . '" />' . PHP_EOL;
        }
        $this->blocks[$resInfo['type']] .= $html;
        $this->emitted[$resource] = true;
    }

    /**
     * Output resource block.
     * @param string[]|string Type(s) of resources to output, e.g. 'script',
     * 'style'.
     * @param bool $allFrames Whether to output all frames or only the current one.
     * @return string Resource block HTML.
     */
    public function resourceBlock($types = null, $allFrames = true)
    {
        if (!isset($types)) {
            $types = array('style', 'script');
        }
        if (!is_array($types)) {
            $types = func_get_args();
        }
        if ($allFrames) {
            while ($this->framePointer > 0) {
                $this->closeFrame();
            }
        }
        $this->emitted = array();
        $this->blocks = array(
            'script' => '',
            'style' => '',
        );
        $this->resCondition = array(
            'script' => null,
            'style' => null,
        );
        foreach ($this->importFrames[$this->framePointer] as $resource) {
            $this->emitResource($resource);
        }
        $block = '';
        foreach ($types as $type) {
            if ($block != '') {
                $block .= PHP_EOL;
            }
            $block .= $this->blocks[$type];
            if (isset($this->resCondition[$type])) {
                $block .= '<![endif]-->' . PHP_EOL;
                $this->resCondition[$type] = null;
            }
        }
        return $block;
    }
}
