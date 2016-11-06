<?php $this->import('css/viewer.css;dist/viewer.js'); ?><div class="frame">
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
<span id="viewer-name"><?php echo \Jivoo\View\Html::h($selection->getName()); ?></span>
            &ndash; Viewer
</div>
<div class="frame-header-actions">
<a href="" data-action="close"></a>
</div>
</div>
<div class="frame-content">
<div id="viewer">
<?php foreach ($images as $image): ?>
<img class="<?php echo $selection == $image ? 'active' : ''; ?>" alt="<?php echo $image->getName(); ?>" data-path="<?php echo $image->getPath(); ?>" src="<?php echo $this->link(['snippet' => 'Api\Download', 'query' => ['path' => $image->getPath()]]); ?>" /><?php endforeach; ?>

</div>
</div>
</div>