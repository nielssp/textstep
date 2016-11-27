<div class="frame">
<?php echo $this->begin('appmenu'); ?><div>
<header>Viewer</header>
<nav>
<ul>
<li><a data-action="close">Close</a></li>
</ul>
</nav>
</div><?php echo $this->end(); ?>
<div class="frame-header">
<div class="frame-header-actions">
<a href="" data-action="toggle-menu"></a>
</div>
<div class="frame-header-title">
<span><?php echo \Jivoo\View\Html::h($video->getName()); ?></span>
            &ndash; Player
</div>
<div class="frame-header-actions">
<a href="" data-action="close"></a>
</div>
</div>
<div class="frame-content">
<div id="player">
<video autoplay controls loop data-path="<?php echo $video->getPath(); ?>" src="<?php echo $this->link(['snippet' => 'Api\Download', 'query' => ['path' => $video->getPath()]]); ?>">
</video>
</div>
</div>
</div>